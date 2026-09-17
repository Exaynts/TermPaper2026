import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import styles from './LiveSearch.module.css';

// Построить абсолютный URL для картинки, если бэкенд вернул относительный путь
const buildImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;

    // Берём origin из API_URL и отрезаем /api/ в конце
    const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
    const origin = apiUrl.replace(/\/api\/?$/, '');
    return `${origin}${url}`;
};

const LiveSearch = ({ placeholder = 'Search for courses...' }) => {
    const [query, setQuery] = useState('');
    const [myCourses, setMyCourses] = useState([]);
    const [catalogResults, setCatalogResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const wrapperRef = useRef(null);
    const navigate = useNavigate();

    // 1. Загрузить "свои" курсы при монтировании (один раз)
    useEffect(() => {
        const loadMyCourses = async () => {
            try {
                const [purchasedRes, savedRes] = await Promise.all([
                    api.get('/courses/my_courses/'),
                    api.get('/courses/saved_courses/'),
                ]);

                const purchased = (purchasedRes.data.results || purchasedRes.data)
                    .map((item) => item.course ? item.course : item);
                const saved = (savedRes.data.results || savedRes.data)
                    .map((item) => item.course ? item.course : item);
                const merged = [...purchased, ...saved];
                const unique = Array.from(
                    new Map(merged.map((c) => [c.course_id, c])).values()
                );

                setMyCourses(unique);
            } catch (err) {
                console.error('LiveSearch: failed to load my courses', err);
            }
        };
        loadMyCourses();
    }, []);

    // Debounced-поиск по каталогу
    useEffect(() => {
        if (query.trim().length < 2) {
            setCatalogResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const timer = setTimeout(async () => {
            try {
                const res = await api.get('/courses/', {
                    params: { search: query, page_size: 5 },
                });
                setCatalogResults(res.data.results || res.data);
            } catch (err) {
                console.error('LiveSearch: failed to search catalog', err);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Закрыть при клике вне компонента
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Клиентская фильтрация "своих" курсов
    const filteredMyCourses = query.trim().length < 2
        ? []
        : myCourses
            .filter((c) =>
                c.name.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, 3);

    const myCourseIds = new Set(myCourses.map((c) => c.course_id));
    const filteredCatalog = catalogResults.filter(
        (course) => !myCourseIds.has(course.course_id)
    );
    const hasResults = filteredMyCourses.length > 0 || filteredCatalog.length > 0;
    const showDropdown = isOpen && query.trim().length >= 2;

    const handleSelect = (courseId) => {
        setIsOpen(false);
        setQuery('');
        navigate(`/courses/${courseId}`);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            setIsOpen(false);
            navigate(`/courses?search=${encodeURIComponent(query.trim())}`);
        }
    };

    const formatPrice = (price) => {
        const num = Number(price);
        return num % 1 === 0 ? num.toFixed(0) : num.toFixed(2);
    };

    return (
        <div className={styles.wrapper} ref={wrapperRef}>
            <form className={styles.form} onSubmit={handleSubmit}>
                <input
                    type="text"
                    className={styles.input}
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                />
                <button type="submit" className={styles.searchButton} aria-label="Search">
                    <svg className={styles.searchIcon} viewBox="0 0 24 24">
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                    </svg>
                </button>
            </form>

            {showDropdown && (
                <div className={styles.dropdown}>
                    {loading && <div className={styles.loading}>Searching...</div>}

                    {!loading && !hasResults && (
                        <div className={styles.empty}>No courses found</div>
                    )}

                    {!loading && filteredMyCourses.length > 0 && (
                        <>
                            <div className={styles.groupTitle}>Your courses</div>
                            {filteredMyCourses.map((course) => (
                                <div
                                    key={`my-${course.course_id}`}
                                    className={styles.item}
                                    onClick={() => handleSelect(course.course_id)}
                                >
                                    {buildImageUrl(course.image) && (
                                        <img
                                            src={buildImageUrl(course.image)}
                                            alt=""
                                            className={styles.itemImage}
                                        />
                                    )}
                                    <span className={styles.itemName}>{course.name}</span>
                                    <span className={styles.itemBadge}>Продолжить</span>
                                </div>
                            ))}
                        </>
                    )}

                    {!loading && filteredCatalog.length > 0 && (
                        <>
                            <div className={styles.groupTitle}>Catalog</div>
                            {filteredCatalog.map((course) => (
                                <div
                                    key={`cat-${course.course_id}`}
                                    className={styles.item}
                                    onClick={() => handleSelect(course.course_id)}
                                >
                                    {buildImageUrl(course.image) && (
                                        <img
                                            src={buildImageUrl(course.image)}
                                            alt=""
                                            className={styles.itemImage}
                                        />
                                    )}
                                    <span className={styles.itemName}>{course.name}</span>
                                    <span className={styles.itemPrice}>
                                        {formatPrice(course.discounted_price || course.price)}₽
                                    </span>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default LiveSearch;