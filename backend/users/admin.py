# login: admin
# password: Novanova2020

# login: Jammy
# password: Novanova2020

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('id', 'nickname', 'email', 'first_name', 'last_name', 'is_staff')
    search_fields = ('nickname', 'email', 'first_name', 'last_name')
    list_filter = ('is_staff', 'is_active', 'sex', 'math_level')

    fieldsets = UserAdmin.fieldsets + (
        ('Дополнительная информация', {
            'fields': ('nickname', 'phone_number', 'date_of_birth', 'sex', 'math_level', 'avatar')
        }),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Дополнительная информация', {
            'fields': ('nickname', 'phone_number', 'date_of_birth', 'sex', 'math_level', 'avatar')
        }),
    )
