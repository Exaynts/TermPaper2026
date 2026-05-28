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
    // Состояние для модального окна подтверждения покупки
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);

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
            const savedRes = await api.get('/courses/saved_courses/');
            const savedCourses = savedRes.data.results || savedRes.data;
            const isCourseSaved = savedCourses.some(item => item.course?.course_id === parseInt(id));
            setIsSaved(isCourseSaved);

            const purchasedRes = await api.get('/courses/my_courses/');
            const purchasedCourses = purchasedRes.data.results || purchasedRes.data;
            const purchased = purchasedCourses.find(item => item.course?.course_id === parseInt(id));
            if (purchased) {
                setIsPurchased(true);
                setProgress(purchased.progress || 0);
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

    // Функция, которая выполнит реальную покупку после подтверждения
    const confirmPurchase = async () => {
        setActionLoading(true);
        try {
            await api.post(`/courses/${id}/purchase/`);
            setIsPurchased(true);
            setProgress(0);
            alert('The course has been successfully purchased!');
            await fetchUserStatus(); // обновить статус
            setShowPurchaseModal(false);
        } catch (err) {
            console.error(err);
            alert('Error when purchasing course');
        } finally {
            setActionLoading(false);
        }
    };

    // Открыть модальное окно (вызывается при клике на "Купить курс")
    const openPurchaseModal = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setShowPurchaseModal(true);
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
        if (course && course.lessons && course.lessons.length) {
            const firstIncomplete = course.lessons.find(lesson => !completedLessons.includes(lesson.lesson_id));
            if (firstIncomplete) {
                navigate(`/lessons/${firstIncomplete.lesson_id}`);
            } else if (course.lessons.length > 0) {
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
    const finalPrice = formatPrice(discountedPrice);

    return (
        <div className={styles.container}>
            <div className={styles.navigation}>
                <button onClick={() => navigate('/courses')} className={styles.backButton}>
                    ← Back to courses
                </button>
            </div>

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
                                <span className={styles.currentPrice}>{finalPrice}₽</span>
                                <span className={styles.discountBadge}>-{course.discount}%</span>
                            </>
                        ) : (
                            <span className={styles.currentPrice}>{finalPrice}₽</span>
                        )}
                    </div>
                    {!isPurchased ? (
                        <button
                            onClick={openPurchaseModal}
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

            {course.image && (
                <div className={styles.imageWrapper}>
                    <img src={course.image} alt={course.name} className={styles.image} />
                </div>
            )}

            <div className={styles.descriptionCard}>
                <h2>О курсе</h2>
                <p>{course.description || 'No description'}</p>
            </div>

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

            {/* Модальное окно подтверждения покупки */}
            {showPurchaseModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <p>Confirm course purchase<br />
                        Your account will be debited {finalPrice} ₽</p>
                        <div className={styles.modalButtons}>
                            <button className={styles.modalCancel} onClick={() => setShowPurchaseModal(false)}>Cancel</button>
                            <button className={styles.modalConfirm} onClick={confirmPurchase}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseDetailPage;