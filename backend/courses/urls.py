from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'courses', views.CourseViewSet, basename='course')
router.register(r'lessons', views.LessonViewSet, basename='lesson')

urlpatterns = [
    path('', include(router.urls)),
]