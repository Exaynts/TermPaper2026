import React from 'react';
import { Link } from 'react-router-dom';
import styles from './CourseCard.module.css';

const CourseCard = ({ course }) => {
    const discountedPrice = course.discounted_price || course.price;
    const hasDiscount = course.discount && course.discount > 0;

    return (
        <div className={styles.courseCard}>
            <Link to={`/courses/${course.course_id}`} className={styles.cardLink}>
                <div className={styles.cardHeader}>
                    <h3 className={styles.courseName}>{course.name}</h3>
                    <div className={styles.priceInfo}>
                        {hasDiscount && (
                            <span className={styles.discountBadge}>-{course.discount}%</span>
                        )}
                        <div className={styles.price}>
                            {hasDiscount && (
                                <span className={styles.oldPrice}>{course.price}₽</span>
                            )}
                            <span className={styles.currentPrice}>{discountedPrice}₽</span>
                        </div>
                    </div>
                </div>
                <div className={styles.cardBody}>
                    <p className={styles.description}>
                        {course.description || 'Нет описания'}
                    </p>
                    {course.image && (
                        <div className={styles.imageWrapper}>
                            <img src={course.image} alt={course.name} />
                        </div>
                    )}
                </div>
                <div className={styles.cardFooter}>
                    <span className={styles.rating}>★ {course.rating || 0}</span>
                    <button className={styles.buyButton}>Купить</button>
                </div>
            </Link>
        </div>
    );
};

export default CourseCard;