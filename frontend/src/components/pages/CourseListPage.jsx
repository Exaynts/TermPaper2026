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

    // Состояния фильтров – значения, которые видит пользователь в форме
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [hasDiscount, setHasDiscount] = useState(false);
    const [ratingMin, setRatingMin] = useState('');
    const [ratingMax, setRatingMax] = useState('');
    const [sortBy, setSortBy] = useState('');

    // Обработчики изменений фильтров (обновляют только состояние)
    const handleCategoryChange = useCallback((categoryId) => {
        setSelectedCategories(prev =>
            prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
        );
    }, []);

    const handlePriceMinChange = useCallback((value) => setPriceMin(value), []);
    const handlePriceMaxChange = useCallback((value) => setPriceMax(value), []);
    const handleHasDiscountChange = useCallback((checked) => setHasDiscount(checked), []);
    const handleRatingMinChange = useCallback((value) => setRatingMin(value), []);
    const handleRatingMaxChange = useCallback((value) => setRatingMax(value), []);
    const handleSortChange = useCallback((value) => setSortBy(value), []);

    const resetFilters = useCallback(() => {
        setSelectedCategories([]);
        setPriceMin('');
        setPriceMax('');
        setHasDiscount(false);
        setRatingMin('');
        setRatingMax('');
        setSortBy('');
        // После сброса сразу загружаем курсы без фильтров
        fetchCoursesWithFilters({});
    }, []);

    // Основная функция загрузки курсов с переданными параметрами фильтрации
    const fetchCoursesWithFilters = useCallback(async (filterParams) => {
        setLoading(true);
        try {
            let url = '/courses/';
            const params = new URLSearchParams();

            if (searchTerm) params.append('search', searchTerm);
            if (filterParams.price_min) params.append('price_min', filterParams.price_min);
            if (filterParams.price_max) params.append('price_max', filterParams.price_max);
            if (filterParams.has_discount) params.append('has_discount', 'true');
            if (filterParams.rating_min) params.append('rating_min', filterParams.rating_min);
            if (filterParams.rating_max) params.append('rating_max', filterParams.rating_max);
            if (filterParams.categories && filterParams.categories.length) {
                params.append('categories', filterParams.categories.join(','));
            }

            let ordering = '';
            if (filterParams.sort === 'price_asc') ordering = 'price';
            else if (filterParams.sort === 'price_desc') ordering = '-price';
            else if (filterParams.sort === 'rating') ordering = '-rating';
            else if (filterParams.sort === 'newest') ordering = '-created_at';
            if (ordering) params.append('ordering', ordering);

            if (params.toString()) url += `?${params.toString()}`;
            const response = await api.get(url);
            const data = response.data.results || response.data;
            setCourses(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Не удалось загрузить курсы');
            setCourses([]);
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    // Применение фильтров – собираем текущие значения из состояния и загружаем курсы
    const applyFilters = useCallback(() => {
        const filters = {
            categories: selectedCategories,
            price_min: priceMin ? Number(priceMin) : null,
            price_max: priceMax ? Number(priceMax) : null,
            has_discount: hasDiscount,
            rating_min: ratingMin ? Number(ratingMin) : null,
            rating_max: ratingMax ? Number(ratingMax) : null,
            sort: sortBy,
        };
        fetchCoursesWithFilters(filters);
    }, [selectedCategories, priceMin, priceMax, hasDiscount, ratingMin, ratingMax, sortBy, fetchCoursesWithFilters]);

    // Загрузка курсов при изменении поиска (мгновенно)
    useEffect(() => {
        // При изменении поиска сбрасываем фильтры (опционально) или просто загружаем с текущими фильтрами
        const currentFilters = {
            categories: selectedCategories,
            price_min: priceMin ? Number(priceMin) : null,
            price_max: priceMax ? Number(priceMax) : null,
            has_discount: hasDiscount,
            rating_min: ratingMin ? Number(ratingMin) : null,
            rating_max: ratingMax ? Number(ratingMax) : null,
            sort: sortBy,
        };
        fetchCoursesWithFilters(currentFilters);
    }, [searchTerm]); // только поиск вызывает автообновление

    const handleSearch = (e) => {
        e.preventDefault();
        // поиск уже обновляется через useEffect
    };

    if (loading) return <div className={styles.loading}>Загрузка...</div>;
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
                onCategoryChange={handleCategoryChange}
                onPriceMinChange={handlePriceMinChange}
                onPriceMaxChange={handlePriceMaxChange}
                onHasDiscountChange={handleHasDiscountChange}
                onRatingMinChange={handleRatingMinChange}
                onRatingMaxChange={handleRatingMaxChange}
                onSortChange={handleSortChange}
                onResetFilters={resetFilters}
                onApplyFilters={applyFilters}
            />
            <div className={styles.content}>
                <div className={styles.searchBar}>
                    <form onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="Поиск курсов..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                        <button type="submit" className={styles.searchBtn}>🔍</button>
                    </form>
                </div>
                <div className={styles.courseList}>
                    {courses.length === 0 ? (
                        <p>Курсы не найдены</p>
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