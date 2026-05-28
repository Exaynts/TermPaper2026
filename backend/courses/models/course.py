from django.db import models
from django.conf import settings
from .category import Category


class Course(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Черновик'
        PUBLISHED = 'published', 'Опубликован'
        ARCHIVED = 'archived', 'Архивирован'

    course_id = models.AutoField(primary_key=True, verbose_name='ID курса')
    name = models.CharField(max_length=255, verbose_name='Название курса')
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Цена')
    discount = models.PositiveSmallIntegerField(default=0, verbose_name='Скидка (%)')
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0, verbose_name='Рейтинг')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT, verbose_name='Статус')
    description = models.TextField(blank=True, verbose_name='Описание')
    image = models.ImageField(upload_to='courses/%Y/%m/%d/', blank=True, null=True, verbose_name='Изображение')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    is_deleted = models.BooleanField(default=False, verbose_name='Удалён автором')
    deleted_at = models.DateTimeField(null=True, blank=True, verbose_name='Дата удаления')

    # Связи
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_courses',
        verbose_name='Автор курса'
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='courses',
        verbose_name='Категория'
    )

    class Meta:
        verbose_name = 'Курс'
        verbose_name_plural = 'Курсы'
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    def publish(self):
        """Переводит курс в статус 'опубликован'"""
        if self.status != self.Status.PUBLISHED:
            self.status = self.Status.PUBLISHED
            self.save()

    def update_rating(self):
        """Метод для пересчёта рейтинга курса (вызывается при добавлении оценок)"""
        # Реализация будет зависеть от наличия модели Rating/Review
        pass