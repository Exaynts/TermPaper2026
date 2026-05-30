from rest_framework import viewsets, permissions
from django.shortcuts import get_object_or_404


from ..models import Course, Lesson
from ..serializers import LessonCreateUpdateSerializer, LessonDetailSerializer
from ..permissions import IsAuthorOrReadOnly


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