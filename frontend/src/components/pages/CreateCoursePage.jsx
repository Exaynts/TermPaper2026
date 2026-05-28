import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import LessonForm from '../../components/courses/LessonForm';
import styles from '../../styles/pages/CreateCoursePage.module.css';
import { validatePriceInput, validateDiscountInput } from '../../utils/validators';

const CreateCoursePage = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
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

    // Lessons state – start with one empty lesson
    const [lessons, setLessons] = useState([
        { name: '', order: 0, description: '', text: '', video: '', image: null, task_file: null }
    ]);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchCategories();
    }, [isAuthenticated, navigate]);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories/');
            setCategories(response.data.results || response.data);
        } catch (err) {
            console.error('Failed to load categories', err);
        }
    };

    // сформировать поля курса
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
                setImagePreview(null);
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

    // Lesson management
    const addLesson = () => {
        setLessons([...lessons, {
            name: '',
            order: lessons.length,
            description: '',
            text: '',
            video: '',
            image: null,
            task_file: null
        }]);
    };

    const updateLesson = (index, updatedLesson) => {
        const newLessons = [...lessons];
        newLessons[index] = updatedLesson;
        setLessons(newLessons);
    };

    const removeLesson = (index) => {
        if (lessons.length === 1) {
            alert('You must have at least one lesson');
            return;
        }
        const newLessons = lessons.filter((_, i) => i !== index);
        // Reorder lesson.order values to keep sequential order
        newLessons.forEach((lesson, idx) => { lesson.order = idx; });
        setLessons(newLessons);
    };

    // Submit course and lessons
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});
        setLoading(true);

        // Validate course fields
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Course name is required';
        if (!formData.price) errors.price = 'Price is required';
        if (parseFloat(formData.price) < 0) errors.price = 'Price cannot be negative';
        if (!formData.category) errors.category = 'Please select a category';
        if (formData.discount < 0 || formData.discount > 100) errors.discount = 'Discount must be between 0 and 100';

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setLoading(false);
            return;
        }

        // Validate at least one lesson has name
        const hasLessonName = lessons.some(lesson => lesson.name.trim());
        if (!hasLessonName) {
            setError('Please add at least one lesson with a name');
            setLoading(false);
            return;
        }

        // Prepare FormData for course
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
            // Create the course
            const courseResponse = await api.post('/courses/', courseFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const courseId = courseResponse.data.course_id;

            // Create each lesson
            const lessonErrors = [];
            for (let i = 0; i < lessons.length; i++) {
                const lesson = lessons[i];
                if (!lesson.name.trim()) {
                    lessonErrors.push(`Lesson ${i+1} has no name, skipped`);
                    continue;
                }

                const lessonFormData = new FormData();
                lessonFormData.append('name', lesson.name);
                lessonFormData.append('order', lesson.order !== undefined ? lesson.order : i);
                if (lesson.description) lessonFormData.append('description', lesson.description);
                if (lesson.text) lessonFormData.append('text', lesson.text);
                if (lesson.video) lessonFormData.append('video', lesson.video);
                if (lesson.task_file) lessonFormData.append('task_file', lesson.task_file);
                if (lesson.image) lessonFormData.append('image', lesson.image);

                try {
                    await api.post(`/courses/${courseId}/lessons/`, lessonFormData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                } catch (err) {
                    lessonErrors.push(`Lesson "${lesson.name}" creation failed: ${err.response?.data?.message || err.message}`);
                }
            }

            if (lessonErrors.length > 0) {
                setError(`Course created, but some lessons failed:\n${lessonErrors.join('\n')}`);
                setLoading(false);
                return;
            }

            navigate(`/courses/${courseId}`);
        } catch (err) {
            console.error(err);
            if (err.response?.data) {
                if (typeof err.response.data === 'object') {
                    setFieldErrors(err.response.data);
                    setError('Please correct the errors in the form');
                } else {
                    setError(err.response.data.message || 'Failed to create course');
                }
            } else {
                setError('Network error. Please try again.');
            }
            setLoading(false);
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div className={styles.createContainer}>
            <div className={styles.formCard}>
                <h1>Create New Course</h1>
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
                                placeholder="e.g., Advanced Mathematics"
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
                                    type="number"
                                    id="discount"
                                    name="discount"
                                    className={styles.textInput}
                                    placeholder="0"
                                    min="0"
                                    max="100"
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
                                placeholder="Describe what students will learn..."
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
                            <small className={styles.hint}>Recommended size: 800x600 px</small>
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
                                onRemove={removeLesson}
                                canRemove={lessons.length > 1}
                            />
                        ))}
                        <button type="button" onClick={addLesson} className={styles.addLessonBtn}>
                            + Add Lesson
                        </button>
                    </fieldset>

                    <button type="submit" className={styles.createButton} disabled={loading}>
                        {loading ? 'Creating...' : 'Create Course'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateCoursePage;