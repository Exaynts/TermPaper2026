import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import StarRating from '../../components/common/StarRating';
import styles from '../../styles/pages/CourseDetailPage.module.css';

// Иконка корзины (SVG)
const TrashIcon = () => (
    <svg className={styles.trashIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
        <path d="M8 4V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
);

const CourseDetailPage = () => {
    const { id } = useParams();   // ← id курса из URL
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
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userRating, setUserRating] = useState(null);

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
            const courseData = response.data;
            setCourse(courseData);
            setError(null);

            // Если пользователь является автором курса – редирект на редактирование
            if (isAuthenticated && user && courseData.created_by_id === user.id) {
                navigate(`/edit-course/${id}`, { replace: true });
                return;
            }
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
                const progressRes = await api.get('/lesson-progress/my-progress/');
                const progressData = progressRes.data;
                const courseProgress = progressData.find(p => p.course_id === parseInt(id));
                if (courseProgress) {
                    setCompletedLessons(courseProgress.completed_lessons || []);
                }
            } else {
                setIsPurchased(false);
            }

            // Получить оценку пользователя (если есть)
            try {
                const ratingRes = await api.get(`/courses/${id}/my-rating/`);
                setUserRating(ratingRes.data.rating);
            } catch (err) {
                console.error('Failed to load user rating', err);
            }
        } catch (err) {
            console.error('Error loading user status:', err);
        }
    };

    const handlePurchaseConfirm = async () => {
        setActionLoading(true);
        try {
            await api.post(`/courses/${id}/purchase/`);
            setIsPurchased(true);
            setProgress(0);
            alert('The course has been successfully purchased!');
            await fetchUserStatus();
        } catch (err) {
            console.error(err);
            alert('Error when purchasing course');
        } finally {
            setActionLoading(false);
            setShowPurchaseModal(false);
        }
    };

    const handleDeleteCourse = async () => {
        setActionLoading(true);
        try {
            await api.post(`/courses/${id}/move_to_recycle_bin/`);
            setIsPurchased(false);
            alert('Course moved to recycle bin');
            navigate('/courses');
        } catch (err) {
            console.error(err);
            alert('Error moving course to bin');
        } finally {
            setActionLoading(false);
            setShowDeleteModal(false);
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
        if (course && course.lessons && course.lessons.length) {
            const firstIncomplete = course.lessons.find(lesson => !completedLessons.includes(lesson.lesson_id));
            if (firstIncomplete) {
                navigate(`/courses/${course.course_id}/lessons/${firstIncomplete.lesson_id}`);
            } else if (course.lessons.length > 0) {
                navigate(`/courses/${course.course_id}/lessons/${course.lessons[0].lesson_id}`);
            }
        }
    };

    const handleBuyClick = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setShowPurchaseModal(true);
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
    const originalPrice = formatPrice(course.price);

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
                            Category: <Link to={`/courses?category=${course.category?.slug}`}>{course.category?.title}</Link>
                        </span>
                        <span className={styles.author}>Author: {course.author || course.author_name || 'MathJam'}</span>
                    </div>
                </div>
                <div className={styles.headerRight}>
                    <div className={styles.priceBlock}>
                        {hasDiscount ? (
                            <>
                                <span className={styles.oldPrice}>{originalPrice}₽</span>
                                <span className={styles.currentPrice}>{finalPrice}₽</span>
                                <span className={styles.discountBadge}>-{course.discount}%</span>
                            </>
                        ) : (
                            <span className={styles.currentPrice}>{finalPrice}₽</span>
                        )}
                    </div>
                    {!isPurchased ? (
                        <>
                            <button
                                onClick={handleBuyClick}
                                disabled={actionLoading}
                                className={styles.purchaseButton}
                            >
                                {actionLoading ? 'Processing...' : 'Buy course'}
                            </button>
                            <button
                                onClick={handleSaveToggle}
                                disabled={actionLoading}
                                className={`${styles.saveButton} ${isSaved ? styles.saved : ''}`}
                            >
                                {isSaved ? '★ In favorites' : '☆ Save'}
                            </button>
                        </>
                    ) : (
                        <div className={styles.buttonGroup}>
                            <button
                                onClick={handleContinue}
                                className={styles.continueButton}
                            >
                                Continue training
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className={styles.deleteCourseButton}
                                title="Move to recycle bin"
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {course.image && (
                <div className={styles.imageWrapper}>
                    <img src={course.image} alt={course.name} className={styles.image} />
                </div>
            )}

            <div className={styles.descriptionCard}>
                <h2>About the course</h2>
                <p>{course.description || 'No description'}</p>
            </div>

            {isPurchased && (
                <div className={styles.progressCard}>
                    <div className={styles.progressHeader}>
                        <span>Your progress</span>
                        <span>{progress}%</span>
                    </div>
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            )}

            {isPurchased && (
                <div className={styles.ratingSection}>
                    <div className={styles.ratingLabel}>Ваша оценка курсу:</div>
                    <StarRating
                        courseId={course.course_id}
                        initialRating={userRating}
                        readonly={false}
                        onRatingChange={(data) => {
                            setCourse(prev => ({ ...prev, rating: data.avgRating }));
                            setUserRating(data.userRating);
                        }}
                    />
                </div>
            )}

            <div className={styles.lessonsCard}>
                <h2>Course lessons ({course.lessons?.length || 0})</h2>
                {isPurchased ? (
                    <div className={styles.lessonsList}>
                        {course.lessons && course.lessons.length > 0 ? (
                            course.lessons.map(lesson => {
                                const isCompleted = completedLessons.includes(lesson.lesson_id);
                                return (
                                    <Link
                                        key={lesson.lesson_id}
                                        to={`/courses/${course.course_id}/lessons/${lesson.lesson_id}`}
                                        className={`${styles.lessonLink} ${isCompleted ? styles.completed : ''}`}
                                    >
                                        <span className={styles.lessonOrder}>{lesson.order}.</span>
                                        <span className={styles.lessonName}>{lesson.name}</span>
                                        {isCompleted && <span className={styles.completedBadge}>✓</span>}
                                    </Link>
                                );
                            })
                        ) : (
                            <p>There are no lessons yet</p>
                        )}
                    </div>
                ) : (
                    <div className={styles.lessonsList}>
                        {course.lessons && course.lessons.length > 0 ? (
                            course.lessons.map(lesson => (
                                <div key={lesson.lesson_id} className={styles.lessonLocked}>
                                    <span className={styles.lessonOrder}>{lesson.order}.</span>
                                    <span className={styles.lessonName}>{lesson.name}</span>
                                    <span className={styles.lockedIcon}>🔒</span>
                                </div>
                            ))
                        ) : (
                            <p>There are no lessons yet</p>
                        )}
                    </div>
                )}
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

            <ConfirmationModal
                isOpen={showPurchaseModal}
                title="Confirm Purchase"
                message={`Are you sure you want to purchase this course? ${finalPrice}₽ will be deducted from your account.`}
                onConfirm={handlePurchaseConfirm}
                onCancel={() => setShowPurchaseModal(false)}
                confirmText="Confirm"
                cancelText="Cancel"
            />

            <ConfirmationModal
                isOpen={showDeleteModal}
                title="Delete Course"
                message="Are you sure you want to delete this course from your purchased list? It will be moved to the recycle bin and you can restore it later."
                onConfirm={handleDeleteCourse}
                onCancel={() => setShowDeleteModal(false)}
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
};

export default CourseDetailPage;