/**
 * Инициализация пагинации
 *
 * @param {HTMLElement|null} container — контейнер для пагинации
 * @param {(el: HTMLElement, page: number, isCurrent: boolean) => HTMLElement} renderPage — функция рендеринга одной страницы
 */
export function initPagination(container, renderPage) {
    // Если контейнера нет, возвращаем пустые функции
    if (!container) {
        return {
            applyPagination: () => {},
            updatePagination: () => {}
        };
    }

    const pagesContainer = container.firstElementChild;
    if (!pagesContainer) {
        return {
            applyPagination: () => {},
            updatePagination: () => {}
        };
    }

    /**
     * Обновляем элементы страниц
     * @param {number} totalItems
     * @param {Object} query — объект с текущей страницей и rowsPerPage
     */
    function updatePagination(totalItems, query) {
        const rowsPerPage = Number(query.rowsPerPage) || 10;
        const currentPage = Number(query.page) || 1;
        const totalPages = Math.ceil(totalItems / rowsPerPage);

        pagesContainer.replaceChildren();

        for (let i = 1; i <= totalPages; i++) {
            const pageEl = document.createElement('div');
            renderPage(pageEl, i, i === currentPage);
            pagesContainer.appendChild(pageEl);
        }
    }

    /**
     * Применяем пагинацию к запросу
     */
    function applyPagination(query, state) {
        const rowsPerPage = Number(state.rowsPerPage) || 10;
        const page = Number(state.page) || 1;

        return {
            ...query,
            limit: rowsPerPage,
            offset: (page - 1) * rowsPerPage
        };
    }

    return { applyPagination, updatePagination };
}