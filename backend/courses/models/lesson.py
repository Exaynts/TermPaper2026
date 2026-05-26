from django.db import models
from .course import Course

class Lesson(models.Model):
    lesson_id = models.AutoField(primary_key=True, verbose_name='ID урока')
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='lessons',
        verbose_name='Курс'
    )
    order = models.PositiveIntegerField(verbose_name='Порядок в курсе')
    name = models.CharField(max_length=255, verbose_name='Название урока')
    text = models.TextField(blank=True, verbose_name='Текстовое содержание')
    description = models.TextField(blank=True, verbose_name='Краткое описание')
    image = models.ImageField(
        upload_to='lessons/%Y/%m/%d/',
        blank=True,
        null=True,
        verbose_name='Изображение'
    )
    video = models.URLField(blank=True, null=True, verbose_name='Видео (URL)')
    task_file = models.FileField(
        upload_to='lessons/tasks/',
        blank=True,
        null=True,
        verbose_name='Файл задания'
    )

    class Meta:
        verbose_name = 'Урок'
        verbose_name_plural = 'Уроки'
        ordering = ['course', 'order']
        unique_together = (('course', 'order'),)

    def __str__(self):
        return f'{self.course.name} — {self.name}'