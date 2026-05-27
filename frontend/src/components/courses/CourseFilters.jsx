import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from './CourseFilters.module.css';

const CourseFilters = ({ onFilterChange, onSortChange }) => {
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [hasDiscount, setHasDiscount] = useState(false);
    const [ratingMin, setRatingMin] = useState('');
    const [ratingMax, setRatingMax] = useState('');
    const [sortBy, setSortBy] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories/');
                const categoriesData = response.data.results || response.data;
                setCategories(Array.isArray(categoriesData) ? categoriesData : []);
            } catch (error) {
                console.error('Ошибка загрузки категорий:', error);
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    const handleCategoryChange = (categoryId) => {
        setSelectedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    // Фильтр ввода: только цифры и одна точка
    const filterNumberInput = (value, maxLength = null) => {
        let filtered = value.replace(/[^\d.]/g, '');
        const dotCount = (filtered.match(/\./g) || []).length;
        if (dotCount > 1) filtered = filtered.slice(0, filtered.lastIndexOf('.'));
        if (maxLength && filtered.length > maxLength) filtered = filtered.slice(0, maxLength);
        return filtered;
    };

    const handlePriceMinChange = (e) => {
        let val = filterNumberInput(e.target.value, 8);
        if (val === '.') val = '';
        setPriceMin(val);
    };

    const handlePriceMaxChange = (e) => {
        let val = filterNumberInput(e.target.value, 8);
        if (val === '.') val = '';
        setPriceMax(val);
    };

    const handleRatingMinChange = (e) => {
        let val = filterNumberInput(e.target.value, 4);
        if (val === '.') val = '';
        const num = parseFloat(val);
        if (!isNaN(num) && num > 5) val = '5';
        setRatingMin(val);
    };

    const handleRatingMaxChange = (e) => {
        let val = filterNumberInput(e.target.value, 4);
        if (val === '.') val = '';
        const num = parseFloat(val);
        if (!isNaN(num) && num > 5) val = '5';
        setRatingMax(val);
    };

    const applyFilters = () => {
        const filters = {
            categories: selectedCategories,
            price_min: priceMin ? Number(priceMin) : null,
            price_max: priceMax ? Number(priceMax) : null,
            has_discount: hasDiscount,
            rating_min: ratingMin ? Number(ratingMin) : null,
            rating_max: ratingMax ? Number(ratingMax) : null,
        };
        onFilterChange(filters);
        onSortChange(sortBy);
    };

    const resetFilters = () => {
        setSelectedCategories([]);
        setPriceMin('');
        setPriceMax('');
        setHasDiscount(false);
        setRatingMin('');
        setRatingMax('');
        setSortBy('');
        onFilterChange({
            categories: [],
            price_min: null,
            price_max: null,
            has_discount: false,
            rating_min: null,
            rating_max: null,
        });
        onSortChange('');
    };

    return (
        <aside className={styles.filtersSidebar}>
            <h2 className={styles.title}>Фильтры</h2>

            {/* Категории */}
            <div className={styles.filterGroup}>
                <div className={styles.checkboxGroup}>
                    {categories.map(cat => (
                        <label key={cat.category_id} className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={selectedCategories.includes(cat.category_id)}
                                onChange={() => handleCategoryChange(cat.category_id)}
                            />
                            {cat.title}
                        </label>
                    ))}
                    {categories.length === 0 && <span className={styles.hint}>Нет категорий</span>}
                </div>
            </div>

            <hr className={styles.divider} />

            {/* Цена */}
            <div className={styles.filterGroup}>
                <h3 className={styles.groupTitle}>Цена (₽)</h3>
                <div className={styles.rangeGroup}>
                    <input
                        type="text"
                        placeholder="от"
                        value={priceMin}
                        onChange={handlePriceMinChange}
                        className={styles.rangeInput}
                        inputMode="decimal"
                    />
                    <span className={styles.rangeSeparator}>—</span>
                    <input
                        type="text"
                        placeholder="до"
                        value={priceMax}
                        onChange={handlePriceMaxChange}
                        className={styles.rangeInput}
                        inputMode="decimal"
                    />
                </div>
            </div>

            <hr className={styles.divider} />

            {/* Скидка */}
            <div className={styles.filterGroup}>
                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        checked={hasDiscount}
                        onChange={(e) => setHasDiscount(e.target.checked)}
                    />
                    Только со скидкой
                </label>
            </div>

            <hr className={styles.divider} />

            {/* Рейтинг */}
            <div className={styles.filterGroup}>
                <h3 className={styles.groupTitle}>Рейтинг (★)</h3>
                <div className={styles.rangeGroup}>
                    <input
                        type="text"
                        placeholder="от"
                        value={ratingMin}
                        onChange={handleRatingMinChange}
                        className={styles.rangeInput}
                        inputMode="decimal"
                    />
                    <span className={styles.rangeSeparator}>—</span>
                    <input
                        type="text"
                        placeholder="до"
                        value={ratingMax}
                        onChange={handleRatingMaxChange}
                        className={styles.rangeInput}
                        inputMode="decimal"
                    />
                </div>
            </div>

            <hr className={styles.divider} />

            {/* Сортировка */}
            <div className={styles.filterGroup}>
                <h3 className={styles.groupTitle}>Сортировка</h3>
                <div className={styles.radioGroup}>
                    <label className={styles.radioLabel}>
                        <input
                            type="radio"
                            name="sort"
                            value="price_asc"
                            checked={sortBy === 'price_asc'}
                            onChange={(e) => setSortBy(e.target.value)}
                        />
                        Самые дешёвые
                    </label>
                    <label className={styles.radioLabel}>
                        <input
                            type="radio"
                            name="sort"
                            value="price_desc"
                            checked={sortBy === 'price_desc'}
                            onChange={(e) => setSortBy(e.target.value)}
                        />
                        Самые дорогие
                    </label>
                    <label className={styles.radioLabel}>
                        <input
                            type="radio"
                            name="sort"
                            value="rating"
                            checked={sortBy === 'rating'}
                            onChange={(e) => setSortBy(e.target.value)}
                        />
                        По рейтингу
                    </label>
                    <label className={styles.radioLabel}>
                        <input
                            type="radio"
                            name="sort"
                            value="newest"
                            checked={sortBy === 'newest'}
                            onChange={(e) => setSortBy(e.target.value)}
                        />
                        Новинки
                    </label>
                </div>
            </div>

            <div className={styles.buttonsGroup}>
                <button onClick={resetFilters} className={styles.resetBtn}>Сбросить</button>
                <button onClick={applyFilters} className={styles.applyBtn}>Применить</button>
            </div>
        </aside>
    );
};

export default CourseFilters;