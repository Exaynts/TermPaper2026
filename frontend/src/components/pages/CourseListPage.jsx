import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import CourseCard from '../../components/common/CourseCard';
import CourseFilters from '../../components/courses/CourseFilters';
import styles from '../../styles/pages/CourseListPage.module.css';

// Константа количества курсов на страницу (должна совпадать с PAGE_SIZE в config/settings.py)
const PAGE_SIZE = 5;

const CourseListPage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [nextPage, setNextPage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Состояния фильтров
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [hasDiscount, setHasDiscount] = useState(false);
    const [ratingMin, setRatingMin] = useState('');
    const [ratingMax, setRatingMax] = useState('');
    const [sortBy, setSortBy] = useState('');

    // Сброс пагинации и списка курсов
    const resetPagination = () => {
        setCourses([]);
        setHasMore(false);
        setNextPage(null);
    };

    // Функция загрузки курсов с возможностью добавить новые данные к существующим
    const loadCourses = useCallback(async (page = 1, append = false) => {
        setLoading(true);
        try {
            let url = '/courses/';
            const params = new URLSearchParams();

            if (searchTerm) params.append('search', searchTerm);
            if (priceMin) params.append('price_min', priceMin);
            if (priceMax) params.append('price_max', priceMax);
            if (hasDiscount) params.append('has_discount', 'true');
            if (ratingMin) params.append('rating_min', ratingMin);
            if (ratingMax) params.append('rating_max', ratingMax);
            if (selectedCategories.length) {
                params.append('categories', selectedCategories.join(','));
            }

            let ordering = '';
            if (sortBy === 'price_asc') ordering = 'price';
            else if (sortBy === 'price_desc') ordering = '-price';
            else if (sortBy === 'rating') ordering = '-rating';
            else if (sortBy === 'newest') ordering = '-created_at';
            if (ordering) params.append('ordering', ordering);

            params.append('page', page);
            params.append('page_size', PAGE_SIZE);

            if (params.toString()) url += `?${params.toString()}`;
            const response = await api.get(url);
            const data = response.data.results || response.data;
            const next = response.data.next;

            if (append) {
                setCourses(prev => [...prev, ...data]);
            } else {
                setCourses(data);
            }
            setHasMore(!!next);
            setNextPage(next);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to load courses');
            setCourses([]);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, priceMin, priceMax, hasDiscount, ratingMin, ratingMax, selectedCategories, sortBy]);

    // Загрузка первой страницы при изменении фильтров или поиска
    const performFiltering = useCallback(() => {
        resetPagination();
        loadCourses(1, false);
    }, [loadCourses]);

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
        resetPagination();
        loadCourses(1, false);
    };

    // Загрузка следующей страницы (кнопка Load more)
    const loadMore = () => {
        if (!nextPage) return;
        // Извлекаем номер следующей страницы из URL next
        const urlParams = new URLSearchParams(nextPage.split('?')[1]);
        const nextPageNum = urlParams.get('page');
        if (nextPageNum) {
            loadCourses(parseInt(nextPageNum), true);
        }
    };

    // Первоначальная загрузка при монтировании
    useEffect(() => {
        loadCourses(1, false);
    }, []);

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
                    {courses.length === 0 && !loading && <p>No courses found</p>}
                    {courses.map(course => (
                        <CourseCard key={course.course_id} course={course} />
                    ))}
                    {loading && <div className={styles.loading}>Loading...</div>}
                    {!loading && hasMore && (
                        <button onClick={loadMore} className={styles.loadMoreButton}>
                            Load more
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CourseListPage;