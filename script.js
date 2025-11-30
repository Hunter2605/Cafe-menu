// ======== ПЕРЕКЛЮЧЕНИЕ ЯЗЫКА ======= //
if (!localStorage.getItem('userName')) {
  window.location.href = 'login.html';
}

const translations = {
  ru: {
    menu_title: "Меню",
    coffe_cat: "Кофе",
    tea_cat: "Чай",
    desserts_cat: "Десерты",
    qdqq_cat: "Моя новая категория"
  },
  en: {
    menu_title: "Coffee Menu",
    coffe_cat: "Coffee",
    tea_cat: "Tea",
    desserts_cat: "Desserts",
    qdqq_cat: "My new category"
  }
};

let currentLang = localStorage.getItem("lang") || "ru";

// --- убираем рекурсию: updateLanguage только обновляет тексты и localStorage
function updateLanguage() {
  document.querySelectorAll("[data-lang]").forEach(el => {
    const key = el.getAttribute("data-lang");
    if (translations[currentLang] && translations[currentLang][key]) {
      el.textContent = translations[currentLang][key];
    }
  });

  const toggleBtn = document.getElementById("langToggle");
  if (toggleBtn) toggleBtn.textContent = currentLang.toUpperCase();
  localStorage.setItem("lang", currentLang);
}

// Обработчик переключения языка — теперь отдельно вызывает перезагрузку меню
document.getElementById("langToggle")?.addEventListener("click", async () => {
  currentLang = currentLang === "ru" ? "en" : "ru";
  updateLanguage();
  await loadAllCategories(); // перезагружаем меню вручную, без рекурсии
});


// ======== Загрузка категорий и товаров ========
const BASE_URL = 'http://localhost:3000';

function formatCurrency(amount) {
  return currentLang === "en" ? `${amount} soms` : `${amount} сом`;
}


async function loadCategory(endpoint, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const response = await fetch(BASE_URL + endpoint);
    if (!response.ok) throw new Error('Ошибка сети');
    const items = await response.json();
    container.innerHTML = '';

    if (items.length === 0) {
      container.innerHTML = '<p>В этой категории пока пусто.</p>';
      return;
    }

    items.forEach(item => {
      // Выбираем название по языку (fallbackы)
      const nameRu = item.name_ru || item.name;
      const nameEn = item.name_en || item.name;
      const compRu = item.comp_ru || item.comp || '';
      const compEn = item.comp_en || '';

      const displayName = (currentLang === 'en') ? (nameEn || nameRu || item.name) : (nameRu || nameEn || item.name);
      const displayComp = (currentLang === 'en') ? (compEn || compRu) : (compRu || compEn);

      const listItem = document.createElement('li');
      listItem.innerHTML = `
  <div class="product-item-content">
      <img src="${item.image_path || ''}" 
           alt="${displayName}" 
           class="product-image">
      
      <div class="product-details"> 
          <h4 class="product-name">${displayName}</h4>
          <div class="product-comp">${displayComp}</div>
          <div class="product-cost">${formatCurrency(item.cost)}</div>
      </div>
  </div>
`;
      container.appendChild(listItem);
    });

  } catch (error) {
    console.error('Ошибка загрузки категории:', error);
    container.innerHTML = `<p style="color:red">Error</p>`;
  }
}

// ======== Загрузка всех категорий и создание меню ========
async function loadAllCategories() {
  const menuContainer = document.getElementById('dynamic-menu-list');
  if (!menuContainer) return;

  try {
    const categoriesResponse = await fetch(`${BASE_URL}/api/categories`);
    if (!categoriesResponse.ok) throw new Error('Ошибка при получении списка категорий');

    const categories = await categoriesResponse.json();
    menuContainer.innerHTML = '';

    categories.forEach(cat => {
      const catKey = cat.name.toLowerCase();
      const translationKey = `${catKey}_cat`;
      const displayTitle = currentLang === "en"
          ? (cat.name_en || cat.name)
          : (cat.name_ru || cat.name);


      const listItem = document.createElement('li');
      listItem.innerHTML = `
        <h3><span data-lang="${translationKey}">${displayTitle}</span></h3>
        <ul class="submenu" id="${catKey}"></ul>
      `;
      menuContainer.appendChild(listItem);

      // Загружаем товары
      loadCategory(`/api/products/${catKey}`, catKey);
    });

    assignMenuEventListeners();
    updateLanguage();

  } catch (error) {
    console.error('Ошибка в loadAllCategories:', error);
    menuContainer.innerHTML = `<p style="color:red">Не удалось загрузить меню (${error.message})</p>`;
  }
}

// ======== Слушатели кликов для открытия/закрытия категорий ========
function assignMenuEventListeners() {
  const headers = document.querySelectorAll('#dynamic-menu-list > li > h3');

  headers.forEach(header => {
    header.addEventListener('click', (e) => {
      e.stopPropagation();
      const li = header.parentElement;

      document.querySelectorAll('#dynamic-menu-list > li')
          .forEach(item => {
            if (item !== li) item.classList.remove('active');
          });

      li.classList.toggle('active');
    });
  });
}

// Закрыть все категории при клике вне меню
document.addEventListener('click', (e) => {
  const menuContainer = document.getElementById('dynamic-menu-list');
  if (menuContainer && !menuContainer.contains(e.target) && e.target.id !== 'langToggle') {
    document.querySelectorAll('#dynamic-menu-list > li').forEach(i => i.classList.remove('active'));
  }
});

// ======== Старт загрузки ========
document.addEventListener("DOMContentLoaded", async () => {
  await loadAllCategories();
});
