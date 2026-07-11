/* =====================================================
   MAIN JAVASCRIPT
   ===================================================== */

// DOM Elements
const authModal = document.getElementById('authModal');
const closeAuthModal = document.getElementById('closeAuthModal');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const profileIcon = document.getElementById('profileIcon');
const menuToggle = document.getElementById('menuToggle');

// Auth Tab Elements
const authTabBtns = document.querySelectorAll('.auth-tab-btn');
const authForms = document.querySelectorAll('.auth-form');

// Auth Form Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const facebookLoginBtn = document.getElementById('facebookLoginBtn');

// Other Elements
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const searchForm = document.getElementById('searchForm');
const categoryBtns = document.querySelectorAll('.category-btn');

// Global Variables
let currentSlide = 0;
let products = [];
let banners = [];
let categories = [];

// ===== AUTH MODAL FUNCTIONS =====
function openAuthModal() {
    if (authModal) {
        authModal.style.display = 'block';
    }
}

function closeModal() {
    if (authModal) {
        authModal.style.display = 'none';
    }
}

// Event Listeners for Auth Modal
if (closeAuthModal) {
    closeAuthModal.addEventListener('click', closeModal);
}

if (loginBtn) {
    loginBtn.addEventListener('click', openAuthModal);
}

if (registerBtn) {
    registerBtn.addEventListener('click', openAuthModal);
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await auth.signOut();
            alert('আপনি সফলভাবে লগআউট হয়েছেন');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    });
}

window.addEventListener('click', (event) => {
    if (event.target === authModal) {
        closeModal();
    }
});

// ===== AUTH TAB SWITCHING =====
if (authTabBtns.length > 0) {
    authTabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            
            // Remove active class from all buttons
            authTabBtns.forEach(b => b.classList.remove('active'));
            authForms.forEach(form => form.classList.remove('active'));
            
            // Add active class to clicked button
            e.target.classList.add('active');
            
            // Show corresponding form
            document.getElementById(`${tabName}Form`).classList.add('active');
        });
    });
}

// ===== LOGIN FORM SUBMISSION =====
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            await auth.signInWithEmailAndPassword(email, password);
            alert('সফলভাবে লগইন হয়েছেন!');
            closeModal();
            loginForm.reset();
        } catch (error) {
            alert(`লগইন ত্রুটি: ${error.message}`);
        }
    });
}

// ===== REGISTER FORM SUBMISSION =====
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const phone = document.getElementById('registerPhone').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        
        if (password !== confirmPassword) {
            alert('পাসওয়ার্ড মিলছে না');
            return;
        }
        
        try {
            const result = await auth.createUserWithEmailAndPassword(email, password);
            
            // Update user profile
            await result.user.updateProfile({
                displayName: name
            });
            
            // Store user info in Firestore
            await db.collection('users').doc(result.user.uid).set({
                name: name,
                email: email,
                phone: phone,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            
            alert('নিবন্ধন সফল হয়েছে! দয়া করে লগইন করুন।');
            
            // Switch to login tab
            document.querySelector('[data-tab="login"]').click();
            registerForm.reset();
        } catch (error) {
            alert(`নিবন্ধন ত্রুটি: ${error.message}`);
        }
    });
}

// ===== GOOGLE LOGIN =====
if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            await auth.signInWithPopup(provider);
            alert('Google দিয়ে সফলভাবে লগইন হয়েছেন!');
            closeModal();
        } catch (error) {
            alert(`Google লগইন ত্রুটি: ${error.message}`);
        }
    });
}

// ===== FACEBOOK LOGIN =====
if (facebookLoginBtn) {
    facebookLoginBtn.addEventListener('click', async () => {
        try {
            const provider = new firebase.auth.FacebookAuthProvider();
            await auth.signInWithPopup(provider);
            alert('Facebook দিয়ে সফলভাবে লগইন হয়েছেন!');
            closeModal();
        } catch (error) {
            alert(`Facebook লগইন ত্রুটি: ${error.message}`);
        }
    });
}

// ===== BANNER SLIDER =====
async function loadBanners() {
    try {
        const response = await fetch('backend/api/banners.php');
        banners = await response.json();
        displayBanners();
        startSliderAutoplay();
    } catch (error) {
        console.error('Error loading banners:', error);
    }
}

function displayBanners() {
    const container = document.getElementById('sliderContainer');
    const dotsContainer = document.getElementById('sliderDots');
    
    if (!container || banners.length === 0) return;
    
    container.innerHTML = '';
    dotsContainer.innerHTML = '';
    
    banners.forEach((banner, index) => {
        const slide = document.createElement('div');
        slide.className = 'slider-item';
        slide.innerHTML = `<img src="${banner.image}" alt="${banner.title}">`;
        container.appendChild(slide);
        
        const dot = document.createElement('div');
        dot.className = `dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
}

function goToSlide(index) {
    currentSlide = index;
    updateSlider();
}

function updateSlider() {
    const container = document.getElementById('sliderContainer');
    if (!container) return;
    
    container.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % banners.length;
    updateSlider();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + banners.length) % banners.length;
    updateSlider();
}

function startSliderAutoplay() {
    setInterval(nextSlide, 60000); // Change banner every 60 seconds
}

if (prevBtn) prevBtn.addEventListener('click', prevSlide);
if (nextBtn) nextBtn.addEventListener('click', nextSlide);

// ===== PRODUCTS LOADING =====
async function loadProducts(categoryFilter = 'all') {
    try {
        let url = 'backend/api/products.php';
        if (categoryFilter !== 'all') {
            url += `?category=${categoryFilter}`;
        }
        
        const response = await fetch(url);
        products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function displayProducts(productsToShow) {
    const grid = document.getElementById('productsGrid');
    const emptyMessage = document.getElementById('emptyMessage');
    
    if (!grid) return;
    
    if (!productsToShow || productsToShow.length === 0) {
        grid.style.display = 'none';
        if (emptyMessage) emptyMessage.style.display = 'block';
        return;
    }
    
    grid.style.display = 'grid';
    if (emptyMessage) emptyMessage.style.display = 'none';
    
    grid.innerHTML = productsToShow.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <span class="product-category">${product.category}</span>
                <p class="product-price">৳ ${product.price}</p>
                <p class="product-description">${product.description.substring(0, 50)}...</p>
                <div class="product-buttons">
                    <a href="product-details.html?id=${product.id}" class="btn btn-primary">বিস্তারিত জানুন</a>
                    <a href="order.html?product=${product.id}" class="btn btn-success">অর্ডার করুন</a>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== CATEGORIES LOADING =====
async function loadCategories() {
    try {
        const response = await fetch('backend/api/categories.php');
        categories = await response.json();
        displayCategories();
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function displayCategories() {
    const container = document.getElementById('categoriesList');
    if (!container || !categories) return;
    
    container.innerHTML = categories.map(category => `
        <button class="category-btn" data-category="${category.id}">
            ${category.name}
        </button>
    `).join('');
    
    // Add event listeners to category buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const categoryId = e.target.dataset.category;
            if (categoryId === 'all') {
                loadProducts();
            } else {
                loadProducts(categoryId);
            }
        });
    });
}

// ===== SEARCH FUNCTIONALITY =====
if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const searchQuery = document.getElementById('searchInput').value.toLowerCase();
        
        if (!searchQuery) {
            loadProducts();
            return;
        }
        
        const filtered = products.filter(product => 
            product.name.toLowerCase().includes(searchQuery) ||
            product.description.toLowerCase().includes(searchQuery)
        );
        
        displayProducts(filtered);
    });
}

// ===== WEBSITE SETTINGS =====
async function loadWebsiteSettings() {
    try {
        const response = await fetch('backend/api/settings.php');
        const settings = await response.json();
        
        // Update website name
        const websiteName = document.getElementById('websiteName');
        if (websiteName && settings.website_name) {
            websiteName.textContent = settings.website_name;
        }
        
        // Update social links
        const socialLinks = document.getElementById('socialLinks');
        if (socialLinks && settings.social_links) {
            socialLinks.innerHTML = `
                ${settings.social_links.facebook ? `<a href="${settings.social_links.facebook}"><i class="fab fa-facebook"></i></a>` : ''}
                ${settings.social_links.whatsapp ? `<a href="${settings.social_links.whatsapp}"><i class="fab fa-whatsapp"></i></a>` : ''}
                ${settings.social_links.telegram ? `<a href="${settings.social_links.telegram}"><i class="fab fa-telegram"></i></a>` : ''}
                ${settings.social_links.instagram ? `<a href="${settings.social_links.instagram}"><i class="fab fa-instagram"></i></a>` : ''}
                ${settings.social_links.youtube ? `<a href="${settings.social_links.youtube}"><i class="fab fa-youtube"></i></a>` : ''}
            `;
        }
        
        // Update footer text
        const aboutText = document.getElementById('aboutText');
        if (aboutText && settings.about_text) {
            aboutText.textContent = settings.about_text;
        }
        
        const copyrightText = document.getElementById('copyrightText');
        if (copyrightText && settings.copyright_text) {
            copyrightText.textContent = settings.copyright_text;
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// ===== LAZY LOADING =====
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    loadBanners();
    loadProducts();
    loadCategories();
    loadWebsiteSettings();
});
