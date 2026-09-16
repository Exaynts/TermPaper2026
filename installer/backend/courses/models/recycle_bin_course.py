from django.db import models
from django.conf import settings

class RecycleBinCourse(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='deleted_courses',
        verbose_name='Пользователь'
    )
    course = models.ForeignKey(
        'Course',
        on_delete=models.CASCADE,
        related_name='deleted_by_users',
        verbose_name='Курс'
    )
    deleted_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата удаления')

    class Meta:
        verbose_name = 'Курс в корзине'
        verbose_name_plural = 'Курсы в корзине'
        unique_together = (('user', 'course'),)

    def __str__(self):
        return f'{self.course.name} (удалён пользователем {self.user.nickname})'