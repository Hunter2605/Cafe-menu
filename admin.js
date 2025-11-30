// --- 1. АБСОЛЮТНАЯ ЗАЩИТА СТРАНИЦЫ ---
const userRole = localStorage.getItem('userRole');
if (userRole !== 'admin') {
    window.location.href = 'login.html';
}

function handleLogout() {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    window.location.href = 'login.html';
}

// --- 2. ОСНОВНАЯ ЛОГИКА ---
document.addEventListener('DOMContentLoaded', () => {
    const BASE_URL = 'http://localhost:3000';

    const logoutButton = document.getElementById('logoutBtn');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }

    // --- ОБНОВЛЕНИЕ ВЫПАДАЮЩЕГО СПИСКА ---
    async function updateCategoryDropdown() {
        const select = document.getElementById('productCategory');
        if (!select) return;

        try {
            const response = await fetch(`${BASE_URL}/categories`);
            const categories = await response.json();

            select.innerHTML = '';
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.name;
                option.textContent = cat.name.charAt(0).toUpperCase() + cat.name.slice(1); // Делаем первую букву заглавной
                select.appendChild(option);
            });
        } catch (error) {
            console.error("Не удалось загрузить список категорий:", error);
        }
    }

    // --- ДОБАВЛЕНИЕ КАТЕГОРИИ ---
    const catForm = document.getElementById('addCategoryForm');
    if (catForm) {
        catForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const categoryName = catForm.categoryName.value.trim();

            try {
                const response = await fetch(`${BASE_URL}/add-category`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ categoryName: categoryName })
                });

                const result = await response.json();

                if (response.ok) {
                    alert(result.message);
                    catForm.reset();
                    loadAllDynamically(); // Перезагружаем список товаров и категорий
                    updateCategoryDropdown(); // Обновляем селект
                } else {
                    alert(`Ошибка: ${result.message}`);
                }
            } catch (error) {
                console.error(error);
                alert('Ошибка сервера');
            }
        });
    }

    // --- ДОБАВЛЕНИЕ ТОВАРА ---
    const prodForm = document.getElementById('addForm');
    if (prodForm) {
        prodForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);

            try {
                const response = await fetch(`${BASE_URL}/add-product`, {
                    method: 'POST',
                    body: formData
                });
                if (response.ok) {
                    alert('Товар успешно добавлен!');
                    prodForm.reset();
                    loadAllDynamically();
                } else {
                    alert('Ошибка при добавлении');
                }
            } catch (error) {
                console.error(error);
                alert('Ошибка сервера');
            }
        });
    }

    // --- ЗАГРУЗКА ОДНОЙ КАТЕГОРИИ ---
    async function loadAdminCategory(category, container) {
        container.innerHTML = 'Загрузка...';
        try {
            // Обратите внимание: маршрут изменен на /api/products/
            const response = await fetch(`${BASE_URL}/api/products/${category}`);
            const items = await response.json();

            container.innerHTML = '';
            if (items.length === 0) {
                container.innerHTML = '<p style="color:gray">Нет товаров</p>';
                return;
            }

            items.forEach(item => {
                const div = document.createElement('div');
                div.classList.add('admin-card');
                div.innerHTML = `
                    <span><b>${item.name}</b> - ${item.cost} сом.</span>
                    <button class="delete-btn" onclick="deleteItem('${category}', ${item.id})">Удалить</button>
                `;
                container.appendChild(div);
            });
        } catch (error) {
            console.error('Ошибка при загрузке категории:', error);
            container.innerHTML = 'Ошибка загрузки данных.';
        }
    }

    // --- ДИНАМИЧЕСКАЯ ЗАГРУЗКА ВСЕГО ---
    async function loadAllDynamically() {
        try {
            const response = await fetch(`${BASE_URL}/categories`);
            const categories = await response.json();

            // Ищем главный контейнер, куда будем складывать списки
            // ВАЖНО: В admin.html добавьте <div id="dynamic-lists"></div>
            let mainContainer = document.getElementById('dynamic-lists');

            // Если главного контейнера нет, используем body (резервный вариант) или ищем существующие ID
            if (!mainContainer) {
                // Пытаемся работать по старой схеме (ищем div по ID),
                // но для новых категорий это не сработает, пока вы не добавите их в HTML вручную.
                // Поэтому лучше добавить <div id="dynamic-lists"></div> в HTML.
                console.warn("Добавьте <div id='dynamic-lists'></div> в admin.html для корректной работы!");
                return;
            }

            mainContainer.innerHTML = ''; // Очищаем всё перед перерисовкой

            for (const cat of categories) {
                // Создаем заголовок
                const title = document.createElement('h3');
                title.textContent = cat.name.charAt(0).toUpperCase() + cat.name.slice(1);
                mainContainer.appendChild(title);

                // Создаем контейнер для товаров
                const listDiv = document.createElement('div');
                listDiv.id = `adm-${cat.name}`;
                mainContainer.appendChild(listDiv);

                // Загружаем товары в этот контейнер
                await loadAdminCategory(cat.name, listDiv);
            }

        } catch (error) {
            console.error('Ошибка загрузки категорий:', error);
        }
    }

    // Глобальная функция удаления
    window.deleteItem = async function (category, id) {
        if (!confirm('Удалить позицию?')) return;
        try {
            const response = await fetch(`${BASE_URL}/delete-product/${category}/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                alert('Удалено!');
                loadAllDynamically();
            } else {
                alert('Ошибка удаления');
            }
        } catch (error) {
            console.error(error);
        }
    }

    // Запуск
    updateCategoryDropdown();
    loadAllDynamically();
});