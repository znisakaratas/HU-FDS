let avatarNames = [];
const customerNameMap = new Map(); // customerId → name eşleşmesi

function setActive(element) {
    const navItems = document.querySelectorAll('.sidebar-item');
    const restaurantSection = document.getElementById("restaurant-section");
    const derbySection = document.getElementById("derby-section");
    const orderSection = document.getElementById("order-section");
    const courierSection = document.getElementById("courier-section");
    const customerSection = document.getElementById("customer-section");
    const avatarSection = document.getElementById("avatar-section");

    // Hepsini gizle
    avatarSection.classList.add("hidden");
    restaurantSection.classList.add("hidden");
    derbySection.classList.add("hidden");
    orderSection.classList.add("hidden");
    courierSection.classList.add("hidden");
    customerSection.classList.add("hidden");

    // Tüm menüleri pasifleştir
    navItems.forEach(item => item.classList.remove("active"));
    element.classList.add("active");

    // Tıklanana göre göster
    if (element.textContent.includes("Manage Restaurant")) {
        loadAdminRestaurants();
        restaurantSection.classList.remove("hidden");
    } else if (element.textContent.includes("Manage Courier")) {
        loadAdminCouriers();
        courierSection.classList.remove("hidden");
    }  else if (element.textContent.includes("Manage Order")) {
        loadAdminCustomers();
        loadAllOrders();
        orderSection.classList.remove("hidden");
    } else if (element.textContent.includes("Manage Customer")) {
        loadAdminCustomers();
        customerSection.classList.remove("hidden");
    } else if (element.textContent.includes("Manage Derby")) {
        loadCustomersForDerby();
        loadAllDerbyTasks();
        derbySection.classList.remove("hidden"); // 💥 Bunu ekledik!


        const checkbox = document.getElementById("assignAllCheckbox");
        const customerWrapper = document.getElementById("customerSelectWrapper");
        if (checkbox && customerWrapper) {
            checkbox.addEventListener("change", function () {
                customerWrapper.style.display = this.checked ? "none" : "block";
            });
        }
    } else if (element.textContent.includes("Profile")) {
        avatarSection.classList.remove("hidden");
        loadAvatar();
    }
}
function deleteRestaurant(id) {
    const token = localStorage.getItem("jwtToken");

    if (!confirm("Are you sure you want to delete this restaurant?")) return;

    fetch(`http://localhost:8080/api/admin/delete/restaurant/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(result => {
            if (result.success) {
                alert("✅ " + result.detail);
                loadAdminRestaurants(); // ✅ listeyi yenile
            } else {
                alert("❌ " + result.detail);
            }
        })
        .catch(err => {
            console.error("Error deleting restaurant:", err);
            alert("❌ An error occurred.");
        });
}
const restStatusMap = new Map(); // customerId → name eşleşmesi
function loadAdminRestaurants() {
    const token = localStorage.getItem('jwtToken');

    fetch('http://localhost:8080/api/admin/restaurants', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(restaurants => {
            const grid = document.getElementById("restaurantGrid");
            grid.innerHTML = "";
            restStatusMap.clear();
            restaurants.forEach(rest => {
                const card = document.createElement("div");
                card.className = "card";
                restStatusMap.set(rest.id, rest.open);
                card.innerHTML = `
                <i class="fas fa-store fa-2x"></i>
                <div class="card-title">${rest.name}</div>
                <div style="font-size: 0.9rem; color: #555;">Owner: ${rest.owner}</div>
                <div style="color: #8EE02C; font-weight: bold;">Rating: ${rest.overAllRating}</div>
                <div style="font-size: 0.9rem; color: #333;">Status: ${rest.open ? "🟢 Open" : "🔴 Closed"}</div>
                <button onclick="deleteRestaurant(${rest.id})"
                    style="margin-top: 10px; padding: 6px 12px; background-color: #e74c3c; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    🗑 Delete
                </button>
            `;

                grid.appendChild(card);

            });
        })
        .catch(err => console.error("Failed to load restaurants:", err));
}
/*function loadCustomers() {
    const token = localStorage.getItem('jwtToken');

    fetch('http://localhost:8080/api/admin/customers', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(customers => {
            customerNameMap.clear();
            customers.forEach(customer => {
                customerNameMap.set(customer.customerId, customer.name);
            });
        })
        .catch(err => console.error("❌ Failed to load customers:", err));
}*/

function loadAdminCustomers() {
    const token = localStorage.getItem('jwtToken');

    fetch('http://localhost:8080/api/admin/customers', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(customers => {
            const grid = document.getElementById("customerGrid");
            grid.innerHTML = "";
            customerNameMap.clear();
            customers.forEach(customer => {
                const addressCount = customer.addresses.length;
                const cardCount = customer.creditCards.length;
                const card = document.createElement("div");
                customerNameMap.set(customer.customerId, customer.name);
                card.className = "card";
                card.innerHTML = `
                <i class="fas fa-user fa-2x"></i>
                <div class="card-title">${customer.name}</div>
                <div style="font-size: 0.9rem; color: #666;">📧 ${customer.mail}</div>
                <div style="font-size: 0.9rem; color: #666;">📞 ${customer.phoneNumber || "-"}</div>
                <div style="font-size: 0.9rem; color: #666;">🎂 Age: ${customer.age}</div>
                <div style="font-size: 0.9rem; color: #666;">🏠 Addresses: ${addressCount}</div>
                <div style="font-size: 0.9rem; color: #666;">💳 Cards: ${cardCount}</div>
                <button onclick="deleteCustomer(${customer.customerId})"
                    style="margin-top: 10px; padding: 6px 12px; background-color: #e74c3c; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    🗑 Delete
                </button>
            `;

                grid.appendChild(card);
            });
        })
        .catch(err => console.error("❌ Failed to load customers:", err));
}
function deleteCustomer(id) {
    const token = localStorage.getItem("jwtToken");

    if (!confirm("Are you sure you want to delete this customer?")) return;

    fetch(`http://localhost:8080/api/admin/delete/customer/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(result => {
            if (result.success) {
                alert("✅ " + result.detail);
                loadAdminCustomers(); // Listeyi güncelle
            } else {
                alert("❌ " + result.detail);
            }
        })
        .catch(err => {
            console.error("Error deleting customer:", err);
            alert("❌ An error occurred.");
        });
}

function loadAdminCouriers() {
    fetch('http://localhost:8080/api/admin/couriers')
        .then(res => res.json())
        .then(couriers => {
            const grid = document.getElementById("courierGrid");
            grid.innerHTML = "";

            couriers.forEach(courier => {
                const card = document.createElement("div");
                card.className = "card";
                card.innerHTML = `
              <i class="fas fa-motorcycle fa-2x"></i>
              <div class="card-title">${courier.name}</div>
              <div style="font-size: 0.9rem; color: #666;">${courier.mail}</div>
              <button onclick="deleteCourier(${courier.courierId})"
                style="margin-top: 10px; padding: 6px 12px; background-color: #e74c3c; color: white; border: none; border-radius: 6px; cursor: pointer;">
                🗑 Delete
              </button>
            `;

                grid.appendChild(card);
            });
        })
        .catch(err => console.error("Failed to load couriers:", err));
}

function deleteCourier(id) {
    const token = localStorage.getItem("jwtToken");

    if (!confirm("Are you sure you want to delete this courier?")) return;

    fetch(`http://localhost:8080/api/admin/delete/courier/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(result => {
            if (result.success) {
                alert("✅ " + result.detail);
                loadAdminCouriers(); // Listeyi güncelle
            } else {
                alert("❌ " + result.detail);
            }
        })
        .catch(err => {
            console.error("Error deleting courier:", err);
            alert("❌ An error occurred.");
        });
}
function assignDerbyTask() {
    const token = localStorage.getItem("jwtToken");
    const quantity = parseInt(document.getElementById("taskQuantityInput").value);
    const reward = parseInt(document.getElementById("taskRewardInput").value);
    const deadline = document.getElementById("taskDeadlineInput").value;
    const taskType = document.querySelector('input[name="taskTarget"]:checked').value;
    const targetId = document.getElementById("targetItemSelect").value;
    const assignAll = document.getElementById("assignAllCheckbox").checked;

    if (!quantity || !reward || !deadline || !targetId) {
        alert("❗ Please fill in all fields.");
        return;
    }

    const payload = {
        productId: taskType === "product" ? parseInt(targetId) : null,
        menuId: taskType === "menu" ? parseInt(targetId) : null,
        requiredQuantity: quantity,
        rewardPoints: reward,
        deadline: deadline
    };

    if (assignAll) {
        fetch("http://localhost:8080/api/admin/customers", {
            headers: { "Authorization": `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(customers => {
                customers.forEach(c => {
                    assignTaskToCustomer(c.customerId, payload);
                });
            })
            .catch(err => console.error("❌ Failed to fetch customers for assignment:", err));
    } else {
        const customerId = document.getElementById("customerSelect").value;
        if (!customerId) {
            alert("❗ Please select a customer.");
            return;
        }
        assignTaskToCustomer(customerId, payload);
    }
}

function assignTaskToCustomer(customerId, payload) {
    const token = localStorage.getItem("jwtToken");

    fetch(`http://localhost:8080/api/admin/customers/${customerId}/tasks/assign-customer-task`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
        .then(res => res.json())
        .then(result => {
            if (result.success) {
                console.log(`✅ Task assigned to customer ${customerId}:`, result.detail);
            } else {
                console.warn(`❌ Failed to assign task to ${customerId}:`, result.detail);
            }
        })
        .catch(err => {
            console.error(`❌ Error assigning task to customer ${customerId}:`, err);
        });
}

function loadCustomersForDerby() {
    const token = localStorage.getItem("jwtToken");

    fetch("http://localhost:8080/api/admin/customers", {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(customers => {
            const customerSelect = document.getElementById("customerSelect");
            customerSelect.innerHTML = '<option disabled selected value="">Select a customer</option>';

            customers.forEach(c => {
                const option = document.createElement("option");
                option.value = c.customerId;
                option.textContent = `${c.name} (${c.mail})`;
                customerSelect.appendChild(option);
            });
        })
        .catch(err => console.error("❌ Failed to load customers for select box:", err));
}

function loadAllOrders() {
    const token = localStorage.getItem("jwtToken");
    const grid = document.getElementById("orderGrid");

    fetch("http://localhost:8080/api/admin/orders/list", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
    })
        .then(res => res.json())
        .then(orders => {
            grid.innerHTML = "";

            if (!orders.length) {
                grid.innerHTML = "<p>No orders found.</p>";
                return;
            }

            orders.forEach(order => {
                const card = document.createElement("div");
                card.className = "card";

                // Ürünleri sayarak adedi göster
                const itemCounts = {};
                order.itemNames?.forEach(name => {
                    itemCounts[name] = (itemCounts[name] || 0) + 1;
                });
                const itemsHtml = Object.entries(itemCounts)
                    .map(([name, count]) => `${name} × ${count}`)
                    .join(", ");

                const customerName = customerNameMap?.get?.(Number(order.customerId)) || `Customer #${order.customerId}`;
                const restaurantName = order.restaurantName || "-";
                const courier = order.courierName || "Not assigned";

                const totalDisplay = order.finalPrice ?? order.totalPrice ?? "N/A";

                card.innerHTML = `
                    <div class="card-title">Order #${order.orderId}</div>
                    <div><strong>Status:</strong> ${order.status}</div>
                    <div><strong>Created:</strong> ${order.createdAt.replace("T", " ").split(".")[0]}</div>
                    <div><strong>Total:</strong> ₺${totalDisplay}</div>
                    <div><strong>Items:</strong> ${itemsHtml}</div>
                    <div><strong>Customer:</strong> ${customerName}</div>
                    <div><strong>Courier:</strong> ${courier}</div>
                    <div><strong>Restaurant:</strong> ${restaurantName}</div>
                `;

                grid.appendChild(card);
            });
        })
        .catch(err => {
            console.error("❌ Failed to load orders:", err);
            grid.innerHTML = "<p>Error loading orders.</p>";
        });
}

function logout() {
    const confirmed = confirm("Are you sure you want to log out?");
    if (confirmed) {
        localStorage.clear();
        window.location.href = "signin.html";
    }
}
document.addEventListener("DOMContentLoaded", () => {
    loadProductsAndMenus();
    loadAvatar();
    // Radio değiştiğinde listeyi yeniden yükle
    const radios = document.getElementsByName("taskTarget");
    radios.forEach(radio => {
        radio.addEventListener("change", () => {
            populateTargetSelect();
        });
    });
});

let allProducts = [];
let allMenus = [];

function loadProductsAndMenus() {
    // Ürünleri al
    fetch("http://localhost:8080/api/customer/homepage/products")
        .then(res => res.json())
        .then(data => {
            allProducts = data;
            populateTargetSelect(); // İlk yükleme için çağır
        });

    // Menüyü al
    fetch("http://localhost:8080/api/customer/homepage/menus")
        .then(res => res.json())
        .then(data => {
            allMenus = data;
            populateTargetSelect(); // İlk yükleme için çağır
        });
}

function populateTargetSelect() {
    const select = document.getElementById("targetItemSelect");
    const selectedType = document.querySelector('input[name="taskTarget"]:checked').value;

    // Temizle
    select.innerHTML = '<option disabled selected value="">Select a product or menu</option>';

    if (selectedType === "product") {
        allProducts.forEach(p => {
            const option = document.createElement("option");
            option.value = p.productId;
            option.textContent = `${p.name} (${p.category}) - ${p.restaurant.name}`;
            select.appendChild(option);
        });
    } else if (selectedType === "menu") {
        allMenus.forEach(m => {
            const option = document.createElement("option");
            option.value = m.menuId;
            option.textContent = `${m.name} (${m.category}) - ${m.restaurant.name}`;
            select.appendChild(option);
        });
    }
}
async function loadAllDerbyTasks() {
    const token = localStorage.getItem("jwtToken");
    console.log("loadAllDerbyTasks çalıştı");

    const customers = await fetch("http://localhost:8080/api/admin/customers", {
        headers: { "Authorization": `Bearer ${token}` }
    }).then(res => res.json());

    const customerCount = customers.length;
    const taskMap = new Map(); // key -> task with assignedCustomers

    for (const customer of customers) {
        const customerId = customer.customerId;
        console.log("Müşteri:", customerId);

        const response = await fetch(`http://localhost:8080/api/admin/customers/${customerId}/tasks`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            console.error(`HATA: ${response.status} ${response.statusText}`);
            continue;
        }

        const tasks = await response.json();
        console.log(`→ ${customerId} için ${tasks.length} görev alındı.`);

        for (const task of tasks) {
            const key = `${task.taskType}-${task.targetName}-${task.requiredQuantity}-${task.rewardPoints}-${task.deadline}`;

            if (!taskMap.has(key)) {
                taskMap.set(key, {
                    ...task,
                    assignedCustomers: [customerId]
                });
            } else {
                const existing = taskMap.get(key);
                if (!existing.assignedCustomers.includes(customerId)) {
                    existing.assignedCustomers.push(customerId);
                }
            }
        }
    }

    console.log("Eşsiz görev sayısı:", taskMap.size);
    renderDerbyTasks([...taskMap.values()], customerCount);
}
function renderDerbyTasks(tasks, totalCustomers) {
    const container = document.getElementById("derbyGrid");
    container.innerHTML = "";

    tasks.forEach(task => {
        const assignedCount = task.assignedCustomers.length;
        const isAll = assignedCount === totalCustomers;

        const card = document.createElement("div");
        card.className = "card";
        card.style.border = "2px solid #77AB5C";

        card.innerHTML = `
            <h4 class="card-title">${task.taskType} - ${task.targetName}</h4>
            <p><strong>Required:</strong> ${task.requiredQuantity}</p>
            <p><strong>Reward:</strong> ${task.rewardPoints} pts</p>
            <p><strong>Deadline:</strong><br>${task.deadline.replace("T", " ")}</p>
            <p style="font-weight: bold; color: #2d2d2d;">
                ${isAll ? `<span style="color: #2ecc71;">✅ All Customers</span>` : `${assignedCount} Customer(s)`}
            </p>
        `;

        container.appendChild(card);
    });
}
function createAvatar() {
    const name = document.getElementById("avatarNameInput").value.trim();
    const token = localStorage.getItem("jwtToken");

    if (!name) {
        alert("⚠️ Please enter a name for the avatar.");
        return;
    }

    fetch("http://localhost:8080/api/admin/avatar/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success === "true") {
                alert("✅ Avatar created successfully");
                avatarNames.push(name);
                loadAvatar();
            } else {
                alert("❌ " + data.detail);
            }
        });
}


function renderAvatars() {
    const container = document.getElementById("avatarListGrid");
    container.innerHTML = "";

    const manualAvatars = [
        { avatarId: 2, name: "Avatar 2" },
        { avatarId: 3, name: "Avatar 3" },
        { avatarId: 5, name: "Avatar 5" },
        { avatarId: 6, name: "Avatar 6" },
        { avatarId: 7, name: "Avatar 7" },
        { avatarId: 11, name: "Avatar 11" }
    ];

    manualAvatars.forEach(avatar => {
        const card = document.createElement("div");
        card.className = "card";

        const img = document.createElement("img");
        img.src = `avatars/avatar${avatar.avatarId}.jpg`;
        img.onerror = () => {
            img.src = "avatars/default.jpg";
        };
        img.alt = avatar.name;

        const nameDiv = document.createElement("div");
        nameDiv.className = "card-title";
        nameDiv.innerText = avatar.name;

        card.appendChild(img);
        card.appendChild(nameDiv);
        container.appendChild(card);
    });
}
function loadAvatar() {
    const token = localStorage.getItem("jwtToken");

    fetch("http://localhost:8080/api/admin/avatar/list", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
        .then(res => {
            if (!res.ok) {
                throw new Error("Avatar fetch failed with status " + res.status);
            }
            return res.json();
        })
        .then(avatars => {
            renderAvatars(avatars);
        })
        .catch(err => {
            console.error("Error loading avatars:", err.message);
        });

}



