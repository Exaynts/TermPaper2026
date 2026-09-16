from django.db import models
from .lesson import Lesson

class LessonProgress(models.Model):
    purchased_course = models.ForeignKey(
        'PurchasedCourse',
        on_delete=models.CASCADE,
        related_name='lesson_progresses',
        verbose_name='Купленный курс'
    )
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name='progresses',
        verbose_name='Урок'
    )
    completed_at = models.DateTimeField(blank=True, null=True, verbose_name='Дата завершения')

    class Meta:
        verbose_name = 'Прогресс урока'
        verbose_name_plural = 'Прогрессы уроков'
        unique_together = (('purchased_course', 'lesson'),)

    def __str__(self):
        return f'{self.purchased_course.course.name} — {self.lesson.name}'