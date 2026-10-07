// ============================================================
// SANTA SAYS HI
// MAIN SHOP SCRIPT - STEP 7 POLISH
// ============================================================


// ============================================================
// BACKEND
// ============================================================

const API_URL = "http://localhost:8080/api/products";
const ORDER_API_URL = "http://localhost:8080/api/orders";

// Seller WhatsApp
const SELLER_WHATSAPP = "254719573665";


// ============================================================
// GLOBAL STATE
// ============================================================

let products = [];
let cart = [];

let currentCategory = "All";
let currentSearch = "";


// ============================================================
// START SHOP
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    loadCart();

    setupSearch();

    loadProducts();

    updateCartUI();
});


// ============================================================
// LOAD PRODUCTS
// ============================================================

async function loadProducts() {

    const productGrid =
        document.getElementById("product-grid");

    if (!productGrid) {
        console.error("Product grid not found.");
        return;
    }

    // Loading state
    productGrid.innerHTML = `
        <div class="loading-message">
            Loading products...
        </div>
    `;

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(
                `Server returned ${response.status}`
            );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Invalid product data received.");
        }

        products = data;

        renderProducts();

    } catch (error) {

        console.error(
            "Could not load products:",
            error
        );

        productGrid.innerHTML = `
            <div class="error-message">
                <strong>Oops!</strong>
                <br>
                We couldn't load the products right now.
                <br><br>
                Please check that Santa Says Hi is running
                and refresh the page.
                <br><br>
                <button
                    class="primary-button"
                    onclick="loadProducts()"
                >
                    Try Again
                </button>
            </div>
        `;
    }
}


// ============================================================
// RENDER PRODUCTS
// ============================================================

function renderProducts() {

    const productGrid =
        document.getElementById("product-grid");

    if (!productGrid) return;

    let filteredProducts = products.filter(product => {

        const matchesCategory =
            currentCategory === "All" ||
            (product.category &&
                product.category.toLowerCase() ===
                currentCategory.toLowerCase());

        const searchText =
            currentSearch.toLowerCase().trim();

        const matchesSearch =
            !searchText ||
            (product.name &&
                product.name
                    .toLowerCase()
                    .includes(searchText)) ||
            (product.description &&
                product.description
                    .toLowerCase()
                    .includes(searchText)) ||
            (product.category &&
                product.category
                    .toLowerCase()
                    .includes(searchText));

        return matchesCategory && matchesSearch;
    });


    // No results
    if (filteredProducts.length === 0) {

        productGrid.innerHTML = `
            <div class="no-products">
                <h3>No products found</h3>
                <p>
                    Try another search or choose a different category.
                </p>
            </div>
        `;

        return;
    }


    productGrid.innerHTML =
        filteredProducts
            .map(product => createProductCard(product))
            .join("");
}


// ============================================================
// CREATE PRODUCT CARD
// ============================================================

function createProductCard(product) {

    const stock =
        Number.isFinite(Number(product.stockQuantity))
            ? Number(product.stockQuantity)
            : 0;


    const image =
        product.image && product.image.trim()
            ? product.image
            : "images/placeholder.jpg";


    const category =
        product.category || "General";


    const description =
        product.description || "No description available.";


    const isOutOfStock = stock <= 0;

    const isLowStock =
        stock > 0 &&
        stock <= 4;


    let stockHTML = "";

    if (isOutOfStock) {

        stockHTML = `
            <div class="stock-status out-of-stock">
                Out of stock
            </div>
        `;

    } else if (isLowStock) {

        stockHTML = `
            <div class="stock-status low-stock">
                Only ${stock} left
            </div>
        `;

    } else {

        stockHTML = `
            <div class="stock-status in-stock">
                In stock
            </div>
        `;
    }


    return `
        <div class="product-card">

            <div
                class="product-image"
                onclick="openProductModal(${product.id})"
                style="cursor: pointer;"
            >

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(product.name || "Product")}"
                    loading="lazy"
                    onerror="this.src='images/placeholder.jpg'"
                >

            </div>


            <div class="product-info">

                <div class="product-category">
                    ${escapeHTML(category)}
                </div>

                <h3>
                    ${escapeHTML(product.name || "Unnamed Product")}
                </h3>

                <p class="product-description-preview">
                    ${escapeHTML(description)}
                </p>

                <div class="product-price">
                    KSh ${formatMoney(product.price)}
                </div>

                ${stockHTML}


                <button
                    class="add-to-cart"
                    onclick="addToCart(${product.id})"
                    ${isOutOfStock ? "disabled" : ""}
                >
                    ${
                        isOutOfStock
                            ? "Out of Stock"
                            : "Add to Cart"
                    }
                </button>

            </div>

        </div>
    `;
}


// ============================================================
// SEARCH
// ============================================================

function setupSearch() {

    const searchInput =
        document.getElementById("search-input");

    if (!searchInput) return;

    searchInput.addEventListener(
        "input",
        event => {

            currentSearch =
                event.target.value;

            renderProducts();
        }
    );
}


// ============================================================
// CATEGORY FILTER
// ============================================================

function filterProducts(category) {

    currentCategory = category;

    renderProducts();

    // Highlight active category if buttons exist
    document
        .querySelectorAll(".category-button")
        .forEach(button => {

            button.classList.remove("active");

            if (
                button.textContent
                    .trim()
                    .toLowerCase() ===
                category.toLowerCase()
            ) {

                button.classList.add("active");
            }
        });
}


// ============================================================
// CART
// ============================================================

function loadCart() {

    try {

        const savedCart =
            localStorage.getItem("santaCart");

        if (savedCart) {

            const parsed =
                JSON.parse(savedCart);

            if (Array.isArray(parsed)) {
                cart = parsed;
            }
        }

    } catch (error) {

        console.error(
            "Could not load cart:",
            error
        );

        cart = [];
    }
}


function saveCart() {

    localStorage.setItem(
        "santaCart",
        JSON.stringify(cart)
    );
}


// ============================================================
// ADD TO CART
// ============================================================

function addToCart(productId) {

    const product =
        products.find(
            item => Number(item.id) === Number(productId)
        );

    if (!product) {

        alert("Product could not be found.");

        return;
    }


    const stock =
        Number(product.stockQuantity);


    if (stock <= 0) {

        alert("Sorry, this product is out of stock.");

        return;
    }


    const existingItem =
        cart.find(
            item => Number(item.id) === Number(productId)
        );


    if (existingItem) {

        if (
            existingItem.quantity >= stock
        ) {

            alert(
                `Only ${stock} available in stock.`
            );

            return;
        }

        existingItem.quantity++;

    } else {

        cart.push({

            id: product.id,
            name: product.name,
            price: Number(product.price),
            image: product.image,
            category: product.category,
            description: product.description,
            stockQuantity: stock,
            quantity: 1
        });
    }


    saveCart();

    updateCartUI();

    showCartFeedback();
}


// ============================================================
// CART FEEDBACK
// ============================================================

function showCartFeedback() {

    const cartButton =
        document.getElementById("cart-button");

    if (!cartButton) return;

    cartButton.classList.add("cart-bump");

    setTimeout(() => {

        cartButton.classList.remove(
            "cart-bump"
        );

    }, 300);
}


// ============================================================
// UPDATE CART UI
// ============================================================

function updateCartUI() {

    const cartItems =
        document.getElementById("cart-items");

    const cartCount =
        document.getElementById("cart-count");

    const cartTotal =
        document.getElementById("cart-total");


    const totalQuantity =
        cart.reduce(
            (total, item) =>
                total + Number(item.quantity),
            0
        );


    const totalPrice =
        cart.reduce(
            (total, item) =>
                total +
                Number(item.price) *
                Number(item.quantity),
            0
        );


    if (cartCount) {
        cartCount.textContent =
            totalQuantity;
    }


    if (cartTotal) {

        cartTotal.textContent =
            `KSh ${formatMoney(totalPrice)}`;
    }


    if (!cartItems) return;


    if (cart.length === 0) {

        cartItems.innerHTML = `
            <div class="empty-cart">
                <p>Your cart is empty.</p>
                <p>Add something you like. 🛒</p>
            </div>
        `;

        return;
    }


    cartItems.innerHTML =
        cart
            .map(item => createCartItem(item))
            .join("");
}


// ============================================================
// CREATE CART ITEM
// ============================================================

function createCartItem(item) {

    const subtotal =
        Number(item.price) *
        Number(item.quantity);


    return `
        <div class="cart-item">

            <div class="cart-item-info">

                <div class="cart-item-name">
                    ${escapeHTML(item.name)}
                </div>

                <div class="cart-item-price">
                    KSh ${formatMoney(item.price)}
                </div>

            </div>


            <div class="quantity-controls">

                <button
                    onclick="changeQuantity(${item.id}, -1)"
                    type="button"
                >
                    −
                </button>

                <span>
                    ${item.quantity}
                </span>

                <button
                    onclick="changeQuantity(${item.id}, 1)"
                    type="button"
                >
                    +
                </button>

            </div>


            <div class="cart-item-subtotal">
                KSh ${formatMoney(subtotal)}
            </div>


            <button
                class="remove-item"
                onclick="removeFromCart(${item.id})"
                type="button"
            >
                Remove
            </button>

        </div>
    `;
}


// ============================================================
// CHANGE QUANTITY
// ============================================================

function changeQuantity(productId, change) {

    const item =
        cart.find(
            product =>
                Number(product.id) ===
                Number(productId)
        );


    if (!item) return;


    const newQuantity =
        Number(item.quantity) +
        Number(change);


    const stock =
        Number(item.stockQuantity);


    if (newQuantity <= 0) {

        removeFromCart(productId);

        return;
    }


    if (newQuantity > stock) {

        alert(
            `Only ${stock} available in stock.`
        );

        return;
    }


    item.quantity =
        newQuantity;


    saveCart();

    updateCartUI();
}


// ============================================================
// REMOVE FROM CART
// ============================================================

function removeFromCart(productId) {

    cart =
        cart.filter(
            item =>
                Number(item.id) !==
                Number(productId)
        );


    saveCart();

    updateCartUI();
}


// ============================================================
// OPEN CART
// ============================================================

function openCart() {

    const sidebar =
        document.getElementById("cart-sidebar");

    const overlay =
        document.getElementById("cart-overlay");


    if (sidebar) {
        sidebar.classList.add("open");
    }

    if (overlay) {
        overlay.classList.add("active");
    }
}


// ============================================================
// CLOSE CART
// ============================================================

function closeCart() {

    const sidebar =
        document.getElementById("cart-sidebar");

    const overlay =
        document.getElementById("cart-overlay");


    if (sidebar) {
        sidebar.classList.remove("open");
    }

    if (overlay) {
        overlay.classList.remove("active");
    }
}


// ============================================================
// OPEN CHECKOUT
// ============================================================

function openCheckout() {

    if (cart.length === 0) {

        alert("Your cart is empty.");

        return;
    }


    const checkoutModal =
        document.getElementById("checkout-modal");


    const checkoutTotal =
        document.getElementById("checkout-total");


    const total =
        cart.reduce(
            (sum, item) =>
                sum +
                Number(item.price) *
                Number(item.quantity),
            0
        );


    if (checkoutTotal) {

        checkoutTotal.textContent =
            `KSh ${formatMoney(total)}`;
    }


    if (checkoutModal) {

        checkoutModal.classList.add("active");
    }
}


// ============================================================
// CLOSE CHECKOUT
// ============================================================

function closeCheckout() {

    const checkoutModal =
        document.getElementById("checkout-modal");


    if (checkoutModal) {

        checkoutModal.classList.remove(
            "active"
        );
    }
}


// ============================================================
// CHECKOUT
// ============================================================

async function submitOrder(event) {

    event.preventDefault();


    if (cart.length === 0) {

        alert("Your cart is empty.");

        return;
    }


    const customerName =
        document
            .getElementById("customer-name")
            ?.value.trim();


    const phone =
        document
            .getElementById("customer-phone")
            ?.value.trim();


    const location =
        document
            .getElementById("customer-location")
            ?.value.trim();


    if (!customerName ||
        !phone ||
        !location) {

        alert(
            "Please fill in all required fields."
        );

        return;
    }


    const total =
        cart.reduce(
            (sum, item) =>
                sum +
                Number(item.price) *
                Number(item.quantity),
            0
        );


    const orderData = {

        customerName: customerName,

        phone: phone,

        location: location,

        paymentMethod:
            "Chat with Seller",

        totalAmount: total,

        status: "PENDING",

        items: cart.map(item => ({

            productId: item.id,

            productName: item.name,

            price: Number(item.price),

            quantity: Number(item.quantity),

            subtotal:
                Number(item.price) *
                Number(item.quantity)
        }))
    };


    const submitButton =
        document.querySelector(
            ".checkout-submit"
        );


    try {

        if (submitButton) {

            submitButton.disabled = true;

            submitButton.textContent =
                "Placing order...";
        }


        const response =
            await fetch(
                ORDER_API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(orderData)
                }
            );


        const resultText =
            await response.text();


        if (!response.ok) {

            throw new Error(
                resultText ||
                "Order could not be completed."
            );
        }


        let savedOrder = {};

        try {

            savedOrder =
                JSON.parse(resultText);

        } catch {
            savedOrder = {};
        }


        const orderId =
            savedOrder.id ||
            "Pending";


        // Build WhatsApp message
        let message =
            `Hello Santa Says Hi! 👋\n\n` +
            `I'd like to place an order.\n\n` +
            `Order ID: ${orderId}\n` +
            `Name: ${customerName}\n` +
            `Phone: ${phone}\n` +
            `Location: ${location}\n\n` +
            `Items:\n`;


        cart.forEach(item => {

            message +=
                `• ${item.name} x${item.quantity}` +
                ` - KSh ${formatMoney(
                    Number(item.price) *
                    Number(item.quantity)
                )}\n`;
        });


        message +=
            `\nTotal: KSh ${formatMoney(total)}` +
            `\nPayment: Chat with Seller`;


        const whatsappURL =
            `https://wa.me/${SELLER_WHATSAPP}` +
            `?text=${encodeURIComponent(message)}`;


        // Clear cart
        cart = [];

        saveCart();

        updateCartUI();

        closeCheckout();

        showSuccess(orderId);


        // Open WhatsApp
        setTimeout(() => {

            window.open(
                whatsappURL,
                "_blank"
            );

        }, 500);


    } catch (error) {

        console.error(
            "Order error:",
            error
        );


        let message =
            "We couldn't place your order.";


        try {

            const parsed =
                JSON.parse(error.message);

            if (parsed.message) {
                message = parsed.message;
            }

        } catch {
            // Keep default message
        }


        alert(message);


    } finally {

        if (submitButton) {

            submitButton.disabled = false;

            submitButton.textContent =
                "Place Order";
        }
    }
}


// ============================================================
// SUCCESS MODAL
// ============================================================

function showSuccess(orderId) {

    const successModal =
        document.getElementById(
            "success-modal"
        );


    if (!successModal) return;


    const orderIdElement =
        successModal.querySelector(
            ".order-id"
        );


    if (orderIdElement) {

        orderIdElement.textContent =
            orderId;
    }


    successModal.classList.add(
        "active"
    );
}


// ============================================================
// CLOSE SUCCESS
// ============================================================

function closeSuccess() {

    const successModal =
        document.getElementById(
            "success-modal"
        );


    if (successModal) {

        successModal.classList.remove(
            "active"
        );
    }
}


// ============================================================
// PRODUCT DETAILS MODAL
// ============================================================

function openProductModal(productId) {

    const product =
        products.find(
            item =>
                Number(item.id) ===
                Number(productId)
        );


    if (!product) return;


    const modal =
        document.getElementById(
            "product-modal"
        );


    if (!modal) return;


    const image =
        modal.querySelector(
            ".product-modal-image"
        );


    const name =
        modal.querySelector(
            ".product-modal-name"
        );


    const price =
        modal.querySelector(
            ".product-modal-price"
        );


    const description =
        modal.querySelector(
            ".product-description"
        );


    const quantityInput =
        modal.querySelector(
            ".modal-quantity input"
        );


    if (image) {

        image.src =
            product.image ||
            "images/placeholder.jpg";

        image.alt =
            product.name ||
            "Product";

        image.onerror = () => {

            image.src =
                "images/placeholder.jpg";
        };
    }


    if (name) {

        name.textContent =
            product.name || "";
    }


    if (price) {

        price.textContent =
            `KSh ${formatMoney(product.price)}`;
    }


    if (description) {

        description.textContent =
            product.description ||
            "No description available.";
    }


    if (quantityInput) {

        quantityInput.value = 1;

        quantityInput.max =
            Math.max(
                1,
                Number(product.stockQuantity)
            );
    }


    const addButton =
        modal.querySelector(
            ".add-to-cart"
        );


    if (addButton) {

        const stock =
            Number(product.stockQuantity);


        if (stock <= 0) {

            addButton.disabled = true;

            addButton.textContent =
                "Out of Stock";

        } else {

            addButton.disabled = false;

            addButton.textContent =
                "Add to Cart";

            addButton.onclick = () => {

                const quantity =
                    quantityInput
                        ? Number(quantityInput.value)
                        : 1;


                addProductQuantityToCart(
                    product,
                    quantity
                );

                closeProductModal();
            };
        }
    }


    modal.classList.add("active");
}


// ============================================================
// ADD MULTIPLE QUANTITY FROM MODAL
// ============================================================

function addProductQuantityToCart(
    product,
    quantity
) {

    const stock =
        Number(product.stockQuantity);


    quantity =
        Math.floor(Number(quantity));


    if (quantity <= 0) {

        alert("Please enter a valid quantity.");

        return;
    }


    if (quantity > stock) {

        alert(
            `Only ${stock} available in stock.`
        );

        return;
    }


    const existing =
        cart.find(
            item =>
                Number(item.id) ===
                Number(product.id)
        );


    if (existing) {

        if (
            existing.quantity +
            quantity >
            stock
        ) {

            alert(
                `Only ${stock} available in stock.`
            );

            return;
        }


        existing.quantity += quantity;

    } else {

        cart.push({

            id: product.id,

            name: product.name,

            price: Number(product.price),

            image: product.image,

            category: product.category,

            description: product.description,

            stockQuantity: stock,

            quantity: quantity
        });
    }


    saveCart();

    updateCartUI();

    showCartFeedback();
}


// ============================================================
// CLOSE PRODUCT MODAL
// ============================================================

function closeProductModal() {

    const modal =
        document.getElementById(
            "product-modal"
        );


    if (modal) {

        modal.classList.remove(
            "active"
        );
    }
}


// ============================================================
// MONEY FORMAT
// ============================================================

function formatMoney(value) {

    const number =
        Number(value);


    if (!Number.isFinite(number)) {

        return "0";
    }


    return number.toLocaleString(
        "en-KE",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    );
}


// ============================================================
// HTML SAFETY
// ============================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ============================================================
// CHECKOUT FORM EVENT
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const form =
            document.getElementById(
                "checkout-form"
            );


        if (form) {

            form.addEventListener(
                "submit",
                submitOrder
            );
        }
    }
);


// ============================================================
// CLOSE MODALS WHEN CLICKING OUTSIDE
// ============================================================

document.addEventListener(
    "click",
    event => {

        if (
            event.target.classList.contains(
                "modal"
            )
        ) {

            event.target.classList.remove(
                "active"
            );
        }
    }
);