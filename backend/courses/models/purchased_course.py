from django.db import models
from django.conf import settings

class PurchasedCourse(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'active', 'Активен'
        EXPIRED = 'expired', 'Истёк'
        REFUNDED = 'refunded', 'Возвращён'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='purchased_courses',
        verbose_name='Пользователь'
    )
    course = models.ForeignKey(
        'Course',
        on_delete=models.CASCADE,
        related_name='purchased_by_users',
        verbose_name='Курс'
    )
    progress = models.PositiveSmallIntegerField(default=0, verbose_name='Прогресс (%)')
    purchased_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата покупки')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE, verbose_name='Статус')

    class Meta:
        verbose_name = 'Купленный курс'
        verbose_name_plural = 'Купленные курсы'
        unique_together = (('user', 'course'),)

    def __str__(self):
        return f'{self.user.nickname} — {self.course.name} ({self.progress}%)'