export function initSearching(searchField) {
    return (query, state, action) => {
        const value = state[searchField.name] || "";

        if (value.trim()) {
            return Object.assign({}, query, { search: value.trim() });
        }

        return query;
    };
}
