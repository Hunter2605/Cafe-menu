// ======== ПЕРЕКЛЮЧЕНИЕ ЯЗЫКА ======= //
if (!localStorage.getItem('userName')) {
  window.location.href = 'login.html';
}
const translations = {
  ru: {
    menu_title: "Меню",
    coffee_cat: "Кофе",
    tea_cat: "Чай",
    desserts_cat: "Десерты"
  },
  en: {
    menu_title: "Coffee Menu",
    coffee_cat: "Coffee",
    tea_cat: "Tea",
    desserts_cat: "Desserts"
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

const items = document.querySelectorAll('.menu-list > li');

  items.forEach(item => {
  item.addEventListener('click', (e) => {
    e.stopPropagation();
    // Закрыть другие категории
    items.forEach(i => {
      if (i !== item) i.classList.remove('active');
    });
    // Переключить выбранную
    item.classList.toggle('active');
  });
});

  // Закрыть все, если клик вне меню
  document.addEventListener('click', () => {
  items.forEach(i => i.classList.remove('active'));
});
  // Базовый URL сервера
  const BASE_URL = 'http://localhost:3000';

  // Универсальная функция загрузки
  // ... (остальной код script.js) ...

  // Универсальная функция загрузки
  async function loadCategory(endpoint, containerId) {
    const container = document.getElementById(containerId);

    try {
      const response = await fetch(BASE_URL + endpoint);

      if (!response.ok) throw new Error('Ошибка сети');

      const items = await response.json();

      container.innerHTML = '';

      console.log('Данные с сервера:', items);

      if (items.length === 0) {
        container.innerHTML = '<p>В этой категории пока пусто.</p>';
        return;
      }

      items.forEach(item => {
        // Создаем элемент списка для каждого продукта
        const listItem = document.createElement('li'); // <--- ВАЖНО: создаем <li>

        // Создаем внутренний контейнер для содержимого продукта
        const productContent = document.createElement('div');
        productContent.classList.add('product-item-content'); // Добавим класс для стилизации

        // --- ОБНОВЛЕННЫЙ HTML-КОД ВНУТРИ productContent ---
        productContent.innerHTML = `
                <img src="${item.image_path}" 
                     alt="${item.name}" 
                     class="product-image">
                
                <h4 class="product-name">${item.name}</h4> <div class="product-cost">${item.cost} soms.</div> `;
        // ----------------------------------------

        listItem.appendChild(productContent); // Вставляем контент в <li>
        container.appendChild(listItem);      // Вставляем <li> в <ul> (.submenu)
      });

    } catch (error) {
      console.error(error);
      container.innerHTML = `<p style="color:red">Error</p>`;
    }
  }

  // Запускаем загрузку для всех категорий
  loadCategory('/tea', 'tea');
  loadCategory('/coffee', 'coffee');
  loadCategory('/desserts', 'desserts');