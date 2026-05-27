import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import CourseCard from '../../components/common/CourseCard';
import CourseFilters from '../../components/courses/CourseFilters';
import styles from '../../styles/pages/CourseListPage.module.css';

const CourseListPage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSearchTerm, setActiveSearchTerm] = useState(''); // только для отображения (не используется в запросах)

    // Состояния фильтров
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [hasDiscount, setHasDiscount] = useState(false);
    const [ratingMin, setRatingMin] = useState('');
    const [ratingMax, setRatingMax] = useState('');
    const [sortBy, setSortBy] = useState('');

    // Функция загрузки курсов с параметрами (принимает все актуальные значения)
    const loadCourses = useCallback(async (search, categories, priceMinVal, priceMaxVal, hasDiscountVal, ratingMinVal, ratingMaxVal, sort) => {
        setLoading(true);
        try {
            let url = '/courses/';
            const params = new URLSearchParams();

            if (search) params.append('search', search);
            if (priceMinVal) params.append('price_min', priceMinVal);
            if (priceMaxVal) params.append('price_max', priceMaxVal);
            if (hasDiscountVal) params.append('has_discount', 'true');
            if (ratingMinVal) params.append('rating_min', ratingMinVal);
            if (ratingMaxVal) params.append('rating_max', ratingMaxVal);
            if (categories && categories.length) {
                params.append('categories', categories.join(','));
            }

            let ordering = '';
            if (sort === 'price_asc') ordering = 'price';
            else if (sort === 'price_desc') ordering = '-price';
            else if (sort === 'rating') ordering = '-rating';
            else if (sort === 'newest') ordering = '-created_at';
            if (ordering) params.append('ordering', ordering);

            if (params.toString()) url += `?${params.toString()}`;
            const response = await api.get(url);
            const data = response.data.results || response.data;
            setCourses(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to load courses');
            setCourses([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Функция, вызываемая при нажатии на лупу или кнопку "Apply"
    const performFiltering = useCallback(() => {
        loadCourses(
            searchTerm,        // используем текущее значение поля
            selectedCategories,
            priceMin ? Number(priceMin) : null,
            priceMax ? Number(priceMax) : null,
            hasDiscount,
            ratingMin ? Number(ratingMin) : null,
            ratingMax ? Number(ratingMax) : null,
            sortBy
        );
        setActiveSearchTerm(searchTerm); // обновляем только для возможного отображения
    }, [searchTerm, selectedCategories, priceMin, priceMax, hasDiscount, ratingMin, ratingMax, sortBy, loadCourses]);

    // Обработчик отправки формы поиска (лупа)
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        performFiltering();
    };

    // Применение всех фильтров (кнопка «Apply»)
    const applyFilters = () => {
        performFiltering();
    };

    // Сброс всех фильтров и поиска
    const resetFilters = () => {
        setSelectedCategories([]);
        setPriceMin('');
        setPriceMax('');
        setHasDiscount(false);
        setRatingMin('');
        setRatingMax('');
        setSortBy('');
        setSearchTerm('');
        setActiveSearchTerm('');
        loadCourses('', [], null, null, false, null, null, '');
    };

    // Первоначальная загрузка при монтировании
    useEffect(() => {
        loadCourses('', [], null, null, false, null, null, '');
    }, []);

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.pageContainer}>
            <CourseFilters
                selectedCategories={selectedCategories}
                priceMin={priceMin}
                priceMax={priceMax}
                hasDiscount={hasDiscount}
                ratingMin={ratingMin}
                ratingMax={ratingMax}
                sortBy={sortBy}
                onCategoryChange={setSelectedCategories}
                onPriceMinChange={setPriceMin}
                onPriceMaxChange={setPriceMax}
                onHasDiscountChange={setHasDiscount}
                onRatingMinChange={setRatingMin}
                onRatingMaxChange={setRatingMax}
                onSortChange={setSortBy}
                onResetFilters={resetFilters}
                onApplyFilters={applyFilters}
            />
            <div className={styles.content}>
                <div className={styles.searchBar}>
                    <form onSubmit={handleSearchSubmit}>
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                        <button type="submit" className={styles.searchBtn}>🔍</button>
                    </form>
                </div>
                <div className={styles.courseList}>
                    {courses.length === 0 ? (
                        <p>No courses found</p>
                    ) : (
                        courses.map(course => (
                            <CourseCard key={course.course_id} course={course} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseListPage;