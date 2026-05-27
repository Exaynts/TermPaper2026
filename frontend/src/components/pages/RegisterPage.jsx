import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../../styles/pages/RegisterPage.module.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        nickname: '',
        email: '',
        password: '',
        password2: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        date_of_birth: '',
        sex: '',
        math_level: ''
    });
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});

        if (formData.password.length < 8) {
            setFieldErrors({ password: 'Password must be at least 8 characters' });
            return;
        }
        if (formData.password !== formData.password2) {
            setFieldErrors({ password2: 'Passwords do not match' });
            return;
        }

        setLoading(true);
        const result = await register(formData);
        setLoading(false);

        if (result.success) {
            navigate('/');
        } else {
            if (typeof result.error === 'object') {
                setFieldErrors(result.error);
                setError('Please correct the errors in the form');
            } else {
                setError(result.error);
            }
        }
    };

    return (
        <div className={styles.registerContainer}>
            <div className={styles.dataForm}>
                <h1>Create Account</h1>
                {error && <div className={styles.errorMessage}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <fieldset className={styles.fieldset}>
                        <legend className={styles.legend}>Basic information</legend>
                        <div className={`${styles.formGroup} ${fieldErrors.nickname ? styles.errorField : ''}`}>
                            <label htmlFor="nickname">Login</label>
                            <input
                                type="text"
                                id="nickname"
                                name="nickname"
                                className={styles.textInput}
                                placeholder="Create your login"
                                value={formData.nickname}
                                onChange={handleChange}
                                required
                            />
                            {fieldErrors.nickname && <span className={styles.fieldError}>{fieldErrors.nickname}</span>}
                        </div>

                        <div className={`${styles.formGroup} ${fieldErrors.password ? styles.errorField : ''}`}>
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className={styles.textInput}
                                placeholder="Create your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            {fieldErrors.password && <span className={styles.fieldError}>{fieldErrors.password}</span>}
                            <small className={styles.passwordHint}>Minimum 8 characters</small>
                        </div>

                        <div className={`${styles.formGroup} ${fieldErrors.password2 ? styles.errorField : ''}`}>
                            <label htmlFor="password2">Confirm Password</label>
                            <input
                                type="password"
                                id="password2"
                                name="password2"
                                className={styles.textInput}
                                placeholder="Confirm your password"
                                value={formData.password2}
                                onChange={handleChange}
                                required
                            />
                            {fieldErrors.password2 && <span className={styles.fieldError}>{fieldErrors.password2}</span>}
                        </div>

                        <div className={`${styles.formGroup} ${fieldErrors.email ? styles.errorField : ''}`}>
                            <label htmlFor="email">E-mail</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className={styles.textInput}
                                placeholder="Enter your e-mail"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            {fieldErrors.email && <span className={styles.fieldError}>{fieldErrors.email}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="phone_number">Phone number</label>
                            <input
                                type="tel"
                                id="phone_number"
                                name="phone_number"
                                className={styles.textInput}
                                placeholder="Enter your phone number"
                                value={formData.phone_number}
                                onChange={handleChange}
                            />
                        </div>
                    </fieldset>

                    <fieldset className={styles.fieldset}>
                        <legend className={styles.legend}>Tell about yourself</legend>
                        <div className={styles.formGroup}>
                            <label htmlFor="first_name">Name</label>
                            <input
                                type="text"
                                id="first_name"
                                name="first_name"
                                className={styles.textInput}
                                placeholder="Enter your name"
                                value={formData.first_name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="last_name">Surname</label>
                            <input
                                type="text"
                                id="last_name"
                                name="last_name"
                                className={styles.textInput}
                                placeholder="Enter your surname"
                                value={formData.last_name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="date_of_birth">Date of birth</label>
                            <input
                                type="date"
                                id="date_of_birth"
                                name="date_of_birth"
                                className={styles.textInput}
                                value={formData.date_of_birth}
                                onChange={handleChange}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="sex">Sex</label>
                            <select
                                id="sex"
                                name="sex"
                                className={styles.textInput}
                                value={formData.sex}
                                onChange={handleChange}
                            >
                                <option value="">Select sex</option>
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                                <option value="O">Other</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="math_level">Math level</label>
                            <select
                                id="math_level"
                                name="math_level"
                                className={styles.textInput}
                                value={formData.math_level}
                                onChange={handleChange}
                            >
                                <option value="">Select math level</option>
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                    </fieldset>

                    <div className={styles.faqLink}>
                        <p>
                            <span>By creating an account you agree to our </span>
                            <Link to="/terms" className={styles.faqText}>Terms and Conditions</Link>
                        </p>
                    </div>

                    <button type="submit" className={styles.signUpButton} disabled={loading}>
                        {loading ? 'Signing up...' : 'Sign up'}
                    </button>
                </form>
                <div className={styles.loginLink}>
                    <p>
                        <span>Already have an account? </span>
                        <Link to="/login" className={styles.faqText}>Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;