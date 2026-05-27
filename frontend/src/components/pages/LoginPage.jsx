import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../../styles/LoginPage.module.css';

const LoginPage = () => {
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(usernameOrEmail, password);
        setLoading(false);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }
    };

    const showForgotPassword = (e) => {
        e.preventDefault();
        alert('Функция восстановления пароля будет доступна позже');
    };

    const showForgotLogin = (e) => {
        e.preventDefault();
        alert('Функция восстановления логина будет доступна позже');
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.dataForm}>
                <h1>Sign in</h1>
                {error && <div className={styles.errorMessage}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="usernameOrEmail">Username or Email</label>
                        <input
                            type="text"
                            id="usernameOrEmail"
                            name="usernameOrEmail"
                            className={styles.textInput}
                            placeholder="Enter your username or email"
                            value={usernameOrEmail}
                            onChange={(e) => setUsernameOrEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className={styles.textInput}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {/* // Если пригодится смена пароля или логина
                    <div className={styles.forgotLinks}>
                        <a href="#" className={styles.forgotLink} onClick={showForgotPassword}>
                            forgot password?
                        </a>
                        <a href="#" className={styles.forgotLink} onClick={showForgotLogin}>
                            forgot login?
                        </a>
                    </div>
                    */}
                    <button type="submit" className={styles.signInButton} disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>

                    <div className={styles.registerLink}>
                        <p>
                            <span>You don't have an account? </span>
                            <Link to="/register">Sign up</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;