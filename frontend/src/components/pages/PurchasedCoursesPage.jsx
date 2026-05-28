import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import styles from '../../styles/pages/PurchasedCoursesPage.module.css';

const PurchasedCoursesPage = () => {
    const { isAuthenticated } = useAuth();
    const [purchasedCourses, setPurchasedCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [movingId, setMovingId] = useState(null);
    const [modalCourse, setModalCourse] = useState(null); // { id, name }

    useEffect(() => {
        if (isAuthenticated) {
            fetchPurchasedCourses();
        }
    }, [isAuthenticated]);

    const fetchPurchasedCourses = async () => {
        setLoading(true);
        try {
            const response = await api.get('/courses/purchased_courses/');
            const data = response.data.results || response.data;
            setPurchasedCourses(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to load purchased courses');
        } finally {
            setLoading(false);
        }
    };

    const handleMoveToRecycleBin = async () => {
        if (!modalCourse) return;
        const courseId = modalCourse.id;
        setMovingId(courseId);
        try {
            await api.post(`/courses/${courseId}/move_to_recycle_bin/`);
            // Удаляем курс из списка купленных
            setPurchasedCourses(prev => prev.filter(item => item.course?.course_id !== courseId));
        } catch (err) {
            console.error(err);
            alert('Error moving course to recycle bin');
        } finally {
            setMovingId(null);
            setModalCourse(null);
        }
    };

    const openModal = (courseId, courseName) => {
        setModalCourse({ id: courseId, name: courseName });
    };

    const closeModal = () => {
        setModalCourse(null);
    };

    if (!isAuthenticated) {
        return <div className={styles.message}>Please log in to view purchased courses.</div>;
    }

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>My Courses (Purchased)</h1>
            {purchasedCourses.length === 0 ? (
                <p className={styles.empty}>You haven't purchased any courses yet.</p>
            ) : (
                <div className={styles.coursesGrid}>
                    {purchasedCourses.map(item => {
                        const course = item.course;
                        if (!course) return null;
                        return (
                            <div key={course.course_id} className={styles.courseCard}>
                                <Link to={`/courses/${course.course_id}`} className={styles.cardLink}>
                                    <h3 className={styles.courseName}>{course.name}</h3>
                                    <p className={styles.coursePrice}>{course.price} ₽</p>
                                    <p className={styles.courseRating}>★ {course.rating || 0}</p>
                                </Link>
                                <button
                                    onClick={() => openModal(course.course_id, course.name)}
                                    disabled={movingId === course.course_id}
                                    className={styles.recycleButton}
                                >
                                    {movingId === course.course_id ? 'Moving...' : 'Move to Recycle Bin'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Модальное окно подтверждения */}
            {modalCourse && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h3>Confirm move to Recycle Bin</h3>
                        <p>
                            Are you sure you want to move the course <strong>“{modalCourse.name}”</strong> to the Recycle Bin?
                            <br />
                            It will no longer appear in your purchased list.
                        </p>
                        <div className={styles.modalButtons}>
                            <button onClick={closeModal} className={styles.cancelBtn}>
                                Cancel
                            </button>
                            <button onClick={handleMoveToRecycleBin} className={styles.confirmBtn}>
                                Yes, move
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurchasedCoursesPage;