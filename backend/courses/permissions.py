from rest_framework import permissions


class IsAuthorOrReadOnly(permissions.BasePermission):
    """
    Разрешение, позволяющее редактировать/удалять курс или урок только его автору или админу.
    Чтение доступно всем.
    """

    def has_object_permission(self, request, view, obj):
        # Разрешаем безопасные методы (GET, HEAD, OPTIONS) всем
        if request.method in permissions.SAFE_METHODS:
            return True

        # Для модели Course
        if hasattr(obj, 'created_by'):
            return obj.created_by == request.user or request.user.is_staff
        # Для модели Lesson
        elif hasattr(obj, 'course') and hasattr(obj.course, 'created_by'):
            return obj.course.created_by == request.user or request.user.is_staff
        # Для других моделей (если понадобятся)
        return False


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Разрешение, позволяющее изменять объекты только администраторам.
    Чтение доступно всем.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class IsAuthenticatedOrReadOnly(permissions.BasePermission):
    """
    Разрешение, позволяющее изменять объекты только авторизованным пользователям.
    Чтение доступно всем.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated