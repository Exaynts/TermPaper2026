import React, { useState } from 'react';
import styles from '../AdBanner.module.css';
import studentImage from '../../assets/images/student_learning.PNG';

const AdBanner = () => {
  const [isFeedbackMode, setIsFeedbackMode] = useState(false);
  const [selectedReason, setSelectedReason] = useState(null);

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setIsFeedbackMode(true);
  };

  const handleBack = () => {
    setIsFeedbackMode(false);
    setSelectedReason(null);
  };

  const handleReasonSelect = (reason) => {
    setSelectedReason(reason);
  };

  const handleSubmit = () => {
    if (selectedReason) {
      // Отправить жалобу (можно добавить API-вызов)
      console.log('Complaint sent. Reason:', selectedReason);
      alert('Thanks for your feedback!');
      setIsFeedbackMode(false);
      setSelectedReason(null);
    }
  };

  const handleCloseFeedback = () => {
    setIsFeedbackMode(false);
    setSelectedReason(null);
  };

  return (
    <div className={`${styles.adBanner} ${isFeedbackMode ? styles.feedbackMode : ''}`}>
      {/* Обычный режим (показывается по умолчанию) */}
      {!isFeedbackMode && (
        <>
          <div className={styles.top}>
            <img
              src={studentImage}
              alt="MathJam mathematics courses"
              className={styles.image}
            />
            <div className={styles.badge}>Ads 0+</div>
            <div className={styles.menu} onClick={handleMenuClick}>
              <div className={styles.dot}></div>
              <div className={styles.dot}></div>
              <div className={styles.dot}></div>
            </div>
          </div>
          <a
            href="https://github.com/Exaynts/MathJam"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.bottomContainer}
          >
            <div className={styles.bottom}>
              <span className={styles.link}>
                MathJam math courses from 0 rubles
              </span>
              <div className={styles.arrowLink}>
                <svg
                  className={styles.arrow}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 12H19"
                    stroke="#f55"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 5L19 12L12 19"
                    stroke="#f55"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </a>
        </>
      )}

      {/* Режим обратной связи */}
      {isFeedbackMode && (
        <div className={styles.feedbackContent}>
          <div className={styles.closeFeedback} onClick={handleCloseFeedback}>
            <div className={styles.closeIcon}></div>
          </div>
          <div className={styles.feedbackTitle}>
            Why don't you like advertising?
          </div>
          <div className={styles.feedbackButtons}>
            <button
              className={`${styles.feedbackButton} ${selectedReason === 'content' ? styles.selected : ''}`}
              onClick={() => handleReasonSelect('content')}
            >
              Advertising obscures content
            </button>
            <button
              className={`${styles.feedbackButton} ${selectedReason === 'interest' ? styles.selected : ''}`}
              onClick={() => handleReasonSelect('interest')}
            >
              Not interested
            </button>
            <button
              className={`${styles.feedbackButton} ${selectedReason === 'purchased' ? styles.selected : ''}`}
              onClick={() => handleReasonSelect('purchased')}
            >
              The item was purchased
            </button>
            <button
              className={`${styles.feedbackButton} ${selectedReason === 'other' ? styles.selected : ''}`}
              onClick={() => handleReasonSelect('other')}
            >
              Other
            </button>
          </div>
          <div className={styles.feedbackActions}>
            <button className={styles.feedbackBack} onClick={handleBack}>
              Back
            </button>
            <button
              className={styles.feedbackSubmit}
              onClick={handleSubmit}
              disabled={!selectedReason}
            >
              Sent
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdBanner;