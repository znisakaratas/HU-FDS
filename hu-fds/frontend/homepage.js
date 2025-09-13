let allHomeMenus = [];
let allHomeProducts = [];
let allRestaurants = [];



document.addEventListener('DOMContentLoaded', function() {
    loadHomePageProducts();
    loadHomeMenus();

    function loadHomePageProducts() {
        fetch('http://localhost:8080/api/customer/homepage/products', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) throw new Error("Failed to load homepage products.");
                return response.json();
            })
            .then(products => {
                allHomeProducts = products;
                renderHomeProducts(allHomeProducts);
            })
            .catch(error => {
                console.error('Error fetching homepage products:', error);
                const productsContainer = document.getElementById('productsContainer');
                productsContainer.innerHTML = `<p>Error loading products. Please try again later.</p>`;
            });
    }
    function loadHomeMenus() {
        fetch('http://localhost:8080/api/customer/homepage/menus')
            .then(response => {
                if (!response.ok) throw new Error("Failed to load homepage menus.");
                return response.json();
            })
            .then(menus => {
                allHomeMenus = menus;
                renderHomeMenus(allHomeMenus);
            })
            .catch(error => {
                console.error('Error fetching homepage menus:', error);
                const menusContainer = document.getElementById('menusContainer');
                menusContainer.innerHTML = `<p>Error loading menus. Please try again later.</p>`;
            });
    }

    // Auth butonlarına event listener ekle
    document.querySelector('.sign-up').addEventListener('click', function() {
        window.location.href = 'signup.html';
    });

    document.querySelector('.sign-in').addEventListener('click', function() {
        window.location.href = 'signin.html';
    });
    loadPopularRestaurants();


});
function filterProducts() {
    const text = document.getElementById('productSearchInput')?.value.toLowerCase() || '';
    const category = document.getElementById('categoryFilter')?.value.toLowerCase() || '';
    const minPrice = parseFloat(document.getElementById('minPrice')?.value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPrice')?.value) || Number.MAX_VALUE;
    const minCalories = parseFloat(document.getElementById('minCalories')?.value) || 0;
    const maxCalories = parseFloat(document.getElementById('maxCalories')?.value) || Number.MAX_VALUE;

    const filtered = allHomeProducts.filter(p => {
        return (
            p.inStock &&
            p.restaurant.open &&

            (p.name.toLowerCase().includes(text) ||
                p.category.toLowerCase().includes(text) ||
                p.restaurant.name.toLowerCase().includes(text)) &&

            (!category || p.category.toLowerCase() === category) &&
            p.price >= minPrice && p.price <= maxPrice &&
            p.calories >= minCalories && p.calories <= maxCalories
        );
    });

    renderHomeProducts(filtered);
}
function filterMenus() {
    const text = document.getElementById('menuSearchInput')?.value.toLowerCase() || '';
    const category = document.getElementById('menuCategoryFilter')?.value.toLowerCase() || '';
    const minPrice = parseFloat(document.getElementById('menuMinPrice')?.value) || 0;
    const maxPrice = parseFloat(document.getElementById('menuMaxPrice')?.value) || Number.MAX_VALUE;
    const minCalories = parseFloat(document.getElementById('menuMinCalories')?.value) || 0;
    const maxCalories = parseFloat(document.getElementById('menuMaxCalories')?.value) || Number.MAX_VALUE;

    const filtered = allHomeMenus.filter(menu =>
        menu.inStock &&
        menu.restaurant.open &&

        (menu.name.toLowerCase().includes(text) ||
            menu.category.toLowerCase().includes(text) ||
            menu.restaurant.name.toLowerCase().includes(text) ||
            menu.products.some(p => p.name.toLowerCase().includes(text))) &&

        (!category || menu.category.toLowerCase() === category) &&
        menu.price >= minPrice && menu.price <= maxPrice &&
        menu.calories >= minCalories && menu.calories <= maxCalories
    );

    renderHomeMenus(filtered);
}


function renderHomeMenus(menus) {
    const menusContainer = document.getElementById('menusContainer');
    menusContainer.innerHTML = '';

    if (!menus.length) {
        menusContainer.innerHTML = `<p>No menus found.</p>`;
        return;
    }

    menus.forEach(menu => {
        const menuCard = document.createElement('div');
        menuCard.className = 'menu-card';

        let imageUrl;
        const cat = menu.category.toLowerCase();
        if (cat === 'snacks') imageUrl = './images/snack.png';
        else if (cat === 'breakfast') imageUrl = './images/breakfast.png';
        else if (cat === 'burger') imageUrl = './images/burgermenu.jpg';
        else if (cat === 'steak' || cat ==='meat') imageUrl = './images/steak.jpg';
        else imageUrl = './images/default.jpg';

        const productNames = menu.products.map(p => p.name).join(', ');

        const isOpen = menu.restaurant.open;
        const inStock = menu.inStock;

        let footerContent = '';
        if (!isOpen) {
            footerContent = `<div style="color: gray; font-weight: bold;">🔒 Restaurant Closed</div>`;
            menuCard.style.opacity = '0.5';
        } else if (!inStock) {
            footerContent = `<div style="color: red; font-weight: bold;">❌ Unavailable</div>`;
            menuCard.style.opacity = '0.6';
        } else {
            footerContent = `<div class="menu-card-price">₺${menu.price.toFixed(2)}</div>`;
        }

        menuCard.innerHTML = `
            <img src="${imageUrl}" alt="${menu.name}">
            <div class="menu-card-content">
                <strong>${menu.name}</strong>
                <p>Category: ${menu.category}</p>
                <p>Includes: ${productNames}</p>
                <p>Calories: ${menu.calories} kcal</p>
                <p><em>Restaurant: ${menu.restaurant.name}</em></p>
            </div>
            ${footerContent}
        `;

        menusContainer.appendChild(menuCard);
    });
}
function renderHomeProducts(products) {
    const productsContainer = document.getElementById('productsContainer');
    productsContainer.innerHTML = '';

    if (!products.length) {
        productsContainer.innerHTML = `<p>No products found.</p>`;
        return;
    }

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'menu-card';

        let imageUrl;
        const cat = product.category.toLowerCase();
        if (cat === 'beverage') imageUrl = './images/beverage.png';
        else if (['snack', 'atıştırmalık'].includes(cat)) imageUrl = './images/snack.png';
        else if (['kebab', 'kebap'].includes(cat)) imageUrl = './images/kebab.png';
        else if (cat === 'coffee') imageUrl = './images/coffee.png';
        else if (cat === 'italian') imageUrl = './images/italian.png';
        else if (cat === 'breakfast') imageUrl = './images/breakfast.png';
        else if (cat === 'burger') imageUrl = './images/burger.jpg';
        else if (cat === 'steak' || cat ==='meat') imageUrl = './images/steak.jpg';
        else imageUrl = './images/default.jpg';

        const isOpen = product.restaurant.open;
        const inStock = product.inStock;

        let footerContent = '';
        if (!isOpen) {
            footerContent = `<div style="color: gray; font-weight: bold;">🔒 Restaurant Closed</div>`;
            productCard.style.opacity = '0.5';
        } else if (!inStock) {
            footerContent = `<div style="color: red; font-weight: bold;">❌ Unavailable</div>`;
            productCard.style.opacity = '0.6';
        } else {
            footerContent = `<div class="menu-card-price">₺${product.price.toFixed(2)}</div>`;
        }

        productCard.innerHTML = `
            <img src="${imageUrl}" alt="${product.name}">
            <div class="menu-card-content">
                <strong>${product.name}</strong>
                <p>Category: ${product.category}</p>
                <p>Calories: ${product.calories} kcal</p>
                <p><em>Restaurant: ${product.restaurant.name}</em></p>
            </div>
            ${footerContent}
        `;

        productsContainer.appendChild(productCard);
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
        <div class="product-card">
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
    overlay.id = "blur-overlay";
    overlay.style.position = "fixed";
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backdropFilter = "blur(6px)";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
    overlay.style.zIndex = 999;

    const modal = document.createElement("div");
    modal.id = "review-modal";
    modal.style.position = "fixed";
    modal.style.top = "50%";
    modal.style.left = "50%";
    modal.style.transform = "translate(-50%, -50%)";
    modal.style.backgroundColor = "#fff";
    modal.style.padding = "2rem";
    modal.style.borderRadius = "12px";
    modal.style.boxShadow = "0 4px 20px rgba(0,0,0,0.25)";
    modal.style.zIndex = 1000;
    modal.style.maxHeight = "70vh";
    modal.style.overflowY = "auto";
    modal.style.width = "90%";
    modal.style.maxWidth = "500px";

    let html = `<h3 style="margin-bottom: 1rem;">Reviews</h3><ul style="list-style:none; padding: 0;">`;
    for (const r of reviews) {
        html += `
          <li style="margin-bottom: 1rem; padding: 0.5rem 0; border-bottom: 1px solid #ddd;">
            <strong>${r.customerName}</strong> - ⭐ ${r.rating}<br/>
            <span>${r.review}</span>
          </li>
        `;
    }
    html += `</ul><button onclick="closeReviewModal()" class="btn" style="margin-top: 1rem;">Close</button>`;
    modal.innerHTML = html;

    document.body.appendChild(overlay);
    document.body.appendChild(modal);
}

function closeReviewModal() {
    document.getElementById('review-modal')?.remove();
    document.getElementById('blur-overlay')?.remove();
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
function renderRestaurants(showAll = false) {
    currentShowAll = showAll;
    const container = document.getElementById("popularRestaurantsContainer");
    const seeAllBtnId = "toggleRestaurantViewBtn";

    container.innerHTML = '';

    const searchValue = document.getElementById("restaurantSearchInput")?.value.toLowerCase() || '';
    let filtered = allRestaurants.filter(r =>
        r.name.toLowerCase().includes(searchValue)
    );

    const toRender = showAll ? filtered : filtered.slice(0, 5);
    toRender.forEach(r => container.innerHTML += createRestaurantCard(r));

    let toggleBtn = document.getElementById(seeAllBtnId);
    if (!toggleBtn) {
        toggleBtn = document.createElement("button");
        toggleBtn.id = seeAllBtnId;
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

function filterRestaurants() {
    renderRestaurants(currentShowAll);
}
