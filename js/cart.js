/* =====================================================
   CART FUNCTIONALITY
   ===================================================== */

const CART_STORAGE_KEY = 'ecommerce_cart';

// Get Cart from LocalStorage
function getCart() {
    const cart = localStorage.getItem(CART_STORAGE_KEY);
    return cart ? JSON.parse(cart) : [];
}

// Save Cart to LocalStorage
function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartDisplay();
}

// Add Item to Cart
function addToCart(productId, productName, productPrice, quantity = 1) {
    let cart = getCart();
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: parseFloat(productPrice),
            quantity: quantity
        });
    }
    
    saveCart(cart);
    showNotification(`${productName} কার্টে যোগ হয়েছে!`, 'success');
}

// Remove Item from Cart
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    showNotification('পণ্য কার্ট থেকে সরানো হয়েছে', 'info');
}

// Update Item Quantity
function updateCartItemQuantity(productId, quantity) {
    let cart = getCart();
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
            saveCart(cart);
        }
    }
}

// Clear Cart
function clearCart() {
    localStorage.removeItem(CART_STORAGE_KEY);
    updateCartDisplay();
}

// Get Cart Total
function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Get Cart Item Count
function getCartItemCount() {
    const cart = getCart();
    return cart.reduce((count, item) => count + item.quantity, 0);
}

// Update Cart Display
function updateCartDisplay() {
    const cartBadge = document.getElementById('cartBadge');
    const cartList = document.getElementById('cartList');
    const cartFooter = document.getElementById('cartFooter');
    
    const cart = getCart();
    const itemCount = getCartItemCount();
    
    // Update badge
    if (cartBadge) {
        cartBadge.textContent = itemCount;
    }
    
    // Update cart list
    if (cartList) {
        if (cart.length === 0) {
            cartList.innerHTML = '<p>আপনার কার্ট খালি আছে</p>';
            if (cartFooter) cartFooter.style.display = 'none';
        } else {
            cartList.innerHTML = cart.map(item => `
                <div class="cart-item" style="padding: 10px 0; border-bottom: 1px solid #ddd;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <p style="font-weight: 600;">${item.name}</p>
                            <p style="font-size: 12px; color: #666;">পরিমাণ: ${item.quantity}</p>
                        </div>
                        <p style="font-weight: 600; color: #ff6b35;">৳ ${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                </div>
            `).join('');
            
            if (cartFooter) cartFooter.style.display = 'block';
            
            // Update total
            const cartTotal = document.getElementById('cartTotal');
            if (cartTotal) {
                cartTotal.textContent = getCartTotal().toFixed(2);
            }
        }
    }
}

// Notification Function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background-color: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.innerHTML = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize cart display on page load
document.addEventListener('DOMContentLoaded', updateCartDisplay);
