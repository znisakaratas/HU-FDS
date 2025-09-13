let allProducts = [];
let allMenus = [];
let currentAddresses = []; // 💾 GET ile gelen adresleri burada tutuyoruz
let editingAddressIndex = null; // null ise add, sayı ise edit modu

let selectedCouponCode = null;
let lastTotalAmount = 0;
let availableCoupons = [];

let allRestaurants = [];
let currentShowAll = false;


function loadHomeProducts() {
    const productsContainer = document.getElementById('productsContainer');
    if (!productsContainer) {
        console.error('❌ productsContainer div not found.');
        return;
    }
    productsContainer.innerHTML = '';

    fetch('http://localhost:8080/api/customer/homepage/products')
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load homepage products.");
            }
            return response.json();
        })
        .then(products => {
            allProducts = products;
            renderProducts(products);
        })
        .catch(error => {
            console.error('Error fetching homepage products:', error);
            productsContainer.innerHTML = `<p>Error loading products. Please try again later.</p>`;
        });
}
function loadHomeMenus() {
    const menusContainer = document.getElementById('menusContainer');
    if (!menusContainer) {
        console.error('❌ menusContainer div not found.');
        return;
    }
    menusContainer.innerHTML = '';

    fetch('http://localhost:8080/api/customer/homepage/menus')
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load homepage menus.");
            }
            return response.json();
        })
        .then(menus => {
            allMenus = menus;
            renderMenus(menus);
        })
        .catch(error => {
            console.error('Error fetching homepage menus:', error);
            menusContainer.innerHTML = `<p>Error loading menus. Please try again later.</p>`;
        });
}

function renderProducts(products) {
    const productsContainer = document.getElementById('productsContainer');
    productsContainer.innerHTML = '';

    if (!products.length) {
        productsContainer.innerHTML = `<p>No products found.</p>`;
        return;
    }

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';

        // Görsel belirleme
        let imageUrl;
        const cat = product.category.toLowerCase();
        if (cat === 'beverage') imageUrl = './images/beverage.png';
        else if (['snack', 'atıştırmalık'].includes(cat)) imageUrl = './images/snack.png';
        else if (['kebab', 'kebap'].includes(cat)) imageUrl = './images/kebab.png';
        else if (cat === 'coffee') imageUrl = './images/coffee.png';
        else if (cat === 'italian') imageUrl = './images/italian.png';
        else if (cat === 'breakfast') imageUrl = './images/breakfast.png';
        else if (cat === 'burger') imageUrl = './images/burger.jpg';
        else if (cat === 'steak') imageUrl = './images/steak.jpg';
        else if (cat === 'meat') imageUrl = './images/steak.jpg';
        else imageUrl = './images/default.jpg';

        // Açık mı? Stokta mı?
        const isOpen = product.restaurant.open;
        const inStock = product.inStock;

        let stockInfo;
        if (!isOpen) {
            stockInfo = `<span style="color: gray; font-weight: bold;">🔒 Restaurant Closed</span>`;
            productCard.style.opacity = '0.5';
        } else if (!inStock) {
            stockInfo = `<span style="color: red; font-weight: bold;">❌ Unavailable</span>`;
            productCard.style.opacity = '0.6';
        } else {
            stockInfo = `<button class="btn" onclick="addToCart('product', ${product.productId})">➕ Add to Cart</button>`;
        }

        productCard.innerHTML = `
            <img src="${imageUrl}" alt="${product.name}">
            <h4>${product.name}</h4>
            <p>Category: ${product.category}</p>
            <p>Calories: ${product.calories} kcal</p>
            <p><em>Restaurant: ${product.restaurant.name}</em></p>
            <p><strong>₺${product.price.toFixed(2)}</strong></p>
            ${stockInfo}
        `;

        productsContainer.appendChild(productCard);
    });
}

function renderMenus(menus) {
    const menusContainer = document.getElementById('menusContainer');
    menusContainer.innerHTML = '';

    if (!menus.length) {
        menusContainer.innerHTML = `<p>No menus found.</p>`;
        return;
    }

    menus.forEach(menu => {
        const menuCard = document.createElement('div');
        menuCard.className = 'product-card';

        // Görsel seçimi
        const cat = menu.category.toLowerCase();
        let imageUrl;
        if (cat === 'snacks') imageUrl = './images/snack.png';
        else if (cat === 'breakfast') imageUrl = './images/breakfast.png';
        else if (cat === 'burger') imageUrl = './images/burgermenu.jpg';
        else if (cat === 'steak') imageUrl = './images/steak.jpg';
        else if (cat === 'meat') imageUrl = './images/steak.jpg';
        else imageUrl = './images/default.jpg';

        const productNames = menu.products.map(p => p.name).join(', ');

        const isOpen = menu.restaurant.open;
        const inStock = menu.inStock;

        let stockInfo;
        if (!isOpen) {
            stockInfo = `<span style="color: gray; font-weight: bold;">🔒 Restaurant Closed</span>`;
            menuCard.style.opacity = '0.5';
        } else if (!inStock) {
            stockInfo = `<span style="color: red; font-weight: bold;">❌ Unavailable</span>`;
            menuCard.style.opacity = '0.6';
        } else {
            stockInfo = `<button class="btn" onclick="addToCart('menu', ${menu.menuId})">➕ Add to Cart</button>`;
        }

        menuCard.innerHTML = `
            <img src="${imageUrl}" alt="${menu.name}">
            <h4>${menu.name}</h4>
            <p>Category: ${menu.category}</p>
            <p>Includes: ${productNames}</p>
            <p>Calories: ${menu.calories} kcal</p>
            <p><em>Restaurant: ${menu.restaurant.name}</em></p>
            <p><strong>₺${menu.price.toFixed(2)}</strong></p>
            ${stockInfo}
        `;

        menusContainer.appendChild(menuCard);
    });
}


function filterProducts() {
    const text = document.getElementById('productSearchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value.toLowerCase();
    const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Number.MAX_VALUE;
    const minCal = parseFloat(document.getElementById('minCalories').value) || 0;
    const maxCal = parseFloat(document.getElementById('maxCalories').value) || Number.MAX_VALUE;

    const filtered = allProducts.filter(p => {
        if (!p.inStock|| !p.restaurant.open) return false; // Unavailable olanları gösterme

        const matchText = (
            p.name.toLowerCase().includes(text) ||
            p.category.toLowerCase().includes(text) ||
            p.restaurant.name.toLowerCase().includes(text)
        );

        const matchPrice = p.price >= minPrice && p.price <= maxPrice;
        const matchCal = p.calories >= minCal && p.calories <= maxCal;

        return matchText && matchPrice && matchCal;
    });

    renderProducts(filtered);
}


function filterMenus() {
    const text = document.getElementById('menuSearchInput').value.toLowerCase();
    const minPrice = parseFloat(document.getElementById('menuMinPrice').value) || 0;
    const maxPrice = parseFloat(document.getElementById('menuMaxPrice').value) || Number.MAX_VALUE;
    const minCal = parseFloat(document.getElementById('menuMinCalories').value) || 0;
    const maxCal = parseFloat(document.getElementById('menuMaxCalories').value) || Number.MAX_VALUE;

    const filtered = allMenus.filter(menu => {
        if (!menu.inStock || !menu.restaurant.open) return false; // Unavailable olan menüleri gösterme

        const matchText =
            menu.name.toLowerCase().includes(text) ||
            menu.category.toLowerCase().includes(text) ||
            menu.restaurant.name.toLowerCase().includes(text) ||
            menu.products.some(p => p.name.toLowerCase().includes(text));

        const matchPrice = menu.price >= minPrice && menu.price <= maxPrice;
        const matchCal = menu.calories >= minCal && menu.calories <= maxCal;

        return matchText && matchPrice && matchCal;
    });

    renderMenus(filtered);
}
function assignTask(taskId) {
    const customerId = localStorage.getItem("customerId");
    const token = localStorage.getItem("jwtToken");

    fetch(`http://localhost:8080/api/customer/${customerId}/task/select`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ customerTaskId: taskId })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("✅ Task assigned successfully!");
                loadCustomerTasks();         // available görevleri yenile
                loadAssignedDerbyTasks();    // assigned görevleri göster
            } else {
                alert(`❌ ${data.detail}`);
            }
        })
        .catch(err => {
            console.error("❌ Error assigning task:", err);
            alert("Network error while assigning task.");
        });
}
function unassignTask(taskId) {
    const customerId = localStorage.getItem("customerId");
    const token = localStorage.getItem("jwtToken");

    fetch(`http://localhost:8080/api/customer/${customerId}/task/unassign`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ customerTaskId: taskId })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("✅ Task unassigned successfully!");
                loadCustomerTasks();         // Available görevleri yenile
                loadAssignedDerbyTasks();    // Assigned görevleri yenile
            } else {
                alert(`❌ ${data.detail}`);
            }
        })
        .catch(err => {
            console.error("❌ Error unassigning task:", err);
            alert("Network error while unassigning task.");
        });
}

function loadCustomerTasks() {
    const token = localStorage.getItem("jwtToken");

    fetch("http://localhost:8080/api/customer/tasks", {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => response.json())
        .then(tasks => {
            const container = document.getElementById('availableTasksContainer');
            container.innerHTML = '';

            if (!tasks.length) {
                container.innerHTML = '<p>No derby tasks assigned.</p>';
                return;
            }

            tasks.forEach(task => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.style.position = 'relative';

                // ➕ butonunu oluştur
                const addButton = document.createElement('button');
                addButton.innerHTML = '➕';
                addButton.style.position = 'absolute';
                addButton.style.top = '10px';
                addButton.style.right = '10px';
                addButton.style.backgroundColor = '#77AB5C';
                addButton.style.color = 'white';
                addButton.style.border = 'none';
                addButton.style.borderRadius = '50%';
                addButton.style.width = '30px';
                addButton.style.height = '30px';
                addButton.style.cursor = 'pointer';
                addButton.title = 'Assign this task';

                // İstersen fonksiyon bağlayabilirsin:
                addButton.addEventListener('click', () => {
                    assignTask(task.taskId);
                });

                card.innerHTML = `
          <h4>${task.taskType} - ${task.targetName}</h4>
          <p><strong>Required:</strong> ${task.requiredQuantity}</p>
          <p><strong>Progress:</strong> ${task.progress}</p>
          <p><strong>Reward:</strong> ${task.rewardPoints} pts</p>
          <p><strong>Deadline:</strong> ${task.deadline.replace('T', ' ')}</p>
          <p><strong>Status:</strong> ${task.completed ? "✅ Completed" : "⏳ In Progress"}</p>
        `;

                card.appendChild(addButton); // Butonu karta ekle
                container.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Error fetching customer tasks:", error);
            document.getElementById('availableTasksContainer').innerHTML = '<p>Error loading tasks.</p>';
        });
}
function loadAssignedDerbyTasks() {
    const customerId = localStorage.getItem("customerId");
    const token = localStorage.getItem("jwtToken");

    fetch(`http://localhost:8080/api/customer/${customerId}/list/assignedtasks`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(tasks => {
            const container = document.getElementById("assignedTasksContainer");
            container.innerHTML = "";

            if (!tasks.length) {
                container.innerHTML = "<p>No assigned derby tasks.</p>";
                return;
            }

            tasks.forEach(task => {
                const card = document.createElement("div");
                card.className = "product-card";
                card.style.position = "relative"; // butonu konumlandırmak için

                const progressPercent = Math.min(
                    Math.round((task.progress / task.requiredQuantity) * 100),
                    100
                );

                const deadline = new Date(task.deadline).toLocaleString();

                // ➖ butonu
                const removeButton = document.createElement('button');
                removeButton.innerHTML = '➖';
                removeButton.style.position = 'absolute';
                removeButton.style.top = '10px';
                removeButton.style.right = '10px';
                removeButton.style.backgroundColor = '#e74c3c';
                removeButton.style.color = 'white';
                removeButton.style.border = 'none';
                removeButton.style.borderRadius = '50%';
                removeButton.style.width = '30px';
                removeButton.style.height = '30px';
                removeButton.style.cursor = 'pointer';
                removeButton.title = 'Unassign this task';

                removeButton.addEventListener('click', () => {
                    unassignTask(task.taskId);
                });

                card.innerHTML = `
        <h4>${task.targetName}</h4>
        <p>Type: ${task.taskType}</p>
        <p>Quantity: ${task.progress}/${task.requiredQuantity}</p>
        <p>Reward: ⭐ ${task.rewardPoints} points</p>
        <p>Deadline: ${deadline}</p>
        <div style="width: 100%; height: 12px; background-color: #e0e0e0; border-radius: 6px; overflow: hidden; margin-top: 8px;">
            <div style="width: ${progressPercent}%; height: 100%; background-color: #77AB5C;"></div>
        </div>
    `;

                card.appendChild(removeButton);
                container.appendChild(card);
            });
        })
        .catch(err => {
            console.error("❌ Error loading assigned tasks:", err);
            document.getElementById("assignedTasksContainer").innerHTML = "<p>Failed to load tasks.</p>";
        });
}

let editingAddressId = null;

function loadCustomerProfile() {
    const token = localStorage.getItem("jwtToken");
    const customerId = localStorage.getItem("customerId");

    fetch(`http://localhost:8080/api/customer/${customerId}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
    })
        .then(res => res.json())
        .then(data => {
            // Profil bilgileri
            //document.getElementById("customerAvatarImg").src = `avatars/${data.avatarId || "default"}.jpg`;
            document.getElementById("displayName").textContent = data.name || "";
            document.getElementById("displayAge").textContent = data.age || "";
            document.getElementById("displayPhone").textContent = data.phoneNumber || "";

            document.getElementById("updateName").value = data.name || "";
            document.getElementById("updateAge").value = data.age || "";
            document.getElementById("updatePhone").value = data.phoneNumber || "";

            // Adresler
            const addressContainer = document.getElementById("addressContainer");
            addressContainer.innerHTML = "";

            if (data.addresses && data.addresses.length > 0) {
                data.addresses.forEach((addr, index) => {
                    const div = document.createElement("div");
                    div.className = "info-box";
                    div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong>Address ${index + 1}</strong>
              <button class="edit-btn" onclick='editAddress(${addr.addressId}, ${JSON.stringify(addr)})'>✏️</button>
              <button class="delete-circle-btn" onclick="deleteAddress(${addr.addressId})">−</button>
            </div>
            <p>${addr.street} Apt: ${addr.apartmentNumber}, Floor: ${addr.floor}, Flat: ${addr.flatNumber}</p>
            <p>${addr.postalCode} ${addr.city}, ${addr.state}, ${addr.country}</p>
          `;
                    addressContainer.appendChild(div);
                });
            } else {
                addressContainer.textContent = "No address found.";
            }

            // Kredi Kartları
            const cardContainer = document.getElementById("cardContainer");
            cardContainer.innerHTML = "";

            if (data.creditCards && data.creditCards.length > 0) {
                data.creditCards.forEach((card, index) => {
                    const div = document.createElement("div");
                    div.className = "info-box";
                    div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong>Card ${index + 1}</strong>
              <button class="delete-circle-btn" onclick="deleteCard(${card.creditCardId})">−</button>
            </div>
            <p>Card Number: **** **** **** ${card.cardNumber.slice(-4)}</p>
            <p>Expiry: ${card.cardExpireDate} &nbsp; • &nbsp; CVC: ***</p>
          `;
                    cardContainer.appendChild(div);
                });
            } else {
                cardContainer.textContent = "No credit cards found.";
            }
        })
        .catch(err => console.error("❌ Failed to load profile info", err));
}

function updateCustomerProfile(event) {
    event.preventDefault();

    const token = localStorage.getItem("jwtToken");
    const customerId = localStorage.getItem("customerId");

    const name = document.getElementById("updateName").value;
    const age = document.getElementById("updateAge").value;
    const phone = document.getElementById("updatePhone").value;

    const body = {
        name: name ? name : null,
        age: age ? parseInt(age) : null,
        phoneNumber: phone ? phone : null
    };

    fetch(`http://localhost:8080/api/customer/${customerId}/profile/update-profile`, {
        method: 'PUT',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body)
    })
        .then(res => res.json())
        .then(result => {
            if (result.success) {
                alert("✅ " + result.detail);
                loadCustomerProfile();
                document.getElementById("profileEdit").style.display = "none";
                document.getElementById("profileDisplay").style.display = "block";
            } else {
                alert("❌ " + result.detail);
                if (result.detail === "There is no change."){

                }
            }
        })
        .catch(err => {
            console.error("❌ Error while updating profile", err);
        });
}
document.getElementById("addAddressForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const customerId = localStorage.getItem("customerId");
    const token = localStorage.getItem("jwtToken");

    const body = {
        country: document.getElementById("addressCountry").value.trim(),
        city: document.getElementById("addressCity").value.trim(),
        state: document.getElementById("addressState").value.trim(),
        street: document.getElementById("addressStreet").value.trim(),
        apartmentNumber: document.getElementById("addressApartment").value.trim(),
        floor: document.getElementById("addressFloor").value.trim(),
        flatNumber: document.getElementById("addressFlat").value.trim(),
        postalCode: document.getElementById("addressPostal").value.trim()
    };

   const isEdit = editingAddressId !== null;
   const url = isEdit
    ? `http://localhost:8080/api/customer/${customerId}/profile/update-address/${editingAddressId}`
    : `http://localhost:8080/api/customer/${customerId}/profile/add-address`;
    const method = isEdit ? "PUT" : "POST";

    fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
    })
        .then(res => res.json())
        .then(response => {
            if (response.success === false) {
                alert("❌ " + response.detail);
            } else {
                alert("✅ Address saved successfully!");
                editingAddressId = null;
                document.getElementById("addAddressForm").reset();
                document.getElementById("addressFormSection").style.display = "none";
                loadCustomerProfile(); // Refresh address list
            }
        })
        .catch(err => console.error("Address save error:", err));
});

function editAddress(addressId, address) {
  editingAddressId = addressId;
  document.getElementById("addressFormSection").style.display = "block";

  document.getElementById("addressCountry").value = address.country || "";
  document.getElementById("addressCity").value = address.city || "";
  document.getElementById("addressState").value = address.state || "";
  document.getElementById("addressStreet").value = address.street || "";
  document.getElementById("addressApartment").value = address.apartmentNumber || "";
  document.getElementById("addressFloor").value = address.floor || "";
  document.getElementById("addressFlat").value = address.flatNumber || "";
  document.getElementById("addressPostal").value = address.postalCode || "";

  document.getElementById("submitAddressBtn").textContent = "Update Address";
}


function toggleAddressForm() {
    const formSection = document.getElementById("addressFormSection");
    formSection.style.display = "block"; // Her zaman göster
    editingAddressId = null;
    document.getElementById("addAddressForm").reset();
    document.getElementById("submitAddressBtn").textContent = "Add Address";
}
function deleteAddress(addressId) {
    const customerId = localStorage.getItem("customerId");
    const token = localStorage.getItem("jwtToken");

    const confirmDelete = confirm("Are you sure you want to delete this address?");
    if (!confirmDelete) return;

    fetch(`http://localhost:8080/api/customer/${customerId}/profile/delete-address/${addressId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(result => {
            if (result.success) {
                alert("✅ Address deleted successfully.");
                loadCustomerProfile();
            } else {
                alert("❌ " + result.detail);
            }
        })
        .catch(err => {
            console.error("❌ Failed to delete address:", err);
        });
}

/*
function editAddress(id, address) {
    editingAddressId = id;
    document.getElementById("addressFormSection").style.display = "block";

    // Formu doldur
    document.getElementById("addressCountry").value = address.country;
    document.getElementById("addressCity").value = address.city;
    document.getElementById("addressState").value = address.state;
    document.getElementById("addressStreet").value = address.street;
    document.getElementById("addressApartment").value = address.apartmentNumber;
    document.getElementById("addressFloor").value = address.floor;
    document.getElementById("addressFlat").value = address.flatNumber;
    document.getElementById("addressPostal").value = address.postalCode;

    document.getElementById("submitAddressBtn").textContent = "Save Address";
}*/
function initCreditCardManagement() {
    const token = localStorage.getItem("jwtToken");
    const customerId = localStorage.getItem("customerId");

    // Kredi kartlarını ekrana bas
    function renderCreditCards(cards) {
        const cardContainer = document.getElementById("cardContainer");
        cardContainer.innerHTML = "";

        if (!cards || cards.length === 0) {
            cardContainer.textContent = "No credit cards found.";
            return;
        }

        cards.forEach((card, index) => {
            const div = document.createElement("div");
            div.className = "info-box";
            div.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong>Card ${index + 1}</strong>
          <button class="delete-circle-btn" onclick="deleteCard(${card.creditCardId})">−</button>
        </div>
        <p>Card Number: **** **** **** ${card.cardNumber.slice(-4)}</p>
        <p>Expiry: ${card.cardExpireDate} &nbsp; • &nbsp; CVC: ***</p>
      `;
            cardContainer.appendChild(div);
        });
    }

    // Kart silme
    window.deleteCard = function (cardId) {
        if (!confirm("Are you sure you want to delete this card?")) return;

        fetch(`http://localhost:8080/api/customer/${customerId}/profile/delete-card/${cardId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(res => {
                if (!res.success) {
                    alert("❌ " + res.detail);
                } else {
                    alert("✅ Credit card deleted.");
                    loadCustomerProfile();
                }
            })
            .catch(err => console.error("❌ Error deleting card:", err));
    };

    // Kart ekleme
    document.getElementById("addCardForm").addEventListener("submit", function (e) {
        e.preventDefault();

        const body = {
            cardNumber: document.getElementById("cardNumber").value.trim(),
            expiryDate: document.getElementById("cardExpireDate").value.trim(),
            cvc: document.getElementById("cardCVC").value.trim()
        };

        fetch(`http://localhost:8080/api/customer/${customerId}/profile/add-card`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(body)
        })
            .then(res => res.json())
            .then(res => {
                if (!res.success) {
                    alert("❌ " + res.detail);
                } else {
                    alert("✅ Credit card added.");
                    document.getElementById("addCardForm").reset();
                    document.getElementById("cardFormSection").style.display = "none";
                    loadCustomerProfile();
                }
            })
            .catch(err => console.error("❌ Error adding card:", err));
    });

    // Formu göster/gizle
    document.getElementById("toggleCardFormBtn").addEventListener("click", () => {
        document.getElementById("cardFormSection").style.display = "block";
        document.getElementById("addCardForm").reset();
    });

    document.getElementById("cancelCardBtn").addEventListener("click", () => {
        document.getElementById("cardFormSection").style.display = "none";
        document.getElementById("addCardForm").reset();
    });

    // Eğer ayrı çağrılmak istenirse dışa aktar
    window.renderCreditCards = renderCreditCards;
}


//TRRYYYYYYYYYYYYYYYYYYYYYYYYYYYY
function addToCart(type, targetId) {
  const customerId = localStorage.getItem("customerId");
  const token = localStorage.getItem("jwtToken");

  fetch(`http://localhost:8080/api/customer/${customerId}/cart/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ type, targetId })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success === "true") {
      alert("✅ " + data.detail);
      updateCartCount(); // Refresh badge count
    } else {
      alert("❌ " + data.detail);
    }
  })
  .catch(err => console.error("Error adding to cart:", err));
}


function updateCartItemQuantity(cartItemId, number) {
  if (number !== 1 && number !== -1) {
    alert("Invalid quantity change.");
    return;
  }

  const customerId = localStorage.getItem("customerId");
  const token = localStorage.getItem("jwtToken");

  fetch(`http://localhost:8080/api/customer/${customerId}/cartItem/${cartItemId}/update_number`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ number })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success === "true") {
      loadCartItems();
      updateCartCount();
    } else {
      alert("❌ " + data.detail);
    }
  })
  .catch(err => console.error("Error updating cart item:", err));
}

function applyCoupon(id) {
    selectedCouponCode = parseInt(id);
    alert("✅ Coupon applied successfully!");
    loadCartSummary();
}


function loadCartItems() {
    const customerId = localStorage.getItem("customerId");
    const token = localStorage.getItem("jwtToken");
    const container = document.getElementById("cartItemsContainer");
    const totalDisplay = document.getElementById("cartTotal");
    const badge = document.getElementById("cartCountBadge");

    fetch(`http://localhost:8080/api/customer/${customerId}/cart_items`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
    })
        .then(res => res.json())
        .then(data => {
            const items = data.items || [];
            const coupons = data.coupons || [];

            availableCoupons = coupons; // store for later access
            container.innerHTML = '';
            let total = 0;
            let totalQuantity = 0;

            if (items.length === 0) {
                container.innerHTML = "<p>Your cart is empty.</p>";
                if (badge) badge.style.display = "none";
            } else {
                items.forEach(item => {
                    total += item.totalPrice;
                    totalQuantity += item.quantity;

                    const card = document.createElement("div");
                    card.className = "product-card";
                    card.innerHTML = `
                    <h4>${item.name}</h4>
                    <p><strong>₺${item.unitPrice}</strong> x ${item.quantity}</p>
                    <p><em>${item.restaurantName ?? "Unknown Restaurant"}</em></p>
                    <div style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 0.5rem;">
                      <button class="btn" onclick="updateCartItemQuantity(${item.itemId}, -1)">−</button>
                      <button class="btn" onclick="updateCartItemQuantity(${item.itemId}, 1)">+</button>
                    </div>
                `;
                    container.appendChild(card);
                });

                if (badge) {
                    badge.textContent = totalQuantity;
                    badge.style.display = totalQuantity > 0 ? "inline-block" : "none";
                }
            }

            totalDisplay.textContent = `₺${total.toFixed(2)}`;
            lastTotalAmount = total;
            renderCoupons(coupons);
        })
        .catch(err => {
            console.error("Error loading cart items:", err);
            container.innerHTML = "<p>Failed to load cart.</p>";
            if (badge) badge.style.display = "none";
        });
}
function renderCoupons(coupons) {
    const couponContainer = document.getElementById("couponListContainer");
    couponContainer.innerHTML = "";

    if (!coupons.length) {
        couponContainer.innerHTML = "<p>No available coupons.</p>";
        return;
    }

    coupons.forEach(coupon => {
        const meetsCondition = lastTotalAmount >= coupon.minimumOrderAmount;
        const discountedPrice = (lastTotalAmount - coupon.discountAmount).toFixed(2);

        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <h4>🎁 ${coupon.code}</h4>
            <p><strong>₺${coupon.discountAmount} discount</strong></p>
            <p>Minimum Order: ₺${coupon.minimumOrderAmount}</p>
            <p>Expires: ${new Date(coupon.expiryDate).toLocaleDateString()}</p>
            ${meetsCondition
            ? `<p style="color: green;"><strong>After Discount:</strong> ₺${discountedPrice}</p><button class="btn" onclick="applyCoupon(${coupon.couponId})">Use</button>`
            : `<p style="color: red;">Requires ₺${coupon.minimumOrderAmount}+</p>`}
        `;

        couponContainer.appendChild(card);
    });
}

function showPurchasePage() {
  showPage("purchase");
  loadAddressAndCardOptions();
  loadCartSummary(); // if you also want to show the cart item summary
}
function submitPurchase() {
    const customerId = localStorage.getItem("customerId");
    const token = localStorage.getItem("jwtToken");
    const addressId = parseInt(document.getElementById("addressSelect").value);
    const cardId = parseInt(document.getElementById("cardSelect").value);

    if (!addressId) return alert("❗ Please select a delivery address.");
    if (!cardId) return alert("❗ Please select a credit card.");

    const payload = {
        addressId: addressId,
        creditCardId: cardId
    };

    if (selectedCouponCode) {
        payload.couponId = selectedCouponCode;
    }

    fetch(`http://localhost:8080/api/customer/${customerId}/order/place`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert(`✅ ${data.detail}\n🧾 Total: ₺${data.totalBeforeDiscount} → Final: ₺${data.finalPrice}`);
                selectedCouponCode = null;
                location.reload();
            } else {
                alert("❌ " + data.detail);
            }
        })
        .catch(err => {
            console.error("❌ Purchase error:", err);
            alert("❌ An unexpected error occurred while placing the order.");
        });
}


function updateCartCount() {
    const customerId = localStorage.getItem("customerId");
    const token = localStorage.getItem("jwtToken");
    const badge = document.getElementById("cartCountBadge");

    fetch(`http://localhost:8080/api/customer/${customerId}/cart_items`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
    })
        .then(res => res.json())
        .then(data => {
            const items = data.items || [];
            const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
            badge.textContent = totalCount > 0 ? totalCount : "";
            badge.style.display = totalCount > 0 ? "inline-block" : "none";
        })
        .catch(err => {
            console.error("Failed to update cart count:", err);
        });
}
function loadCartSummary() {
    const summary = document.getElementById("purchaseSummary");
    const customerId = localStorage.getItem("customerId");
    const token = localStorage.getItem("jwtToken");

    fetch(`http://localhost:8080/api/customer/${customerId}/cart_items`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
    })
        .then(res => res.json())
        .then(data => {
            const items = data.items || [];
            let total = 0;
            summary.innerHTML = "";

            if (!items.length) {
                summary.innerHTML = "<p>Your cart is empty.</p>";
                return;
            }

            summary.innerHTML = items.map(item => {
                total += item.totalPrice;
                return `<p>${item.name} x ${item.quantity} — ₺${item.totalPrice.toFixed(2)}</p>`;
            }).join('');

            summary.innerHTML += `<p><strong>Total: ₺${total.toFixed(2)}</strong></p>`;

            if (selectedCouponCode) {
                const matchedCoupon = availableCoupons.find(c => c.couponId === selectedCouponCode);
                if (matchedCoupon) {
                    if (total >= matchedCoupon.minimumOrderAmount) {
                        const discount = matchedCoupon.discountAmount;
                        const final = total - discount;
                        summary.innerHTML += `
                        <p style="color: #28a745;">Coupon Applied: <strong>${matchedCoupon.code}</strong></p>
                        <p>Discount: ₺${discount.toFixed(2)}</p>
                        <p><strong>Final Price: ₺${final.toFixed(2)}</strong></p>
                    `;
                    } else {
                        summary.innerHTML += `<p style="color: red;">❗ Coupon '${matchedCoupon.code}' requires minimum ₺${matchedCoupon.minimumOrderAmount}</p>`;
                    }
                }
            }
        })
        .catch(err => {
            console.error("Error loading cart summary:", err);
            summary.innerHTML = "<p>❌ Failed to load cart summary.</p>";
        });
}

function loadAddressAndCardOptions() {
    const customerId = localStorage.getItem("customerId");
    const token = localStorage.getItem("jwtToken");

    console.log("📦 Loading addresses and cards for:", customerId);

    fetch(`http://localhost:8080/api/customer/${customerId}/profile`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
    })
        .then(res => {
            if (!res.ok) {
                throw new Error("Network response was not ok");
            }
            return res.json();
        })
        .then(data => {
            console.log("✅ Profile data loaded:", data); // 💥 See if addresses and cards are here
            const addressSelect = document.getElementById("addressSelect");
            const cardSelect = document.getElementById("cardSelect");

            addressSelect.innerHTML = "";
            cardSelect.innerHTML = "";

            if (data.addresses && data.addresses.length > 0) {
                data.addresses.forEach(addr => {
                    const opt = document.createElement("option");
                    opt.value = addr.addressId;
                    opt.textContent = `${addr.street}, Apt ${addr.apartmentNumber}, ${addr.city}`;
                    addressSelect.appendChild(opt);
                });
            } else {
                addressSelect.innerHTML = `<option disabled selected>No address found</option>`;
            }

            if (data.creditCards && data.creditCards.length > 0) {
                data.creditCards.forEach(card => {
                    const opt = document.createElement("option");
                    opt.value = card.creditCardId;
                    opt.textContent = `**** **** **** ${card.cardNumber.slice(-4)} | ${card.cardExpireDate}`;
                    cardSelect.appendChild(opt);
                });
            } else {
                cardSelect.innerHTML = `<option disabled selected>No credit card found</option>`;
            }
        })
        .catch(err => {
            console.error("❌ Failed to load address and card options", err);
        });
}

function loadCustomerAvatar() {
    const customerId = localStorage.getItem("customerId");
    const token = localStorage.getItem("jwtToken");

    fetch(`http://localhost:8080/api/customer/${customerId}/view/avatar`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(data => {
            const avatarImg = document.getElementById("customerAvatarImg");
            const avatarNameSpan = document.getElementById("customerAvatarName");

            if (!data.success) {
                avatarImg.src = "avatars/default.jpg";
                avatarNameSpan.textContent = "Guest";
                return;
            }

            const avatarId = data.avatarId;
            if (avatarId === null) {
                avatarImg.src = "avatars/default.jpg";
            } else {
                avatarImg.src = `avatars/avatar${avatarId}.jpg`;
                document.getElementById("headerAvatarImg").src = `avatars/avatar${avatarId}.jpg`;
            }

            // Müşteri adını da çek ve yaz
            fetch(`http://localhost:8080/api/customer/${customerId}/profile`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
                .then(res => res.json())
                .then(profile => {
                    avatarNameSpan.textContent = profile.name || "Customer";
                })
                .catch(() => {
                    avatarNameSpan.textContent = "Customer";
                });
        })
        .catch(err => {
            console.warn("❌ Avatar fetch failed.");
            document.getElementById("customerAvatarImg").src = "avatars/default.jpg";
            document.getElementById("customerAvatarName").textContent = "Guest";
        });
}

function editCustomerAvatar() {
    const container = document.getElementById("avatarSelectList");

    // Eğer zaten açık ise kapat
    if (container.style.display === "flex") {
        container.style.display = "none";
        return;
    }

    const availableAvatars = [2, 3, 5, 6, 7, 11];
    container.innerHTML = "";
    container.style.display = "flex";

    availableAvatars.forEach(id => {
        const card = document.createElement("div");
        card.className = "card";
        card.style.cursor = "pointer";
        card.style.width = "120px";
        card.style.textAlign = "center";

        const img = document.createElement("img");
        img.src = `avatars/avatar${id}.jpg`;
        img.alt = `Avatar ${id}`;
        img.style.width = "100px";
        img.style.height = "100px";
        img.style.borderRadius = "50%";
        img.style.border = "2px solid transparent";
        img.onerror = () => img.src = "avatars/default.jpg";

        const label = document.createElement("div");
        label.innerText = `Avatar ${id}`;
        label.style.marginTop = "8px";

        card.appendChild(img);
        card.appendChild(label);

        card.addEventListener("click", () => {
            updateCustomerAvatar(`avatar${id}`, id);
        });

        container.appendChild(card);
    });
}
function updateCustomerAvatar(avatarId, index) {
    document.getElementById("avatarSelectList").style.display = "none";

    const customerId = localStorage.getItem("customerId");
    const token = localStorage.getItem("jwtToken");

    fetch(`http://localhost:8080/api/customer/${customerId}/avatar/update`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ avatarId: index })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("✅ Avatar updated successfully!");
                document.getElementById("customerAvatarImg").src = `avatars/avatar${index}.jpg`;
                document.getElementById("avatarSelectList").style.display = "none";
                document.getElementById("headerAvatarImg").src = `avatars/avatar${index}.jpg`;

            } else {
                alert("❌ " + data.detail);
            }
        })
        .catch(err => {
            console.error("❌ Error updating avatar:", err);
        });
}
function loadCustomerLevelPoints() {
    const customerId = localStorage.getItem("customerId");
    const token = localStorage.getItem("jwtToken");

    fetch(`http://localhost:8080/api/customer/${customerId}/view/level-points`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const level = data.level;
                const points = data.points;
                const progress = points % 100;

                // Mevcut level ve puanı göster
                document.getElementById("customerPoints").textContent = points;

                // Slider barı güncelle
                const bar = document.getElementById("levelProgressBar");
                if (bar) bar.style.width = `${progress}%`;

                // Badge'e mevcut level yaz
                const badge = document.getElementById("currentLevelBadge");
                if (badge) badge.textContent = level;
            } else {
                console.warn("⚠️ Could not load level/points:", data.detail);
            }
        })
        .catch(err => {
            console.error("❌ Error loading level/points:", err);
        });
}

function openReviewPopup(orderId, restaurantId) {
    console.log(orderId);
    console.log(restaurantId);
    document.getElementById("reviewPopup").style.display = "block";
    document.getElementById("popupOverlay").style.display = "block";

    document.getElementById("reviewOrderId").value = orderId;
    document.getElementById("reviewRestaurantId").value = restaurantId;
}
function closeReviewPopup() {
    document.getElementById("popupOverlay").style.display = "none";
    document.getElementById("reviewPopup").style.display = "none";
    document.getElementById("reviewRating").value = "";
    document.getElementById("reviewText").value = "";
}

function submitReview() {
    const token = localStorage.getItem("jwtToken");
    const customerId = localStorage.getItem("customerId");

    const restaurantId = parseInt(document.getElementById("reviewRestaurantId").value);
    const orderId = parseInt(document.getElementById("reviewOrderId").value);
    const rating = parseInt(document.getElementById("reviewRating").value);
    const review = document.getElementById("reviewText").value.trim();

    if (isNaN(rating) || rating < 1 || rating > 5) {
        alert("❗ Rating must be between 1 and 5.");
        return;
    }

    const body = { restaurantId, orderId, rating, review };

    fetch(`http://localhost:8080/api/customer/${customerId}/rate-restaurant`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
    })
        .then(res => res.json())
        .then(result => {
            alert(result.detail);
            if (result.success) {
                closeReviewPopup();
                loadCustomerOrders(); // refresh list
            }
        })
        .catch(err => {
            console.error("Review submit failed:", err);
            alert("❌ Failed to submit review.");
        });
}

function loadCustomerOrders() {
    const token = localStorage.getItem("jwtToken");
    const customerId = localStorage.getItem("customerId");

    fetch(`http://localhost:8080/api/customer/${customerId}/orders/list`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(orders => {
            const container = document.getElementById("orderListContainer");
            container.innerHTML = "";

            if (!orders.length) {
                container.innerHTML = "<p>You have no orders yet.</p>";
                return;
            }

            orders.forEach(order => {
                const card = document.createElement("div");
                card.className = "order-card";
                const created = order.createdAt.replace("T", " ").substring(0, 19);
                const items = order.itemNames.join(", ");
                const restaurant = order.restaurantName || "Unknown";
                const courier = order.courierName || "Not assigned";
                const totalText = order.finalPrice != null ? `₺${order.finalPrice}` : "Not available";

                card.innerHTML = `
                    <h4>Order #${order.orderId}</h4>
                    <p><strong>Status:</strong> ${order.status}</p>
                    <p><strong>Amount:</strong> ${order.itemCount} item(s)</p>
                    <p><strong>Total:</strong> ${totalText}</p>
                    <p><strong>Created:</strong> ${created}</p>
                    <p><strong>Items:</strong> ${items}</p>
                    <p><strong>Restaurant:</strong> ${restaurant}</p>
                    <p><strong>Courier:</strong> ${courier}</p>
                `;

                // Cancel butonu (pending ise)
                if (order.status.toUpperCase() === "PENDING") {
                    const cancelBtn = document.createElement("button");
                    cancelBtn.textContent = "❌ Cancel Order";
                    cancelBtn.onclick = () => cancelOrder(order.orderId);
                    cancelBtn.style.marginTop = "10px";
                    card.appendChild(cancelBtn);
                }

                // ✅ Rate & Review butonu (delivered ise)
                if (order.status.toUpperCase() === "DELIVERED") {
                    const reviewBtn = document.createElement("button");
                    reviewBtn.textContent = "⭐ Rate & Review";
                    reviewBtn.style.marginTop = "10px";
                    reviewBtn.onclick = () => openReviewPopup(order.orderId, order.restaurantId);
                    card.appendChild(reviewBtn);
                }

                container.appendChild(card);
            });
        })
        .catch(err => {
            console.error("❌ Failed to load orders:", err);
        });
}

function cancelOrder(orderId) {
  const token = localStorage.getItem("jwtToken");
  const customerId = localStorage.getItem("customerId");

  if (!token || !customerId) {
    alert("❌ You must be logged in to cancel an order.");
    return;
  }

  const confirmCancel = confirm("Are you sure you want to cancel this order?");
  if (!confirmCancel) return;

  fetch(`http://localhost:8080/api/customer/${customerId}/order/${orderId}/cancel`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        alert("✅ " + result.detail);
        // Refresh or reload order list if needed
        loadCustomerOrders();
      } else {
        alert("❌ " + result.detail);
      }
    })
    .catch(err => {
      console.error("❌ Error cancelling order:", err);
      alert("❌ Something went wrong while cancelling the order.");
    });
}
function loadPopularRestaurants() {
    const token = localStorage.getItem("jwtToken");
    fetch("http://localhost:8080/api/customer/homepage/restaurant-reviews", {
        headers: { Authorization: `Bearer ${token}` }
    })
        .then(res => res.json())
        .then(data => {
            allRestaurants = data.sort((a, b) => b.overAllRating - a.overAllRating);
            renderRestaurants(false);
        });
}

function createRestaurantCard(restaurant) {
    const rating = restaurant.overAllRating;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.25 && rating % 1 < 0.75;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let starsHtml = '';
    for (let i = 0; i < fullStars; i++) {
        starsHtml += `<i class="fas fa-star"></i>`;
    }
    if (hasHalfStar) {
        starsHtml += `<i class="fas fa-star-half-alt"></i>`;
    }
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += `<i class="far fa-star"></i>`;
    }

    return `
    <div class="product-card" style="padding: 1rem; display: flex; justify-content: space-between; align-items: center; flex-direction: row;">
      <div>
        <strong style="font-size: 1.1rem;">${restaurant.name}</strong>
        <p style="margin: 0.4rem 0;">${rating.toFixed(1)} / 5</p>
        <div style="width: 100px; display: flex; justify-content: start; gap: 4px; font-size: 20px; color: #FFD700;">
          ${starsHtml}
        </div>
      </div>
      <button class="btn" style="margin-left: 1rem;" onclick='showReviews(${JSON.stringify(restaurant.reviews)})'>See Reviews</button>
    </div>
  `;
}

function showReviews(reviews) {
    const overlay = document.createElement("div");
    overlay.id = "reviewBlurOverlay";
    overlay.style.position = "fixed";
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backdropFilter = "blur(6px)";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
    overlay.style.zIndex = 999;

    const modal = document.createElement("div");
    modal.id = "reviewModal";
    modal.style.position = "fixed";
    modal.style.top = "50%";
    modal.style.left = "50%";
    modal.style.transform = "translate(-50%, -50%)";
    modal.style.backgroundColor = "#fff";
    modal.style.padding = "2rem";
    modal.style.borderRadius = "10px";
    modal.style.boxShadow = "0 4px 20px rgba(0,0,0,0.25)";
    modal.style.zIndex = 1000;
    modal.style.maxHeight = "70vh";
    modal.style.overflowY = "auto";
    modal.style.width = "90%";
    modal.style.maxWidth = "500px";

    let html = `<h3 style="margin-bottom: 1rem;">Reviews</h3><ul style="list-style:none; padding: 0;">`;
    for (const r of reviews) {
        html += `
      <li style="margin-bottom: 1rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem;">
        <strong>${r.customerName}</strong> - ⭐ ${r.rating}<br/>
        <span>${r.review}</span>
      </li>
    `;
    }
    html += `</ul><button class="btn" style="margin-top: 1rem;" onclick="closeReviewModal()">Close</button>`;

    modal.innerHTML = html;
    document.body.appendChild(overlay);
    document.body.appendChild(modal);
}

function closeReviewModal() {
    document.getElementById("reviewModal")?.remove();
    document.getElementById("reviewBlurOverlay")?.remove();
}
function filterRestaurants() {
    renderRestaurants(currentShowAll);
}

function renderRestaurants(showAll = false) {
    currentShowAll = showAll;
    const container = document.getElementById("popularRestaurantsContainer");
    const toggleBtnId = "toggleRestaurantBtn";
    container.innerHTML = '';

    const searchValue = document.getElementById("restaurantSearchInput")?.value.toLowerCase() || '';
    const filtered = allRestaurants.filter(r =>
        r.name.toLowerCase().includes(searchValue)
    );

    const toRender = showAll ? filtered : filtered.slice(0, 5);
    toRender.forEach(r => container.innerHTML += createRestaurantCard(r));

    let toggleBtn = document.getElementById(toggleBtnId);
    if (!toggleBtn) {
        toggleBtn = document.createElement("button");
        toggleBtn.id = toggleBtnId;
        toggleBtn.className = "btn";
        toggleBtn.style.marginTop = "1rem";
        toggleBtn.style.display = "block";
        toggleBtn.style.marginLeft = "auto";
        toggleBtn.style.marginRight = "0";
        container.parentElement.appendChild(toggleBtn);
    }

    toggleBtn.textContent = showAll ? "Show Top 5 Only" : "See All Restaurants";
    toggleBtn.onclick = () => renderRestaurants(!showAll);
}


