from django.db import models
from django.contrib.auth.models import AbstractUser

from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    nickname = models.CharField(max_length=150, unique=True, verbose_name='Никнейм')
    phone_number = models.CharField(max_length=20, blank=True, null=True, verbose_name='Телефон')
    date_of_birth = models.DateField(blank=True, null=True, verbose_name='Дата рождения')

    sex = models.CharField(
        max_length=1,
        choices=[
            ('M', 'Мужской'),
            ('F', 'Женский'),
            ('O', 'Другой')
        ],
        blank=True,
        null=True,
        verbose_name='Пол'
    )

    math_level = models.CharField(
        max_length=20,
        choices=[
            ('beginner', 'Начальный'),
            ('intermediate', 'Средний'),
            ('advanced', 'Продвинутый')
        ],
        default='beginner',
        verbose_name='Уровень математики'
    )

    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True, verbose_name='Аватар')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nickname', 'first_name', 'last_name']

    def __str__(self):
        return self.nickname or self.username