import { cloneTemplate } from "../lib/utils.js";

/**
 * Инициализирует таблицу и вызывает коллбэк при любых изменениях и нажатиях на кнопки
 *
 * @param {Object} settings
 * @param {(action: HTMLButtonElement | undefined) => void} onAction
 * @returns {{container: Node, elements: *, render: render, renderPagination: renderPagination}}
 */
export function initTable(settings, onAction) {
    const {
        tableTemplate,
        rowTemplate,
        before = [],
        after = [],
        pagination: paginationTemplate = null
    } = settings;

    const root = cloneTemplate(tableTemplate);

    root.rows = root.elements?.rows || null;
    root.beforeContainer = root.elements?.before || null;
    root.afterContainer = root.elements?.after || null;
    root.pagination = root.elements?.pagination || null;
    root.filter = root.elements?.filter || null;

    if (root.elements?.header) {
      root.header = {
        container: root.elements.header,
        search: root.elements.search || null,
        sortByDate: root.elements.sortByDate || null,
        sortByTotal: root.elements.sortByTotal || null
     };
    } else {
      root.header = null;
    }


    function renderBlocks(array, template, target) {
        if (!template || !target) return;
        array.forEach(item => {
            const block = cloneTemplate(template);
            Object.keys(item).forEach(key => {
                if (block.elements[key]) {
                    block.elements[key].textContent = item[key];
                }
            });
            target.append(block.container);
        });
    }

    renderBlocks(before, rowTemplate, root.beforeContainer);
    renderBlocks(after, rowTemplate, root.afterContainer);

    // ===== Обработчики событий =====
    root.container.addEventListener("change", () => onAction());
    root.container.addEventListener("reset", () => setTimeout(() => onAction(), 0));
    root.container.addEventListener("submit", (e) => {
        e.preventDefault();
        onAction(e.submitter);
    });

    /**
     * Рендер строк таблицы
     */
    const render = (data) => {
        if (!root.rows) return;
        const nextRows = data.map(item => {
            const row = cloneTemplate(rowTemplate);
            Object.keys(item).forEach(key => {
                if (row.elements[key]) row.elements[key].textContent = item[key];
            });
            return row.container;
        });
        root.rows.replaceChildren(...nextRows);
    };

    const renderPagination = (paginationData) => {
        if (!paginationTemplate || !root.pagination) return;
        root.pagination.replaceChildren();
        paginationData.forEach(item => {
            const page = cloneTemplate(paginationTemplate);
            Object.keys(item).forEach(key => {
                if (page.elements[key]) page.elements[key].textContent = item[key];
            });
            root.pagination.append(page.container);
        });
    };

    return {
        ...root,
        render,
        renderPagination,
        rows: root.rows,
        beforeContainer: root.beforeContainer,
        afterContainer: root.afterContainer,
        pagination: root.pagination,
        filter: root.filter,
        header: root.header
    };
}
