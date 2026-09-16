from django.test import TestCase
from django.contrib.auth import get_user_model
from courses.models import Category, Course

User = get_user_model()

class CourseModelTest(TestCase):
    def test_course_creation(self):
        user = User.objects.create_user(username='author', password='pass')
        category = Category.objects.create(title='Math', slug='math')
        course = Course.objects.create(
            name='Test Course',
            price=1000,
            status='published',
            created_by=user,
            category=category
        )
        self.assertEqual(course.name, 'Test Course')
        self.assertEqual(course.price, 1000)