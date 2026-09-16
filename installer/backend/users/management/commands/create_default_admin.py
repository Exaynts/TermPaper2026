from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()

DEFAULT_EMAIL = 'admin@mathjam.local'
DEFAULT_NICKNAME = 'admin'
DEFAULT_PASSWORD = 'mathjam1!'
DEFAULT_FIRST_NAME = 'Admin'
DEFAULT_LAST_NAME = 'Adminer'


class Command(BaseCommand):
    help = 'Создаёт суперпользователя по умолчанию, если его ещё нет'

    def handle(self, *args, **options):
        if User.objects.filter(is_superuser=True).exists():
            self.stdout.write(self.style.WARNING(
                'Суперпользователь уже существует. Пропускаю создание.'
            ))
            return

        User.objects.create_superuser(
            email=DEFAULT_EMAIL,
            nickname=DEFAULT_NICKNAME,
            password=DEFAULT_PASSWORD,
            first_name=DEFAULT_FIRST_NAME,
            last_name=DEFAULT_LAST_NAME,
        )

        self.stdout.write(self.style.SUCCESS('Суперпользователь создан.'))
        self.stdout.write(f'  Email:    {DEFAULT_EMAIL}')
        self.stdout.write(f'  Nickname: {DEFAULT_NICKNAME}')
        self.stdout.write(f'  Пароль:   {DEFAULT_PASSWORD}')