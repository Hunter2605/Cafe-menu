const BASE_URL = 'http://localhost:3000';
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
async function loadAdminCategory(category, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = 'Загрузка...';
    try {
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
async function deleteItem(category, id) {
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
function loadAll() {
    loadAdminCategory('tea', 'adm-tea');
    loadAdminCategory('coffee', 'adm-coffee');
    loadAdminCategory('desserts', 'adm-desserts');
}
loadAll();