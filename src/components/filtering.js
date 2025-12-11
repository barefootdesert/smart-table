
export function initFiltering(elements) {
    const updateIndexes = (elements, indexes) => {
        Object.keys(indexes).forEach((elementName) => {
            const select = elements[elementName];
            if (!select) return;
            while (select.options.length > 1) {
                select.remove(1);
            }
            Object.values(indexes[elementName]).forEach(name => {
                const el = document.createElement("option");
                el.textContent = name;
                el.value = name;
                select.appendChild(el);
            });
        });
    };

    const applyFiltering = (query, state, action) => {

        if (action && action.name === "clear" && action.dataset.field) {
            const field = action.dataset.field;
            if (elements[field]) {
                elements[field].value = "";
                state[field] = "";
            }
        }

        const filter = {};

        Object.keys(elements).forEach(key => {
            const el = elements[key];
            if (!el) return;

            if (['INPUT', 'SELECT'].includes(el.tagName) && el.value) {
                filter[`filter[${el.name}]`] = el.value;
            }
        });

        return Object.keys(filter).length
            ? Object.assign({}, query, filter)
            : query;
    };

    return {
        updateIndexes,
        applyFiltering
    };
}
