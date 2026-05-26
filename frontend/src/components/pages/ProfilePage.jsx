import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../../styles/ProfilePage.module.css';

const ProfilePage = () => {
    const { user, loading, updateProfile, updateAvatar } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nickname: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        date_of_birth: '',
        sex: '',
        math_level: ''
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [editMode, setEditMode] = useState({});
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [purchasedCourses, setPurchasedCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(false);

    const fileInputRef = useRef(null);

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleAvatarChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Проверка типа файла (опционально)
        if (!file.type.startsWith('image/')) {
            setMessage({ text: 'Please select an image file', type: 'error' });
            return;
        }

        const result = await updateAvatar(file);
        if (result.success) {
            setMessage({ text: 'Avatar updated successfully', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } else {
            setMessage({ text: 'Failed to update avatar', type: 'error' });
        }
    };

    // Смена пароля
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const toggleDropdown = () => setDropdownOpen(prev => !prev);

    const handleChangePassword = () => navigate('/change-password');
    const handleDeleteAccount = () => {
        if (window.confirm('Are you sure? This action cannot be undone.')) {
            // Вызов API удаления аккаунта (пока заглушка)
            alert('Account deletion not implemented yet');
        }
    };

    // Загрузка данных пользователя в форму
    useEffect(() => {
        if (user) {
            setFormData({
                nickname: user.nickname || '',
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone_number: user.phone_number || '',
                date_of_birth: user.date_of_birth || '',
                sex: user.sex || '',
                math_level: user.math_level || ''
            });
        }
    }, [user]);

    // Загрузка купленных курсов
    useEffect(() => {
        const fetchPurchasedCourses = async () => {
            setLoadingCourses(true);
            try {
                // Реальный запрос к API (когда появится)
                // const response = await api.get('/courses/my_courses/');
                // setPurchasedCourses(response.data);

                // Пока просто оставляем пустой массив
                setPurchasedCourses([]);
            } catch (error) {
                console.error('Failed to load purchased courses:', error);
            } finally {
                setLoadingCourses(false);
            }
        };

        if (user) {
            fetchPurchasedCourses();
        }
    }, [user]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveField = async (fieldName) => {
        setSaving(true);
        setMessage({ text: '', type: '' });

        const result = await updateProfile({ [fieldName]: formData[fieldName] });

        if (result.success) {
            setMessage({ text: `${fieldName} updated successfully`, type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } else {
            setMessage({ text: `Error: ${result.error}`, type: 'error' });
        }

        setEditMode(prev => ({ ...prev, [fieldName]: false }));
        setSaving(false);
    };

    const toggleEditMode = (fieldName) => {
        setEditMode(prev => ({ ...prev, [fieldName]: !prev[fieldName] }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    if (!user) {
        return <div className={styles.error}>Please log in</div>;
    }

    return (
        <main className={styles.main}>
            {/* Sidebar */}
            <aside className={styles.aside}>
                <Link to="/" className={styles.asideButton}>Back to menu</Link>
                <Link to="/courses" className={styles.asideButton}>Buy new course</Link>
                <Link to="/faq" className={styles.asideButton}>FAQ</Link>
            </aside>

            {/* Main Content */}
            <div className={styles.mainContent}>
                {/* Message */}
                {message.text && (
                    <div className={message.type === 'success' ? styles.successMessage : styles.errorMessage}>
                        {message.text}
                    </div>
                )}

                {/* Upper Menu */}
                <div className={styles.upperMenu}>
                    <div className={styles.search}>
                        <form onSubmit={handleSearch}>
                            <input
                                type="text"
                                className={styles.inputField}
                                placeholder="Search for courses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button type="submit" className={styles.searchButton}>
                                <svg className={styles.searchIcon} viewBox="0 0 24 24">
                                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                                </svg>
                            </button>
                        </form>
                    </div>
                    <div className={styles.userInfo}>
                        <div className={styles.avatar} onClick={handleAvatarClick}>
                            {user.avatar ? (
                                <img className={styles.avatarImage} src={user.avatar} alt="User avatar" />
                            ) : (
                                <div className={styles.avatarPlaceholder}>
                                    <svg className={styles.avatarPlus} viewBox="0 0 24 24">
                                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div className={styles.nicknameWrapper}>
                            <div className={styles.nickname} onClick={toggleDropdown}>
                                {user.nickname || user.first_name || user.email}
                                <span className={dropdownOpen ? styles.arrowUp : styles.arrowDown}></span>
                            </div>
                            {dropdownOpen && (
                                <div className={styles.dropdownMenu}>
                                    <div className={styles.dropdownItem} onClick={handleChangePassword}>
                                        Change password
                                    </div>
                                    <div className={styles.dropdownItem} onClick={handleDeleteAccount}>
                                        Delete account
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={handleAvatarChange}
                    />
                </div>

                {/* User Data Sections */}
                <div className={styles.data}>
                    {/* My Account */}
                    <div className={styles.myAccount}>
                        <h3>My Account</h3>
                        <div className={styles.accountGrid}>
                            <div className={styles.gridItem}>
                                <label>Login</label>
                                <input
                                    type="text"
                                    name="nickname"
                                    value={formData.nickname}
                                    onChange={handleChange}
                                    disabled={!editMode.nickname}
                                />
                                {!editMode.nickname ? (
                                    <button
                                        className={styles.pencilButton}
                                        onClick={() => toggleEditMode('nickname')}
                                        type="button"
                                    />
                                ) : (
                                    <button
                                        className={styles.saveButton}
                                        onClick={() => handleSaveField('nickname')}
                                        disabled={saving}
                                        type="button"
                                    >
                                        {saving ? '...' : '✓'}
                                    </button>
                                )}
                            </div>
                            <div className={styles.gridItem}>
                                <label>E-mail</label>
                                <input
                                    type="email"
                                    value={user.email}
                                    disabled
                                />
                            </div>
                            <div className={styles.gridItem}>
                                <label>Phone number</label>
                                <input
                                    type="tel"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    disabled={!editMode.phone_number}
                                />
                                {!editMode.phone_number ? (
                                    <button
                                        className={styles.pencilButton}
                                        onClick={() => toggleEditMode('phone_number')}
                                        type="button"
                                    />
                                ) : (
                                    <button
                                        className={styles.saveButton}
                                        onClick={() => handleSaveField('phone_number')}
                                        disabled={saving}
                                        type="button"
                                    >
                                        {saving ? '...' : '✓'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* About Me */}
                    <div className={styles.aboutMe}>
                        <h3>About Me</h3>
                        <div className={styles.aboutGrid}>
                            <div className={styles.gridItem}>
                                <label>Name</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    disabled={!editMode.first_name}
                                />
                                {!editMode.first_name ? (
                                    <button
                                        className={styles.pencilButton}
                                        onClick={() => toggleEditMode('first_name')}
                                        type="button"
                                    />
                                ) : (
                                    <button
                                        className={styles.saveButton}
                                        onClick={() => handleSaveField('first_name')}
                                        disabled={saving}
                                        type="button"
                                    >
                                        {saving ? '...' : '✓'}
                                    </button>
                                )}
                            </div>
                            <div className={styles.gridItem}>
                                <label>Surname</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    disabled={!editMode.last_name}
                                />
                                {!editMode.last_name ? (
                                    <button
                                        className={styles.pencilButton}
                                        onClick={() => toggleEditMode('last_name')}
                                        type="button"
                                    />
                                ) : (
                                    <button
                                        className={styles.saveButton}
                                        onClick={() => handleSaveField('last_name')}
                                        disabled={saving}
                                        type="button"
                                    >
                                        {saving ? '...' : '✓'}
                                    </button>
                                )}
                            </div>
                            <div className={styles.gridItem}>
                                <label>Date of birth</label>
                                <input
                                    type="date"
                                    name="date_of_birth"
                                    value={formData.date_of_birth}
                                    onChange={handleChange}
                                    disabled={!editMode.date_of_birth}
                                />
                                {!editMode.date_of_birth ? (
                                    <button
                                        className={styles.pencilButton}
                                        onClick={() => toggleEditMode('date_of_birth')}
                                        type="button"
                                    />
                                ) : (
                                    <button
                                        className={styles.saveButton}
                                        onClick={() => handleSaveField('date_of_birth')}
                                        disabled={saving}
                                        type="button"
                                    >
                                        {saving ? '...' : '✓'}
                                    </button>
                                )}
                            </div>
                            <div className={styles.gridItem}>
                                <label>Sex</label>
                                <select
                                    name="sex"
                                    value={formData.sex}
                                    onChange={handleChange}
                                    disabled={!editMode.sex}
                                >
                                    <option value="">Select sex</option>
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                    <option value="O">Other</option>
                                </select>
                                {!editMode.sex ? (
                                    <button
                                        className={styles.pencilButton}
                                        onClick={() => toggleEditMode('sex')}
                                        type="button"
                                    />
                                ) : (
                                    <button
                                        className={styles.saveButton}
                                        onClick={() => handleSaveField('sex')}
                                        disabled={saving}
                                        type="button"
                                    >
                                        {saving ? '...' : '✓'}
                                    </button>
                                )}
                            </div>
                            <div className={styles.gridItem}>
                                <label>Math level</label>
                                <select
                                    name="math_level"
                                    value={formData.math_level}
                                    onChange={handleChange}
                                    disabled={!editMode.math_level}
                                >
                                    <option value="">Select level</option>
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                                {!editMode.math_level ? (
                                    <button
                                        className={styles.pencilButton}
                                        onClick={() => toggleEditMode('math_level')}
                                        type="button"
                                    />
                                ) : (
                                    <button
                                        className={styles.saveButton}
                                        onClick={() => handleSaveField('math_level')}
                                        disabled={saving}
                                        type="button"
                                    >
                                        {saving ? '...' : '✓'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* My Courses */}
                    <div className={styles.myCourses}>
                        <h3>My Courses</h3>
                        {loadingCourses ? (
                            <p>Loading...</p>
                        ) : purchasedCourses.length > 0 ? (
                            <div className={styles.courseList}>
                                {purchasedCourses.map(course => (
                                    <div key={course.id} className={styles.courseItem}>
                                        <span className={styles.courseName}>{course.name}</span>
                                        <span className={styles.progressText}>Progress: {course.progress}%</span>
                                        <Link to={`/courses/${course.id}`}>
                                            <button className={styles.continueButton}>
                                                Continue
                                            </button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className={styles.emptyMessage}>You don't have any purchased courses yet</p>
                        )}
                        <div className={styles.buyButtonContainer}>
                            <Link to="/courses">
                                <button className={styles.buyCoursesButton}>
                                    Buy Courses
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ProfilePage;