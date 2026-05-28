from rest_framework import filters, viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from .models import Category, Course, Lesson, SavedCourse, PurchasedCourse, RecycleBinCourse, LessonProgress
from .serializers import (
    CategorySerializer, CourseListSerializer, CourseDetailSerializer,
    CourseCreateUpdateSerializer, LessonCreateUpdateSerializer,
    SavedCourseSerializer, RecycleBinCourseSerializer,
    PurchasedCourseSerializer, LessonProgressSerializer, LessonProgressCreateSerializer
)
from .permissions import IsAuthorOrReadOnly
from .filters import CourseFilter


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet для категорий (только чтение)"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


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
        - Для действий, связанных с пользовательскими данными (save, unsave, purchase, move_to_bin, restore_from_bin) – только аутентифицированный пользователь.
        - Для остальных (list, retrieve) – любой (AllowAny).
        """
        if self.action in ['create', 'update', 'partial_update', 'soft_delete', 'destroy']:
            return [IsAuthorOrReadOnly()]
        elif self.action in ['save', 'unsave', 'purchase', 'move_to_recycle_bin', 'restore_from_bin',
                             'remove_from_bin', 'add_lesson', 'my_created']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    # Дополнительные действия (actions)

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

    @action(detail=True, methods=['post'])
    def unsave(self, request, pk=None):
        """Удалить курс из избранного"""
        course = self.get_object()
        deleted, _ = SavedCourse.objects.filter(user=request.user, course=course).delete()
        if deleted:
            return Response({'status': 'unsaved', 'message': 'Курс удалён из сохранённых'}, status=status.HTTP_200_OK)
        return Response({'status': 'not_saved', 'message': 'Курс не был в сохранённых'},
                        status=status.HTTP_404_NOT_FOUND)

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

    @action(detail=False, methods=['get'])
    def my_courses(self, request):
        """Мои купленные курсы"""
        purchased = PurchasedCourse.objects.filter(user=request.user).select_related('course')
        serializer = PurchasedCourseSerializer(purchased, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def saved_courses(self, request):
        """Мои сохранённые курсы"""
        saved = SavedCourse.objects.filter(user=request.user).select_related('course')
        serializer = SavedCourseSerializer(saved, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def bin_courses(self, request):
        """Мои курсы в корзине"""
        binned = RecycleBinCourse.objects.filter(user=request.user).select_related('course')
        serializer = RecycleBinCourseSerializer(binned, many=True)
        return Response(serializer.data)

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

    @action(detail=True, methods=['delete'], url_path='soft_delete')
    def soft_delete(self, request, pk=None):
        """Удаление курса (скрыть, но не удалять из БД)"""
        course = self.get_object()
        from django.utils import timezone
        course.is_deleted = True
        course.deleted_at = timezone.now()
        course.save()
        return Response({'status': 'deleted', 'message': 'Course hidden from store'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='lessons')
    def add_lesson(self, request, pk=None):
        """Создать урок в курсе"""
        course = self.get_object()
        if course.created_by != request.user and not request.user.is_staff:
            return Response({'error': 'Only author can add lessons'}, status=status.HTTP_403_FORBIDDEN)

        serializer = LessonCreateUpdateSerializer(data=request.data, context={'course': course})
        serializer.is_valid(raise_exception=True)
        serializer.save(course=course)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='my_created')
    def my_created(self, request):
        """Возвращает курсы, созданные текущим пользователем"""
        user = request.user
        if not user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=401)
        courses = Course.objects.filter(created_by=user)
        serializer = self.get_serializer(courses, many=True)
        return Response(serializer.data)

class LessonViewSet(viewsets.ModelViewSet):
    """
    ViewSet для уроков (вложенный в курс):
    - GET /api/courses/{course_pk}/lessons/ – список уроков курса
    - GET /api/lessons/{id}/ – детальная информация урока (с проверкой доступа)
    - POST /api/courses/{course_pk}/lessons/ – создание урока (только автор курса или админ)
    - PUT/PATCH /api/lessons/{id}/ – обновление (только автор курса или админ)
    - DELETE /api/lessons/{id}/ – удаление (только автор курса или админ)
    """
    serializer_class = LessonCreateUpdateSerializer
    permission_classes = [IsAuthorOrReadOnly]

    def get_queryset(self):
        course_pk = self.kwargs.get('course_pk')
        if course_pk:
            return Lesson.objects.filter(course_id=course_pk)
        return Lesson.objects.all()

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            # Для чтения используем детальный сериализатор
            from .serializers import LessonDetailSerializer
            return LessonDetailSerializer
        return LessonCreateUpdateSerializer

    def perform_create(self, serializer):
        course_pk = self.kwargs.get('course_pk')
        course = get_object_or_404(Course, pk=course_pk)
        # Проверяем, что текущий пользователь — автор курса или админ
        if course.created_by != self.request.user and not self.request.user.is_staff:
            self.permission_denied(self.request, message="Вы не являетесь автором этого курса")
        serializer.save(course=course)

    def perform_destroy(self, instance):
        """Мягкое удаление курса: пометить как удалённый, но не удалять из БД"""
        from django.utils import timezone
        instance.is_deleted = True
        instance.deleted_at = timezone.now()
        instance.save()

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthorOrReadOnly()]
        return [permissions.AllowAny()]


class LessonProgressViewSet(viewsets.ViewSet):
    """ViewSet для отметки прогресса уроков"""
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='mark')
    def mark_completed(self, request):
        """
        Отметить урок как пройденный или снять отметку.
        Возвращает обновлённый прогресс курса.
        """
        serializer = LessonProgressCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        lesson_id = request.data.get('lesson')
        lesson = get_object_or_404(Lesson, pk=lesson_id)

        # Проверить, что пользователь купил курс
        purchased = PurchasedCourse.objects.filter(
            user=request.user,
            course=lesson.course,
            status='active'
        ).first()

        if not purchased:
            return Response(
                {'error': 'Вы не приобрели этот курс'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Найти или создать запись прогресса
        progress, created = LessonProgress.objects.get_or_create(
            purchased_course=purchased,
            lesson=lesson
        )

        # Переключить состояние завершённости
        if progress.completed_at is None:
            from django.utils import timezone
            progress.completed_at = timezone.now()
        else:
            progress.completed_at = None
        progress.save()

        # Пересчитать общий прогресс курса
        total_lessons = lesson.course.lessons.count()
        if total_lessons > 0:
            completed_count = LessonProgress.objects.filter(
                purchased_course=purchased,
                completed_at__isnull=False
            ).count()
            purchased.progress = int((completed_count / total_lessons) * 100)
        else:
            purchased.progress = 0
        purchased.save()

        status_msg = 'completed' if progress.completed_at else 'incomplete'
        return Response({'status': status_msg, 'progress': purchased.progress})

    @action(detail=False, methods=['get'], url_path='my-progress')
    def my_progress(self, request):
        """Прогресс по всем купленным курсам пользователя"""
        purchased_courses = PurchasedCourse.objects.filter(user=request.user, status='active')
        result = []
        for purchased in purchased_courses:
            lessons = purchased.course.lessons.all()
            completed = LessonProgress.objects.filter(
                purchased_course=purchased,
                completed_at__isnull=False
            ).values_list('lesson_id', flat=True)

            result.append({
                'course_id': purchased.course.course_id,
                'course_name': purchased.course.name,
                'progress': purchased.progress,
                'completed_lessons': list(completed),
                'total_lessons': lessons.count()
            })
        return Response(result)