import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/CourseListPage.module.css';

const CourseListPage = () => {
    // Временные данные для демонстрации
    const courses = [
        { id: 1, name: 'Математика для начинающих', price: 3500 },
        { id: 2, name: 'Алгебра и анализ', price: 7500 },
        { id: 3, name: 'Визуальная геометрия', price: 4500 },
    ];

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Все курсы</h1>
            <div className={styles.coursesGrid}>
                {courses.map(course => (
                    <div key={course.id} className={styles.courseCard}>
                        <h2>{course.name}</h2>
                        <p>Цена: {course.price} ₽</p>
                        <Link to={`/courses/${course.id}`}>Подробнее</Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CourseListPage;