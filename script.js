  const items = document.querySelectorAll('.menu-list > li');
  items.forEach(item => {
  item.addEventListener('click', (e) => {
    e.stopPropagation();
    items.forEach(i => {
      if (i !== item) i.classList.remove('active');
    });
    item.classList.toggle('active');
  });
});
  document.addEventListener('click', () => {
  items.forEach(i => i.classList.remove('active'));
});
  const BASE_URL = 'http://localhost:3000';
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
        const listItem = document.createElement('li');
        const productContent = document.createElement('div');
        productContent.classList.add('product-item-content');
        productContent.innerHTML = `
                <img src="${item.image_path}" 
                     alt="${item.name}" 
                     class="product-image">
               
                <h4 class="product-name">${item.name}</h4> <div class="product-cost">${item.cost} soms.</div> `;
        listItem.appendChild(productContent);
        container.appendChild(listItem);
      });
    } catch (error) {
      console.error(error);
      container.innerHTML = `<p style="color:red">Ошибка загрузки данных.</p>`;
    }
  }
  loadCategory('/tea', 'tea');
  loadCategory('/coffee', 'coffee');
  loadCategory('/desserts', 'desserts');