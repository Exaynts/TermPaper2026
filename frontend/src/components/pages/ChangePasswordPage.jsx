import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../../styles/pages/ChangePasswordPage.module.css';

const ChangePasswordPage = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { changePassword, logout } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        const result = await changePassword(oldPassword, newPassword, confirmPassword);
        setLoading(false);
        if (result.success) {
            setMessage(result.message);
            setTimeout(() => {
                logout(); // очищаем локальные токены
                navigate('/login');
            }, 2000);
        } else {
            setError(result.error);
        }
    };

    return (
        <div className={styles.changePasswordContainer}>
            <div className={styles.dataForm}>
                <h1>Change Password</h1>
                {error && <div className={styles.errorMessage}>{error}</div>}
                {message && <div className={styles.successMessage}>{message}</div>}
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="oldPassword">Old Password</label>
                        <input
                            type="password"
                            id="oldPassword"
                            className={styles.textInput}
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="newPassword">New Password</label>
                        <input
                            type="password"
                            id="newPassword"
                            className={styles.textInput}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <small className={styles.hint}>Minimum 8 characters</small>
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className={styles.textInput}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className={styles.changeButton} disabled={loading}>
                        {loading ? 'Changing...' : 'Change Password'}
                    </button>
                </form>
                <div className={styles.backLink}>
                    <a href="/profile" onClick={(e) => { e.preventDefault(); navigate('/profile'); }}>Back to Profile</a>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordPage;