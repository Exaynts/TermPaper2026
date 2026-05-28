from rest_framework import serializers
from .models import (
    Category, Course, Lesson,
    SavedCourse, RecycleBinCourse, PurchasedCourse, LessonProgress
)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['category_id', 'title', 'slug']

class LessonDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['lesson_id', 'order', 'name', 'text', 'description', 'image', 'video', 'task_file']

class CourseListSerializer(serializers.ModelSerializer):
    category_title = serializers.CharField(source='category.title', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    author_name = serializers.CharField(source='created_by.nickname', read_only=True)
    discounted_price = serializers.SerializerMethodField()
    created_by_id = serializers.IntegerField(source='created_by.id', read_only=True)

    class Meta:
        model = Course
        fields = [
            'course_id', 'name', 'price', 'discount', 'discounted_price',
            'rating', 'status', 'image', 'description', 'category_title', 'category_slug',
            'author_name', 'created_at', 'created_by_id',
        ]

    def get_discounted_price(self, obj):
        """Вычислить цену со скидкой"""
        if obj.discount and obj.discount > 0:
            return float(obj.price) * (1 - obj.discount / 100)
        return float(obj.price)


class CourseDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    author = serializers.StringRelatedField(source='created_by', read_only=True)
    discounted_price = serializers.SerializerMethodField()
    lessons = LessonDetailSerializer(many=True, read_only=True)
    created_by_id = serializers.IntegerField(source='created_by.id', read_only=True)

    class Meta:
        model = Course
        fields = [
            'course_id', 'name', 'price', 'discount', 'discounted_price',
            'rating', 'status', 'description', 'image', 'created_at',
            'category', 'author', 'lessons', 'created_by_id'
        ]

    def get_discounted_price(self, obj):
        if obj.discount and obj.discount > 0:
            return float(obj.price) * (1 - obj.discount / 100)
        return float(obj.price)


class LessonListSerializer(serializers.ModelSerializer):
    has_video = serializers.SerializerMethodField()
    has_task = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ['lesson_id', 'order', 'name', 'has_video', 'has_task']

    def get_has_video(self, obj):
        return bool(obj.video)

    def get_has_task(self, obj):
        return bool(obj.task_file)


class CourseCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['course_id', 'name', 'price', 'discount', 'status', 'description', 'image', 'category']
        read_only_fields = ['course_id']

    def validate_name(self, value):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            instance = self.instance
            # Если обновляем курс и имя не изменилось – пропускаем
            if instance and instance.name == value:
                return value
            if Course.objects.filter(created_by=request.user, name__iexact=value).exists():
                raise serializers.ValidationError(
                    "You have already created a course with this name. Please choose a different name."
                )
        return value

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price cannot be negative")
        if value > 99_999_999:
            raise serializers.ValidationError("Price cannot exceed 1,000,000 ₽")
        # Валидация количества знаков после запятой (максимум 2)
        if hasattr(value, 'as_tuple'):  # для Decimal
            if value.as_tuple().exponent < -2:
                raise serializers.ValidationError("Price can have at most 2 decimal places")
        return value

    def validate_discount(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Discount must be between 0 and 100")
        return value


class LessonCreateUpdateSerializer(serializers.ModelSerializer):
    task_file = serializers.FileField(required=False, allow_null=True)
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Lesson
        fields = ['order', 'name', 'text', 'description', 'image', 'video', 'task_file']

    def validate_order(self, value):
        if value < 0:
            raise serializers.ValidationError("Порядковый номер не может быть отрицательным")
        return value

    def validate(self, data):
        # Определяем курс: либо из контекста (создание), либо из существующего экземпляра (обновление)
        course = None
        if 'course' in self.context:
            course = self.context['course']
        elif self.instance and self.instance.course:
            course = self.instance.course

        if course:
            order = data.get('order')
            # При обновлении исключаем текущий урок
            qs = Lesson.objects.filter(course=course, order=order)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError(
                    {'order': f'Lesson with order {order} already exists in this course.'}
                )
        return data

    def validate_task_file(self, value):
        if value is None:
            return value
        max_size = 25 * 1024 * 1024
        if value.size > max_size:
            raise serializers.ValidationError(
                f"File size must not exceed 25 MB (current: {value.size // (1024 * 1024)} MB)."
            )
        return value


class SavedCourseSerializer(serializers.ModelSerializer):
    """Сериализатор для сохранённых курсов"""
    course = CourseListSerializer(read_only=True)

    class Meta:
        model = SavedCourse
        fields = ['id', 'course', 'saved_at']


class PurchasedCourseSerializer(serializers.ModelSerializer):
    """Сериализатор для купленных курсов"""
    course = serializers.SerializerMethodField()

    class Meta:
        model = PurchasedCourse
        fields = ['id', 'course', 'progress', 'purchased_at', 'status']

    def get_course(self, obj):
        # Вернуть объект, если курс помечен как удалённый
        if obj.course.is_deleted:
            return {
                'course_id': obj.course.course_id,
                'name': obj.course.name,
                'is_deleted': True,
                'deleted_at': obj.course.deleted_at,
            }
        # Если курс не удален, использовать существующий сериализатор
        return CourseListSerializer(obj.course).data


class RecycleBinCourseSerializer(serializers.ModelSerializer):
    """Сериализатор для корзины восстановления"""
    course = CourseListSerializer(read_only=True)

    class Meta:
        model = RecycleBinCourse
        fields = ['id', 'course', 'deleted_at']


class LessonProgressSerializer(serializers.ModelSerializer):
    """Сериализатор для прогресса уроков"""
    lesson = LessonListSerializer(read_only=True)

    class Meta:
        model = LessonProgress
        fields = ['id', 'lesson', 'completed_at']


class LessonProgressCreateSerializer(serializers.ModelSerializer):
    """Сериализатор для отметки прогресса урока (только lesson_id)"""

    class Meta:
        model = LessonProgress
        fields = ['lesson']