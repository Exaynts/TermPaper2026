import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import LessonForm from '../../components/courses/LessonForm';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import styles from '../../styles/pages/EditCoursePage.module.css';
import { validatePriceInput, validateDiscountInput } from '../../utils/validators';

const EditCoursePage = () => {
    const { isAuthenticated } = useAuth();
    const { id: courseId } = useParams();
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        discount: 0,
        category: '',
        description: '',
        status: 'draft',
        image: null,
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [originalImageUrl, setOriginalImageUrl] = useState(null);

    const [lessons, setLessons] = useState([]);
    const [removedLessonIds, setRemovedLessonIds] = useState([]);
    const [modalLessonId, setModalLessonId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchCategories();
        fetchCourseData();
    }, [isAuthenticated, courseId, navigate]);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories/');
            setCategories(response.data.results || response.data);
        } catch (err) {
            console.error('Failed to load categories', err);
        }
    };

    const fetchCourseData = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/courses/${courseId}/`);
            const course = response.data;
            setFormData({
                name: course.name,
                price: course.price,
                discount: course.discount,
                category: course.category?.category_id || '',
                description: course.description || '',
                status: course.status,
                image: null,
            });
            if (course.image) {
                setOriginalImageUrl(course.image);
                setImagePreview(course.image);
            }
            const loadedLessons = (course.lessons || []).map(lesson => ({
                lesson_id: lesson.lesson_id,
                name: lesson.name,
                order: lesson.order,
                description: lesson.description || '',
                text: lesson.text || '',
                video: lesson.video || '',
                image: null,
                task_file: null,
                existing_image: lesson.image,
                existing_task_file: lesson.task_file,
            }));
            setLessons(loadedLessons);
        } catch (err) {
            console.error(err);
            setError('Failed to load course data');
        } finally {
            setLoading(false);
            setRemovedLessonIds([]);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            const file = files[0];
            setFormData(prev => ({ ...prev, image: file }));
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setImagePreview(reader.result);
                reader.readAsDataURL(file);
            } else {
                setImagePreview(originalImageUrl || null);
            }
            return;
        }

        let processedValue = value;
        if (name === 'price') {
            processedValue = validatePriceInput(value);
        } else if (name === 'discount') {
            processedValue = validateDiscountInput(value);
        }

        setFormData(prev => ({ ...prev, [name]: processedValue }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const addLesson = () => {
        setLessons([...lessons, {
            lesson_id: null,
            name: '',
            order: lessons.length,
            description: '',
            text: '',
            video: '',
            image: null,
            task_file: null,
        }]);
    };

    const updateLesson = (index, updatedLesson) => {
        const newLessons = [...lessons];
        newLessons[index] = updatedLesson;
        setLessons(newLessons);
    };

    const openRemoveLessonModal = (index) => {
        const lesson = lessons[index];
        if (lesson.lesson_id) {
            setModalLessonId(lesson.lesson_id);
            setModalOpen(true);
        } else {
            removeLesson(index);
        }
    };

    const removeLesson = (index) => {
        const lessonToRemove = lessons[index];
        if (lessonToRemove.lesson_id) {
            setRemovedLessonIds(prev => [...prev, lessonToRemove.lesson_id]);
        }
        const newLessons = lessons.filter((_, i) => i !== index);
        newLessons.forEach((lesson, idx) => { lesson.order = idx; });
        setLessons(newLessons);
        setModalOpen(false);
        setModalLessonId(null);
    };

    const confirmRemoveLesson = () => {
        const index = lessons.findIndex(l => l.lesson_id === modalLessonId);
        if (index !== -1) removeLesson(index);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});
        setSaving(true);

        const errors = {};
        if (!formData.name.trim()) errors.name = 'Course name is required';
        if (!formData.price) errors.price = 'Price is required';
        if (parseFloat(formData.price) < 0) errors.price = 'Price cannot be negative';
        if (!formData.category) errors.category = 'Please select a category';
        if (formData.discount < 0 || formData.discount > 100) errors.discount = 'Discount must be between 0 and 100';

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setSaving(false);
            return;
        }

        const hasLessonName = lessons.some(lesson => lesson.name.trim());
        if (!hasLessonName) {
            setError('Please add at least one lesson with a name');
            setSaving(false);
            return;
        }

        const courseFormData = new FormData();
        courseFormData.append('name', formData.name);
        courseFormData.append('price', formData.price);
        courseFormData.append('discount', formData.discount);
        courseFormData.append('category', formData.category);
        courseFormData.append('description', formData.description);
        courseFormData.append('status', formData.status);
        if (formData.image) {
            courseFormData.append('image', formData.image);
        }

        try {
            await api.patch(`/courses/${courseId}/`, courseFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            for (const lessonId of removedLessonIds) {
                await api.delete(`/lessons/${lessonId}/`);
            }

            // Принудительно пересчитываем порядок уроков
            const reorderedLessons = lessons.map((lesson, idx) => ({ ...lesson, order: idx }));
            for (let i = 0; i < reorderedLessons.length; i++) {
                const lesson = reorderedLessons[i];
                if (!lesson.name.trim()) continue;

                const lessonFormData = new FormData();
                lessonFormData.append('name', lesson.name);
                lessonFormData.append('order', lesson.order);
                if (lesson.description) lessonFormData.append('description', lesson.description);
                if (lesson.text) lessonFormData.append('text', lesson.text);
                if (lesson.video) lessonFormData.append('video', lesson.video);
                if (lesson.task_file) lessonFormData.append('task_file', lesson.task_file);
                if (lesson.image) lessonFormData.append('image', lesson.image);

                if (lesson.lesson_id) {
                    await api.patch(`/lessons/${lesson.lesson_id}/`, lessonFormData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                } else {
                    await api.post(`/courses/${courseId}/lessons/`, lessonFormData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                }
            }

            navigate(`/courses/${courseId}`);
        } catch (err) {
            console.error(err);
            if (err.response?.data) {
                if (typeof err.response.data === 'object') {
                    setFieldErrors(err.response.data);
                    setError('Please correct the errors in the form');
                } else {
                    setError(err.response.data.message || 'Failed to update course');
                }
            } else {
                setError('Network error. Please try again.');
            }
            setSaving(false);
        }
    };

    if (!isAuthenticated) return null;
    if (loading) return <div className={styles.loading}>Loading...</div>;


    return (
        <div className={styles.editContainer}>
            <div className={styles.formCard}>
                <h1>Edit Course</h1>
                {error && <div className={styles.errorMessage}>{error}</div>}
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <fieldset className={styles.fieldset}>
                        <legend className={styles.legend}>Course Information</legend>

                        <div className={`${styles.formGroup} ${fieldErrors.name ? styles.errorField : ''}`}>
                            <label htmlFor="name">Course Name *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                className={styles.textInput}
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                            {fieldErrors.name && <span className={styles.fieldError}>{fieldErrors.name}</span>}
                        </div>

                        <div className={styles.priceRow}>
                            <div className={`${styles.formGroup} ${fieldErrors.price ? styles.errorField : ''}`}>
                                <label htmlFor="price">Price (₽) *</label>
                                <input
                                    type="text"
                                    id="price"
                                    name="price"
                                    className={styles.textInput}
                                    placeholder="0.00"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                />
                                {fieldErrors.price && <span className={styles.fieldError}>{fieldErrors.price}</span>}
                            </div>
                            <div className={`${styles.formGroup} ${fieldErrors.discount ? styles.errorField : ''}`}>
                                <label htmlFor="discount">Discount (%)</label>
                                <input
                                    type="text"
                                    id="discount"
                                    name="discount"
                                    className={styles.textInput}
                                    placeholder="0"
                                    value={formData.discount}
                                    onChange={handleChange}
                                />
                                {fieldErrors.discount && <span className={styles.fieldError}>{fieldErrors.discount}</span>}
                            </div>
                        </div>

                        <div className={`${styles.formGroup} ${fieldErrors.category ? styles.errorField : ''}`}>
                            <label htmlFor="category">Category *</label>
                            <select
                                id="category"
                                name="category"
                                className={styles.textInput}
                                value={formData.category}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select category</option>
                                {categories.map(cat => (
                                    <option key={cat.category_id} value={cat.category_id}>
                                        {cat.title}
                                    </option>
                                ))}
                            </select>
                            {fieldErrors.category && <span className={styles.fieldError}>{fieldErrors.category}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="status">Status</label>
                            <select
                                id="status"
                                name="status"
                                className={styles.textInput}
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                            <small className={styles.hint}>Published courses are visible to everyone</small>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                className={styles.textArea}
                                rows="5"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="image">Course Image</label>
                            <input
                                type="file"
                                id="image"
                                name="image"
                                accept="image/*"
                                className={styles.fileInput}
                                onChange={handleChange}
                            />
                            {imagePreview && (
                                <div className={styles.imagePreview}>
                                    <img src={imagePreview} alt="Preview" />
                                </div>
                            )}
                            <small className={styles.hint}>Leave empty to keep current image</small>
                        </div>
                    </fieldset>

                    <fieldset className={styles.fieldset}>
                        <legend className={styles.legend}>Lessons</legend>
                        {lessons.map((lesson, idx) => (
                            <LessonForm
                                key={idx}
                                index={idx}
                                lesson={lesson}
                                onChange={updateLesson}
                                onRemove={() => openRemoveLessonModal(idx)}
                                canRemove={lessons.length > 1}
                            />
                        ))}
                        <button type="button" onClick={addLesson} className={styles.addLessonBtn}>
                            + Add Lesson
                        </button>
                    </fieldset>

                    <div className={styles.buttonGroup}>
                        <button type="button" onClick={() => navigate(`/courses/${courseId}`)} className={styles.cancelButton}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.saveButton} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            <ConfirmationModal
                isOpen={modalOpen}
                title="Remove Lesson"
                message="Are you sure you want to delete this lesson? This action cannot be undone."
                onConfirm={confirmRemoveLesson}
                onCancel={() => setModalOpen(false)}
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
};

export default EditCoursePage;