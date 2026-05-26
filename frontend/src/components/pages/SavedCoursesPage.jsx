import React from 'react';
import styles from '../../styles/SavedCoursesPage.module.css';

const SavedCoursesPage = () => {
    const savedCourses = []; // временно пусто

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Сохранённые курсы</h1>
            {savedCourses.length === 0 ? (
                <p className={styles.emptyMessage}>У вас пока нет сохранённых курсов</p>
            ) : (
                <div>Список сохранённых курсов</div>
            )}
        </div>
    );
};

export default SavedCoursesPage;