import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                {/* Help Section */}
                <div className="footer-section">
                    <h2>Help</h2>
                    <ul>
                        <li><Link to="/faq">Is the site down?</Link></li>
                        <li><Link to="/faq">FAQ</Link></li>
                        <li><Link to="/terms">Terms and Conditions</Link></li>
                    </ul>
                </div>

                {/* Navigation Section (shortcut) */}
                <div className="footer-section">
                    <h2>Navigation</h2>
                    <ul>
                        <li><Link to="/">MathJam</Link></li>
                        <li><Link to="/courses">Courses</Link></li>
                        <li><Link to="/aboutUs">About us</Link></li>
                    </ul>
                </div>

                {/* Contacts Section */}
                <div className="footer-section">
                    <h2>Contacts</h2>
                    <ul>
                        <li>Email: <a href="mailto:info@mathjam.com">info@mathjam.com</a></li>
                        <li>Phone: <a href="tel:+79000000000">+7 900 000-00-00</a></li>
                        <li>Telegram: <a href="https://t.me/mathjam_support">@mathjam_support</a></li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                <p className="footer-slogan">We make mathematics understandable and engaging for everyone!</p>
                <p className="copyright">&copy; 2026 MathJam. All rights reserved.</p>
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