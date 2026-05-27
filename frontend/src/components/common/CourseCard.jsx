import React from 'react';
import { Link } from 'react-router-dom';
import styles from './CourseCard.module.css';

const CourseCard = ({ course }) => {
    const discountedPrice = course.discounted_price || course.price;
    const hasDiscount = course.discount && course.discount > 0;

    // форматировать цену (2 знака после запятой, убрать лишние нули)
    const formatPrice = (price) => {
        const num = Number(price);
        return num % 1 === 0 ? num.toFixed(0) : num.toFixed(2);
    };

    const formattedPrice = formatPrice(course.price);
    const formattedDiscountedPrice = formatPrice(discountedPrice);
    const formattedRating = Number(course.rating || 0).toFixed(1);

    return (
        <div className={styles.courseCard}>
            <Link to={`/courses/${course.course_id}`} className={styles.cardLink}>
                <div className={styles.cardHeader}>
                    <h3 className={styles.courseName}>{course.name}</h3>
                    <div className={styles.priceInfo}>
                        {hasDiscount ? (
                            <>
                                <span className={styles.discountBadge}>-{course.discount}%</span>
                                <div className={styles.price}>
                                    <span className={styles.oldPrice}>{formattedPrice}₽</span>
                                    <span className={styles.currentPrice}>{formattedDiscountedPrice}₽</span>
                                </div>
                            </>
                        ) : (
                            <div className={styles.price}>
                                <span className={styles.currentPrice}>{formattedPrice}₽</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className={styles.cardBody}>
                    <p className={styles.description}>
                        {course.description || 'No description'}
                    </p>
                    {course.image && (
                        <div className={styles.imageWrapper}>
                            <img src={course.image} alt={course.name} />
                        </div>
                    )}
                </div>
                <div className={styles.cardFooter}>
                    <div className={styles.footerLeft}>
                        <span className={styles.rating}>★ {formattedRating}</span>
                        {course.author_name && (
                            <span className={styles.author}>Author: {course.author_name}</span>
                        )}
                    </div>
                    <button className={styles.buyButton}>Buy</button>
                </div>
            </Link>
        </div>
    );
};

export default CourseCard;