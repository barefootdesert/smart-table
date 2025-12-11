import './fonts/ys-display/fonts.css';
import './style.css';

import { data as sourceData } from "./data/dataset_1.js";
import { initData } from "./data.js";
import { processFormData } from "./lib/utils.js";

import { initTable } from "./components/table.js";
import { initPagination } from "./components/pagination.js";
import { initFiltering } from "./components/filtering.js";
import { initSearching } from "./components/searching.js";
import { initSorting } from "./components/sorting.js";

// API
const api = initData(sourceData);

// собираем состояние формы
function collectState() {
    const state = processFormData(new FormData(sampleTable.container));
    return {
        ...state,
        rowsPerPage: Number(state.rowsPerPage) || 10,
        page: Number(state.page) || 1
    };
}

// основной рендер
async function render(action) {
    const state = collectState();
    let query = {};

    if (applySearching)  query = applySearching(query, state, action);
    if (applyFiltering)  query = applyFiltering(query, state, action);
    if (applySorting)    query = applySorting(query, state, action);
    if (applyPagination) query = applyPagination(query, state, action);

    const { total, items } = await api.getRecords(query);

    if (updatePagination) updatePagination(total, query);

    sampleTable.render(items);
}

// Инициализация UI
const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['header', 'filter'],
    after: ['pagination']
}, render);

document.querySelector('#app').appendChild(sampleTable.container);

// пагинация
let applyPagination, updatePagination;
if (sampleTable.pagination) {
    ({ applyPagination, updatePagination } = initPagination(
        sampleTable.pagination,
        (el, page, isCurrent) => {
            const input = el.querySelector('input');
            const label = el.querySelector('span');
            if (input) input.value = page;
            if (input) input.checked = isCurrent;
            if (label) label.textContent = page;
            return el;
        }
    ));
}

// фильтрация
let applyFiltering, updateIndexes;
if (sampleTable.filter) {
    ({ applyFiltering, updateIndexes } = initFiltering(sampleTable.filter));
}

// поиск
const applySearching =
    sampleTable.header?.search
        ? initSearching(sampleTable.header.search)
        : null;

console.log("HEADER:", sampleTable.header);
console.log("ELEMENTS:", sampleTable.header?.elements);
console.log("sortByDate =", sampleTable.header?.elements?.sortByDate);
console.log("sortByTotal =", sampleTable.header?.elements?.sortByTotal);

// сортировка
const applySorting =
    sampleTable.header
        ? initSorting([
            sampleTable.header.sortByDate,
            sampleTable.header.sortByTotal
        ])
        : null;

async function init() {
    const indexes = await api.getIndexes();

    if (updateIndexes && sampleTable.filter) {
        updateIndexes(sampleTable.filter, {
            searchBySeller: indexes.sellers
        });
    }

    await render();
}

init().catch(err => {
    console.error('Init error', err);
    render();
});
