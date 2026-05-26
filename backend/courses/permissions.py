from rest_framework import permissions


class IsAuthorOrReadOnly(permissions.BasePermission):
    """
    Разрешение, позволяющее редактировать/удалять курс только его автору или админу
    Чтение доступно всем.
    """

    def has_object_permission(self, request, view, obj):
        # Разрешаем безопасные методы (GET, HEAD, OPTIONS) всем
        if request.method in permissions.SAFE_METHODS:
            return True

        # Редактирование/удаление разрешено автору или администратору
        return obj.created_by == request.user or request.user.is_staff


class IsAdminOrReadOnly(permissions.BasePermission):

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True

        # Изменение только для администраторов
        return request.user and request.user.is_staff


class IsAuthenticatedOrReadOnly(permissions.BasePermission):

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated