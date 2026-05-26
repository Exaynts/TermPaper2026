# login: admin
# password: Novanova2020
from django.contrib import admin
from .models import (
    Category, Course, Lesson, SavedCourse,
    RecycleBinCourse, PurchasedCourse, LessonProgress
)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('category_id', 'title', 'slug')
    search_fields = ('title',)
    prepopulated_fields = {'slug': ('title',)}
    list_display_links = ('category_id', 'title')

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('course_id', 'name', 'price', 'discount', 'rating', 'status', 'category', 'created_by', 'created_at')
    list_filter = ('status', 'category', 'created_at')
    search_fields = ('name', 'description')
    readonly_fields = ('rating', 'created_at')
    fieldsets = (
        (None, {'fields': ('name', 'category', 'description', 'image')}),
        ('Цены и скидки', {'fields': ('price', 'discount')}),
        ('Статус и рейтинг', {'fields': ('status', 'rating')}),
        ('Автор и дата', {'fields': ('created_by', 'created_at')}),
    )

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('lesson_id', 'course', 'order', 'name', 'has_video', 'has_task')
    list_filter = ('course',)
    search_fields = ('name', 'text')
    list_editable = ('order',)
    fieldsets = (
        (None, {'fields': ('course', 'order', 'name', 'description', 'text')}),
        ('Медиа', {'fields': ('image', 'video', 'task_file')}),
    )

    def has_video(self, obj):
        return bool(obj.video)
    has_video.boolean = True
    has_video.short_description = 'Видео'

    def has_task(self, obj):
        return bool(obj.task_file)
    has_task.boolean = True
    has_task.short_description = 'Задание'

@admin.register(SavedCourse)
class SavedCourseAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'course', 'saved_at')
    list_filter = ('saved_at',)
    search_fields = ('user__nickname', 'course__name')
    readonly_fields = ('saved_at',)

@admin.register(RecycleBinCourse)
class RecycleBinCourseAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'course', 'deleted_at')
    list_filter = ('deleted_at',)
    search_fields = ('user__nickname', 'course__name')
    readonly_fields = ('deleted_at',)

@admin.register(PurchasedCourse)
class PurchasedCourseAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'course', 'progress', 'purchased_at', 'status')
    list_filter = ('status', 'purchased_at')
    search_fields = ('user__nickname', 'course__name')
    readonly_fields = ('purchased_at',)
    list_editable = ('progress', 'status')

@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ('id', 'purchased_course', 'lesson', 'completed_at')
    list_filter = ('completed_at',)
    search_fields = ('purchased_course__user__nickname', 'lesson__name')
    readonly_fields = ('completed_at',)