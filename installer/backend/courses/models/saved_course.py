from django.db import models
from django.conf import settings

class SavedCourse(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='saved_courses',
        verbose_name='Пользователь'
    )
    course = models.ForeignKey(
        'Course',
        on_delete=models.CASCADE,
        related_name='saved_by_users',
        verbose_name='Курс'
    )
    saved_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата сохранения')

    class Meta:
        verbose_name = 'Сохранённый курс'
        verbose_name_plural = 'Сохранённые курсы'
        unique_together = (('user', 'course'),)  # один пользователь может сохранить курс только один раз

    def __str__(self):
        return f'{self.user.nickname} сохранил {self.course.name}'