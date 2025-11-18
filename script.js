
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
