from django.db import models

class Category(models.Model):
    category_id = models.AutoField(primary_key=True, verbose_name='ID категории')
    title = models.CharField(max_length=150, unique=True, verbose_name='Название категории')
    slug = models.SlugField(max_length=150, unique=True, verbose_name='Человекопонятный URL')

    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'
        ordering = ['title']

    def __str__(self):
        return self.title