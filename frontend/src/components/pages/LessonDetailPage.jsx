import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import styles from '../../styles/pages/LessonDetailPage.module.css';

const LessonDetailPage = () => {
    const { isAuthenticated } = useAuth();
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();

    const [lesson, setLesson] = useState(null);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [progress, setProgress] = useState(null);
    const [marking, setMarking] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [isAuthenticated, courseId, lessonId, navigate]);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            // Получить данные курса
            const courseResponse = await api.get(`/courses/${courseId}/`);
            const courseData = courseResponse.data;
            setCourse(courseData);

            // Проверить, куплен ли курс
            const purchasedResponse = await api.get('/courses/my_courses/');
            const purchasedCourses = purchasedResponse.data.results || purchasedResponse.data;
            const isPurchased = purchasedCourses.some(pc =>
                (pc.course?.course_id === parseInt(courseId)) ||
                (pc.course_id === parseInt(courseId))
            );
            if (!isPurchased) {
                setError('You have not purchased this course.');
                setLoading(false);
                return;
            }

            // Получить данные урока
            const lessonResponse = await api.get(`/lessons/${lessonId}/`);
            setLesson(lessonResponse.data);

            // Получить прогресс по курсу
            const progressResponse = await api.get('/lesson-progress/my-progress/');
            const allProgress = progressResponse.data;
            const courseProgress = allProgress.find(p => p.course_id === parseInt(courseId));
            if (courseProgress) {
                const isCompleted = courseProgress.completed_lessons?.includes(parseInt(lessonId));
                setProgress({ completed: isCompleted, progress_percent: courseProgress.progress });
            } else {
                setProgress({ completed: false, progress_percent: 0 });
            }
        } catch (err) {
            console.error(err);
            if (err.response?.status === 404) {
                setError('Lesson not found.');
            } else if (err.response?.status === 403) {
                setError('You do not have access to this lesson.');
            } else {
                setError('Failed to load lesson.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleMarkComplete = async () => {
        if (marking) return;
        setMarking(true);
        try {
            const response = await api.post('/lesson-progress/mark/', { lesson: parseInt(lessonId) });
            // Обновить локальное состояние на основе ответа сервера
            setProgress({
                completed: response.data.status === 'completed',
                progress_percent: response.data.progress
            });
        } catch (err) {
            console.error(err);
            alert('Failed to mark lesson as completed.');
        } finally {
            setMarking(false);
        }
    };

    const handleMarkIncomplete = async () => {
        if (marking) return;
        setMarking(true);
        try {
            const response = await api.post('/lesson-progress/mark/', { lesson: parseInt(lessonId) });
            setProgress({
                completed: response.data.status === 'completed',
                progress_percent: response.data.progress
            });
        } catch (err) {
            console.error(err);
            alert('Failed to mark lesson as incomplete.');
        } finally {
            setMarking(false);
        }
    };

    // Навигация по урокам
    const currentLessonIndex = course?.lessons?.findIndex(l => l.lesson_id === parseInt(lessonId));
    const prevLesson = currentLessonIndex > 0 ? course?.lessons[currentLessonIndex - 1] : null;
    const nextLesson = currentLessonIndex < (course?.lessons?.length - 1) ? course?.lessons[currentLessonIndex + 1] : null;

    if (!isAuthenticated) return null;
    if (loading) return <div className={styles.loading}>Loading lesson...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!lesson) return <div className={styles.error}>Lesson not found.</div>;

    return (
        <div className={styles.container}>
            <div className={styles.lessonHeader}>
                {/* Стилизованная кнопка назад, как на странице курса */}
                <Link to={`/courses/${courseId}`} className={styles.backLink}>
                    ← Back to course
                </Link>
                <h1 className={styles.title}>{lesson.name}</h1>
                <div className={styles.progressIndicator}>
                    Course progress: {progress?.progress_percent || 0}%
                </div>
            </div>

            <div className={styles.content}>
                {lesson.text && (
                    <div className={styles.textContent}>
                        <h2>Content</h2>
                        <div dangerouslySetInnerHTML={{ __html: lesson.text.replace(/\n/g, '<br/>') }} />
                    </div>
                )}

                {lesson.video && (
                    <div className={styles.videoContainer}>
                        <h2>Video</h2>
                        <div className={styles.videoWrapper}>
                            <iframe
                                src={lesson.video.replace('watch?v=', 'embed/')}
                                title={lesson.name}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                )}

                {lesson.task_file && (
                    <div className={styles.taskContainer}>
                        <h2>Assignment</h2>
                        <a href={lesson.task_file} download className={styles.taskLink}>
                            Download task file
                        </a>
                    </div>
                )}
            </div>

            <div className={styles.completeSection}>
                {progress?.completed ? (
                    <button
                        onClick={handleMarkIncomplete}
                        disabled={marking}
                        className={`${styles.completeButton} ${styles.completed}`}
                    >
                        {marking ? 'Updating...' : '✓ Completed'}
                    </button>
                ) : (
                    <button
                        onClick={handleMarkComplete}
                        disabled={marking}
                        className={styles.completeButton}
                    >
                        {marking ? 'Updating...' : 'Mark as Completed'}
                    </button>
                )}
            </div>

            <div className={styles.navigation}>
                {prevLesson && (
                    <Link to={`/courses/${courseId}/lessons/${prevLesson.lesson_id}`} className={styles.navLink}>
                        ← {prevLesson.name}
                    </Link>
                )}
                {nextLesson && (
                    <Link to={`/courses/${courseId}/lessons/${nextLesson.lesson_id}`} className={styles.navLink}>
                        {nextLesson.name} →
                    </Link>
                )}
            </div>
        </div>
    );
};

export default LessonDetailPage;