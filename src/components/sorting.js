import { sortMap } from "../lib/sort.js"; 

export function initSorting(columns) {
    return (query, state, action) => {
        let field = null;
        let order = null;

        if (action && action.name === 'sort') {
            const current = action.dataset.value || 'none';

            let next;
            if (current === 'none') next = 'asc';
            else if (current === 'asc') next = 'desc';
            else next = 'none';

            action.dataset.value = next;

            columns.forEach(column => {
                if (column !== action) {
                    column.dataset.value = 'none';
                }
            });

            field = action.dataset.field;
            order = next;

        } else {
            columns.forEach(column => {
                if (column.dataset.value !== 'none') {
                    field = column.dataset.field;
                    order = column.dataset.value;
                }
            });
        }

        if (!field || order === 'none') {
            return query;
        }

        const sort = `${field}:${order}`;

        return Object.assign({}, query, { sort });
    };
}
