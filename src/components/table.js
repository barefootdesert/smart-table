import {cloneTemplate} from "../lib/utils.js";

/**
 * Инициализирует таблицу и вызывает коллбэк при любых изменениях и нажатиях на кнопки
 *
 * @param {Object} settings
 * @param {(action: HTMLButtonElement | undefined) => void} onAction
 * @returns {{container: Node, elements: *, render: render}}
 */
export function initTable(settings, onAction) {
    const {tableTemplate, rowTemplate, before, after} = settings;
    const root = cloneTemplate(tableTemplate);

    // @todo: #1.2 —  вывести дополнительные шаблоны до и после таблицы
    function renderBlocks(array, template, target) {
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

    // @todo: #1.3 —  обработать события и вызвать onAction()

    // 1. Событие change
    root.container.addEventListener("change", () => {
      // просто вызываем onAction без аргументов
      onAction();
    });

    // 2. Событие reset
    root.container.addEventListener("reset", () => {
      // reset срабатывает ДО очистки полей → нужна задержка
      setTimeout(() => onAction(), 0);
    });

    // 3. Событие submit
    root.container.addEventListener("submit", (e) => {
      e.preventDefault();                // предотвращаем перезагрузку страницы
      onAction(e.submitter);             // передаём кнопку, которая инициировала submit
    });


    const render = (data) => {
    // @todo: #1.1 — преобразовать данные в массив строк на основе шаблона rowTemplate
    const nextRows = data.map(item => {
        // Клонируем шаблон строки
        const row = cloneTemplate(rowTemplate);

        // Обходим ключи объекта item
        Object.keys(item).forEach(key => {
            // Если такой элемент существует в шаблоне
            if (row.elements[key]) {
                row.elements[key].textContent = item[key];
            }
        });

        // Возвращаем контейнер строки (DOM-элемент)
        return row.container;
    });

    root.elements.rows.replaceChildren(...nextRows);
}


    return {...root, render};
}