import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import styles from '../../styles/pages/RecycleBinPage.module.css';

const RecycleBinPage = () => {
    const { isAuthenticated } = useAuth();
    const [binCourses, setBinCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [restoringId, setRestoringId] = useState(null);
    const [modalCourse, setModalCourse] = useState(null);
    const [deleteModalCourse, setDeleteModalCourse] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            fetchBinCourses();
        }
    }, [isAuthenticated]);

    const fetchBinCourses = async () => {
        setLoading(true);
        try {
            const response = await api.get('/courses/bin_courses/');
            const data = response.data.results || response.data;
            setBinCourses(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to load recycle bin courses');
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async () => {
        if (!modalCourse) return;
        const courseId = modalCourse.id;
        setRestoringId(courseId);
        try {
            await api.post(`/courses/${courseId}/restore_from_bin/`);
            // Удаляем курс из списка корзины
            setBinCourses(prev => prev.filter(item => item.course?.course_id !== courseId));
        } catch (err) {
            console.error(err);
            alert('Error restoring course from recycle bin');
        } finally {
            setRestoringId(null);
            setModalCourse(null);
        }
    };

    // Функции для удаления курса у пользователя (удаления из корзины, не из БД для всех пользователей)
    const openDeleteModal = (courseId, courseName) => {
        setDeleteModalCourse({ id: courseId, name: courseName });
    };

    const closeDeleteModal = () => {
        setDeleteModalCourse(null);
    };

    const handlePermanentDelete = async () => {
        if (!deleteModalCourse) return;
        const courseId = deleteModalCourse.id;
        setRestoringId(courseId); // используем тот же индикатор загрузки
        try {
            await api.delete(`/courses/${courseId}/permanently_delete/`);
            // Удаляем курс из списка корзины
            setBinCourses(prev => prev.filter(item => item.course?.course_id !== courseId));
        } catch (err) {
            console.error(err);
            alert('Error permanently deleting course');
        } finally {
            setRestoringId(null);
            setDeleteModalCourse(null);
        }
    };
    const openModal = (courseId, courseName) => {
        setModalCourse({ id: courseId, name: courseName });
    };

    const closeModal = () => {
        setModalCourse(null);
    };

    if (!isAuthenticated) {
        return <div className={styles.message}>Please log in to view recycle bin.</div>;
    }

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Recycle Bin</h1>
            {binCourses.length === 0 ? (
                <p className={styles.empty}>Your recycle bin is empty.</p>
            ) : (
                <div className={styles.coursesGrid}>
                    {binCourses.map(item => {
                        const course = item.course;
                        if (!course) return null;
                        return (
                            <div key={course.course_id} className={styles.courseCard}>
                                <Link to={`/courses/${course.course_id}`} className={styles.cardLink}>
                                    <h3 className={styles.courseName}>{course.name}</h3>
                                    <p className={styles.coursePrice}>{course.price} ₽</p>
                                    <p className={styles.courseRating}>★ {course.rating || 0}</p>
                                </Link>
                                <div className={styles.buttonGroup}>
                                    <button
                                        onClick={() => openModal(course.course_id, course.name)}
                                        disabled={restoringId === course.course_id}
                                        className={styles.restoreButton}
                                    >
                                        {restoringId === course.course_id ? 'Restoring...' : 'Restore'}
                                    </button>
                                    <button
                                        onClick={() => openDeleteModal(course.course_id, course.name)}
                                        disabled={restoringId === course.course_id}
                                        className={styles.deletePermanentButton}
                                    >
                                        {restoringId === course.course_id ? 'Deleting...' : 'Delete Permanently'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Модальное окно подтверждения */}
            {modalCourse && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h3>Confirm Restore</h3>
                        <p>
                            Are you sure you want to restore the course <strong>“{modalCourse.name}”</strong> to your purchased list?
                        </p>
                        <div className={styles.modalButtons}>
                            <button onClick={closeModal} className={styles.cancelBtn}>
                                Cancel
                            </button>
                            <button onClick={handleRestore} className={styles.confirmBtn}>
                                Yes, restore
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {deleteModalCourse && (
                <div className={styles.modalOverlay} onClick={closeDeleteModal}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h3>Confirm Permanent Deletion</h3>
                        <p>
                            Are you sure you want to <strong>permanently delete</strong> the course <strong>“{deleteModalCourse.name}”</strong>?
                            <br />
                            This action cannot be undone, and the course will no longer be associated with your account.
                        </p>
                        <div className={styles.modalButtons}>
                            <button onClick={closeDeleteModal} className={styles.cancelBtn}>
                                Cancel
                            </button>
                            <button onClick={handlePermanentDelete} className={styles.deleteConfirmBtn}>
                                Yes, delete permanently
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecycleBinPage;