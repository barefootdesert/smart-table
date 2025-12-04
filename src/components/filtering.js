import {createComparison, defaultRules} from "../lib/compare.js";

// @todo: #4.3 — настроить компаратор
const compare = createComparison(defaultRules);

export function initFiltering(elements, indexes) {

    // @todo: #4.1 — заполнить выпадающие списки опциями
    Object.keys(indexes).forEach((elementName) => {

        const select = elements[elementName];       // сам <select>
        const values = Object.values(indexes[elementName]); // массив значений (строки)

        const options = values.map(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            return option;
        });

        select.append(...options);
    });

    return (data, state, action) => {

        // @todo: #4.2 — обработать очистку поля
        if (action && action.name === 'clear' && action.dataset.field) {
            const field = action.dataset.field;
            elements[field].value = "";   // очистили выпадающий список
            state[field] = "";            // очистили состояние
        }

        // @todo: #4.5 — отфильтровать данные используя компаратор
        return data.filter(row => compare(row, state));
    }
}
