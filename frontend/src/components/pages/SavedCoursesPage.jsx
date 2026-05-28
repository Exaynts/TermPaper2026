import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import styles from '../../styles/pages/SavedCoursesPage.module.css';

const SavedCoursesPage = () => {
    const { isAuthenticated } = useAuth();
    const [savedCourses, setSavedCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [removingId, setRemovingId] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            fetchSavedCourses();
        }
    }, [isAuthenticated]);

    const fetchSavedCourses = async () => {
        setLoading(true);
        try {
            const response = await api.get('/courses/saved_courses/');
            const data = response.data.results || response.data;
            setSavedCourses(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to load saved courses');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (courseId) => {
        setRemovingId(courseId);
        try {
            await api.post(`/courses/${courseId}/unsave/`);
            // Обновляем список, удаляя удалённый курс
            setSavedCourses(prev => prev.filter(item => item.course?.course_id !== courseId));
        } catch (err) {
            console.error(err);
            alert('Error removing course from saved');
        } finally {
            setRemovingId(null);
        }
    };

    if (!isAuthenticated) {
        return <div className={styles.message}>Please log in to view saved courses.</div>;
    }

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Saved Courses</h1>
            {savedCourses.length === 0 ? (
                <p className={styles.empty}>You haven't saved any courses yet.</p>
            ) : (
                <div className={styles.coursesGrid}>
                    {savedCourses.map(item => {
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
                                    onClick={() => handleRemove(course.course_id)}
                                    disabled={removingId === course.course_id}
                                    className={styles.removeButton}
                                >
                                    {removingId === course.course_id ? 'Removing...' : 'Remove'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SavedCoursesPage;