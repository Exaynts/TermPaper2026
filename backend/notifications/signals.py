from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from courses.models import PurchasedCourse, LessonProgress, RecycleBinCourse
from .models import Notification

User = get_user_model()

@receiver(post_save, sender=User)
def notify_registration(sender, instance, created, **kwargs):
    """Создать уведомление при регистрации нового пользователя."""
    if created:
        Notification.objects.create(
            user=instance,
            type='registration',
            message=f'Welcome to MathJam, {instance.username}! Your account has been successfully created.'
        )

@receiver(post_save, sender=PurchasedCourse)
def notify_purchase(sender, instance, created, **kwargs):
    """Создать уведомление при покупке курса."""
    if created:
        Notification.objects.create(
            user=instance.user,
            type='purchase',
            message=f'You have successfully purchased the course "{instance.course.name}". Start learning now!',
            data={'course_id': instance.course.course_id}
        )

@receiver(post_save, sender=LessonProgress)
def notify_lesson_completed(sender, instance, created, **kwargs):
    """ Создать уведомление при отметке урока как пройденного """
    if instance.completed_at is not None:
        # Проверить, не было ли уже уведомления для этого урока
        existing = Notification.objects.filter(
            user=instance.purchased_course.user,
            type='lesson_completed',
            data__lesson_id=instance.lesson.lesson_id
        ).exists()
        if not existing:
            Notification.objects.create(
                user=instance.purchased_course.user,
                type='lesson_completed',
                message=f'Congratulations! You have completed the lesson "{instance.lesson.name}" in course "{instance.lesson.course.name}".',
                data={'course_id': instance.lesson.course.course_id, 'lesson_id': instance.lesson.lesson_id}
            )

@receiver(post_save, sender=RecycleBinCourse)
def notify_bin_action(sender, instance, created, **kwargs):
    """Создать уведомление при перемещении курса в корзину или восстановлении."""
    # Определить, создана запись или обновлена
    if created:
        Notification.objects.create(
            user=instance.user,
            type='moved_to_bin',
            message=f'The course "{instance.course.name}" has been moved to the recycle bin. You can restore it within 30 days.',
            data={'course_id': instance.course.course_id}
        )
    else:
        # Если запись существует, но была обновлена – обработать отдельно
        pass