import React, { useState } from 'react';
import styles from './CourseFilters.module.css';

const CourseFilters = ({ onFilterChange }) => {
    const [filters, setFilters] = useState({
        category: [],
        level: [],
        price: []
    });

    const handleCheckboxChange = (type, value) => {
        setFilters(prev => {
            const updated = { ...prev };
            if (updated[type].includes(value)) {
                updated[type] = updated[type].filter(v => v !== value);
            } else {
                updated[type] = [...updated[type], value];
            }
            return updated;
        });
    };

    const applyFilters = () => {
        onFilterChange(filters);
    };

    const resetFilters = () => {
        setFilters({ category: [], level: [], price: [] });
        onFilterChange({ category: [], level: [], price: [] });
    };

    return (
        <aside className={styles.filtersSidebar}>
            <h2>Фильтры</h2>
            <div className={styles.filterGroup}>
                <h3>Категория</h3>
                <label><input type="checkbox" onChange={() => handleCheckboxChange('category', 'algebra')} /> Алгебра</label>
                <label><input type="checkbox" onChange={() => handleCheckboxChange('category', 'geometry')} /> Геометрия</label>
                <label><input type="checkbox" onChange={() => handleCheckboxChange('category', 'trigonometry')} /> Тригонометрия</label>
            </div>
            <div className={styles.filterGroup}>
                <h3>Уровень</h3>
                <label><input type="checkbox" onChange={() => handleCheckboxChange('level', 'beginner')} /> Начальный</label>
                <label><input type="checkbox" onChange={() => handleCheckboxChange('level', 'intermediate')} /> Средний</label>
                <label><input type="checkbox" onChange={() => handleCheckboxChange('level', 'advanced')} /> Продвинутый</label>
            </div>
            <div className={styles.filterGroup}>
                <h3>Цена</h3>
                <label><input type="checkbox" onChange={() => handleCheckboxChange('price', '0-1000')} /> до 1000₽</label>
                <label><input type="checkbox" onChange={() => handleCheckboxChange('price', '1000-5000')} /> 1000₽ – 5000₽</label>
                <label><input type="checkbox" onChange={() => handleCheckboxChange('price', '5000+')} /> от 5000₽</label>
            </div>
            <button onClick={applyFilters} className={styles.applyBtn}>Применить</button>
            <button onClick={resetFilters} className={styles.resetBtn}>Сбросить</button>
        </aside>
    );
};

export default CourseFilters;