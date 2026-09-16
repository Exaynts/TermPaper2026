from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers as drf_serializers

from ..models import Lesson, PurchasedCourse, LessonProgress
from ..serializers import LessonProgressCreateSerializer


class LessonProgressViewSet(viewsets.ViewSet):
    """ViewSet для отметки прогресса уроков"""
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        description="Отметить урок как пройденный или снять отметку. Возвращает обновлённый прогресс курса.",
        request=LessonProgressCreateSerializer,
        responses={
            200: inline_serializer(
                name='MarkProgressResponse',
                fields={
                    'status': drf_serializers.CharField(),
                    'progress': drf_serializers.IntegerField()
                }
            )
        }
    )
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

    @extend_schema(
        description="Прогресс по всем купленным курсам пользователя.",
        responses={
            200: inline_serializer(
                name='MyProgressResponse',
                fields={
                    'course_id': drf_serializers.IntegerField(),
                    'course_name': drf_serializers.CharField(),
                    'progress': drf_serializers.IntegerField(),
                    'completed_lessons': drf_serializers.ListField(child=drf_serializers.IntegerField()),
                    'total_lessons': drf_serializers.IntegerField(),
                },
                many=True
            )
        }
    )
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