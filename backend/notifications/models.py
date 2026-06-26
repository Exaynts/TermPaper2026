# backend/notifications/models.py
from django.db import models
from django.conf import settings
from django.utils import timezone

class Notification(models.Model):
    TYPE_CHOICES = (
        ('registration', 'Registration'),
        ('purchase', 'Purchase'),
        ('lesson_completed', 'Lesson Completed'),
        ('moved_to_bin', 'Moved to Bin'),
        ('restored_from_bin', 'Restored from Bin'),
        ('removed_from_bin', 'Removed from Bin'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    message = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    is_read = models.BooleanField(default=False)
    data = models.JSONField(default=dict, blank=True)  # хранит дополнительные данные (course_id, lesson_id)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'

    def __str__(self):
        return f"{self.user.username} - {self.type} - {self.created_at}"