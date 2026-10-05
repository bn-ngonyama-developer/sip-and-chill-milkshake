/* ==========================================================================
   Sip & Chill — Shared Cart + WhatsApp Checkout Engine
   Contact number: 067 840 0511  |  WhatsApp/Order email: blessingport47@gmail.com
   ========================================================================== */

const SHOP = {
    phoneDisplay: "067 840 0511",
    whatsapp: "27678400511", // South African intl format for 067 840 0511
    email: "blessingport47@gmail.com",
    address: "51 Peulwane Street, Midrand"
};

const CART_KEY = "sipandchill_cart";
const LAST_ORDER_KEY = "sipandchill_last_order";

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge();
}

function addToCart(name, price) {
    const cart = getCart();
    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ name, price, qty: 1 });
    }
    saveCart(cart);
    flashAddedToCart(name);
}

function removeFromCart(name) {
    let cart = getCart();
    cart = cart.filter(item => item.name !== name);
    saveCart(cart);
}

function setQty(name, qty) {
    const cart = getCart();
    const item = cart.find(i => i.name === name);
    if (item) {
        item.qty = Math.max(1, qty);
        saveCart(cart);
    }
}

function cartTotal(cart) {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function cartCount(cart) {
    return cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateCartBadge() {
    const badge = document.getElementById("cartBadge");
    if (!badge) return;
    const count = cartCount(getCart());
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
}

function flashAddedToCart(name) {
    const toast = document.getElementById("cartToast");
    if (!toast) return;
    toast.textContent = `${name} added to your order ✓`;
    toast.classList.add("show");
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function generateOrderNumber() {
    const now = new Date();
    const stamp = now.getFullYear().toString().slice(2) +
        String(now.getMonth() + 1).padStart(2, "0") +
        String(now.getDate()).padStart(2, "0") +
        String(now.getHours()).padStart(2, "0") +
        String(now.getMinutes()).padStart(2, "0");
    const rand = Math.floor(100 + Math.random() * 900);
    return `SC-${stamp}-${rand}`;
}

function buildOrderSummaryText(cart, orderNumber, customer) {
    let lines = [];
    lines.push(`Sip & Chill — New Order`);
    lines.push(`Order No: ${orderNumber}`);
    lines.push(``);
    cart.forEach(item => {
        lines.push(`${item.qty} x ${item.name} — R${(item.price * item.qty).toFixed(2)}`);
    });
    lines.push(``);
    lines.push(`Total: R${cartTotal(cart).toFixed(2)}`);
    lines.push(``);
    lines.push(`Name: ${customer.name}`);
    lines.push(`Phone: ${customer.phone}`);
    if (customer.email) lines.push(`Email: ${customer.email}`);
    lines.push(`Fulfilment: ${customer.method}`);
    if (customer.address) lines.push(`Delivery Address: ${customer.address}`);
    if (customer.notes) lines.push(`Notes: ${customer.notes}`);
    return lines.join("\n");
}

function whatsappOrderLink(cart, orderNumber, customer) {
    const text = buildOrderSummaryText(cart, orderNumber, customer);
    return `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(text)}`;
}

function whatsappGeneralLink(prefill) {
    const text = prefill || "Hi Sip & Chill! I'd like to find out more about your milkshakes.";
    return `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(text)}`;
}

document.addEventListener("DOMContentLoaded", updateCartBadge);
