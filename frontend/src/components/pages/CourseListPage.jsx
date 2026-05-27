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
    const [activeFilters, setActiveFilters] = useState({ category: [], level: [], price: [] });

    useEffect(() => {
        fetchCourses();
    }, [searchTerm, activeFilters]);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            let url = '/courses/';
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            // Здесь можно добавить параметры фильтрации, если бэкенд поддерживает
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

    const handleFilterChange = (filters) => {
        setActiveFilters(filters);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchCourses(); // поиск уже в useEffect через searchTerm
    };

    if (loading) return <div className={styles.loading}>Загрузка...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.pageContainer}>
            <CourseFilters onFilterChange={handleFilterChange} />
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