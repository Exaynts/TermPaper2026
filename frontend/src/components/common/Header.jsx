import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

const Header = () => {
    const { isAuthenticated, logout } = useAuth();
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
                    <li><Link to="/profile">Profile</Link></li>
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
                            <li className="dropdown">
                                <Link to="#">My Courses</Link>
                                <div className="dropdown-content">
                                    <Link to="/saved-courses">Saved</Link>
                                    <Link to="/purchased-courses">Purchased</Link>
                                    <Link to="/created-courses">Created</Link>
                                    <Link to="/recycle-bin">Recycle Bin</Link>
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