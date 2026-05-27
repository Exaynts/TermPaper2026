import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import CourseCard from '../../components/common/CourseCard';
import CourseFilters from '../../components/courses/CourseFilters';
import styles from '../../styles/pages/CourseListPage.module.css';

const CourseListPage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    const [sort, setSort] = useState('');

    // Обработчики фильтров
    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handleSortChange = (newSort) => {
        setSort(newSort);
    };

    // Запрашивать курсы при изменении searchTerm, filters или sort
    useEffect(() => {
        fetchCourses();
    }, [searchTerm, filters, sort]);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            let url = '/courses/';
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            // Позже здесь будут параметры фильтрации и сортировки
            // if (filters.price_min) params.append('price_min', filters.price_min);
            // if (sort) params.append('ordering', sort === 'price_asc' ? 'price' : sort === 'price_desc' ? '-price' : sort === 'rating' ? '-rating' : '-created_at');
            if (params.toString()) url += `?${params.toString()}`;
            const response = await api.get(url);
            setCourses(response.data.results || response.data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Не удалось загрузить курсы');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchCourses();
    };

    if (loading) return <div className={styles.loading}>Загрузка...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.pageContainer}>
            <CourseFilters
                onFilterChange={handleFilterChange}
                onSortChange={handleSortChange}
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