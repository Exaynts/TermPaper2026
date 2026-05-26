import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../../styles/ProfilePage.module.css';

const ProfilePage = () => {
    const { user, loading } = useAuth();

    if (loading) return <div>Загрузка...</div>;
    if (!user) return <div>Пожалуйста, войдите в систему</div>;

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Мой профиль</h1>
            <div className={styles.profileInfo}>
                <div className={styles.field}>
                    <div className={styles.label}>Никнейм:</div>
                    <div className={styles.value}>{user.nickname}</div>
                </div>
                <div className={styles.field}>
                    <div className={styles.label}>Email:</div>
                    <div className={styles.value}>{user.email}</div>
                </div>
                <div className={styles.field}>
                    <div className={styles.label}>Имя:</div>
                    <div className={styles.value}>{user.first_name || '—'}</div>
                </div>
                <div className={styles.field}>
                    <div className={styles.label}>Фамилия:</div>
                    <div className={styles.value}>{user.last_name || '—'}</div>
                </div>
                <div className={styles.field}>
                    <div className={styles.label}>Уровень математики:</div>
                    <div className={styles.value}>{user.math_level || '—'}</div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;