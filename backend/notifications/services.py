import threading
from django.core.mail import send_mail
from django.conf import settings
from .models import Notification


class EmailNotificationService:
    """Сервис для отправки email-уведомлений."""

    @staticmethod
    def _send_email_async(subject, message, recipient):
        """Фоновый поток для отправки письма."""
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient],
                fail_silently=False,
            )
        except Exception as e:
            # Логирововать возможную ошибку
            print(f"Email sending failed: {e}")

    @staticmethod
    def send_notification_email(notification: Notification):
        """Отправить email пользователю на основе объекта Notification (асинхронно)"""
        if not notification.user.email:
            return

        subject_map = {
            'registration': 'Welcome to MathJam!',
            'purchase': 'Course Purchase Confirmation',
            'lesson_completed': 'Lesson Completed!',
            'moved_to_bin': 'Course Moved to Recycle Bin',
            'restored_from_bin': 'Course Restored',
            'removed_from_bin': 'Course Permanently Deleted',
        }

        subject = subject_map.get(notification.type, 'MathJam Notification')
        message = notification.message + '\n\nBest regards,\nMathJam Team'

        # Запустить отправку в отдельном потоке
        thread = threading.Thread(
            target=EmailNotificationService._send_email_async,
            args=(subject, message, notification.user.email)
        )
        thread.daemon = True
        thread.start()