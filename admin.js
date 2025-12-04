if (localStorage.getItem('userRole') !== 'admin') {
    window.location.href = 'login.html';
}

function handleLogout() {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    window.location.href = 'login.html';
}

document.addEventListener("DOMContentLoaded", () => {

    const BASE_URL = "http://localhost:3000";

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.onclick = handleLogout;

    async function loadCategories() {
        try {
            const res = await fetch(`${BASE_URL}/categories`);
            const cats = await res.json();

            // обновляем select
            const select = document.getElementById("productCategory");
            select.innerHTML = "";
            cats.forEach(cat => {
                const op = document.createElement("option");
                op.value = cat.name;
                op.textContent = `${cat.name}`;
                select.appendChild(op);
            });

            // обновляем список категорий для удаления
            renderCategoryList(cats);

        } catch (err) {
            console.error("Ошибка загрузки категорий:", err);
        }
    }

    function renderCategoryList(cats) {
        const list = document.getElementById("category-list");
        list.innerHTML = "";

        cats.forEach(cat => {
            const div = document.createElement("div");
            div.className = "admin-card";

            div.innerHTML = `
            <span>${cat.name_ru || cat.name} (${cat.name_en || ""})</span>
            <button class="cat-delete" onclick="deleteCategory('${cat.name}')">Удалить</button>
        `;

            list.appendChild(div);
        });
    }

    document.getElementById("addCategoryForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const fd = new FormData(e.target);

        const name = fd.get("name").trim();
        const name_ru = fd.get("name_ru").trim();
        const name_en = fd.get("name_en").trim();

        if (!name || !name_ru || !name_en) {
            alert("Заполните все поля!");
            return;
        }

        const body = { name, name_ru, name_en };

        try {
            const res = await fetch(`${BASE_URL}/add-category`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            alert(data.message);

            if (res.ok) {
                e.target.reset();
                loadCategories();
                loadAllProducts();
            }
        } catch (err) {
            console.error("Ошибка добавления категории:", err);
            alert("Ошибка сервера");
        }
    });

    document.getElementById("addForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);

        try {
            const res = await fetch(`${BASE_URL}/add-product`, {
                method: "POST",
                body: fd
            });

            const data = await res.json();

            alert(data.message);

            if (res.ok) {
                e.target.reset();
                loadAllProducts();
            }

        } catch (err) {
            console.error("Ошибка добавления товара:", err);
            alert("Ошибка сервера");
        }
    });

    async function loadProductsOfCategory(catName, container) {
        container.innerHTML = "Загрузка...";

        try {
            const res = await fetch(`${BASE_URL}/api/products/${catName}`);
            const items = await res.json();

            container.innerHTML = "";

            if (!items.length) {
                container.innerHTML = "<p style='color:gray'>Нет товаров</p>";
                return;
            }

            items.forEach(item => {
                const div = document.createElement("div");
                div.className = "admin-card";

                div.innerHTML = `
                <div>
                    <b>${item.name_ru || ''}</b> / ${item.name_en || ''}  
                    — ${item.cost} сом
                    <div style="font-size:12px;color:#777;">
                        ${item.comp_ru ? "RU: " + item.comp_ru : ""}
                        ${item.comp_en ? "<br>EN: " + item.comp_en : ""}
                    </div>
                </div>

                <button class="delete-btn"
                    onclick="deleteItem('${catName}', ${item.id})">Удалить</button>
            `;

                container.appendChild(div);
            });

        } catch (err) {
            console.error("Ошибка загрузки товаров:", err);
            container.innerHTML = "Ошибка загрузки!";
        }
    }

    async function loadAllProducts() {
        try {
            const res = await fetch(`${BASE_URL}/categories`);
            const cats = await res.json();

            const main = document.getElementById("dynamic-lists");
            main.innerHTML = "";

            for (const cat of cats) {
                const h = document.createElement("h3");
                h.textContent = cat.name_ru || cat.name;
                main.appendChild(h);

                const block = document.createElement("div");
                main.appendChild(block);

                await loadProductsOfCategory(cat.name, block);
            }

        } catch (err) {
            console.error("Ошибка полной загрузки:", err);
        }
    }



    window.deleteItem = async function (category, id) {
        if (!confirm("Удалить товар?")) return;

        try {
            await fetch(`${BASE_URL}/delete-product/${category}/${id}`, {
                method: "DELETE"
            });

            loadAllProducts();

        } catch (err) {
            console.error("Ошибка удаления товара:", err);
        }
    }

    window.deleteCategory = async function (name) {
        if (!confirm("Удалить категорию и все её товары?")) return;

        try {
            await fetch(`${BASE_URL}/delete-category/${name}`, { method: "DELETE" });
            loadCategories();
            loadAllProducts();

        } catch (err) {
            console.error("Ошибка удаления категории:", err);
        }
    }
    loadCategories();
    loadAllProducts();

});
