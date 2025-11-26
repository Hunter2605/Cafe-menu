// admin.js

// --- 1. АБСОЛЮТНАЯ ЗАЩИТА СТРАНИЦЫ (Срабатывает НЕМЕДЛЕННО) ---
const userRole = localStorage.getItem('userRole');

// Если роль не 'admin' или не существует, сразу перенаправляем.
if (userRole !== 'admin') {
    // В консоли будет видно, что считал скрипт
    console.error(`ДОСТУП ЗАПРЕЩЕН: Считанная роль - ${userRole}.`);
    window.location.href = 'login.html';
    // Ключевое слово 'return' здесь не нужно, так как window.location.href
    // и так остановит выполнение.
}
// Если пользователь АДМИН, выполнение скрипта продолжается дальше.
function handleLogout() {
    // 1. Удаляем ключ доступа
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');

    // 2. Перенаправляем на страницу входа
    window.location.href = 'login.html';
}

// --- 2. ОСНОВНАЯ ЛОГИКА (Запускается ТОЛЬКО после загрузки HTML) ---
document.addEventListener('DOMContentLoaded', () => {
    const BASE_URL = 'http://localhost:3000';

    const logoutButton = document.getElementById('logoutBtn');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault(); // Отменяем стандартный переход по ссылке '#'
            handleLogout();
        });
    } else {
        console.error("Кнопка 'Выйти' с ID 'logoutBtn' не найдена.");
    }

    // Подключение слушателя событий к форме добавления
    document.getElementById('addForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        try {
            const response = await fetch(`${BASE_URL}/add-product`, {
                method: 'POST',
                body: formData
            });
            if (response.ok) {
                alert('Товар успешно добавлен!');
                e.target.reset();
                loadAll();
            } else {
                alert('Ошибка при добавлении');
            }
        } catch (error) {
            console.error(error);
            alert('Ошибка сервера');
        }
    });

    // Определение вспомогательных функций
    async function loadAdminCategory(category, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return console.error(`Контейнер с ID ${containerId} не найден.`);

        container.innerHTML = 'Загрузка...';
        try {
            const response = await fetch(`${BASE_URL}/${category}`);
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
            console.error('Ошибка при загрузке категории:', error);
            container.innerHTML = 'Ошибка загрузки данных.';
        }
    }

    // Объявление глобальной функции deleteItem (доступна из HTML)
    window.deleteItem = async function(category, id) {
        if (!confirm('Вы уверены, что хотите удалить эту позицию?')) return;
        try {
            const response = await fetch(`${BASE_URL}/delete-product/${category}/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                alert('Удалено!');
                loadAll();
            } else {
                alert('Ошибка удаления');
            }
        } catch (error) {
            console.error(error);
        }
    }

    // Определение функции loadAll и её запуск
    function loadAll() {
        loadAdminCategory('tea', 'adm-tea');
        loadAdminCategory('coffee', 'adm-coffee');
        loadAdminCategory('desserts', 'adm-desserts');
    }

    // Запускаем загрузку данных только после DOMContentLoaded
    loadAll();
});