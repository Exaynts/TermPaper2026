from rest_framework import filters, viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from .models import Category, Course, Lesson, SavedCourse, RecycleBinCourse, PurchasedCourse, LessonProgress
from .serializers import (
    CategorySerializer, CourseListSerializer, CourseDetailSerializer,
    CourseCreateUpdateSerializer, LessonCreateUpdateSerializer,
    SavedCourseSerializer, RecycleBinCourseSerializer,
    PurchasedCourseSerializer, LessonProgressSerializer, LessonProgressCreateSerializer
)
from .permissions import IsAuthorOrReadOnly, IsAuthenticatedOrReadOnly
from .filters import CourseFilter


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet для категорий (только чтение)"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


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
        """Для списка – только опубликованные курсы. Для детального – все (проверка прав позже)"""
        if self.action == 'list':
            return Course.objects.filter(status='published').select_related('category', 'created_by').prefetch_related(
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
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthorOrReadOnly()]
        elif self.action in ['save', 'unsave', 'purchase', 'move_to_bin', 'restore_from_bin']:
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

    @action(detail=True, methods=['post'])
    def move_to_bin(self, request, pk=None):
        """Переместить курс в корзину восстановления"""
        course = self.get_object()
        # Проверяем, не находится ли уже в корзине
        if RecycleBinCourse.objects.filter(user=request.user, course=course).exists():
            return Response({'status': 'already_in_bin', 'message': 'Курс уже в корзине'},
                            status=status.HTTP_400_BAD_REQUEST)

        RecycleBinCourse.objects.create(user=request.user, course=course)
        return Response({'status': 'moved_to_bin', 'message': 'Курс перемещён в корзину'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def restore_from_bin(self, request, pk=None):
        """Восстановить курс из корзины"""
        course = self.get_object()
        deleted, _ = RecycleBinCourse.objects.filter(user=request.user, course=course).delete()
        if deleted:
            return Response({'status': 'restored', 'message': 'Курс восстановлен из корзины'},
                            status=status.HTTP_200_OK)
        return Response({'status': 'not_in_bin', 'message': 'Курс не найден в корзине'},
                        status=status.HTTP_404_NOT_FOUND)

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

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthorOrReadOnly()]
        return [permissions.AllowAny()]


class LessonProgressViewSet(viewsets.ViewSet):
    """ViewSet для отметки прогресса уроков"""
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='mark')
    def mark_completed(self, request):
        """Отметить урок как пройденный (или снять отметку)"""
        serializer = LessonProgressCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        lesson_id = serializer.validated_data['lesson']
        lesson = get_object_or_404(Lesson, pk=lesson_id)

        # Проверяем, что пользователь купил курс, содержащий этот урок
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

        # Ищем или создаём запись прогресса
        progress, created = LessonProgress.objects.get_or_create(
            purchased_course=purchased,
            lesson=lesson
        )

        if progress.completed_at is None:
            # Отмечаем пройденным
            from django.utils import timezone
            progress.completed_at = timezone.now()
            progress.save()

            # Пересчитываем общий прогресс курса
            total_lessons = lesson.course.lessons.count()
            completed_count = LessonProgress.objects.filter(
                purchased_course=purchased,
                completed_at__isnull=False
            ).count()

            purchased.progress = int((completed_count / total_lessons) * 100) if total_lessons > 0 else 0
            purchased.save()

            return Response({'status': 'completed', 'progress': purchased.progress})
        else:
            # Снимаем отметку
            progress.completed_at = None
            progress.save()

            # Пересчитываем прогресс
            total_lessons = lesson.course.lessons.count()
            completed_count = LessonProgress.objects.filter(
                purchased_course=purchased,
                completed_at__isnull=False
            ).count()

            purchased.progress = int((completed_count / total_lessons) * 100) if total_lessons > 0 else 0
            purchased.save()

            return Response({'status': 'incomplete', 'progress': purchased.progress})

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