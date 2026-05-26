from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, UserSerializer, ProfileUpdateSerializer
from rest_framework_simplejwt.views import TokenViewBase
from .serializers import CustomTokenObtainPairSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """
    Регистрация нового пользователя
    POST /api/auth/register/
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "user": UserSerializer(user).data,
                "message": "Пользователь успешно зарегистрирован"
            },
            status=status.HTTP_201_CREATED
        )


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    Получение и обновление профиля пользователя
    GET /api/auth/profile/
    PUT/PATCH /api/auth/profile/
    """
    serializer_class = ProfileUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        """Для GET-запроса возвращаем больше полей, для PUT/PATCH – только редактируемые"""
        if self.request.method == 'GET':
            return UserSerializer
        return ProfileUpdateSerializer


class CustomTokenObtainPairView(TokenViewBase):
    """View для получения JWT токенов с использованием email"""
    serializer_class = CustomTokenObtainPairSerializer