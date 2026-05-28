// components/courses/LessonForm.jsx
import React from 'react';
import styles from './LessonForm.module.css';

const LessonForm = ({ index, lesson, onChange, onRemove, canRemove }) => {
    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            onChange(index, { ...lesson, [name]: files[0] });
        } else {
            onChange(index, { ...lesson, [name]: value });
        }
    };

    return (
        <div className={styles.lessonCard}>
            <div className={styles.lessonHeader}>
                <h3>Lesson #{index + 1}</h3>
                {canRemove && (
                    <button type="button" onClick={() => onRemove(index)} className={styles.removeLessonBtn}>
                        Remove
                    </button>
                )}
            </div>
            <div className={styles.formGroup}>
                <label>Lesson Name *</label>
                <input
                    type="text"
                    name="name"
                    className={styles.textInput}
                    value={lesson.name}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className={styles.formGroup}>
                <label>Order (sequence number)</label>
                <input
                    type="number"
                    name="order"
                    className={styles.textInput}
                    value={lesson.order}
                    onChange={handleChange}
                    min="0"
                />
                <small className={styles.hint}>Leave empty – will be set automatically</small>
            </div>
            <div className={styles.formGroup}>
                <label>Short description</label>
                <textarea
                    name="description"
                    className={styles.textArea}
                    rows="2"
                    value={lesson.description}
                    onChange={handleChange}
                />
            </div>
            <div className={styles.formGroup}>
                <label>Text content</label>
                <textarea
                    name="text"
                    className={styles.textArea}
                    rows="4"
                    value={lesson.text}
                    onChange={handleChange}
                />
            </div>
            <div className={styles.formGroup}>
                <label>Video URL</label>
                <input
                    type="url"
                    name="video"
                    className={styles.textInput}
                    value={lesson.video}
                    onChange={handleChange}
                    placeholder="https://..."
                />
            </div>
            <div className={styles.formGroup}>
                <label>Task file (PDF/DOC)</label>
                <input
                    type="file"
                    name="task_file"
                    accept=".pdf,.doc,.docx"
                    className={styles.fileInput}
                    onChange={handleChange}
                />
            </div>
            <div className={styles.formGroup}>
                <label>Image for lesson</label>
                <input
                    type="file"
                    name="image"
                    accept="image/*"
                    className={styles.fileInput}
                    onChange={handleChange}
                />
            </div>
            {lesson.existing_image && !lesson.image && (
                <div className={styles.fileInfo}>Current image: {lesson.existing_image.split('/').pop()}</div>
            )}
            {lesson.existing_task_file && !lesson.task_file && (
                <div className={styles.fileInfo}>Current task file: {lesson.existing_task_file.split('/').pop()}</div>
            )}
        </div>
    );
};

export default LessonForm;