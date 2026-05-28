from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'courses', views.CourseViewSet, basename='course')

urlpatterns = [
    path('', include(router.urls)),
    path('courses/<int:pk>/lessons/', views.CourseViewSet.as_view({'post': 'add_lesson'}), name='course-lessons'),
]