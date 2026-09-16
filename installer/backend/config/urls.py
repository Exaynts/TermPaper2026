from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve
from drf_spectacular.views import (
    SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
)
from .views import spa_or_static

urlpatterns = [
    # Админка
    path('admin/', admin.site.urls),

    # API
    path('api/auth/', include('users.urls')),
    path('api/', include('courses.urls')),
    path('api/', include('notifications.urls')),

    # Документация
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

# Статика и медиа
urlpatterns += [
    re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]

# Catch-all — идёт ПОСЛЕДНИМ
urlpatterns += [
    re_path(r'^(?P<path>.*)$', spa_or_static),
]