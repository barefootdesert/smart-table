import {rules, createComparison} from "../lib/compare.js";

export function initSearching(searchField) {

    // @todo: #5.1 — настроить компаратор
    // создаём компаратор, который будет сравнивать строку поиска с полями объекта
    const compare = createComparison(rules);

    return (data, state, action) => {

        // пустой поиск → не фильтруем
        const query = searchField.value.trim();
        if (!query) return data;

        // @todo: #5.2 — применить компаратор
        // фильтруем каждую строку с учётом правил сравнения
        return data.filter(row => compare(row, { search: query }));
    }
}
