import {sortCollection, sortMap} from "../lib/sort.js";

export function initSorting(columns) {
    return (data, state, action) => {
        let field = null;
        let order = null;

        if (action && action.name === 'sort') {
            // @todo: #3.1 — запомнить выбранный режим сортировки
            const current = action.dataset.value || 'none';

            // Переключаем режим сортировки кнопки
            let next;
            if (current === 'none') next = 'asc';
            else if (current === 'asc') next = 'desc';
            else next = 'none';

            action.dataset.value = next;
            action.dataset.field = action.dataset.field;

            // @todo: #3.2 — сбросить сортировки остальных колонок
            columns.forEach(column => {
                if (column !== action) {
                    column.dataset.value = 'none';
                }
            });

            // Устанавливаем сортировку после клика
            field = action.dataset.field;
            order = action.dataset.value;

        } else {
            // @todo: #3.3 — получить выбранный режим сортировки (после обновления формы)
            columns.forEach(column => {
                if (column.dataset.value !== 'none') {
                    field = column.dataset.field;
                    order = column.dataset.value;
                }
            });
        }

        return sortCollection(data, field, order);
    }
}
