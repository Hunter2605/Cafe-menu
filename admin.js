const BASE_URL = 'http://localhost:3000';

// 1. Обработка отправки формы (ДОБАВЛЕНИЕ)
document.getElementById('addForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Чтобы страница не перезагружалась

    const formData = new FormData(e.target); // Автоматически собирает все поля и файл

    try {
        const response = await fetch(`${BASE_URL}/add-product`, {
            method: 'POST',
            body: formData // Отправляем как FormData (не JSON!)
        });

        if (response.ok) {
            alert('Товар успешно добавлен!');
            e.target.reset(); // Очистить форму
            loadAll(); // Обновить списки внизу
        } else {
            alert('Ошибка при добавлении');
        }
    } catch (error) {
        console.error(error);
        alert('Ошибка сервера');
    }
});

// 2. Загрузка списков для удаления
async function loadAdminCategory(category, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = 'Загрузка...';

    try {
        // Обратите внимание: для API пути /tea, /coffee, /desserts
        // Но для удаления мы будем использовать имена категорий: tea, coffee, desserts
        const response = await fetch(`${BASE_URL}/${category === 'coffee' ? 'coffee' : category}`);
        const items = await response.json();

        container.innerHTML = '';
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
        console.error(error);
    }
}

// 3. Функция удаления
async function deleteItem(category, id) {
    if (!confirm('Вы уверены, что хотите удалить эту позицию?')) return;

    try {
        const response = await fetch(`${BASE_URL}/delete-product/${category}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Удалено!');
            loadAll(); // Обновить список
        } else {
            alert('Ошибка удаления');
        }
    } catch (error) {
        console.error(error);
    }
}

// Функция для обновления всех списков
function loadAll() {
    loadAdminCategory('tea', 'adm-tea');
    loadAdminCategory('coffee', 'adm-coffee');
    loadAdminCategory('desserts', 'adm-desserts');
}

// Запускаем при старте
loadAll();