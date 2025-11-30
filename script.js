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

function updateLanguage() {
  document.querySelectorAll("[data-lang]").forEach(el => {
    const key = el.getAttribute("data-lang");
    if (translations[currentLang][key]) {
      el.textContent = translations[currentLang][key];
    }
  });

  const toggleBtn = document.getElementById("langToggle");
  if (toggleBtn) toggleBtn.textContent = currentLang.toUpperCase();
  localStorage.setItem("lang", currentLang);
}

document.getElementById("langToggle")?.addEventListener("click", () => {
  currentLang = currentLang === "ru" ? "en" : "ru";
  updateLanguage();
});

// ======== Загрузка категорий и товаров ========
const BASE_URL = 'http://localhost:3000';

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
      const listItem = document.createElement('li');
      listItem.innerHTML = `
        <div class="product-item-content">
            <img src="${item.image_path}" alt="${item.name}" class="product-image">
            <div class="product-details"> 
                <h4 class="product-name">${item.name}</h4>
                <div class="product-cost">${item.cost} сом.</div>
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
      const displayTitle = translations[currentLang][translationKey] || cat.name;

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
