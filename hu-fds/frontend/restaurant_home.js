// Popup aç/kapat
let editingRestaurantAddressId = null;

function openMenuPopup(menu) {
    const popup = document.getElementById("menuPopupForm");
    const overlay = document.getElementById("popupOverlay");

    if (menu) {
        // Mevcut menüyü düzenlemek için popup aç
        document.getElementById("menuPopupTitle").innerText = "Update Menu";
        document.getElementById("editMenuId").value = menu.menuId;
        document.getElementById("menuName").value = menu.name;
        document.getElementById("menuCategory").value = menu.category;
        document.getElementById("menuPrice").value = menu.price;
    } else {
        // Yeni menü için popup aç
        document.getElementById("menuPopupTitle").innerText = "Create New Menu";
        document.getElementById("editMenuId").value = "";
        document.getElementById("menuName").value = "";
        document.getElementById("menuCategory").value = "";
        document.getElementById("menuPrice").value = "";
        loadProductSelection();
    }

    popup.style.display = "block";
    overlay.style.display = "block";
}




function closeMenuPopup() {
    document.getElementById('menuPopupForm').style.display = 'none';
    document.getElementById('popupOverlay').style.display = 'none';
}

// Ürünleri çekip checkbox olarak göster
function loadProductSelection() {
    const restaurantId = localStorage.getItem('restaurantId');
    const token = localStorage.getItem('jwtToken');

    fetch(`http://localhost:8080/api/product/${restaurantId}/products`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => response.json())
        .then(products => {
            const selectionDiv = document.getElementById('productSelection');
            selectionDiv.innerHTML = '';
            products.forEach(product => {
                const label = document.createElement('label');
                label.style.display = 'block';
                label.innerHTML = `<input type="checkbox" value="${product.productId}" data-name="${product.name}"> ${product.name}`;
                selectionDiv.appendChild(label);
            });
        })
        .catch(error => {
            console.error('Error loading products:', error);
            alert('❌ Failed to load products for menu.');
        });
}

// Menü kaydet
function saveMenu() {
    const name = document.getElementById('menuName').value.trim();
    const category = document.getElementById('menuCategory').value.trim();
    const price = parseFloat(document.getElementById('menuPrice').value.trim());
    const menuId = document.getElementById('editMenuId').value;
    const restaurantId = localStorage.getItem('restaurantId');
    const token = localStorage.getItem('jwtToken');

    const isUpdate = menuId && menuId !== "";

    if (!name || !category || isNaN(price)) {
        alert('❗ Please fill all the fields correctly.');
        return;
    }

    let url = "";
    let method = "";
    let bodyData = {};

    if (isUpdate) {
        // 🔁 UPDATE işlemi: sadece name, category, price gönder
        url = `http://localhost:8080/api/menu/${restaurantId}/update/${menuId}`;
        method = "PUT";
        bodyData = {
            name: name,
            category: category,
            price: price
        };
    } else {
        // ➕ CREATE işlemi: products da eklenmeli
        const selectedCheckboxes = document.querySelectorAll('#productSelection input[type="checkbox"]:checked');
        const selectedProducts = Array.from(selectedCheckboxes).map(cb => ({
            productId: parseInt(cb.value),
            name: cb.getAttribute('data-name')
        }));

        if (selectedProducts.length === 0) {
            alert('❗ Please select at least one product for the menu.');
            return;
        }

        url = `http://localhost:8080/api/menu/${restaurantId}/create`;
        method = "POST";
        bodyData = {
            name: name,
            category: category,
            price: price,
            products: selectedProducts
        };
    }

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bodyData)
    })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert("✅ " + result.detail);
                closeMenuPopup();
                loadMenus();
            } else {
                alert("❌ " + result.detail);
            }
        })
        .catch(error => {
            console.error("Error saving menu:", error);
            alert("❌ Unexpected error occurred while saving menu.");
        });
}
function loadMenus() {
    const restaurantId = localStorage.getItem('restaurantId');
    const token = localStorage.getItem('jwtToken');

    if (!restaurantId || !token) {
        console.error("Restaurant ID or token missing!");
        return;
    }

    fetch(`http://localhost:8080/api/menu/${restaurantId}/menus`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load menus.");
            }
            return response.json();
        })
        .then(menus => {
            const menuListDiv = document.getElementById('menuList');
            menuListDiv.innerHTML = '';

            if (menus.length === 0) {
                menuListDiv.innerHTML = '<p>No menus available at the moment.</p>';
                return;
            }

            menus.forEach(menu => {
                const menuCard = document.createElement('div');
                menuCard.className = 'menu-item';

                const productNames = menu.products.map(p => p.name).join(', ');

                const statusBadge = menu.inStock
                    ? `<span style="padding: 2px 8px; background-color: #d4edda; color: #155724; border-radius: 12px; font-size: 0.85rem;">Available</span>`
                    : `<span style="padding: 2px 8px; background-color: #f8d7da; color: #721c24; border-radius: 12px; font-size: 0.85rem;">Unavailable</span>`;

                menuCard.innerHTML = `
                    <div style="flex: 1;">
                        <strong>${menu.name}</strong><br>
                        Category: ${menu.category}<br>
                        Products: ${productNames}<br>
                        Calories: ${menu.calories} kcal<br>
                        <em>Restaurant: ${menu.restaurant.name}</em><br>
                        ${statusBadge}
                    </div>
                    <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end;">
                        <div style="font-weight: bold;">₺${menu.price.toFixed(2)}</div>
                        <div style="margin-top: 5px;">
                            <button onclick="updateMenu(${menu.menuId})" style="margin-right: 5px; background-color: #f1f1f1; border: 1px solid #ccc; padding: 4px 8px; border-radius: 4px;">✏️ Update</button>
                            <button onclick="deleteMenu(${menu.menuId})" style="background-color: #e74c3c; color: white; border: none; padding: 4px 8px; border-radius: 4px;">🗑 Delete</button>

                        </div>
                    </div>
                `;

                menuListDiv.appendChild(menuCard);
            });
        })
        .catch(error => {
            console.error('Error loading menus:', error);
            const menuListDiv = document.getElementById('menuList');
            menuListDiv.innerHTML = '<p>Error loading menus. Please try again later.</p>';
        });
}

function updateMenu(menuId) {
    const restaurantId = localStorage.getItem('restaurantId');
    const token = localStorage.getItem('jwtToken');

    fetch(`http://localhost:8080/api/menu/${restaurantId}/menus`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(menus => {
            const foundMenu = menus.find(m => m.menuId === menuId);
            if (foundMenu) {
                openMenuPopup(foundMenu); // sadece popup'ı aç, save'e elleme
            } else {
                alert("❌ Menu not found.");
            }
        })
        .catch(err => {
            console.error("Error loading menu:", err);
            alert("❌ Failed to fetch menu for editing.");
        });
}

function deleteMenu(menuId) {
    const restaurantId = localStorage.getItem('restaurantId');
    const token = localStorage.getItem('jwtToken');

    const confirmDelete = confirm("Are you sure you want to delete this menu?");
    if (!confirmDelete) return;

    fetch(`http://localhost:8080/api/menu/${restaurantId}/delete/${menuId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(result => {
            if (result.success) {
                alert("✅ " + result.detail);
                loadMenus();
            } else {
                alert("❌ " + result.detail);
            }
        })
        .catch(error => {
            console.error("Error deleting menu:", error);
            alert("❌ Failed to delete menu.");
        });
}

let existingProducts = [];
let editedProductId = null; // ✅ Update mi Create mi kontrolü için
function toggleProductAvailability(productId, newStatus) {
    const restaurantId = localStorage.getItem("restaurantId");
    const token = localStorage.getItem("jwtToken");

    fetch(`http://localhost:8080/api/product/${restaurantId}/toggle-stock/${productId}`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert(`✅ ${data.detail}`);
                loadMenus();
            } else {
                alert(`❌ ${data.detail}`);
                // Geri alma işlemi: checkbox'u tekrar eski haline döndür
                document.querySelector(`input[data-product-id="${productId}"]`).checked = !newStatus;
            }
        })
        .catch(err => {
            alert("❌ Network error!");
            console.error(err);
            document.querySelector(`input[data-product-id="${productId}"]`).checked = !newStatus;
        });
}

function loadRestaurantMenu() {
    const restaurantId = localStorage.getItem("restaurantId");
    const token = localStorage.getItem("jwtToken");

    fetch(`http://localhost:8080/api/product/${restaurantId}/products`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(products => {
            const productList = document.getElementById("productList");
            productList.innerHTML = "";

            products.forEach(product => {
                const itemDiv = document.createElement("div");
                itemDiv.className = "menu-item"; // mevcut stilleri kullanıyor

                itemDiv.innerHTML = `
                    <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <div><strong>${product.name}</strong> (${product.category})</div>
                            <div>${product.calories} kcal</div>
                        </div>
                        <label class="switch" style="margin-top: 8px; align-self: flex-start;">
                            <input type="checkbox" ${product.inStock ? "checked" : ""}
                                data-product-id="${product.productId}"
                                onchange="toggleProductAvailability(${product.productId}, this.checked)">
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end;">
                        <div style="font-weight: bold; color: black;">₺${product.price.toFixed(2)}</div>
                        <div style="margin-top: 5px;">
                            <button onclick="editProduct(${product.productId})" style="margin-right: 5px; background-color: #f1f1f1; border: 1px solid #ccc; padding: 4px 8px; border-radius: 4px;">✏️ Update</button>
                            <button onclick="deleteProduct(${product.productId})" style="background-color: #e74c3c; color: white; border: none; padding: 4px 8px; border-radius: 4px;">🗑 Delete</button>
                        </div>
                    </div>
                `;

                productList.appendChild(itemDiv);
            });
        })
        .catch(err => {
            console.error("❌ Error loading products:", err);
        });
}
function deleteProduct(productId) {
    const restaurantId = localStorage.getItem('restaurantId');
    const token = localStorage.getItem('jwtToken');

    if (!restaurantId || !token) {
        alert("Token or restaurant ID missing.");
        return;
    }

    const confirmDelete = confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) {
        return;
    }

    fetch(`http://localhost:8080/api/product/${restaurantId}/delete/${productId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert("✅ " + result.detail);
                loadRestaurantMenu(); // Listeyi yenile
            } else {
                alert("❌ " + result.detail);
            }
        })
        .catch(error => {
            console.error('Error deleting product:', error);
            alert("❌ An unexpected error occurred while deleting.");
        });
}

function openPopup(product = null) {
    document.getElementById('popupForm').style.display = 'block';
    document.getElementById('popupOverlay').style.display = 'block';

    const popupTitle = document.getElementById('popupTitle');
    const saveButton = document.getElementById('saveButton');

    if (product) {
        console.log(product.productId);
        document.getElementById('popupName').value = product.name;
        document.getElementById('popupDesc').value = product.category;
        document.getElementById('popupPrice').value = product.price;
        document.getElementById('popupCalorie').value = product.calories;

        editedProductId = product.productId;
        popupTitle.textContent = "Update Product";
        saveButton.textContent = "Update";
    } else {
        document.getElementById('popupName').value = "";
        document.getElementById('popupDesc').value = "";
        document.getElementById('popupPrice').value = "";
        document.getElementById('popupCalorie').value = "";

        updatingProductId = null;
        popupTitle.textContent = "Add Product";
        saveButton.textContent = "Save";
    }
}

function closePopup() {
    document.getElementById('popupForm').style.display = 'none';
    document.getElementById('popupOverlay').style.display = 'none';
    updatingProductId = null; // ✅ Popup kapatılınca create moda dön
}

function savePopupMenu() {
    const name = document.getElementById('popupName').value.trim();
    const desc = document.getElementById('popupDesc').value.trim();
    const price = parseFloat(document.getElementById('popupPrice').value.trim());
    const calorie = parseFloat(document.getElementById('popupCalorie').value.trim());

    if (!name || !desc || isNaN(price) || isNaN(calorie)) {
        alert('Please fill all the spaces.');
        return;
    }

    const restaurantId = localStorage.getItem('restaurantId');
    const token = localStorage.getItem('jwtToken');

    const productData = {
        name: name,
        category: desc,
        price: price,
        calories: calorie
    };

    if (editedProductId !== null) {
        // Güncelleme modundayız
        fetch(`http://localhost:8080/api/product/${restaurantId}/update/${editedProductId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    alert('✅ Product is successfully updated!.');
                    closePopup();
                    loadRestaurantMenu();
                    editedProductId = null; // Güncelleme bitince sıfırla
                } else {
                    alert('⚠️ Error: ' + result.detail);
                }
            })
            .catch(error => console.error('Error updating product:', error));
    } else {
        // Yeni ürün ekleme modundayız
        const duplicateProduct = existingProducts.find(product =>
            product.name.toLowerCase() === name.toLowerCase() &&
            product.category.toLowerCase() === desc.toLowerCase()
        );

        if (duplicateProduct) {
            alert("❌ This product already exists!");
            return;
        }

        fetch(`http://localhost:8080/api/product/${restaurantId}/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // !! MUTLAKA TOKEN GİTMELİ
            },
            body: JSON.stringify(productData)
        })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    alert('✅ The product is successfully created!.');
                    closePopup();
                    loadRestaurantMenu();
                } else {
                    alert('⚠️ Error: ' + result.detail);
                }
            })
            .catch(error => console.error('Error adding product:', error));
    }
}
function editProduct(productId) {
    const product = existingProducts.find(p => p.productId === productId);
    if (!product) {
        alert('Product not found!');
        return;
    }

    // Popup'ı mevcut bilgilerle doldur
    document.getElementById('popupName').value = product.name;
    document.getElementById('popupDesc').value = product.category;
    document.getElementById('popupPrice').value = product.price;
    document.getElementById('popupCalorie').value = product.calories;

    editedProductId = productId; // Güncellenecek ID'yi setle
    openPopup(product);
}

function toggleRestaurantEdit(showEdit) {
    document.getElementById("restaurantProfileEdit").style.display = showEdit ? "block" : "none";
    document.getElementById("restaurantProfileDisplay").style.display = showEdit ? "none" : "block";
}

/*function loadRestaurantProfile() {
    const restaurantId = localStorage.getItem("restaurantId");
    const token = localStorage.getItem("jwtToken");
    //  HATALARI ÖNLEMEK İÇİN KONTROL EKLİYORUZ
    if (!restaurantId || !token) {
        alert("❌ Restaurant ID veya token eksik. Lütfen tekrar giriş yapın.");
        return;
    }

    fetch(`http://localhost:8080/api/restaurant/${restaurantId}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
    })
        .then(res => res.json())
        .then(data => {
            // Display mode
            document.getElementById("restaurantNameDisplay").textContent = data.name || "-";
            document.getElementById("restaurantOwnerDisplay").textContent = data.owner || "-";
            document.getElementById("restaurantEmailDisplay").textContent = data.mail || "-";
            document.getElementById("restaurantPhoneDisplay").textContent = data.phoneNumber || "-";

            // Edit mode (boş gelirse inputlar boş kalsın)
            document.getElementById("restaurantNameInput").value = data.name ?? "";
            document.getElementById("restaurantPhoneInput").value = data.phoneNumber ?? "";

            // Adresler
            const listDiv = document.getElementById("restaurantAddressList");
            listDiv.innerHTML = "";
            if (data.addresses && data.addresses.length > 0) {
                data.addresses.forEach(addr => {
                    const item = document.createElement("div");
                    item.className = "order-item";
                    item.innerHTML = `
              <div>
                ${addr.street}, Apt ${addr.apartmentNumber}, Floor ${addr.floor}, Flat ${addr.flatNumber}<br>
                ${addr.postalCode} ${addr.city}, ${addr.state}, ${addr.country}
              </div>
              <button onclick="deleteRestaurantAddress(${addr.addressId})" style="background:red;color:white;">🗑</button>
            `;
                    listDiv.appendChild(item);
                });
            } else {
                listDiv.innerHTML = "<p>No address found.</p>";
            }
        })
        .catch(err => {
            console.error("❌ Failed to load restaurant profile", err);
        });
}*/


function updateRestaurantProfile(e) {
    e.preventDefault();
    const restaurantId = localStorage.getItem("restaurantId");
    const token = localStorage.getItem("jwtToken");

    const body = {
        name: document.getElementById("restaurantNameInput").value.trim(),
        phoneNumber: document.getElementById("restaurantPhoneInput").value.trim()
    };

    fetch(`http://localhost:8080/api/restaurant/${restaurantId}/profile/update`, {
        method: 'PUT',
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
    })
        .then(async res => {
            if (res.status === 204) {
                alert("✅ Update successful (no content returned).");
                toggleRestaurantEdit(false);
                loadRestaurantProfile();
                return;
            }

            const result = await res.json();
            alert(result.success ? "✅ " + (result.detail || "Updated.") : "❌ " + (result.detail || "Unknown error."));

            if (result.success) {
                toggleRestaurantEdit(false);
                loadRestaurantProfile();
            }
        })
        .catch(err => {
            console.error("❌ Error updating profile", err);
            alert("❌ An unexpected error occurred while updating profile.");
        });
}

function deleteRestaurantAddress(addressId) {
    const restaurantId = localStorage.getItem("restaurantId");
    const token = localStorage.getItem("jwtToken");

    if (!confirm("Are you sure you want to delete this address?")) return;

    fetch(`http://localhost:8080/api/restaurant/${restaurantId}/profile/delete-address/${addressId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
    })
        .then(res => res.json())
        .then(result => {
            alert(result.success ? "✅ Address deleted." : "❌ " + result.detail);
            if (result.success) loadRestaurantProfile();
        })
        .catch(err => console.error("❌ Delete error", err));
}


window.openPopup = openPopup;
window.closePopup = closePopup;
window.savePopupMenu = savePopupMenu;
window.updateMenu = updateMenu;
window.deleteMenu = deleteMenu;

document.addEventListener('DOMContentLoaded', function () {
    const activeSidebar = document.querySelector('.sidebar-item.active');
    if (activeSidebar && activeSidebar.textContent.trim() === 'Profile') {
        loadRestaurantProfile();
    }
    const signInButton = document.getElementById('signInBtn');
    const popupOverlay = document.getElementById('popupOverlay');
    const popupForm = document.getElementById('popupForm');
    const menuList = document.getElementById('menuList');
    const token = localStorage.getItem('jwtToken');
    const restaurantId = localStorage.getItem("restaurantId");

    function logout() {
        const confirmed = confirm("Are you sure you want to log out?");
        if (confirmed) {
            localStorage.clear();
            window.location.href = "signin.html";
        }
    }

    if (signInButton) {
        signInButton.addEventListener('click', function () {
            if (getUserType() === 'restaurant') {
                const email = document.querySelector('input[placeholder="Enter Username or gmail"]').value.trim();
                const password = document.querySelector('input[placeholder="Enter your password"]').value.trim();

                if (!email || !password) {
                    alert("Please fill in both email and password.");
                    return;
                }

                const data = { mail: email, password: password };

                fetch('http://localhost:8080/api/restaurant/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                })
                    .then(response => response.json())
                    .then(result => {
                        if (result.status === true && result.token && result.token !== "null") {
                            localStorage.setItem('jwtToken', result.token);
                            localStorage.setItem('restaurantId', result.restaurantId);
                            localStorage.setItem('restaurantName',result.name);

                            alert("✅ " + result.detail);
                            window.location.href = "restaurant.html";
                        } else {
                            localStorage.removeItem('jwtToken');
                            alert("❌ " + result.detail);
                        }
                    })
                    .catch(error => {
                        console.error("Error during login:", error);
                        alert("An error occurred while logging in: " + error.message);
                    });
            }else if(getUserType() === 'customer') {
                const email = document.querySelector('input[placeholder="Enter Username or gmail"]').value.trim();
                const password = document.querySelector('input[placeholder="Enter your password"]').value.trim();

                if (!email || !password) {
                    alert("❗ Please fill in both email and password.");
                    return;
                }

                const data = { mail: email, password: password };

                fetch('http://localhost:8080/api/customer/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                })
                    .then(response => response.json())
                    .then(result => {
                        console.log("Customer login response:", result);

                        if (result.status === true && result.token && result.token !== "null") {
                            localStorage.setItem('jwtToken', result.token);
                            localStorage.setItem('customerId', result.customerId);
                            alert("✅ " + result.detail);
                            window.location.href = "customer.html"; // ✅ Customer Home Page'e yönlendirme
                        } else {
                            alert("❌ " + result.detail);
                        }
                    })
                    .catch(error => {
                        console.error("Error during customer login:", error);
                        alert("❌ An error occurred while logging in: " + error.message);
                    });
            }else if (getUserType() === 'admin') {
                const username = document.querySelector('input[placeholder="Enter Username or gmail"]').value.trim();
                const password = document.querySelector('input[placeholder="Enter your password"]').value.trim();

                if (!username || !password) {
                    alert("❗ Please fill in both username and password.");
                    return;
                }

                const data = { username: username, password: password };

                fetch('http://localhost:8080/api/admin/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                })
                    .then(response => response.json())
                    .then(result => {
                        console.log("Admin login response:", result);

                        if (result.status === true && result.token && result.token !== "null") {
                            localStorage.setItem('jwtToken', result.token);
                            alert("✅ " + result.detail);
                            window.location.href = "admin.html";
                        } else {
                            alert("❌ " + result.detail);
                        }
                    })
                    .catch(error => {
                        console.error("Error during admin login:", error);
                        alert("❌ An error occurred while logging in: " + error.message);
                    });
            }else if (getUserType() === 'courier') {
                const email = document.querySelector('input[placeholder="Enter Username or gmail"]').value.trim();
                const password = document.querySelector('input[placeholder="Enter your password"]').value.trim();

                if (!email || !password) {
                    alert("❗ Please fill in both email and password.");
                    return;
                }

                const data = { mail: email, password: password };

                fetch('http://localhost:8080/api/courier/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                })
                    .then(response => response.json())
                    .then(result => {
                        console.log("Courier login response:", result);

                        if (result.status === true && result.token && result.token !== "null") {
                            localStorage.setItem('jwtToken', result.token);
                            localStorage.setItem('courierId', result.courierId);
                            alert("✅ " + result.detail);
                            window.location.href = "courier.html"; // ✅ Courier ana sayfasına yönlendir
                        } else {
                            alert("❌ " + result.detail);
                        }
                    })
                    .catch(error => {
                        console.error("Error during courier login:", error);
                        alert("❌ An error occurred while logging in: " + error.message);
                    });
            }


        });
    }

    const signUpButton = document.querySelector('.sign-up-btn');
    if (signUpButton) {
        signUpButton.addEventListener('click', function () {
            const email = document.querySelector('input[placeholder="Enter your email address"]').value.trim();
            const password = document.querySelector('input[placeholder="Enter your password"]').value.trim();
            const verifyPassword = document.querySelector('input[placeholder="Enter your password for verification"]').value.trim();
            if (!email || !password || !verifyPassword) {
                alert("❗Please fill all the spaces.");
                return;
            }
            if (!email.endsWith('@gmail.com') && !email.endsWith('@hotmail.com')) {
                alert("❗ Please enter a valid mail address (gmail.com veya hotmail.com).");
                return;
            }

            if (password !== verifyPassword) {
                alert("❗ Passwords do not match.");
                return;
            }
            if (getUserType() === 'restaurant') {
                const restaurantNameInput = document.querySelector('input[placeholder="Restaurant Name"]');
                const ownerNameInput = document.querySelector('input[placeholder="Owner Name"]');
                const isRestaurantSignUp = restaurantNameInput !== null && ownerNameInput !== null;

                if (!email || !password || !verifyPassword) {
                    alert("❗Please fill all the spaces.");
                    return;
                }

                if (password !== verifyPassword) {
                    alert("❗Passwords do not match.");
                    return;
                }

                if (isRestaurantSignUp) {
                    const restaurantName = restaurantNameInput.value.trim();
                    const ownerName = ownerNameInput.value.trim();

                    if (!restaurantName || !ownerName) {
                        alert("Restaurant owner and name cannot be empty.");
                        return;
                    }

                    const data = {
                        name: restaurantName,
                        owner: ownerName,
                        mail: email,
                        password: password,
                        passwordVerification: verifyPassword
                    };

                    fetch('http://localhost:8080/api/restaurant/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    })
                        .then(response => response.json())
                        .then(result => {
                            if (result.status === true) {
                                localStorage.setItem('jwtToken', result.token);
                                localStorage.setItem('restaurantId', result.restaurantId);
                                localStorage.setItem('restaurantName',result.name);
                                alert("✅ " + result.detail);
                                window.location.href = "restaurant.html";
                            } else {
                                localStorage.setItem('jwtToken', null);
                                alert("❌ " + result.detail);
                            }
                        })
                        .catch(error => {
                            console.error(error);
                            alert("An error occurred while connecting to the server: " + error.message);
                        });
                } else {
                    alert("Normal user registration is not defined yet.");
                }
            }else if (getUserType() === 'customer') {
                const username = document.getElementById('usernameInput').value.trim();

                if (!username) {
                    alert("❗ Please enter a valid username.");
                    return;
                }

                const data = {
                    name: username,
                    mail: email,
                    password: password,
                    passwordVerification: verifyPassword
                };

                fetch('http://localhost:8080/api/customer/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                })
                    .then(response => response.json())
                    .then(result => {
                        console.log("Customer signup response:", result);
                        if (result.status === true) {
                            localStorage.setItem('jwtToken', result.token);
                            localStorage.setItem('customerId', result.customerId);
                            alert("✅ " + result.detail);
                            window.location.href = "customer.html";
                        } else {
                            alert("❌ " + result.detail);
                        }
                    })
                    .catch(error => {
                        console.error('Signup error:', error);
                        alert("❌ An unexpected error occurred.");
                    });
            }else if (getUserType() === 'courier') {
                const username = document.getElementById('usernameInput').value.trim();

                if (!username) {
                    alert("❗ Please enter a valid username.");
                    return;
                }

                const data = {
                    name: username,
                    mail: email,
                    password: password,
                    passwordVerification: verifyPassword
                };

                fetch('http://localhost:8080/api/courier/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                })
                    .then(response => response.json())
                    .then(result => {
                        console.log("Courier signup response:", result);
                        if (result.status === true) {
                            localStorage.setItem('jwtToken', result.token);
                            localStorage.setItem('courierId', result.courierId);
                            alert("✅ " + result.detail);
                            window.location.href = "courier.html"; // ✅ Courier ana sayfasına yönlendir
                        } else {
                            alert("❌ " + result.detail);
                        }
                    })
                    .catch(error => {
                        console.error('Signup error:', error);
                        alert("❌ An unexpected error occurred.");
                    });
            }



        });
    }

    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.addEventListener('click', () => {
            const text = item.textContent.trim();
            switch (text) {
                case 'Home': window.location.href = 'restaurant.html'; break;
                case 'Orders': window.location.href = 'restaurant_orders.html'; break;
                case 'Menu': window.location.href = 'menu.html'; break;
                case 'Reviews': window.location.href = 'restaurant_reviews.html'; break;
                case 'Logout': logout(); break;
                default: break;
            }
        });
    });

    if (popupOverlay) {
        popupOverlay.addEventListener('click', closePopup);
        popupOverlay.addEventListener('click', closeMenuPopup);

    }

    function openPopup(product = null) {
        const popupForm = document.getElementById('popupForm');
        const popupOverlay = document.getElementById('popupOverlay');
        const popupTitle = popupForm.querySelector('h3'); // <h3> başlığı seçiyoruz

        if (popupForm && popupOverlay) {
            popupForm.style.display = 'block';
            popupOverlay.style.display = 'block';

            if (product) {
                // Eğer bir ürün gönderilmişse (Güncelleme Modu)
                popupTitle.textContent = "Update Product";

                document.getElementById('popupName').value = product.name;
                document.getElementById('popupDesc').value = product.category;
                document.getElementById('popupPrice').value = product.price;
                document.getElementById('popupCalorie').value = product.calories;
            } else {
                // Eğer yeni ürün eklenecekse (Create Modu)
                popupTitle.textContent = "Add Product";

                document.getElementById('popupName').value = "";
                document.getElementById('popupDesc').value = "";
                document.getElementById('popupPrice').value = "";
                document.getElementById('popupCalorie').value = "";
            }
        }
    }


    function closePopup() {
        if (popupForm && popupOverlay) {
            popupForm.style.display = 'none';
            popupOverlay.style.display = 'none';
        }
    }

    window.openPopup = openPopup;
    window.closePopup = closePopup;


    const statusToggle = document.getElementById("restaurantStatusToggle");
    const statusLabel = document.getElementById("statusLabel");

    // Varsayılan olarak açık (toggle checked)
    statusToggle.checked = true;
    statusLabel.textContent = "Status: Open";
    statusLabel.style.color = "#155724";

    statusToggle.addEventListener("change", function () {
        fetch(`http://localhost:8080/api/restaurant/${restaurantId}/status-toggle`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    if (data.detail.includes("OPEN")) {
                        statusLabel.textContent = "Status: Open";
                        statusLabel.style.color = "#155724";
                        statusToggle.checked = true;
                    } else {
                        statusLabel.textContent = "Status: Closed";
                        statusLabel.style.color = "#721c24";
                        statusToggle.checked = false;
                    }
                } else {
                    alert("❌ Error toggling status: " + data.detail);
                    // toggle'ı geri çevir
                    statusToggle.checked = !statusToggle.checked;
                }
            })
            .catch(err => {
                alert("❌ Network error");
                statusToggle.checked = !statusToggle.checked;
                console.error(err);
            });
    });

});

function loadRestaurantProfile() {
    const token = localStorage.getItem("jwtToken");
    const restaurantId = localStorage.getItem("restaurantId");

    fetch(`http://localhost:8080/api/restaurant/${restaurantId}/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
        .then(res => res.json())
        .then(data => {
            // Ad - Telefon - Puan
            document.getElementById("restaurantDisplayName").textContent = data.name || "-";
            document.getElementById("restaurantDisplayPhone").textContent = data.phoneNumber || "-";
            document.getElementById("restaurantDisplayRating").textContent = data.overAllRating != null ? `${data.overAllRating.toFixed(1)} / 5` : "-";

            document.getElementById("restaurantUpdateName").value = data.name || "";
            document.getElementById("restaurantUpdatePhone").value = data.phoneNumber || "";

            // Açık mı kontrolü
            const isOpen = data.open === true;
            const toggle = document.getElementById("restaurantStatusToggle");
            const label = document.getElementById("statusLabel");

            toggle.checked = isOpen;
            label.textContent = `Status: ${isOpen ? "Open" : "Closed"}`;

            // Adres bilgisi
            const container = document.getElementById("restaurantAddressContainer");
            container.innerHTML = "";

            const addr = data.address;
            if (addr && addr.street) {
                const div = document.createElement("div");
                div.className = "info-box";
                div.innerHTML = `
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <strong>Address</strong>
                    <div style="display: flex; gap: 8px;">
                      <button class="edit-btn" onclick='editRestaurantAddress(${JSON.stringify(addr)})'>✏️</button>
                      <button class="delete-circle-btn" onclick="deleteRestaurantAddress(${addr.addressId})">🗑</button>
                    </div>
                  </div>
                  <p>${addr.street} Apt: ${addr.apartmentNumber}, Floor: ${addr.floor}, Flat: ${addr.flatNumber}</p>
                  <p>${addr.postalCode} ${addr.city}, ${addr.state}, ${addr.country}</p>
                `;
                container.appendChild(div);
            } else {
                container.innerHTML = "<p>No address found.</p>";
            }
        })
        .catch(err => {
            console.error("❌ Failed to load restaurant profile:", err);
            alert("Failed to load restaurant profile.");
        });
}

document.getElementById("editRestaurantProfileBtn").addEventListener("click", () => {
    document.getElementById("restaurantProfileDisplay").style.display = "none";
    document.getElementById("restaurantProfileEdit").style.display = "block";
});

document.getElementById("updateRestaurantProfileForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const token = localStorage.getItem("jwtToken");
    const restaurantId = localStorage.getItem("restaurantId");

    const body = {
        name: document.getElementById("restaurantUpdateName").value,
        phoneNumber: document.getElementById("restaurantUpdatePhone").value
    };

    fetch(`http://localhost:8080/api/restaurant/${restaurantId}/profile/update`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body)
    })
        .then(res => res.json())
        .then(result => {
            alert(result.detail);
            if (result.success) {
                loadRestaurantProfile();
                document.getElementById("restaurantProfileEdit").style.display = "none";
                document.getElementById("restaurantProfileDisplay").style.display = "block";
            }else if(result.detail.includes("no change.")) {
                loadRestaurantProfile();
                document.getElementById("restaurantProfileEdit").style.display = "none";
                document.getElementById("restaurantProfileDisplay").style.display = "block";
            }
        });
});

document.getElementById("toggleRestaurantAddressFormBtn").addEventListener("click", () => {
    document.getElementById("restaurantAddressFormSection").style.display = "block";
});

document.getElementById("cancelRestaurantAddressBtn").addEventListener("click", () => {
    document.getElementById("restaurantAddressFormSection").style.display = "none";
    document.getElementById("addRestaurantAddressForm").reset();
});

document.getElementById("addRestaurantAddressForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const restaurantId = localStorage.getItem("restaurantId");
    const token = localStorage.getItem("jwtToken");

    const body = {
        country: document.getElementById("restAddressCountry").value.trim(),
        city: document.getElementById("restAddressCity").value.trim(),
        state: document.getElementById("restAddressState").value.trim(),
        street: document.getElementById("restAddressStreet").value.trim(),
        apartmentNumber: document.getElementById("restAddressApartment").value.trim(),
        floor: document.getElementById("restAddressFloor").value.trim(),
        flatNumber: document.getElementById("restAddressFlat").value.trim(),
        postalCode: document.getElementById("restAddressPostal").value.trim()
    };

    const isEdit = editingRestaurantAddressId !== null;
    const url = isEdit
        ? `http://localhost:8080/api/restaurant/${restaurantId}/profile/update-address/${editingRestaurantAddressId}`
        : `http://localhost:8080/api/restaurant/${restaurantId}/profile/add-address`;
    const method = isEdit ? "PUT" : "POST";
    if (method === "POST") {
        document.getElementById("submitRestaurantAddressBtn").textContent = "Add Address";
    }
    fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(body)
    })
        .then(res => res.json())
        .then(response => {
            if (response.success === false) {
                alert("❌ " + response.detail); // örn: "Address not found."
            } else {
                alert("✅ Address saved successfully!");
                document.getElementById("addRestaurantAddressForm").reset();
                document.getElementById("restaurantAddressFormSection").style.display = "none";
                editingRestaurantAddressId = null;
                loadRestaurantProfile();
            }
        })
        .catch(err => {
            console.error("❌ Error saving address:", err);
            alert("❌ An unexpected error occurred.");
        });
});


function editRestaurantAddress(addr) {
    // Adres formunu göster
    document.getElementById("restaurantAddressFormSection").style.display = "block";

    // Alanları doldur
    document.getElementById("restAddressCountry").value = addr.country || "";
    document.getElementById("restAddressCity").value = addr.city || "";
    document.getElementById("restAddressState").value = addr.state || "";
    document.getElementById("restAddressStreet").value = addr.street || "";
    document.getElementById("restAddressApartment").value = addr.apartmentNumber || "";
    document.getElementById("restAddressFloor").value = addr.floor || "";
    document.getElementById("restAddressFlat").value = addr.flatNumber || "";
    document.getElementById("restAddressPostal").value = addr.postalCode || "";

    // Güncelleme için ID'yi kaydet
    editingRestaurantAddressId = addr.addressId;

    // Buton adını güncelle
    document.getElementById("submitRestaurantAddressBtn").textContent = "Update Address";
}

function updateOrderStatus(orderId, newStatus) {
    const restaurantId = localStorage.getItem("restaurantId");
    const token = localStorage.getItem("jwtToken");

    fetch(`http://localhost:8080/api/restaurant/${restaurantId}/order/${orderId}/update-status`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ newStatus })
    })
    .then(res => res.json())
    .then(result => {
        if (result.success) {
            alert(`✅ ${result.detail}`);
            location.reload(); // Sayfayı tamamen yeniler
        } else {
            alert(`❌ ${result.detail}`);
        }
    })
    .catch(err => {
        console.error("❌ Failed to update order status:", err);
        alert("❌ Network error.");
    });
}
function loadRestaurantReviews() {
    const restaurantId = localStorage.getItem("restaurantId");
    const token = localStorage.getItem("jwtToken");

    fetch(`http://localhost:8080/api/restaurant/${restaurantId}/profile/rates-and-reviews`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
    })
        .then(res => res.json())
        .then(data => {
            const reviews = data.reviews || [];
            const overall = data.overallRating || "-";
            const listContainer = document.getElementById("restaurantReviewsList");
            const overallBox = document.getElementById("overallRatingBox");

            overallBox.innerHTML = `⭐ Overall Rating: <strong>${overall}</strong>`;
            listContainer.innerHTML = "";

            if (!reviews.length) {
                listContainer.innerHTML = "<p>No reviews yet.</p>";
                return;
            }

            reviews.forEach(r => {
                const card = document.createElement("div");
                card.className = "menu-item";
                const date = new Date(r.createdAt).toLocaleString();

                card.innerHTML = `
          <div>
            <p><strong>${r.customerName}</strong> (${date})</p>
            <p>⭐ Rating: ${r.rating}/5</p>
            <p>${r.review}</p>
          </div>
        `;
                listContainer.appendChild(card);
            });
        })
        .catch(err => {
            console.error("Failed to load reviews:", err);
            document.getElementById("restaurantReviewsList").innerHTML = "<p>❌ Error loading reviews.</p>";
        });
}
function showSection(sectionId) {
    document.querySelectorAll('.content-area > div').forEach(div => div.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';

    if (sectionId === 'reviewsSection') {
        loadRestaurantReviews();
    }
}

