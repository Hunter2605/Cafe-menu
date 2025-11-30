// ======== ПЕРЕКЛЮЧЕНИЕ ЯЗЫКА ======= //
if (!localStorage.getItem('userName')) {
  window.location.href = 'login.html';
}
const translations = {
  ru: {
    menu_title: "Меню",
    // Ключи должны совпадать с тем, что в базе + "_cat"
    coffe_cat: "Кофе",      // Исправляем отображение для coffe
    tea_cat: "Чай",
    desserts_cat: "Десерты",
    qdqq_cat: "Моя новая категория" // Добавьте перевод для новой категории
  },
  en: {
    menu_title: "Coffee Menu",
    coffe_cat: "Coffee",    // Исправляем отображение для coffe
    tea_cat: "Tea",
    desserts_cat: "Desserts",
    qdqq_cat: "My new category"
  }
};

let currentLang = localStorage.getItem("lang") || "ru";

function updateLanguage() {
  document.querySelectorAll("[data-lang]").forEach(el => {
    const key = el.getAttribute("data-lang");
    el.textContent = translations[currentLang][key];
  });

  document.getElementById("langToggle").textContent = currentLang.toUpperCase();
  localStorage.setItem("lang", currentLang);
}

document.getElementById("langToggle").addEventListener("click", () => {
  currentLang = currentLang === "ru" ? "en" : "ru";
  updateLanguage();
});

document.addEventListener("DOMContentLoaded", updateLanguage);
// язык


// Базовый URL сервера
  const BASE_URL = 'http://localhost:3000';

async function loadCategory(endpoint, containerId) {
  const container = document.getElementById(containerId);

  try {
    // ИСПОЛЬЗУЕМ BASE_URL и endpoint, например: http://localhost:3000/api/products/tea
    const response = await fetch(BASE_URL + endpoint);

    if (!response.ok) throw new Error('Ошибка сети');

    const items = await response.json();

    container.innerHTML = '';

    console.log('Данные с сервера:', items);

    if (items.length === 0) {
      container.innerHTML = '<p>В этой категории пока пусто.</p>';
      return;
    }

    // --- ВНУТРИ loadCategory(endpoint, containerId) ---
// ... (после проверки items.length)

    items.forEach(item => {
      // 1. Создаем элемент списка (li)
      const listItem = document.createElement('li');

      // 2. Вставляем ВЕСЬ HTML продукта прямо в li
      listItem.innerHTML = `
        <div class="product-item-content">
            <img src="${item.image_path}" 
                 alt="${item.name}" 
                 class="product-image">
            
            <div class="product-details"> 
                <h4 class="product-name">${item.name}</h4>
                <div class="product-cost">${item.cost} сом.</div>
            </div>
        </div>
      `;

      // 3. Добавляем li в ul.submenu
      container.appendChild(listItem);
    });
// -----------------------------------------------------------------

  } catch (error) {
    console.error('Ошибка загрузки категории:', error);
    // Если произошла ошибка сети или сервера
    container.innerHTML = `<p style="color:red">Error</p>`;
  }
}

// ==========================================================
//  НОВАЯ УНИВЕРСАЛЬНАЯ ФУНКЦИЯ ЗАГРУЗКИ МЕНЮ
// ==========================================================
async function loadAllCategories() {
  const menuContainer = document.getElementById('dynamic-menu-list');

  if (!menuContainer) {
    console.error("Контейнер #dynamic-menu-list не найден.");
    return;
  }

  try {
    // 1. Запрос списка всех категорий с сервера
    const categoriesResponse = await fetch(`${BASE_URL}/api/categories`);
    if (!categoriesResponse.ok) throw new Error('Ошибка при получении списка категорий');

    const categories = await categoriesResponse.json();

    // Очищаем контейнер перед добавлением
    menuContainer.innerHTML = '';

    // 2. Создание HTML-структуры и загрузка товаров для КАЖДОЙ категории
    categories.forEach(cat => {
      const categoryName = cat.name.toLowerCase(); // tea, coffee, qdqq и т.д.

      // 2а. Создаем li (элемент меню)
      const listItem = document.createElement('li');

      // Пытаемся использовать перевод, если ключ существует
      const translationKey = `${categoryName}_cat`;
      const displayTitle = translations[currentLang][translationKey] || categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

      // Добавляем атрибут data-lang для переключения языка
      if (translations.ru.hasOwnProperty(translationKey)) {
        listItem.setAttribute('data-lang', translationKey);
      }

      listItem.innerHTML = `
                <h3 ${translations.ru.hasOwnProperty(translationKey) ? `data-lang="${translationKey}"` : ''}>${displayTitle}</h3>
                <ul class="submenu" id="${categoryName}">
                    </ul>
            `;

      menuContainer.appendChild(listItem);

      // 2б. Запускаем загрузку товаров в созданный контейнер
      loadCategory(`/api/products/${categoryName}`, categoryName);
    });

    // 3. Переназначаем слушатели кликов для динамически созданных элементов
    assignMenuEventListeners();

    // 4. Применяем текущий язык к новым элементам
    updateLanguage();

  } catch (error) {
    console.error('Ошибка в loadAllCategories:', error);
    menuContainer.innerHTML = `<p style="color:red">Не удалось загрузить меню (${error.message})</p>`;
  }
}

// -------------------------------------------------------------
// ОБНОВЛЕННЫЕ СЛУШАТЕЛИ КЛИКОВ (нужно вынести в отдельную функцию)
// -------------------------------------------------------------
function assignMenuEventListeners() {
  const items = document.querySelectorAll('#dynamic-menu-list > li');

  items.forEach(item => {
    item.addEventListener('click', toggleCategory);
  });
}

function toggleCategory(e) {
  e.stopPropagation();
  const currentItem = e.currentTarget;
  const items = document.querySelectorAll('#dynamic-menu-list > li');

  // Закрыть другие категории
  items.forEach(i => {
    if (i !== currentItem) i.classList.remove('active');
  });
  // Переключить выбранную
  currentItem.classList.toggle('active');
}

// -------------------------------------------------------------
//  ОБНОВЛЕНИЕ ВЫЗОВА ФУНКЦИЙ В КОНЦЕ ФАЙЛА
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  updateLanguage();
  loadAllCategories(); // <-- Запускаем новую универсальную загрузку!
});
// --- ДОБАВЬТЕ ЭТОТ БЛОК В КОНЕЦ script.js ---

// Закрыть все категории, если клик произошел вне меню
document.addEventListener('click', (e) => {
  // Проверяем, был ли клик внутри контейнера меню (#dynamic-menu-list)
  const menuContainer = document.getElementById('dynamic-menu-list');

  // Если клик не внутри контейнера меню или не на кнопке переключения языка
  if (menuContainer && !menuContainer.contains(e.target) && e.target.id !== 'langToggle') {
    const items = document.querySelectorAll('#dynamic-menu-list > li');
    items.forEach(i => i.classList.remove('active'));
  }
});
// Убедитесь, что глобальный слушатель document.addEventListener('click', ...) остался.