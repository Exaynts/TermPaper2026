import React from 'react';
import styles from '../../styles/pages/MyCoursesPage.module.css';

const MyCoursesPage = () => {
    // Здесь будет загрузка реальных данных
    const purchasedCourses = []; // временно пусто

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Мои курсы</h1>
            {purchasedCourses.length === 0 ? (
                <p className={styles.emptyMessage}>У вас пока нет приобретённых курсов</p>
            ) : (
                <div>Список курсов</div>
            )}
        </div>
    );
};

export default MyCoursesPage;