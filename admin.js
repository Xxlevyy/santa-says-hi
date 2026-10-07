// ==================================================
// SANTA SAYS HI
// ADMIN DASHBOARD
// PRODUCT + STOCK + ORDER MANAGEMENT
// ==================================================


// ==================================================
// API
// ==================================================

const API_URL =
    "http://localhost:8080/api/products";

const ORDER_API_URL =
    "http://localhost:8080/api/orders";


// ==================================================
// STATE
// ==================================================

let products = [];

let orders = [];


// ==================================================
// LOAD PRODUCTS
// ==================================================

async function loadProducts() {

    try {

        const response =
            await fetch(
                API_URL + "?t=" + Date.now()
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load products"
            );
        }


        products =
            await response.json();


        renderProducts();

        updateProductDashboard();

    }

    catch (error) {

        console.error(error);


        const table =
            document.getElementById(
                "products-table"
            );


        if (table) {

            table.innerHTML = `
                <tr>
                    <td
                        colspan="8"
                        class="message"
                    >
                        Could not connect to
                        the Santa Says Hi backend.
                    </td>
                </tr>
            `;
        }
    }
}


// ==================================================
// RENDER PRODUCTS
// ==================================================

function renderProducts() {

    const table =
        document.getElementById(
            "products-table"
        );


    if (!table) {
        return;
    }


    table.innerHTML = "";


    if (products.length === 0) {

        table.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    class="message"
                >
                    No products found.
                </td>
            </tr>
        `;

        return;
    }


    products.forEach(
        function (product) {

            const stock =
                Number(
                    product.stockQuantity || 0
                );


            const threshold =
                Number(
                    product.lowStockThreshold || 0
                );


            let stockClass =
                "stock-good";


            let status =
                "IN STOCK";


            if (stock === 0) {

                stockClass =
                    "stock-out";

                status =
                    "OUT OF STOCK";

            }

            else if (
                stock <= threshold
            ) {

                stockClass =
                    "stock-low";

                status =
                    "LOW STOCK";
            }


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>

                    <img
                        src="${escapeHtml(
                            product.image || ""
                        )}"
                        class="product-image"
                        onerror="
                            this.style.display='none'
                        "
                    >

                </td>


                <td>

                    <strong>
                        ${escapeHtml(
                            product.name
                        )}
                    </strong>

                </td>


                <td>
                    ${escapeHtml(
                        product.category || ""
                    )}
                </td>


                <td>
                    KSh
                    ${Number(
                        product.price || 0
                    ).toLocaleString()}
                </td>


                <td
                    class="${stockClass}"
                >
                    ${stock}
                </td>


                <td
                    class="${stockClass}"
                >
                    ${status}
                </td>


                <td>

                    <div class="stock-controls">

                        <input
                            type="number"
                            id="stock-${product.id}"
                            min="1"
                            value="1"
                        >


                        <button
                            class="success"
                            title="Add stock"
                            onclick="
                                addStock(
                                    ${product.id}
                                )
                            "
                        >
                            +
                        </button>


                        <button
                            class="warning"
                            title="Remove stock"
                            onclick="
                                removeStock(
                                    ${product.id}
                                )
                            "
                        >
                            −
                        </button>

                    </div>

                </td>


                <td>

                    <div class="actions">

                        <button
                            class="primary"
                            onclick="
                                editProduct(
                                    ${product.id}
                                )
                            "
                        >
                            Edit
                        </button>


                        <button
                            class="danger"
                            onclick="
                                deleteProduct(
                                    ${product.id}
                                )
                            "
                        >
                            Delete
                        </button>

                    </div>

                </td>

            `;


            table.appendChild(row);

        }
    );
}


// ==================================================
// PRODUCT DASHBOARD
// ==================================================

function updateProductDashboard() {

    const totalProducts =
        products.length;


    const totalStock =
        products.reduce(
            function (
                total,
                product
            ) {

                return total +
                    Number(
                        product.stockQuantity || 0
                    );

            },
            0
        );


    const lowStock =
        products.filter(
            function (product) {

                const stock =
                    Number(
                        product.stockQuantity || 0
                    );


                const threshold =
                    Number(
                        product.lowStockThreshold || 0
                    );


                return (
                    stock > 0 &&
                    stock <= threshold
                );
            }
        ).length;


    const outOfStock =
        products.filter(
            function (product) {

                return Number(
                    product.stockQuantity || 0
                ) === 0;

            }
        ).length;


    setText(
        "total-products",
        totalProducts
    );


    setText(
        "total-stock",
        totalStock
    );


    setText(
        "low-stock",
        lowStock
    );


    setText(
        "out-of-stock",
        outOfStock
    );
}


// ==================================================
// ADD STOCK
// ==================================================

async function addStock(productId) {

    const input =
        document.getElementById(
            `stock-${productId}`
        );


    const quantity =
        Number(
            input.value
        );


    if (
        !Number.isInteger(quantity) ||
        quantity <= 0
    ) {

        alert(
            "Enter a valid whole-number quantity."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/${productId}/stock/add?quantity=${quantity}`,
                {
                    method: "PUT"
                }
            );


        if (!response.ok) {

            throw new Error(
                await response.text()
            );
        }


        alert(
            `Added ${quantity} item(s) to stock. 📦`
        );


        await loadProducts();

    }

    catch (error) {

        console.error(error);


        alert(
            "Could not add stock:\n" +
            error.message
        );
    }
}


// ==================================================
// REMOVE STOCK
// ==================================================

async function removeStock(productId) {

    const input =
        document.getElementById(
            `stock-${productId}`
        );


    const quantity =
        Number(
            input.value
        );


    if (
        !Number.isInteger(quantity) ||
        quantity <= 0
    ) {

        alert(
            "Enter a valid whole-number quantity."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/${productId}/stock/remove?quantity=${quantity}`,
                {
                    method: "PUT"
                }
            );


        if (!response.ok) {

            throw new Error(
                await response.text()
            );
        }


        alert(
            `Removed ${quantity} item(s) from stock.`
        );


        await loadProducts();

    }

    catch (error) {

        console.error(error);


        alert(
            "Could not remove stock:\n" +
            error.message
        );
    }
}


// ==================================================
// ADD / UPDATE PRODUCT
// ==================================================

document
    .getElementById("product-form")
    .addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const productId =
                document.getElementById(
                    "product-id"
                ).value;


            const name =
                document.getElementById(
                    "product-name"
                ).value.trim();


            const category =
                document.getElementById(
                    "product-category"
                ).value;


            const price =
                Number(
                    document.getElementById(
                        "product-price"
                    ).value
                );


            const stockQuantity =
                Number(
                    document.getElementById(
                        "product-stock"
                    ).value
                );


            const lowStockThreshold =
                Number(
                    document.getElementById(
                        "product-threshold"
                    ).value
                );


            const image =
                document.getElementById(
                    "product-image"
                ).value.trim();


            const description =
                document.getElementById(
                    "product-description"
                ).value.trim();


            if (!name) {

                alert(
                    "Enter a product name."
                );

                return;
            }


            if (!category) {

                alert(
                    "Select a category."
                );

                return;
            }


            if (
                !Number.isFinite(price) ||
                price < 0
            ) {

                alert(
                    "Enter a valid price."
                );

                return;
            }


            if (
                !Number.isInteger(
                    stockQuantity
                ) ||
                stockQuantity < 0
            ) {

                alert(
                    "Stock must be a whole number."
                );

                return;
            }


            if (
                !Number.isInteger(
                    lowStockThreshold
                ) ||
                lowStockThreshold < 1
            ) {

                alert(
                    "Low-stock threshold must be at least 1."
                );

                return;
            }


            const product = {

                name:
                    name,

                category:
                    category,

                price:
                    price,

                stockQuantity:
                    stockQuantity,

                lowStockThreshold:
                    lowStockThreshold,

                image:
                    image,

                description:
                    description

            };


            try {

                let response;


                if (productId) {

                    response =
                        await fetch(
                            `${API_URL}/${productId}`,
                            {
                                method: "PUT",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(
                                        product
                                    )
                            }
                        );

                }

                else {

                    response =
                        await fetch(
                            API_URL,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(
                                        product
                                    )
                            }
                        );
                }


                if (!response.ok) {

                    throw new Error(
                        await response.text()
                    );
                }


                alert(
                    productId
                        ? "Product updated successfully! ✅"
                        : "Product added successfully! 🎉"
                );


                resetForm();

                await loadProducts();

            }

            catch (error) {

                console.error(error);


                alert(
                    "Could not save product:\n" +
                    error.message
                );
            }
        }
    );


// ==================================================
// EDIT PRODUCT
// ==================================================

function editProduct(productId) {

    const product =
        products.find(
            function (item) {

                return Number(item.id) ===
                    Number(productId);

            }
        );


    if (!product) {

        alert(
            "Product not found."
        );

        return;
    }


    document.getElementById(
        "product-id"
    ).value =
        product.id;


    document.getElementById(
        "product-name"
    ).value =
        product.name;


    document.getElementById(
        "product-category"
    ).value =
        product.category;


    document.getElementById(
        "product-price"
    ).value =
        product.price;


    document.getElementById(
        "product-stock"
    ).value =
        product.stockQuantity;


    document.getElementById(
        "product-threshold"
    ).value =
        product.lowStockThreshold;


    document.getElementById(
        "product-image"
    ).value =
        product.image || "";


    document.getElementById(
        "product-description"
    ).value =
        product.description || "";


    document.getElementById(
        "save-product-button"
    ).textContent =
        "💾 Update Product";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ==================================================
// DELETE PRODUCT
// ==================================================

async function deleteProduct(productId) {

    const product =
        products.find(
            function (item) {

                return Number(item.id) ===
                    Number(productId);

            }
        );


    if (!product) {
        return;
    }


    const confirmed =
        confirm(
            `Are you sure you want to delete "${product.name}"?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/${productId}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            throw new Error(
                await response.text()
            );
        }


        alert(
            "Product deleted successfully. 🗑️"
        );


        resetForm();

        await loadProducts();

    }

    catch (error) {

        console.error(error);


        alert(
            "Could not delete product:\n" +
            error.message
        );
    }
}


// ==================================================
// RESET PRODUCT FORM
// ==================================================

function resetForm() {

    const form =
        document.getElementById(
            "product-form"
        );


    if (form) {
        form.reset();
    }


    document.getElementById(
        "product-id"
    ).value = "";


    document.getElementById(
        "product-threshold"
    ).value = 5;


    document.getElementById(
        "save-product-button"
    ).textContent =
        "➕ Add Product";
}


// ==================================================
// LOAD ORDERS
// ==================================================

async function loadOrders() {

    try {

        const response =
            await fetch(
                ORDER_API_URL +
                "?t=" +
                Date.now()
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load orders"
            );
        }


        orders =
            await response.json();


        renderOrders();

        updateOrderDashboard();

    }

    catch (error) {

        console.error(error);


        const table =
            document.getElementById(
                "orders-table"
            );


        if (table) {

            table.innerHTML = `
                <tr>
                    <td
                        colspan="9"
                        class="message"
                    >
                        Could not load orders.
                    </td>
                </tr>
            `;
        }
    }
}


// ==================================================
// RENDER ORDERS
// ==================================================

function renderOrders() {

    const table =
        document.getElementById(
            "orders-table"
        );


    if (!table) {
        return;
    }


    table.innerHTML = "";


    if (
        !orders ||
        orders.length === 0
    ) {

        table.innerHTML = `
            <tr>
                <td
                    colspan="9"
                    class="message"
                >
                    No orders yet.
                </td>
            </tr>
        `;

        return;
    }


    orders
        .slice()
        .reverse()
        .forEach(
            function (order) {

                const row =
                    document.createElement(
                        "tr"
                    );


                let date =
                    "N/A";


                if (order.orderDate) {

                    const parsedDate =
                        new Date(
                            order.orderDate
                        );


                    if (
                        !isNaN(
                            parsedDate.getTime()
                        )
                    ) {

                        date =
                            parsedDate.toLocaleString();
                    }
                }


                const status =
                    order.status ||
                    "PENDING";


                const items =
                    order.items ||
                    [];


                let itemText =
                    "Loading...";


                if (
                    items.length > 0
                ) {

                    itemText =
                        items
                            .map(
                                function (item) {

                                    return `
                                        ${escapeHtml(
                                            item.productName ||
                                            "Product"
                                        )}
                                        ×
                                        ${item.quantity}
                                    `;

                                }
                            )
                            .join("<br>");

                }

                else {

                    itemText =
                        "View items";
                }


                row.innerHTML = `

                    <td>
                        <strong>
                            #${order.id}
                        </strong>
                    </td>


                    <td>
                        ${escapeHtml(
                            order.customerName || ""
                        )}
                    </td>


                    <td>
                        ${escapeHtml(
                            order.phone || ""
                        )}
                    </td>


                    <td>
                        ${escapeHtml(
                            order.location || ""
                        )}
                    </td>


                    <td>
                        ${escapeHtml(
                            order.paymentMethod || ""
                        )}
                    </td>


                    <td>

                        <strong>
                            KSh
                            ${Number(
                                order.totalAmount || 0
                            ).toLocaleString()}
                        </strong>

                    </td>


                    <td>

                        <select
                            class="order-status"
                            onchange="
                                updateOrderStatus(
                                    ${order.id},
                                    this.value
                                )
                            "
                        >

                            <option
                                value="PENDING"
                                ${
                                    status === "PENDING"
                                        ? "selected"
                                        : ""
                                }
                            >
                                PENDING
                            </option>


                            <option
                                value="PROCESSING"
                                ${
                                    status === "PROCESSING"
                                        ? "selected"
                                        : ""
                                }
                            >
                                PROCESSING
                            </option>


                            <option
                                value="SHIPPED"
                                ${
                                    status === "SHIPPED"
                                        ? "selected"
                                        : ""
                                }
                            >
                                SHIPPED
                            </option>


                            <option
                                value="DELIVERED"
                                ${
                                    status === "DELIVERED"
                                        ? "selected"
                                        : ""
                                }
                            >
                                DELIVERED
                            </option>


                            <option
                                value="CANCELLED"
                                ${
                                    status === "CANCELLED"
                                        ? "selected"
                                        : ""
                                }
                            >
                                CANCELLED
                            </option>

                        </select>

                    </td>


                    <td>

                        ${itemText}

                    </td>


                    <td>
                        ${escapeHtml(date)}
                    </td>

                `;


                table.appendChild(
                    row
                );


                // Load the actual items
                // for this order.

                loadOrderItems(
                    order.id,
                    row
                );

            }
        );
}


// ==================================================
// LOAD ORDER ITEMS
// ==================================================

async function loadOrderItems(
    orderId,
    row
) {

    try {

        const response =
            await fetch(
                `${ORDER_API_URL}/${orderId}/items`
            );


        if (!response.ok) {
            return;
        }


        const items =
            await response.json();


        const cells =
            row.querySelectorAll(
                "td"
            );


        // Items column is index 7
        const itemsCell =
            cells[7];


        if (!itemsCell) {
            return;
        }


        if (
            !items ||
            items.length === 0
        ) {

            itemsCell.textContent =
                "No items";

            return;
        }


        itemsCell.innerHTML =
            items
                .map(
                    function (item) {

                        return `
                            <div style="
                                margin-bottom:4px;
                            ">

                                <strong>
                                    ${escapeHtml(
                                        item.productName
                                    )}
                                </strong>

                                ×
                                ${item.quantity}

                                <br>

                                <small>
                                    KSh
                                    ${Number(
                                        item.subtotal || 0
                                    ).toLocaleString()}
                                </small>

                            </div>
                        `;

                    }
                )
                .join("");

    }

    catch (error) {

        console.error(
            "Could not load order items:",
            error
        );
    }
}


// ==================================================
// UPDATE ORDER STATUS
// ==================================================

async function updateOrderStatus(
    orderId,
    status
) {

    try {

        const response =
            await fetch(
                `${ORDER_API_URL}/${orderId}/status?status=${encodeURIComponent(status)}`,
                {
                    method: "PUT"
                }
            );


        if (!response.ok) {

            throw new Error(
                await response.text()
            );
        }


        alert(
            `Order #${orderId} updated to ${status}.`
        );


        await loadOrders();

    }

    catch (error) {

        console.error(error);


        alert(
            "Could not update order:\n" +
            error.message
        );


        await loadOrders();
    }
}


// ==================================================
// ORDER DASHBOARD
// ==================================================

function updateOrderDashboard() {

    const totalOrders =
        orders.length;


    const pendingOrders =
        orders.filter(
            function (order) {

                return (
                    order.status ===
                    "PENDING"
                );

            }
        ).length;


    const totalRevenue =
        orders
            .filter(
                function (order) {

                    return (
                        order.status !==
                        "CANCELLED"
                    );

                }
            )
            .reduce(
                function (
                    total,
                    order
                ) {

                    return total +
                        Number(
                            order.totalAmount || 0
                        );

                },
                0
            );


    setText(
        "total-orders",
        totalOrders
    );


    setText(
        "pending-orders",
        pendingOrders
    );


    setText(
        "total-revenue",
        "KSh " +
        totalRevenue.toLocaleString()
    );
}


// ==================================================
// HELPER
// ==================================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;
    }
}


// ==================================================
// ESCAPE HTML
// ==================================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }


    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}


// ==================================================
// START DASHBOARD
// ==================================================

loadProducts();

loadOrders();