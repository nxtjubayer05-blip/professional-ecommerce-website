/* =====================================================
   FIREBASE CONFIGURATION
   ===================================================== */

// Firebase Configuration
// আপনার Firebase প্রজেক্ট সেটিংস থেকে নিম্নোক্ত তথ্য পূরণ করুন
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
let db, auth, storage;

try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    storage = firebase.storage();
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
}

// Authentication State Observer
if (auth) {
    auth.onAuthStateChanged(user => {
        if (user) {
            console.log('User logged in:', user.email);
            updateUserUI(user);
        } else {
            console.log('User logged out');
            resetUserUI();
        }
    });
}

// Update UI with user information
function updateUserUI(user) {
    const profileInfo = document.getElementById('profileInfo');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (profileInfo) {
        profileInfo.innerHTML = `
            <p><strong>${user.displayName || user.email}</strong></p>
            <p style="font-size: 12px; color: #666;">${user.email}</p>
        `;
    }

    if (loginBtn) loginBtn.style.display = 'none';
    if (registerBtn) registerBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'block';
}

// Reset UI when user logs out
function resetUserUI() {
    const profileInfo = document.getElementById('profileInfo');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (profileInfo) {
        profileInfo.innerHTML = '<p>লগইন করুন</p>';
    }

    if (loginBtn) loginBtn.style.display = 'block';
    if (registerBtn) registerBtn.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'none';
}
