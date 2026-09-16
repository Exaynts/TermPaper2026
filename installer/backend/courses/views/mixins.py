from rest_framework import permissions, filters

class CourseMixin:
    """ Общие настройки для курсов """
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'rating', 'created_at']