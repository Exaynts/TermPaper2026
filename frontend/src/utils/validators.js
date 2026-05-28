/**
 * Валидация ввода цены: разрешает только цифры и точку, не более двух знаков после запятой,
 * ограничивает целую часть 9 цифрами, убирает лишние ведущие нули и точки.
 * @param {string} value - вводимое значение
 * @returns {string} отфильтрованное значение
 */
export const validatePriceInput = (value) => {
    // Удаляем всё кроме цифр и точки
    let filtered = value.replace(/[^\d.]/g, '');
    // Оставляем только первую точку
    const parts = filtered.split('.');
    if (parts.length > 2) {
        filtered = parts[0] + '.' + parts.slice(1).join('');
    }

    let integerPart = parts[0] || '';
    let fractionalPart = parts[1] || '';

    // Ограничиваем целую часть до 9 цифр
    if (integerPart.length > 9) {
        integerPart = integerPart.slice(0, 9);
    }

    // Убираем ведущие нули в целой части, но не оставляем пустую строку
    if (integerPart.startsWith('0') && integerPart.length > 1) {
        integerPart = integerPart.replace(/^0+/, '');
        if (integerPart === '') integerPart = '0';
    }

    // Ограничиваем дробную часть до 2 цифр
    if (fractionalPart.length > 2) {
        fractionalPart = fractionalPart.slice(0, 2);
    }

    // Собираем строку
    if (fractionalPart) {
        filtered = integerPart + '.' + fractionalPart;
    } else {
        filtered = integerPart;
    }

    // Если строка начинается с точки, добавляем ведущий ноль
    if (filtered.startsWith('.')) {
        filtered = '0' + filtered;
    }

    // Если осталась только пустая строка или точка – возвращаем пустую строку
    if (filtered === '' || filtered === '.') return '';
    return filtered;
};

/**
 * Валидация ввода скидки: разрешает только цифры, не более 100.
 * @param {string} value
 * @returns {string}
 */
export const validateDiscountInput = (value) => {
    let filtered = value.replace(/[^\d]/g, '');
    if (filtered === '') return '';
    let num = parseInt(filtered, 10);
    if (num > 100) num = 100;
    return num.toString();
};