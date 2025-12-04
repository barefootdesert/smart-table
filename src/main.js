import './fonts/ys-display/fonts.css'
import './style.css'

import {data as sourceData} from "./data/dataset_1.js";

import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";

import {initTable} from "./components/table.js";
import {initPagination} from "./components/pagination.js";
import {initSorting} from "./components/sorting.js";   // ← нужно добавить этот файл!


// Исходные данные используемые в render()
const {data, ...indexes} = initData(sourceData);

// Глобальные значения пагинации
let page = 1;
let rowsPerPage = 10;

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
    const state = processFormData(new FormData(sampleTable.container));

    rowsPerPage = Number(state.rowsPerPage) || 10;
    page = Number(state.page) || page;

    return {
        ...state,
        rowsPerPage,
        page
    };
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
function render(action) {
    let state = collectState(); // состояние полей из формы
    let result = [...data];

    // сортировка
    result = applySorting(result, state, action);

    // пагинация
    result = applyPagination(result, state, action);

    sampleTable.render(result);
}

const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['header', 'filter'],
    after: ['pagination']
}, render);


// Инициализация пагинации
const applyPagination = initPagination(
    sampleTable.pagination.elements,
    (el, page, isCurrent) => {
        const input = el.querySelector('input');
        const label = el.querySelector('span');
        input.value = page;
        input.checked = isCurrent;
        label.textContent = page;
        return el;
    }
);


// Инициализация сортировки
const applySorting = initSorting([
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
]);


// Вставляем таблицу в DOM
const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

// Первичный рендер
render();
