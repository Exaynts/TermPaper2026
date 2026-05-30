from rest_framework import filters, viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiResponse, inline_serializer
from rest_framework import serializers as drf_serializers

from ..models import (
    Course, SavedCourse, PurchasedCourse, RecycleBinCourse, CourseRating
)
from ..serializers import (
    CourseListSerializer, CourseDetailSerializer, CourseCreateUpdateSerializer,
    SavedCourseSerializer, PurchasedCourseSerializer, RecycleBinCourseSerializer
)
from ..permissions import IsAuthorOrReadOnly
from ..filters import CourseFilter


class CourseViewSet(viewsets.ModelViewSet):
    """
    ViewSet для курсов:
    - GET /api/courses/ – список курсов (только опубликованные для всех)
    - GET /api/courses/{id}/ – детальная информация
    - POST /api/courses/ – создание курса (требует авторизации)
    - PUT/PATCH /api/courses/{id}/ – обновление (только автор или админ)
    - DELETE /api/courses/{id}/ – удаление (только автор или админ)
    """
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CourseFilter
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'rating', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        """Добавить в список только опубликованные и не удалённые курсы"""
        if self.action == 'list':
            return Course.objects.filter(status='published', is_deleted=False).select_related('category',
                                                                                              'created_by').prefetch_related(
                'lessons')
        return Course.objects.all().select_related('category', 'created_by').prefetch_related('lessons')

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CourseCreateUpdateSerializer
        elif self.action == 'list':
            return CourseListSerializer
        return CourseDetailSerializer

    def perform_create(self, serializer):
        """Привязывать автора при создании курса автоматически"""
        serializer.save(created_by=self.request.user)

    def get_permissions(self):
        """
        Назначает разрешения в зависимости от действия:
        - Для действий, изменяющих курс (create, update, partial_update, destroy) – только автор или админ.
        - Для действий, связанных с пользовательскими данными (save, unsave, purchase, move_to_recycle_bin, restore_from_bin) – только аутентифицированный пользователь.
        - Для остальных (list, retrieve) – любой (AllowAny).
        """
        if self.action in ['create', 'update', 'partial_update', 'soft_delete', 'destroy']:
            return [IsAuthorOrReadOnly()]
        elif self.action in ['save', 'unsave', 'purchase', 'move_to_recycle_bin', 'restore_from_bin',
                             'remove_from_bin', 'add_lesson', 'my_created']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    # Дополнительные действия (actions) с декораторами @extend_schema

    @extend_schema(
        description="Сохранить курс в избранное.",
        request=None,
        responses={
            201: OpenApiResponse(description="Курс сохранён"),
            200: OpenApiResponse(description="Курс уже сохранён"),
        }
    )
    @action(detail=True, methods=['post'])
    def save(self, request, pk=None):
        """Сохранить курс в избранное"""
        course = self.get_object()
        saved, created = SavedCourse.objects.get_or_create(
            user=request.user,
            course=course
        )
        if created:
            return Response({'status': 'saved', 'message': 'Курс сохранён'}, status=status.HTTP_201_CREATED)
        return Response({'status': 'already_saved', 'message': 'Курс уже сохранён'}, status=status.HTTP_200_OK)

    @extend_schema(
        description="Удалить курс из избранного.",
        request=None,
        responses={
            200: OpenApiResponse(description="Курс удалён из избранного"),
            404: OpenApiResponse(description="Курс не был в избранном"),
        }
    )
    @action(detail=True, methods=['post'])
    def unsave(self, request, pk=None):
        """Удалить курс из избранного"""
        course = self.get_object()
        deleted, _ = SavedCourse.objects.filter(user=request.user, course=course).delete()
        if deleted:
            return Response({'status': 'unsaved', 'message': 'Курс удалён из сохранённых'}, status=status.HTTP_200_OK)
        return Response({'status': 'not_saved', 'message': 'Курс не был в сохранённых'},
                        status=status.HTTP_404_NOT_FOUND)

    @extend_schema(
        description="Возвращает курсы, купленные пользователем (список объектов с вложенным курсом).",
        responses={200: drf_serializers.ListSerializer(child=drf_serializers.DictField())}
    )
    @action(detail=False, methods=['get'], url_path='purchased_courses')
    def purchased_courses(self, request):
        """Возвратить курсы, купленные пользователем"""
        user = request.user
        if not user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=401)

        # Получить ID курсов, которые купил пользователь (используем модель PurchasedCourse)
        purchased_course_ids = PurchasedCourse.objects.filter(user=user).values_list('course_id', flat=True)

        courses = Course.objects.filter(course_id__in=purchased_course_ids)
        serializer = self.get_serializer(courses, many=True)

        # Сформировать ответ в том же формате, что и для saved_courses
        data = [{'course': course} for course in serializer.data]
        return Response({'results': data})

    @extend_schema(
        description="Купить курс. Требует авторизации.",
        request=None,
        responses={
            201: OpenApiResponse(description="Курс куплен"),
            400: OpenApiResponse(description="Курс уже куплен или недоступен"),
        }
    )
    @action(detail=True, methods=['post'])
    def purchase(self, request, pk=None):
        """Купить курс"""
        course = self.get_object()

        # Проверяем, не куплен ли уже
        if PurchasedCourse.objects.filter(user=request.user, course=course).exists():
            return Response({'status': 'already_purchased', 'message': 'Курс уже куплен'},
                            status=status.HTTP_400_BAD_REQUEST)

        # Проверяем статус курса (только опубликованные можно купить)
        if course.status != 'published':
            return Response({'status': 'not_available', 'message': 'Курс недоступен для покупки'},
                            status=status.HTTP_400_BAD_REQUEST)

        purchased = PurchasedCourse.objects.create(
            user=request.user,
            course=course,
            progress=0,
            status='active'
        )
        serializer = PurchasedCourseSerializer(purchased)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @extend_schema(
        description="Мои купленные курсы (список PurchasedCourse с вложенным курсом).",
        responses={200: PurchasedCourseSerializer(many=True)}
    )
    @action(detail=False, methods=['get'])
    def my_courses(self, request):
        """Мои купленные курсы"""
        purchased = PurchasedCourse.objects.filter(user=request.user).select_related('course')
        serializer = PurchasedCourseSerializer(purchased, many=True)
        return Response(serializer.data)

    @extend_schema(
        description="Мои сохранённые курсы (список SavedCourse с вложенным курсом).",
        responses={200: SavedCourseSerializer(many=True)}
    )
    @action(detail=False, methods=['get'])
    def saved_courses(self, request):
        """Мои сохранённые курсы"""
        saved = SavedCourse.objects.filter(user=request.user).select_related('course')
        serializer = SavedCourseSerializer(saved, many=True)
        return Response(serializer.data)

    @extend_schema(
        description="Мои курсы в корзине (список RecycleBinCourse с вложенным курсом).",
        responses={200: RecycleBinCourseSerializer(many=True)}
    )
    @action(detail=False, methods=['get'])
    def bin_courses(self, request):
        """Мои курсы в корзине"""
        binned = RecycleBinCourse.objects.filter(user=request.user).select_related('course')
        serializer = RecycleBinCourseSerializer(binned, many=True)
        return Response(serializer.data)

    @extend_schema(
        description="Переместить курс в корзину восстановления.",
        request=None,
        responses={
            200: OpenApiResponse(description="Курс перемещён в корзину"),
            400: OpenApiResponse(description="Курс уже в корзине"),
        }
    )
    @action(detail=True, methods=['post'])
    def move_to_recycle_bin(self, request, pk=None):
        """Переместить курс в корзину восстановления"""
        course = self.get_object()
        user = request.user
        # Проверить, не находится ли уже в корзине
        if RecycleBinCourse.objects.filter(user=user, course=course).exists():
            return Response({'status': 'already_in_bin', 'message': 'Курс уже в корзине'},
                            status=status.HTTP_400_BAD_REQUEST)

        # Удалить запись о покупке, если она есть
        PurchasedCourse.objects.filter(user=user, course=course).delete()
        # Добавить в корзину
        RecycleBinCourse.objects.create(user=user, course=course)
        return Response({'status': 'moved_to_bin', 'message': 'Курс перемещён в корзину'}, status=status.HTTP_200_OK)

    @extend_schema(
        description="Безвозвратно удалить курс из корзины пользователя (без возможности восстановления).",
        request=None,
        responses={
            200: OpenApiResponse(description="Курс удалён из корзины"),
            404: OpenApiResponse(description="Курс не найден в корзине"),
        }
    )
    @action(detail=True, methods=['delete'], url_path='remove_from_bin')
    def remove_from_bin(self, request, pk=None):
        """Безвозвратно удалить курс из корзины пользователя (без возможности восстановления)"""
        course = self.get_object()
        user = request.user

        bin_entry = RecycleBinCourse.objects.filter(user=user, course=course).first()
        if not bin_entry:
            return Response({'status': 'not_in_bin', 'message': 'Курс не найден в корзине'},
                            status=status.HTTP_404_NOT_FOUND)

        bin_entry.delete()
        return Response({'status': 'removed_from_bin', 'message': 'Курс полностью удалён из корзины'},
                        status=status.HTTP_200_OK)

    @extend_schema(
        description="Восстановить курс из корзины (вернуть в купленные).",
        request=None,
        responses={
            200: OpenApiResponse(description="Курс восстановлен"),
            404: OpenApiResponse(description="Курс не найден в корзине"),
        }
    )
    @action(detail=True, methods=['post'], url_path='restore_from_bin')
    def restore_from_bin(self, request, pk=None):
        """Восстановить курс из корзины (вернуть в купленные)"""
        course = self.get_object()
        user = request.user

        bin_entry = RecycleBinCourse.objects.filter(user=user, course=course).first()
        if not bin_entry:
            return Response({'status': 'not_in_bin', 'message': 'Курс не найден в корзине'},
                            status=status.HTTP_404_NOT_FOUND)

        # Восстанавливаем запись о покупке, если её нет
        PurchasedCourse.objects.get_or_create(
            user=user,
            course=course,
            defaults={'progress': 0, 'status': 'active'}
        )

        # Удаляем из корзины
        bin_entry.delete()

        return Response({'status': 'restored', 'message': 'Курс восстановлен из корзины'},
                        status=status.HTTP_200_OK)

    @extend_schema(
        description="Удаление курса (скрыть, но не удалять из БД).",
        request=None,
        responses={200: OpenApiResponse(description="Курс скрыт")}
    )
    @action(detail=True, methods=['delete'], url_path='soft_delete')
    def soft_delete(self, request, pk=None):
        """Удаление курса (скрыть, но не удалять из БД)"""
        course = self.get_object()
        from django.utils import timezone
        course.is_deleted = True
        course.deleted_at = timezone.now()
        course.save()
        return Response({'status': 'deleted', 'message': 'Course hidden from store'}, status=status.HTTP_200_OK)

    @extend_schema(
        description="Создать урок в курсе. Требует авторизации (автор курса или админ).",
        request=inline_serializer(
            name='AddLessonRequest',
            fields={
                'order': drf_serializers.IntegerField(),
                'name': drf_serializers.CharField(),
                'text': drf_serializers.CharField(required=False),
                'description': drf_serializers.CharField(required=False),
                'image': drf_serializers.ImageField(required=False),
                'video': drf_serializers.URLField(required=False),
                'task_file': drf_serializers.FileField(required=False),
            }
        ),
        responses={201: OpenApiResponse(description="Урок создан")}
    )
    @action(detail=True, methods=['post'], url_path='lessons')
    def add_lesson(self, request, pk=None):
        """Создать урок в курсе"""
        course = self.get_object()
        if course.created_by != request.user and not request.user.is_staff:
            return Response({'error': 'Only author can add lessons'}, status=status.HTTP_403_FORBIDDEN)

        from ..serializers import LessonCreateUpdateSerializer
        serializer = LessonCreateUpdateSerializer(data=request.data, context={'course': course})
        serializer.is_valid(raise_exception=True)
        serializer.save(course=course)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @extend_schema(
        description="Возвращает курсы, созданные текущим пользователем.",
        responses={200: CourseListSerializer(many=True)}
    )
    @action(detail=False, methods=['get'], url_path='my_created')
    def my_created(self, request):
        """Возвращает курсы, созданные текущим пользователем"""
        user = request.user
        if not user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=401)
        courses = Course.objects.filter(created_by=user)
        serializer = self.get_serializer(courses, many=True)
        return Response(serializer.data)

    @extend_schema(
        description="Получить оценку, которую текущий пользователь поставил курсу.",
        responses={200: inline_serializer(name='MyRatingResponse', fields={'rating': drf_serializers.IntegerField(allow_null=True)})}
    )
    @action(detail=True, methods=['get'], url_path='my-rating')
    def my_rating(self, request, pk=None):
        """Получить оценку, которую текущий пользователь поставил курсу"""
        course = self.get_object()
        if not request.user.is_authenticated:
            return Response({'rating': None})
        rating = CourseRating.objects.filter(user=request.user, course=course).first()
        return Response({'rating': rating.rating if rating else None})

    @extend_schema(
        description="Поставить оценку курсу (только для купивших курс). Ожидает JSON: {'rating': 3}.",
        request=inline_serializer(name='RateRequest', fields={'rating': drf_serializers.IntegerField(min_value=1, max_value=5)}),
        responses={200: inline_serializer(name='RateResponse', fields={'rating': drf_serializers.IntegerField(), 'course_rating': drf_serializers.DecimalField(max_digits=3, decimal_places=2)})}
    )
    @action(detail=True, methods=['post'], url_path='rate')
    def rate_course(self, request, pk=None):
        """
        Поставить оценку курсу (только для купивших курс).
        Ожидает JSON: {"rating": 3}
        """
        course = self.get_object()
        user = request.user
        if not user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=401)

        # Проверить, куплен ли курс пользователем
        if not PurchasedCourse.objects.filter(user=user, course=course, status='active').exists():
            return Response({'error': 'You can only rate courses you have purchased'}, status=403)

        rating_value = request.data.get('rating')
        try:
            rating_value = int(rating_value)
            if rating_value < 1 or rating_value > 5:
                raise ValueError
        except (TypeError, ValueError):
            return Response({'error': 'Rating must be an integer between 1 and 5'}, status=400)

        # Обновить или создать оценку
        obj, created = CourseRating.objects.update_or_create(
            user=user, course=course,
            defaults={'rating': rating_value}
        )
        course.update_rating()  # пересчитать средний рейтинг
        return Response({'rating': rating_value, 'course_rating': course.rating})