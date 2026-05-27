import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import styles from '../../styles/pages/CourseDetailPage.module.css';

const CourseDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaved, setIsSaved] = useState(false);
    const [isPurchased, setIsPurchased] = useState(false);
    const [progress, setProgress] = useState(0);
    const [completedLessons, setCompletedLessons] = useState([]);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchCourseDetails();
        if (isAuthenticated) {
            fetchUserStatus();
        }
    }, [id, isAuthenticated]);

    const fetchCourseDetails = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/courses/${id}/`);
            setCourse(response.data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to load course');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserStatus = async () => {
        try {
            // Проверка, сохранён ли курс
            const savedRes = await api.get('/courses/saved_courses/');
            const savedCourses = savedRes.data.results || savedRes.data;
            const isCourseSaved = savedCourses.some(item => item.course?.course_id === parseInt(id));
            setIsSaved(isCourseSaved);

            // Проверка, куплен ли курс и получение прогресса
            const purchasedRes = await api.get('/courses/my_courses/');
            const purchasedCourses = purchasedRes.data.results || purchasedRes.data;
            const purchased = purchasedCourses.find(item => item.course?.course_id === parseInt(id));
            if (purchased) {
                setIsPurchased(true);
                setProgress(purchased.progress || 0);
                // Получить список пройденных уроков
                const progressRes = await api.get('/progress/my-progress/');
                const progressData = progressRes.data;
                const courseProgress = progressData.find(p => p.course_id === parseInt(id));
                if (courseProgress) {
                    setCompletedLessons(courseProgress.completed_lessons || []);
                }
            } else {
                setIsPurchased(false);
            }
        } catch (err) {
            console.error('Error loading user status:', err);
        }
    };

    const handlePurchase = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setActionLoading(true);
        try {
            await api.post(`/courses/${id}/purchase/`);
            setIsPurchased(true);
            // Обновить прогресс (0%)
            setProgress(0);
            // Можно показать уведомление об успехе
            alert('The course has been successfully purchased!');
            await fetchUserStatus(); // обновить статус
        } catch (err) {
            console.error(err);
            alert('Error when purchasing course');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSaveToggle = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setActionLoading(true);
        try {
            if (isSaved) {
                await api.post(`/courses/${id}/unsave/`);
                setIsSaved(false);
            } else {
                await api.post(`/courses/${id}/save/`);
                setIsSaved(true);
            }
        } catch (err) {
            console.error(err);
            alert('Error saving course');
        } finally {
            setActionLoading(false);
        }
    };

    const handleContinue = () => {
        // Найти первый непройденный урок
        if (course && course.lessons && course.lessons.length) {
            const firstIncomplete = course.lessons.find(lesson => !completedLessons.includes(lesson.lesson_id));
            if (firstIncomplete) {
                navigate(`/lessons/${firstIncomplete.lesson_id}`);
            } else if (course.lessons.length > 0) {
                // Все пройдены – перейти на первый урок
                navigate(`/lessons/${course.lessons[0].lesson_id}`);
            }
        }
    };

    const formatPrice = (price) => {
        const num = Number(price);
        return num % 1 === 0 ? num.toFixed(0) : num.toFixed(2);
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!course) return null;

    const hasDiscount = course.discount && course.discount > 0;
    const discountedPrice = course.discounted_price || course.price;

    return (
        <div className={styles.container}>
            <div className={styles.navigation}>
                <button onClick={() => navigate('/courses')} className={styles.backButton}>
                    ← Back to courses
                </button>
            </div>

            {/* Карточка с основной информацией о курсе */}
            <div className={styles.courseHeaderCard}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>{course.name}</h1>
                    <div className={styles.meta}>
                        <span className={styles.rating}>★ {Number(course.rating || 0).toFixed(1)}</span>
                        <span className={styles.category}>
                            Категория: <Link to={`/courses?category=${course.category?.slug}`}>{course.category?.title}</Link>
                        </span>
                        <span className={styles.author}>Автор: {course.author || course.author_name || 'MathJam'}</span>
                    </div>
                </div>
                <div className={styles.headerRight}>
                    <div className={styles.priceBlock}>
                        {hasDiscount ? (
                            <>
                                <span className={styles.oldPrice}>{formatPrice(course.price)}₽</span>
                                <span className={styles.currentPrice}>{formatPrice(discountedPrice)}₽</span>
                                <span className={styles.discountBadge}>-{course.discount}%</span>
                            </>
                        ) : (
                            <span className={styles.currentPrice}>{formatPrice(course.price)}₽</span>
                        )}
                    </div>
                    {!isPurchased ? (
                        <button
                            onClick={handlePurchase}
                            disabled={actionLoading}
                            className={styles.purchaseButton}
                        >
                            {actionLoading ? 'Processing...' : 'Buy a course'}
                        </button>
                    ) : (
                        <button
                            onClick={handleContinue}
                            className={styles.continueButton}
                        >
                            Continue training
                        </button>
                    )}
                    <button
                        onClick={handleSaveToggle}
                        disabled={actionLoading}
                        className={`${styles.saveButton} ${isSaved ? styles.saved : ''}`}
                    >
                        {isSaved ? '★ In favorites' : '☆ Save'}
                    </button>
                </div>
            </div>

            {/* Блок с изображением (если есть) – можно без карточки, либо обернуть в карточку при желании */}
            {course.image && (
                <div className={styles.imageWrapper}>
                    <img src={course.image} alt={course.name} className={styles.image} />
                </div>
            )}

            {/* Карточка "О курсе" (без отдельного фона) */}
            <div className={styles.descriptionCard}>
                <h2>О курсе</h2>
                <p>{course.description || 'No description'}</p>
            </div>

            {/* Карточка прогресса (если куплен) */}
            {isPurchased && (
                <div className={styles.progressCard}>
                    <div className={styles.progressHeader}>
                        <span>Ваш прогресс</span>
                        <span>{progress}%</span>
                    </div>
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            )}

            {/* Карточка уроков */}
            <div className={styles.lessonsCard}>
                <h2>Уроки курса ({course.lessons?.length || 0})</h2>
                <ul className={styles.lessonsList}>
                    {course.lessons && course.lessons.length > 0 ? (
                        course.lessons.map(lesson => {
                            const isCompleted = completedLessons.includes(lesson.lesson_id);
                            const isClickable = isPurchased;
                            return (
                                <li key={lesson.lesson_id} className={styles.lessonItem}>
                                    <div className={styles.lessonInfo}>
                                        <span className={styles.lessonOrder}>{lesson.order}.</span>
                                        <span className={styles.lessonName}>
                                            {isClickable ? (
                                                <Link to={`/lessons/${lesson.lesson_id}`}>{lesson.name}</Link>
                                            ) : (
                                                lesson.name
                                            )}
                                        </span>
                                        {isCompleted && <span className={styles.completedBadge}>✓</span>}
                                    </div>
                                    {!isPurchased && (
                                        <span className={styles.lockedIcon}>🔒</span>
                                    )}
                                </li>
                            );
                        })
                    ) : (
                        <li>There are no lessons yet</li>
                    )}
                </ul>
            </div>

            {/* Админские действия (без карточки) */}
            {isAuthenticated && user?.is_staff && (
                <div className={styles.adminActions}>
                    <button onClick={() => navigate(`/courses/edit/${course.course_id}`)} className={styles.editButton}>
                        Edit Course
                    </button>
                    <button onClick={() => { if (window.confirm('Delete the Course?')) api.delete(`/courses/${course.course_id}/`).then(() => navigate('/courses')); }} className={styles.deleteButton}>
                        Delete Course
                    </button>
                </div>
            )}
        </div>
    );
};

export default CourseDetailPage;