import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import CourseCard from '../../components/common/CourseCard';
import CourseFilters from '../../components/courses/CourseFilters';
import styles from '../../styles/pages/CourseListPage.module.css';

// Определить константу количества курсов на страницу (совпадает с PAGE_SIZE в бэкенде)
const PAGE_SIZE = 5;

const CourseListPage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Состояния фильтров
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [hasDiscount, setHasDiscount] = useState(false);
    const [ratingMin, setRatingMin] = useState('');
    const [ratingMax, setRatingMax] = useState('');
    const [sortBy, setSortBy] = useState('');

    // Пагинация
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Сбросить состояние и загрузить первую страницу
    const resetAndFetch = useCallback(() => {
        setCourses([]);
        setCurrentPage(1);
        setTotalPages(1);
        fetchCourses(1, false);
    }, []);

    // Загрузить курсы. append = true – добавить к существующим, false – заменить
    const fetchCourses = useCallback(async (page, append = false) => {
        setLoading(true);
        try {
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

            const url = `/courses/?${params.toString()}`;
            const response = await api.get(url);
            const data = response.data.results || response.data;
            const count = response.data.count || data.length;
            const total = Math.ceil(count / PAGE_SIZE);

            setTotalPages(total);

            if (append) {
                setCourses(prev => [...prev, ...data]);
            } else {
                setCourses(data);
            }
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to load courses');
            setCourses([]);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, priceMin, priceMax, hasDiscount, ratingMin, ratingMax, selectedCategories, sortBy]);

    // Применить фильтры и поиск (сбросить пагинацию, загрузить первую страницу)
    const performFiltering = useCallback(() => {
        setCourses([]);
        setCurrentPage(1);
        setTotalPages(1);
        fetchCourses(1, false);
    }, [fetchCourses]);

    // Переключиться на определённую страницу (заменить список)
    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        fetchCourses(page, false);
    };

    // Загрузить следующую страницу (добавить курсы к уже загруженным)
    const loadMore = () => {
        const nextPage = currentPage + 1;
        if (nextPage <= totalPages) {
            setCurrentPage(nextPage);
            fetchCourses(nextPage, true);
        }
    };

    // Обработать отправку формы поиска (лупа)
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        performFiltering();
    };

    // Сбросить все фильтры и поиск
    const resetFilters = () => {
        setSelectedCategories([]);
        setPriceMin('');
        setPriceMax('');
        setHasDiscount(false);
        setRatingMin('');
        setRatingMax('');
        setSortBy('');
        setSearchTerm('');
        performFiltering();
    };

    // При изменении фильтров или поиска сбросить пагинацию и загрузить первую страницу
    useEffect(() => {
        performFiltering();
    }, [searchTerm, priceMin, priceMax, hasDiscount, ratingMin, ratingMax, selectedCategories, sortBy]);

    // Первоначальная загрузка
    useEffect(() => {
        performFiltering();
    }, []); // пустой массив – только при монтировании

    // Создать кнопки пагинации (если страниц больше одной)
    const renderPagination = () => {
        if (totalPages <= 1) return null;
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }
        const pages = [];
        for (let i = start; i <= end; i++) pages.push(i);
        return (
            <div className={styles.pagination}>
                <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className={styles.pageButton}>
                    Previous
                </button>
                {pages.map(p => (
                    <button key={p} onClick={() => goToPage(p)} className={`${styles.pageButton} ${p === currentPage ? styles.activePage : ''}`}>
                        {p}
                    </button>
                ))}
                <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className={styles.pageButton}>
                    Next
                </button>
            </div>
        );
    };

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
                onApplyFilters={performFiltering}
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
                    {!loading && courses.length > 0 && currentPage < totalPages && (
                        <button onClick={loadMore} className={styles.loadMoreButton}>
                            Load more
                        </button>
                    )}
                    {renderPagination()}
                </div>
            </div>
        </div>
    );
};

export default CourseListPage;