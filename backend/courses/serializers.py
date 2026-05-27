from rest_framework import serializers
from .models import (
    Category, Course, Lesson,
    SavedCourse, RecycleBinCourse, PurchasedCourse, LessonProgress
)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['category_id', 'title', 'slug']


class CourseListSerializer(serializers.ModelSerializer):
    category_title = serializers.CharField(source='category.title', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    author_name = serializers.CharField(source='created_by.nickname', read_only=True)
    discounted_price = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'course_id', 'name', 'price', 'discount', 'discounted_price',
            'rating', 'status', 'image', 'description', 'category_title', 'category_slug',
            'author_name', 'created_at'
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

    class Meta:
        model = Course
        fields = [
            'course_id', 'name', 'price', 'discount', 'discounted_price',
            'rating', 'status', 'description', 'image', 'created_at',
            'category', 'author'
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


class LessonDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['lesson_id', 'order', 'name', 'text', 'description', 'image', 'video', 'task_file']


class CourseCreateUpdateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания и обновления курса"""
    class Meta:
        model = Course
        fields = [
            'name', 'price', 'discount', 'status', 'description',
            'image', 'category'
        ]

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Цена не может быть отрицательной")
        return value

    def validate_discount(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Скидка должна быть от 0 до 100")
        return value


class LessonCreateUpdateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания и обновления урока"""
    class Meta:
        model = Lesson
        fields = [
            'order', 'name', 'text', 'description', 'image', 'video', 'task_file'
        ]

    def validate_order(self, value):
        if value < 0:
            raise serializers.ValidationError("Порядковый номер не может быть отрицательным")
        return value


class SavedCourseSerializer(serializers.ModelSerializer):
    """Сериализатор для сохранённых курсов"""
    course = CourseListSerializer(read_only=True)

    class Meta:
        model = SavedCourse
        fields = ['id', 'course', 'saved_at']


class PurchasedCourseSerializer(serializers.ModelSerializer):
    """Сериализатор для купленных курсов"""
    course = CourseListSerializer(read_only=True)

    class Meta:
        model = PurchasedCourse
        fields = ['id', 'course', 'progress', 'purchased_at', 'status']


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