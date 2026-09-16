from rest_framework import viewsets, permissions
from ..models import Category
from ..serializers import CategorySerializer

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ ViewSet для категорий """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None