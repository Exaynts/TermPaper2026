// frontend/src/components/common/Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationsDropdown from './NotificationsDropdown';
import './Header.css';

const Header = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="header">
            <Link to="/" className="logo-link">
                <img className="icon" src="/images/logo.png" alt="Logo" />
            </Link>
            <nav className="nav">
                <ul className="nav-list">
                    <li><Link to="/">MathJam</Link></li>
                    <li className="dropdown">
                        <Link to="/courses">Courses</Link>
                        <div className="dropdown-content">
                            <Link to="/courses?category=primary">For Primary School</Link>
                            <Link to="/courses?category=ege">Preparation for USE</Link>
                            <Link to="/courses?category=students">For Students</Link>
                        </div>
                    </li>
                    {!isAuthenticated && (
                        <li className="dropdown">
                            <Link to="#">Sign-in/up</Link>
                            <div className="dropdown-content">
                                <Link to="/login">Sign-in</Link>
                                <Link to="/register">Sign-up</Link>
                            </div>
                        </li>
                    )}
                    {isAuthenticated && (
                        <>
                            <li><Link to="/profile">Profile</Link></li>
                            <li className="notification-item"><NotificationsDropdown/></li>
                            <li className="dropdown">
                                <Link to="#">My Courses</Link>
                                <div className="dropdown-content">
                                    <Link to="/saved-courses" className="dropdown-item">
                                        <span className="dropdown-icon">★</span>
                                        <span className="dropdown-label">Saved</span>
                                    </Link>
                                    <Link to="/purchased-courses" className="dropdown-item">
                                        <span className="dropdown-icon">📘</span>
                                        <span className="dropdown-label">Purchased</span>
                                    </Link>
                                    <Link to="/recycle-bin" className="dropdown-item">
                                        <span className="dropdown-icon">🗑</span>
                                        <span className="dropdown-label">Recycle Bin</span>
                                    </Link>
                                    <Link to="/created-courses" className="dropdown-item">
                                        <span className="dropdown-icon">✎</span>
                                        <span className="dropdown-label">Created</span>
                                    </Link>
                                    <Link to="/create-course" className="dropdown-item dropdown-item-primary">
                                        <span className="dropdown-icon">+</span>
                                        <span className="dropdown-label">Create Course</span>
                                    </Link>
                                </div>
                            </li>
                            <li>
                                <button onClick={handleLogout} className="logout-btn">
                                    Exit
                                </button>
                            </li>
                        </>
                    )}
                </ul>
            </nav>
        </header>
    );
};

export default Header;