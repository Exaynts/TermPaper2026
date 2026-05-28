from django.db import models
from django.conf import settings

class CourseRating(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='course_ratings',
        verbose_name='Пользователь'
    )
    course = models.ForeignKey(
        'Course',
        on_delete=models.CASCADE,
        related_name='ratings',
        verbose_name='Курс'
    )
    rating = models.PositiveSmallIntegerField(
        choices=[(i, i) for i in range(1, 6)],
        verbose_name='Оценка (1–5)'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = (('user', 'course'),)
        verbose_name = 'Оценка курса'
        verbose_name_plural = 'Оценки курсов'

    def __str__(self):
        return f'{self.user} -> {self.course} : {self.rating}'