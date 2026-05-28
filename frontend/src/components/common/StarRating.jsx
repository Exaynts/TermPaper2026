import React, { useState } from 'react';
import api from '../../services/api';
import styles from './StarRating.module.css';

const StarRating = ({ courseId, initialRating, readonly, onRatingChange }) => {
    const [hoverRating, setHoverRating] = useState(0);
    const [currentRating, setCurrentRating] = useState(initialRating || 0);
    const [loading, setLoading] = useState(false);

    const handleRate = async (rating) => {
        if (readonly || loading) return;
        setLoading(true);
        try {
            const response = await api.post(`/courses/${courseId}/rate/`, { rating });
            const newAvg = response.data.course_rating;
            setCurrentRating(rating);
            if (onRatingChange) onRatingChange({ userRating: rating, avgRating: newAvg });
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Не удалось поставить оценку');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.starRating}>
            {[1, 2, 3, 4, 5].map(star => (
                <span
                    key={star}
                    className={`${styles.star} ${(hoverRating || currentRating) >= star ? styles.filled : ''}`}
                    onMouseEnter={() => !readonly && setHoverRating(star)}
                    onMouseLeave={() => !readonly && setHoverRating(0)}
                    onClick={() => !readonly && handleRate(star)}
                    style={{ cursor: readonly ? 'default' : 'pointer' }}
                >
                    ★
                </span>
            ))}
            {loading && <span className={styles.loading}>...</span>}
        </div>
    );
};

export default StarRating;