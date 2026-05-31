import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CourseCard from '../components/courses/CourseCard.jsx';

const mockCourse = {
  course_id: 1,
  name: 'Математика для начинающих',
  price: 1500,
  discounted_price: 1200,
  discount: 20,
  category_title: 'Math',
  author_name: 'admin',
  image: '/media/courses/math.jpg',
};

test('CourseCard displays correct information', () => {
  render(
    <BrowserRouter>
      <CourseCard course={mockCourse} />
    </BrowserRouter>
  );

  // Проверка названия курса
  expect(screen.getByText(/Математика для начинающих/i)).toBeInTheDocument();
  // Проверка значения цены курса
  expect(screen.getByText(/1200₽/)).toBeInTheDocument();
  expect(screen.getByText(/1500₽/)).toBeInTheDocument();
  expect(screen.getByText(/-20%/)).toBeInTheDocument();
});