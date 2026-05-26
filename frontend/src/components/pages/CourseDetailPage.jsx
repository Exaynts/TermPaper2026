import React from 'react';
import { useParams } from 'react-router-dom';
import styles from '../../styles/CourseDetailPage.module.css';

const CourseDetailPage = () => {
    const { id } = useParams();
    // Временные данные (позже будут загружаться с сервера)
    const course = {
        id,
        name: 'Пример курса',
        description: 'Полное описание курса будет здесь',
        lessons: [
            { id: 1, name: 'Введение', duration: '10 мин' },
            { id: 2, name: 'Основы', duration: '20 мин' },
        ]
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{course.name}</h1>
            <p className={styles.info}>{course.description}</p>
            <h2>Уроки:</h2>
            <ul className={styles.lessonsList}>
                {course.lessons.map(lesson => (
                    <li key={lesson.id} className={styles.lessonItem}>
                        {lesson.name} — {lesson.duration}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CourseDetailPage;