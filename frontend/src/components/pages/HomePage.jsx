import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/pages/HomePage.module.css';

const HomePage = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const totalSlides = 3;

    const images = [
        '/images/index/image1.PNG',
        '/images/index/image2.PNG',
        '/images/index/image3.PNG'
    ];

    const descriptions = [
        'Our average rate is 4.8',
        'More than 800 people have studied with us',
        'The result is noticed even after two weeks of learning'
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % totalSlides);
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    const goToPrevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    };

    const goToNextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    return (
        <>
            {/* Intro and Carousel Section */}
            <div className={styles.introAndCarousel}>
                <div className={styles.introBlock}>
                    <h2>Learn with MathJam!</h2>
                    <p className={styles.introText}>
                        Would you like to start <br />
                        your educational journey Right Now?
                    </p>
                    <div className={styles.getStarted}>
                        <p>
                            <Link to="/register">Get Started</Link>
                        </p>
                    </div>
                </div>

                {/* Carousel */}
                <div className={styles.carouselContainer}>
                    <div className={styles.carousel}>
                        <div
                            className={styles.carouselSlides}
                            style={{ transform: `translateX(-${currentSlide * 33.333}%)` }}
                        >
                            {images.map((img, index) => (
                                <div className={styles.carouselSlide} key={index}>
                                    <img
                                        className={styles.carouselImage}
                                        src={img}
                                        alt={`Math concept ${index + 1}`}
                                        aria-description={descriptions[index]}
                                    />
                                </div>
                            ))}
                        </div>
                        <button
                            className={`${styles.carouselBtn} ${styles.prev}`}
                            onClick={goToPrevSlide}
                        >
                            ‹
                        </button>
                        <button
                            className={`${styles.carouselBtn} ${styles.next}`}
                            onClick={goToNextSlide}
                        >
                            ›
                        </button>
                        <div className={styles.carouselIndicators}>
                            {[0, 1, 2].map((index) => (
                                <span
                                    key={index}
                                    className={`${styles.carouselIndicator} ${currentSlide === index ? styles.active : ''}`}
                                    data-slide={index}
                                    onClick={() => goToSlide(index)}
                                />
                            ))}
                        </div>
                    </div>
                    <p className={styles.promotionPhrase}>
                        Don't be afraid to try! The first lesson is free!
                    </p>
                </div>
            </div>

            {/* Info block */}
            <div className={styles.infoBlock}>
                <p> MathJam is a website for online mathematics courses for children and students.
                </p>
            </div>

            {/* Advantages Section */}
            <div className={styles.advantages}>
                <div className={styles.advantagesCard}>
                    <h2>What can we give</h2>
                    <ul className={styles.advantagesList}>
                        <li>
                            <span>
                                We have a specially prepared database of video lessons and practical assignments
                            </span>
                        </li>
                        <li>
                            <span>
                                A system that allows you to fully unlock learning potential by choosing the right topic for each lesson
                            </span>
                        </li>
                        <li>
                            <span>
                                We also learn better than working through long school textbooks
                            </span>
                        </li>
                        <li>
                            <span>
                                We break down complex concepts into simple ones and analyze them individually for a complete understanding of the material
                            </span>
                        </li>
                        <li>
                            <span>More information can be found in the section </span>
                            <span>
                                <Link to="/aboutUs">About us</Link>
                            </span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Reviews Section */}
            <div className={styles.reviews}>
                <div className={styles.reviewsCard}>
                    <h2>Our reviews</h2>
                    <ul className={styles.reviewsList}>
                        <li className={styles.reviewItem}>
                            <p className={styles.reviewText}>
                                MathJam completely changed my attitude towards mathematics...
                            </p>
                            <div className={styles.reviewAuthor}>
                                <span>Alex M.</span>
                                <div className={styles.reviewRating}>★★★★★</div>
                            </div>
                        </li>
                        <li className={styles.reviewItem}>
                            <p className={styles.reviewText}>
                                As a teacher, I recommend MathJam to all my students...
                            </p>
                            <div className={styles.reviewAuthor}>
                                <span>Sarah K., Math Teacher</span>
                                <div className={styles.reviewRating}>★★★★★</div>
                            </div>
                        </li>
                        <li className={styles.reviewItem}>
                            <p className={styles.reviewText}>
                                I was struggling with calculus for months until I found MathJam...
                            </p>
                            <div className={styles.reviewAuthor}>
                                <span>Michael R.</span>
                                <div className={styles.reviewRating}>★★★★☆</div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </>
    );
};

export default HomePage;