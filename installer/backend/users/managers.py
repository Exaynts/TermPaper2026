from django.contrib.auth.models import BaseUserManager


class UserManager(BaseUserManager):
    """
    Менеджер для кастомной модели User (аутентификация по email).
    """

    def create_user(self, email, nickname, password=None, **extra_fields):
        if not email:
            raise ValueError('Email обязателен')
        if not nickname:
            raise ValueError('Nickname обязателен')

        email = self.normalize_email(email)
        extra_fields.setdefault('is_active', True)

        # Поле username из AbstractUser не используется для входа,
        # но имеет UNIQUE-ограничение. Заполняем его email'ом,
        # чтобы create_superuser и create_user работали корректно.
        extra_fields.setdefault('username', email)

        user = self.model(email=email, nickname=nickname, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, nickname, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Суперпользователь должен иметь is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Суперпользователь должен иметь is_superuser=True.')

        return self.create_user(email, nickname, password, **extra_fields)