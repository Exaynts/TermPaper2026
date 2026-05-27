import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    // Переключение языка (можно расширить)
    const toggleLanguage = () => {
        // Здесь будет логика переключения языка
        const newLang = window.currentLanguage === 'en' ? 'ru' : 'en';
        if (window.switchLanguage) {
            window.switchLanguage(newLang);
        }
    };

    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h2>MathJam</h2>
                    <ul>
                        <li>We make mathematics understandable and engaging for everyone!</li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h2>Navigation</h2>
                    <ul>
                        <li><Link to="/">MathJam</Link></li>
                        <li><Link to="/courses">Courses</Link></li>
                        <li><Link to="/aboutUs">About us</Link></li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h2>Contacts</h2>
                    <ul>
                        <li>Email: info@mathjam.com</li>
                        <li>Telegram: @mathjam_support</li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2026 MathJam. All rights deserved.</p>
            </div>
            {/*
            <div className="language-switcher">
                <button className="language-btn" onClick={toggleLanguage}>
                    <p>RU/EN</p>
                </button>
            </div>
            */}
        </footer>
    );
};

export default Footer;