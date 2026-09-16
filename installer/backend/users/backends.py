from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()

class EmailBackend(ModelBackend):
    """Аутентификация по email (только если передан email)"""

    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            return None

        # Проверить: это email? (содержит @ и .)
        if '@' in username and '.' in username:
            try:
                user = User.objects.get(email=username)
                if user.check_password(password) and self.user_can_authenticate(user):
                    return user
            except User.DoesNotExist:
                return None
        # Если это не email, возвратить None и дать обработать логин
        return None