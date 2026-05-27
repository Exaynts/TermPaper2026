import React from 'react';
import styles from '../../styles/pages/AboutUsPage.module.css';

const AboutPage = () => {
    return (
         <div className={styles.aboutContainer}>
            <h1>About us</h1>

            {/* Our Mission Section */}
            <section className={styles.card}>
                <h2>Our mission</h2>
                <p className={styles.missionStatement}>
                    We help people learn mathematics<br />
                    better, faster, and more interestingly!
                </p>
            </section>

            {/* What can we give? Section */}
            <section className={styles.card}>
                <h2>What can we give?</h2>
                <div className={styles.cardGrid}>
                    <div className={styles.cardItem}>
                        <h3>Comprehensive Learning Materials</h3>
                        <p>We have a specially prepared database of video lessons and practical assignments</p>
                    </div>
                    <div className={styles.cardItem}>
                        <h3>Personalized Learning Path</h3>
                        <p>A system that allows you to fully unlock learning potential by choosing the right topic for each lesson</p>
                    </div>
                    <div className={styles.cardItem}>
                        <h3>Efficient Learning</h3>
                        <p>We also learn better than working through long school textbooks</p>
                    </div>
                    <div className={styles.cardItem}>
                        <h3>Simplified Concepts</h3>
                        <p>We break down complex concepts into simple ones and analyze them individually for a complete understanding of the material</p>
                    </div>
                </div>
            </section>

            {/* Our Methods Section */}
            <section className={styles.card}>
                <h2>Our methods</h2>
                <div className={styles.cardGrid}>
                    <div className={styles.cardItem}>
                        <h3>Targeted practice and review</h3>
                        <p>Focus on specific areas that need improvement with regular review sessions</p>
                    </div>
                    <div className={styles.cardItem}>
                        <h3>Making it fun</h3>
                        <p>Interactive lessons and gamified learning experiences to keep students engaged</p>
                    </div>
                    <div className={styles.cardItem}>
                        <h3>Cheap, simple and fast</h3>
                        <p>Affordable pricing, straightforward approach, and accelerated learning progress</p>
                    </div>
                    <div className={styles.cardItem}>
                        <h3>Demonstration</h3>
                        <p>Practical examples and real-world applications to demonstrate mathematical concepts</p>
                    </div>
                </div>
            </section>

            {/* Our Values Section */}
            <section className={styles.card}>
                <h2>Our values</h2>
                <div className={styles.cardGrid}>
                    <div className={styles.cardItem}>
                        <h3>Quality Education</h3>
                        <p>Providing high-quality educational content that makes a real difference</p>
                    </div>
                    <div className={styles.cardItem}>
                        <h3>Innovation</h3>
                        <p>Continuously improving our teaching methods and platform features</p>
                    </div>
                    <div className={styles.cardItem}>
                        <h3>Student Success</h3>
                        <p>Our primary goal is the success and satisfaction of every student</p>
                    </div>
                </div>
            </section>

            {/* Our Partners Section */}
            <section className={styles.card}>
                <h2>Our partners</h2>
                <div className={styles.cardGrid}>
                    <div className={styles.cardItem}>
                        <h3>Education Alliance</h3>
                        <p>Collaborating with leading educational institutions worldwide</p>
                    </div>
                    <div className={styles.cardItem}>
                        <h3>Tech Innovators</h3>
                        <p>Partnerships with technology companies to enhance learning tools</p>
                    </div>
                    <div className={styles.cardItem}>
                        <h3>Community Network</h3>
                        <p>Working with local communities to make math accessible for everyone</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;