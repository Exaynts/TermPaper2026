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

    phone_number = serializers.CharField(
        required=False, allow_blank=True, allow_null=True,
    )
    date_of_birth = serializers.DateField(
        required=False, allow_null=True,
    )
    sex = serializers.CharField(
        required=False, allow_blank=True, allow_null=True,
    )
    math_level = serializers.CharField(
        required=False, allow_blank=True, allow_null=True,
    )

    class Meta:
        model = User
        fields = [
            'nickname', 'email', 'password', 'password2',
            'first_name', 'last_name', 'phone_number',
            'date_of_birth', 'sex', 'math_level'
        ]

    def to_internal_value(self, data):
        data = data.copy()
        for field in ('phone_number', 'date_of_birth', 'sex'):
            if field in data and data[field] == '':
                data[field] = None
        if 'math_level' in data and data['math_level'] == '':
            data.pop('math_level')

        return super().to_internal_value(data)

    def validate(self, attrs):
        """Проверить совпадение паролей"""
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Пароли не совпадают"})
        return attrs

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Пользователь с таким email уже существует")
        return value

    def validate_nickname(self, value):
        if User.objects.filter(nickname=value).exists():
            raise serializers.ValidationError("Пользователь с таким никнеймом уже существует")
        return value

    def validate_sex(self, value):
        if value in (None, ''):
            return None
        valid_choices = dict(User._meta.get_field('sex').choices)
        if value not in valid_choices:
            raise serializers.ValidationError("Недопустимое значение пола")
        return value

    def validate_math_level(self, value):
        # Пустое значение (если вдруг дошло) → default
        if value in (None, ''):
            return 'beginner'
        valid_choices = dict(User._meta.get_field('math_level').choices)
        if value not in valid_choices:
            raise serializers.ValidationError("Недопустимый уровень математики")
        return value

    def create(self, validated_data):
        validated_data.pop('password2')
        validated_data['username'] = validated_data.get('nickname')
        # Если math_level не пришёл — ставим default
        validated_data.setdefault('math_level', 'beginner')
        user = User.objects.create_user(**validated_data)
        return user


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
    username_or_email = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        username_or_email = attrs.get('username_or_email')
        password = attrs.get('password')

        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = None

        # Поиск по email (если похоже на email)
        if '@' in username_or_email and '.' in username_or_email:
            try:
                user = User.objects.get(email=username_or_email)
            except User.DoesNotExist:
                pass

        # Если не найден по email, ищем по username
        if not user:
            try:
                user = User.objects.get(username=username_or_email)
            except User.DoesNotExist:
                pass

        # Проверить пароль
        if not user or not user.check_password(password):
            raise serializers.ValidationError('Invalid username/email or password')

        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }