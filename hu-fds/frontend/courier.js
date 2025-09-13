document.addEventListener("DOMContentLoaded", () => {
    const courierId = localStorage.getItem("courierId");
    const token = localStorage.getItem("jwtToken");

    if (!courierId || !token) {
        alert("Missing authentication. Please log in again.");
        window.location.href = "signin.html";
        return;
    }

    // Load courier profile
    fetch(`http://localhost:8080/api/courier/${courierId}/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById("courierName").textContent = data.name || "-";
        document.getElementById("courierEmail").textContent = data.mail || "-";
        const statusSpan = document.getElementById("courierStatus");
        if (data.online) {
            statusSpan.textContent = "Online";
            statusSpan.classList.remove("status-offline");
            statusSpan.classList.add("status-online");
            document.getElementById("statusToggle").checked = true;
        } else {
            statusSpan.textContent = "Offline";
            statusSpan.classList.remove("status-online");
            statusSpan.classList.add("status-offline");
            document.getElementById("statusToggle").checked = false;
        }
    })
    .catch(err => {
        alert("❌ Failed to load profile.");
        console.error(err);
    });

    const statusLabel = document.getElementById("statusLabel");

document.getElementById("statusToggle").addEventListener("change", function () {
    const toggle = document.getElementById("statusToggle");
    const statusLabel = document.getElementById("statusLabel");
    const statusText = document.getElementById("courierStatus");

    fetch(`http://localhost:8080/api/courier/${courierId}/status-toggle`, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(data => {
        const success = data.status;
        const message = data.detail || "";

        if (!success) {
            alert("❌ " + message);
            toggle.checked = !toggle.checked; // Revert toggle
            return;
        }

        const nowOnline = toggle.checked;

        if (nowOnline) {
            // UI Updates for Online
            statusLabel.textContent = "Status: Open";
            statusLabel.classList.remove("status-offline-label");
            statusLabel.classList.add("status-online-label");

            statusText.textContent = "Online";
            statusText.classList.remove("status-offline");
            statusText.classList.add("status-online");
        } else {
            // UI Updates for Offline
            statusLabel.textContent = "Status: Closed";
            statusLabel.classList.remove("status-online-label");
            statusLabel.classList.add("status-offline-label");

            statusText.textContent = "Offline";
            statusText.classList.remove("status-online");
            statusText.classList.add("status-offline");
        }
    })
    .catch(err => {
        alert("❌ Network error while changing status.");
        console.error(err);
        toggle.checked = !toggle.checked; // Revert toggle
    });
});


    loadOrders();
    goTo("profile");
});

// ===========================
// Modular Status Functions
// ===========================

// Check courier status and toggle online if offline
function ensureCourierOnline() {
    const courierId = localStorage.getItem("courierId");
    const token = localStorage.getItem("jwtToken");

    return fetch(`http://localhost:8080/api/courier/${courierId}/profile`, {
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(profile => {
        if (!profile.online) {
            return fetch(`http://localhost:8080/api/courier/${courierId}/toggle-status`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => {
                console.log("Courier went online:", data.detail);
            });
        }
    });
}

// Only updates order status
function updateOrderStatusOnly(orderId, newStatus) {
    const courierId = localStorage.getItem("courierId");
    const token = localStorage.getItem("jwtToken");

    return fetch(`http://localhost:8080/api/courier/${courierId}/order/${orderId}/update-status`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ newStatus })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert(data.detail);
            loadOrders();
        } else {
            alert("❌ Failed: " + data.detail);
        }
    })
    .catch(err => {
        console.error("❌ Error updating order:", err);
        alert("Something went wrong.");
    });
}

// Call both functions in order
function updateCourierAndOrderStatus(orderId, currentStatus, newStatus) {
    const allowedTransitions = {
        "READY": "DELIVERING",
        "DELIVERING": "DELIVERED"
    };

    const current = currentStatus?.toUpperCase().trim();
    const next = newStatus?.toUpperCase().trim();

    if (allowedTransitions[current] !== next) {
        alert("❌ Failed: Courier can only update to DELIVERING or DELIVERED.");
        return;
    }

    ensureCourierOnline()
        .then(() => updateOrderStatusOnly(orderId, next));
}


// ===========================
// Utility UI Functions
// ===========================

function logout() {
    localStorage.removeItem("courierId");
    localStorage.removeItem("jwtToken");
    window.location.href = "signin.html";
}

function loadOrders() {
    const courierId = localStorage.getItem("courierId");
    const token = localStorage.getItem("jwtToken");

    fetch(`http://localhost:8080/api/courier/${courierId}/orders/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(renderOrders)
    .catch(err => {
        document.getElementById("orderList").innerHTML = "<p>❌ Failed to load orders.</p>";
        console.error(err);
    });
}

function renderOrders(orders) {
    const orderList = document.getElementById("orderList");
    orderList.innerHTML = "";

    if (!orders || orders.length === 0) {
        orderList.innerHTML = "<p>No orders found.</p>";
        return;
    }

    orders.forEach(order => {
        const div = document.createElement("div");
        div.className = "order-card";

        const status = order.status?.toUpperCase().trim(); // Normalize status

        const statusClass =
            status === "DELIVERED" ? "status-online" :
            status === "CANCELLED" ? "status-offline" : "";

        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin-bottom: 0;">Order #${order.orderId}</h3>
                <span class="${statusClass}" style="font-weight: bold;">${status}</span>
            </div>

            <p><strong>Restaurant:</strong> ${order.restaurantName}</p>
            <p><strong>Items:</strong> ${order.itemNames.join(", ")}</p>
            <p><strong>Address:</strong><br>
                ${order.address.street}, ${order.address.city}, ${order.address.state}</p>
            <p><strong>Created:</strong> ${new Date(order.createdAt).toLocaleString()}</p>

            <div style="margin-top: 10px;">
                ${status === 'READY' ? `
                    <button class="btn-action" onclick="updateCourierAndOrderStatus(${order.orderId}, '${status}', 'DELIVERING')">
                        Set to DELIVERING
                    </button>` : ''}

                ${status === 'DELIVERING' ? `
                    <button class="btn-action" onclick="updateCourierAndOrderStatus(${order.orderId}, '${status}', 'DELIVERED')">
                        Set to DELIVERED
                    </button>` : ''}
            </div>
        `;

        orderList.appendChild(div);
    });
}


function goTo(section) {
    const profileSection = document.getElementById("profileSection");
    const ordersSection = document.getElementById("ordersSection");

    if (section === "profile") {
        profileSection.style.display = "block";
        ordersSection.style.display = "none";
    } else if (section === "orders") {
        profileSection.style.display = "none";
        ordersSection.style.display = "block";
    }

    const items = document.querySelectorAll(".sidebar-item");
    items.forEach(item => item.classList.remove("active"));
    if (section === "profile") items[0].classList.add("active");
    if (section === "orders") items[1].classList.add("active");
}

function updateCourierProfile() {
    const courierId = localStorage.getItem("courierId");
    const token = localStorage.getItem("jwtToken");

    const name = document.getElementById("editName").value.trim() || null;
    const ageInput = document.getElementById("editAge").value;
    const age = ageInput !== "" ? parseInt(ageInput, 10) : null;
    const telephone = document.getElementById("editPhone").value.trim() || null;

    // Optional: Frontend phone validation
    const phoneRegex = /^0\d{3} \d{3} \d{2} \d{2}$/;
    if (telephone && !phoneRegex.test(telephone)) {
        alert("❌ Phone number must be in format: 0XXX XXX XX XX.");
        return;
    }

    const payload = {
        name,
        age,
        telephoneNumber: telephone
    };

    fetch(`http://localhost:8080/api/courier/${courierId}/profile/update`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.status) {
            alert("✅ " + data.detail);
            location.reload(); // Refresh to show updated profile
        } else {
            alert("❌ " + data.detail);
        }
    })
    .catch(err => {
        alert("❌ Error updating profile.");
        console.error(err);
    });
}
