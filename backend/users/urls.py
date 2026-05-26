from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from . import views

urlpatterns = [
    # Регистрация и профиль
    path('register/', views.RegisterView.as_view(), name='register'),
    path('profile/', views.ProfileView.as_view(), name='profile'),

    # JWT аутентификация (кастомный login по email)
    path('login/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
]