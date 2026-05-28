import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import styles from '../../styles/pages/CreatedCoursesPage.module.css';

const CreatedCoursesPage = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            fetchCreatedCourses();
        }
    }, [isAuthenticated]);

    const fetchCreatedCourses = async () => {
        setLoading(true);
        try {
            const response = await api.get('/courses/my_created/');
            setCourses(response.data.results || response.data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to load created courses');
        } finally {
            setLoading(false);
        }
    };

    const openDeleteModal = (course) => {
        setSelectedCourse(course);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedCourse(null);
    };

    const handleDelete = async () => {
        if (!selectedCourse) return;
        setDeletingId(selectedCourse.course_id);
        try {
            await api.delete(`/courses/${selectedCourse.course_id}/`);
            setCourses(prev => prev.filter(c => c.course_id !== selectedCourse.course_id));
            closeModal();
        } catch (err) {
            console.error(err);
            alert('Error deleting course');
        } finally {
            setDeletingId(null);
        }
    };

    const handleEdit = (courseId) => {
        navigate(`/edit-course/${courseId}`);
    };

    if (!isAuthenticated) {
        return <div className={styles.message}>Please log in to view your created courses.</div>;
    }

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>My Created Courses</h1>
            {courses.length === 0 ? (
                <p className={styles.empty}>You haven't created any courses yet.</p>
            ) : (
                <div className={styles.coursesGrid}>
                    {courses.map(course => (
                        <div key={course.course_id} className={styles.courseCard}>
                            <Link to={`/courses/${course.course_id}`} className={styles.cardLink}>
                                <h3 className={styles.courseName}>{course.name}</h3>
                                <p className={styles.coursePrice}>{course.price} ₽</p>
                                <p className={styles.courseRating}>★ {course.rating || 0}</p>
                                {course.image && (
                                    <div className={styles.imageWrapper}>
                                        <img src={course.image} alt={course.name} />
                                    </div>
                                )}
                            </Link>
                            <div className={styles.actionButtons}>
                                <button
                                    onClick={() => handleEdit(course.course_id)}
                                    className={styles.editBtn}
                                    title="Edit course"
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => openDeleteModal(course)}
                                    disabled={deletingId === course.course_id}
                                    className={styles.deleteBtn}
                                    title="Delete course"
                                >
                                    {deletingId === course.course_id ? '...' : '🗑️'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmationModal
                isOpen={modalOpen}
                title="Delete Course"
                message={`Are you sure you want to delete the course "${selectedCourse?.name}"? This action cannot be undone, and all lessons will be permanently removed.`}
                onConfirm={handleDelete}
                onCancel={closeModal}
                confirmText="Delete"
                cancelText="Cancel"
                confirmDisabled={deletingId !== null}
            />
        </div>
    );
};

export default CreatedCoursesPage;