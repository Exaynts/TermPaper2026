from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Сериализатор для данных пользователя (чтение, обновление профиля)"""
    class Meta:
        model = User
        fields = [
            'id', 'nickname', 'email', 'first_name', 'last_name',
            'phone_number', 'date_of_birth', 'sex', 'math_level', 'avatar'
        ]
        read_only_fields = ['id', 'email']


class RegisterSerializer(serializers.ModelSerializer):
    """Сериализатор для регистрации нового пользователя"""
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = [
            'nickname', 'email', 'password', 'password2',
            'first_name', 'last_name', 'phone_number',
            'date_of_birth', 'sex', 'math_level'
        ]

    def validate(self, attrs):
        """Проверка совпадения паролей"""
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Пароли не совпадают"})
        return attrs

    def validate_email(self, value):
        """Проверка уникальности email"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Пользователь с таким email уже существует")
        return value

    def validate_nickname(self, value):
        """Проверка уникальности никнейма"""
        if User.objects.filter(nickname=value).exists():
            raise serializers.ValidationError("Пользователь с таким никнеймом уже существует")
        return value

    def create(self, validated_data):
        """Создание пользователя с хешированием пароля"""
        validated_data.pop('password2')
        # Устанавливаем username на основе nickname (обязательное поле)
        validated_data['username'] = validated_data.get('nickname')
        user = User.objects.create_user(**validated_data)
        return user

    def validate_date_of_birth(self, value):
        return value if value else None
    def validate_sex(self, value):
        return value if value else None
    def validate_phone_number(self, value):
        return value if value else None


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Сериализатор для обновления профиля пользователя"""
    class Meta:
        model = User
        fields = [
            'nickname', 'first_name', 'last_name', 'phone_number',
            'date_of_birth', 'sex', 'math_level', 'avatar'
        ]

    def validate_nickname(self, value):
        """Проверка уникальности никнейма при обновлении"""
        user = self.instance
        if User.objects.exclude(id=user.id).filter(nickname=value).exists():
            raise serializers.ValidationError("Пользователь с таким никнеймом уже существует")
        return value


class CustomTokenObtainPairSerializer(serializers.Serializer):
    """Сериализатор для входа по email"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        print(f"DEBUG: Попытка входа с email={email}, password={password}")

        user = authenticate(request=self.context.get('request'), username=email, password=password)

        print(f"DEBUG: Результат authenticate: {user}")

        if not user:
            raise serializers.ValidationError('Неверный email или пароль')

        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }