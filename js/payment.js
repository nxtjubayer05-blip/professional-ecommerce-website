/* =====================================================
   PAYMENT HANDLING
   ===================================================== */

// Get Payment Method from URL
const urlParams = new URLSearchParams(window.location.search);
const paymentMethod = urlParams.get('method') || 'bkash';

// Payment Forms
const bkashForm = document.getElementById('bkashForm');
const nagadForm = document.getElementById('nagadForm');
const cardForm = document.getElementById('cardForm');
const proceedPaymentBtn = document.getElementById('proceedPaymentBtn');

// Show Payment Form
function showPaymentForm() {
    const paymentProcessing = document.querySelector('.payment-processing');
    const paymentForms = document.getElementById('paymentForms');
    
    if (paymentProcessing) paymentProcessing.style.display = 'none';
    if (paymentForms) paymentForms.style.display = 'block';
    
    // Show appropriate form
    if (bkashForm) bkashForm.style.display = paymentMethod === 'bkash' ? 'block' : 'none';
    if (nagadForm) nagadForm.style.display = paymentMethod === 'nagad' ? 'block' : 'none';
    if (cardForm) cardForm.style.display = paymentMethod === 'card' ? 'block' : 'none';
}

// Process Payment
async function processPayment(method, formData) {
    try {
        const response = await fetch('backend/handlers/payment-handler.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                method: method,
                ...formData
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Payment successful
            handlePaymentSuccess(result);
        } else {
            // Payment failed
            handlePaymentError(result.message);
        }
    } catch (error) {
        handlePaymentError('পেমেন্ট প্রক্রিয়াকরণে ত্রুটি: ' + error.message);
    }
}

// Handle Payment Success
function handlePaymentSuccess(result) {
    // Clear cart
    localStorage.removeItem('ecommerce_cart');
    
    // Show success message
    const container = document.querySelector('.payment-container');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 60px; color: #28a745; margin-bottom: 20px;">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h2>পেমেন্ট সফল!</h2>
                <p style="color: #666; margin-bottom: 20px;">আপনার অর্ডার নিশ্চিত হয়েছে</p>
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; text-align: left;">
                    <p><strong>অর্ডার আইডি:</strong> ${result.order_id}</p>
                    <p><strong>মোট পরিমাণ:</strong> ৳ ${result.amount}</p>
                    <p><strong>লেনদেন আইডি:</strong> ${result.transaction_id}</p>
                    <p><strong>তারিখ:</strong> ${new Date().toLocaleDateString('bn-BD')}</p>
                </div>
                <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
                    আমরা আপনার ইনবক্সে একটি ইনভয়েস পাঠিয়েছি। দয়া করে আপনার ডাউনলোড লিংক চেক করুন।
                </p>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <a href="index.html" class="btn btn-primary" style="display: inline-block; padding: 12px 30px; text-decoration: none;">
                        হোম পেজে ফিরুন
                    </a>
                    <button onclick="window.print()" class="btn btn-outline" style="display: inline-block; padding: 12px 30px;">
                        ইনভয়েস প্রিন্ট করুন
                    </button>
                </div>
            </div>
        `;
    }
}

// Handle Payment Error
function handlePaymentError(message) {
    alert('পেমেন্ট ব্যর্থ: ' + message);
    
    // Show form again
    showPaymentForm();
}

// bKash Payment Form Handler
if (bkashForm) {
    bkashForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const number = bkashForm.querySelector('input[type="tel"]').value;
        const pin = bkashForm.querySelector('input[type="password"]').value;
        
        // Show processing
        const btn = bkashForm.querySelector('button');
        btn.disabled = true;
        btn.textContent = 'প্রক্রিয়াকরণ করা হচ্ছে...';
        
        // Process payment
        await processPayment('bkash', {
            number: number,
            pin: pin
        });
        
        btn.disabled = false;
        btn.textContent = 'পেমেন্ট করুন';
    });
}

// Nagad Payment Form Handler
if (nagadForm) {
    nagadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const number = nagadForm.querySelector('input[type="tel"]').value;
        const pin = nagadForm.querySelector('input[type="password"]').value;
        
        const btn = nagadForm.querySelector('button');
        btn.disabled = true;
        btn.textContent = 'প্রক্রিয়াকরণ করা হচ্ছে...';
        
        await processPayment('nagad', {
            number: number,
            pin: pin
        });
        
        btn.disabled = false;
        btn.textContent = 'পেমেন্ট করুন';
    });
}

// Card Payment Form Handler
if (cardForm) {
    cardForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const cardName = cardForm.querySelectorAll('input[type="text"]')[0].value;
        const cardNumber = cardForm.querySelectorAll('input[type="text"]')[1].value;
        const expiry = cardForm.querySelectorAll('input[type="text"]')[2].value;
        const cvv = cardForm.querySelectorAll('input[type="text"]')[3].value;
        
        const btn = cardForm.querySelector('button');
        btn.disabled = true;
        btn.textContent = 'প্রক্রিয়াকরণ করা হচ্ছে...';
        
        await processPayment('card', {
            card_name: cardName,
            card_number: cardNumber,
            expiry: expiry,
            cvv: cvv
        });
        
        btn.disabled = false;
        btn.textContent = 'পেমেন্ট করুন';
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(showPaymentForm, 2000); // Show form after 2 seconds
});
