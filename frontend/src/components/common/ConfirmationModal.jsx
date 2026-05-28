import React from 'react';
import styles from './ConfirmationModal.module.css';

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Delete', cancelText = 'Cancel', confirmDisabled = false }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h3>{title}</h3>
                <p>{message}</p>
                <div className={styles.modalButtons}>
                    <button className={styles.cancelBtn} onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button
                        className={`${styles.confirmBtn} ${confirmDisabled ? styles.disabled : ''}`}
                        onClick={onConfirm}
                        disabled={confirmDisabled}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;