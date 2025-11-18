
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
  async function loadCategory(endpoint, containerId) {
    const container = document.getElementById(containerId);

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
        const card = document.createElement('div');
        card.classList.add('card');

        // --- ОБНОВЛЕННЫЙ HTML-КОД КАРТОЧКИ ---
        card.innerHTML = `
                <img src="${item.image_path}" 
                     alt="${item.name}" 
                     class="product-image">
                
                <h3>${item.name}</h3>
                
                <div class="cost">${item.cost} soms.</div>
            `;
        // ----------------------------------------

        container.appendChild(card);
      });

    } catch (error) {
      console.error(error);
      container.innerHTML = `<p style="color:red">Ошибка загрузки данных.</p>`;
    }
  }

  // Запускаем загрузку для всех категорий
  loadCategory('/tea', 'tea');
  loadCategory('/coffee', 'coffee');
  loadCategory('/desserts', 'desserts');