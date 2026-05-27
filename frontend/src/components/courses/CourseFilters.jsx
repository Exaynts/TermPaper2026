import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from './CourseFilters.module.css';

const CourseFilters = ({
    selectedCategories, priceMin, priceMax, hasDiscount, ratingMin, ratingMax, sortBy,
    onCategoryChange, onPriceMinChange, onPriceMaxChange, onHasDiscountChange,
    onRatingMinChange, onRatingMaxChange, onSortChange,
    onApplyFilters, onResetFilters
}) => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories/');
                const categoriesData = response.data.results || response.data;
                setCategories(Array.isArray(categoriesData) ? categoriesData : []);
            } catch (error) {
                console.error('Error loading categories:', error);
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    const filterNumberInput = (value, maxLength = null) => {
        let filtered = value.replace(/[^\d.]/g, '');
        const dotCount = (filtered.match(/\./g) || []).length;
        if (dotCount > 1) filtered = filtered.slice(0, filtered.lastIndexOf('.'));
        if (maxLength && filtered.length > maxLength) filtered = filtered.slice(0, maxLength);
        return filtered;
    };

    const handlePriceMin = (e) => {
        let val = filterNumberInput(e.target.value, 8);
        if (val === '.') val = '';
        onPriceMinChange(val);
    };
    const handlePriceMax = (e) => {
        let val = filterNumberInput(e.target.value, 8);
        if (val === '.') val = '';
        onPriceMaxChange(val);
    };
    const handleRatingMin = (e) => {
        let val = filterNumberInput(e.target.value, 4);
        if (val === '.') val = '';
        const num = parseFloat(val);
        if (!isNaN(num) && num > 5) val = '5';
        onRatingMinChange(val);
    };
    const handleRatingMax = (e) => {
        let val = filterNumberInput(e.target.value, 4);
        if (val === '.') val = '';
        const num = parseFloat(val);
        if (!isNaN(num) && num > 5) val = '5';
        onRatingMaxChange(val);
    };

    return (
        <aside className={styles.filtersSidebar}>
            <h2 className={styles.title}>Filters</h2>

            <div className={styles.filterGroup}>
                <h3 className={styles.groupTitle}>Category</h3>
                <div className={styles.checkboxGroup}>
                    {categories.map(cat => (
                        <label key={cat.category_id} className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={selectedCategories.includes(cat.category_id)}
                                onChange={() => onCategoryChange(cat.category_id)}
                            />
                            {cat.title}
                        </label>
                    ))}
                    {categories.length === 0 && <span className={styles.hint}>No categories</span>}
                </div>
            </div>

            <hr className={styles.divider} />

            <div className={styles.filterGroup}>
                <h3 className={styles.groupTitle}>Price (₽)</h3>
                <div className={styles.rangeGroup}>
                    <input
                        type="text"
                        placeholder="from"
                        value={priceMin}
                        onChange={handlePriceMin}
                        className={styles.rangeInput}
                        inputMode="decimal"
                    />
                    <span className={styles.rangeSeparator}>—</span>
                    <input
                        type="text"
                        placeholder="to"
                        value={priceMax}
                        onChange={handlePriceMax}
                        className={styles.rangeInput}
                        inputMode="decimal"
                    />
                </div>
            </div>

            <hr className={styles.divider} />

            <div className={styles.filterGroup}>
                <label className={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        checked={hasDiscount}
                        onChange={(e) => onHasDiscountChange(e.target.checked)}
                    />
                    Only with discount
                </label>
            </div>

            <hr className={styles.divider} />

            <div className={styles.filterGroup}>
                <h3 className={styles.groupTitle}>Rating (★)</h3>
                <div className={styles.rangeGroup}>
                    <input
                        type="text"
                        placeholder="from"
                        value={ratingMin}
                        onChange={handleRatingMin}
                        className={styles.rangeInput}
                        inputMode="decimal"
                    />
                    <span className={styles.rangeSeparator}>—</span>
                    <input
                        type="text"
                        placeholder="to"
                        value={ratingMax}
                        onChange={handleRatingMax}
                        className={styles.rangeInput}
                        inputMode="decimal"
                    />
                </div>
            </div>

            <hr className={styles.divider} />

            <div className={styles.filterGroup}>
                <h3 className={styles.groupTitle}>Sort by</h3>
                <div className={styles.radioGroup}>
                    <label className={styles.radioLabel}>
                        <input
                            type="radio"
                            name="sort"
                            value="price_asc"
                            checked={sortBy === 'price_asc'}
                            onChange={(e) => onSortChange(e.target.value)}
                        />
                        Cheapest
                    </label>
                    <label className={styles.radioLabel}>
                        <input
                            type="radio"
                            name="sort"
                            value="price_desc"
                            checked={sortBy === 'price_desc'}
                            onChange={(e) => onSortChange(e.target.value)}
                        />
                        Most expensive
                    </label>
                    <label className={styles.radioLabel}>
                        <input
                            type="radio"
                            name="sort"
                            value="rating"
                            checked={sortBy === 'rating'}
                            onChange={(e) => onSortChange(e.target.value)}
                        />
                        By rating
                    </label>
                    <label className={styles.radioLabel}>
                        <input
                            type="radio"
                            name="sort"
                            value="newest"
                            checked={sortBy === 'newest'}
                            onChange={(e) => onSortChange(e.target.value)}
                        />
                        Newest
                    </label>
                </div>
            </div>

            <div className={styles.buttonsGroup}>
                <button onClick={onResetFilters} className={styles.resetBtn}>Reset</button>
                <button onClick={onApplyFilters} className={styles.applyBtn}>Apply</button>
            </div>
        </aside>
    );
};

export default React.memo(CourseFilters);