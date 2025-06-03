// Configuration
const API_URL = 'https://python-web-p5sz.onrender.com';

// DOM Elements
const adminLoginForm = document.getElementById('admin-login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.querySelector('.toggle-password');
const statusMessage = document.getElementById('status-message');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    setupMobileOptimizations();
    
    // Check if user is already logged in
    const token = localStorage.getItem('admin_token');
    if (token) {
        window.location.href = 'dashboard.html';
    }
});

if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', handleLogin);
}

if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
}

// Functions
function setupMobileOptimizations() {
    // Fix for iOS input zoom issues
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
        document.addEventListener('focus', function(e) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
            }
        }, true);
        
        document.addEventListener('blur', function() {
            viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }, true);
    }
    
    // Improve mobile touch targets
    if (window.innerWidth <= 768) {
        const touchTargets = document.querySelectorAll('a, button, .toggle-option, input[type="file"]');
        touchTargets.forEach(target => {
            if (target.style.minHeight !== '44px') {
                target.style.minHeight = '44px';
            }
        });
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    // Get form values
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Validate form
    if (!email || !password) {
        showMessage('Please enter both email and password.', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = adminLoginForm.querySelector('.submit-btn');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;
    
    try {
        // In a real app, you would send this to your backend API
        // For demo purposes, we're using a hardcoded admin credential
        if (email === 'admin@example.com' && password === 'admin123') {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Store token in localStorage (in a real app, this would come from the server)
            localStorage.setItem('admin_token', 'demo_token_123');
            localStorage.setItem('admin_user', JSON.stringify({
                email: 'admin@example.com',
                name: 'Admin User',
                role: 'administrator'
            }));
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            showMessage('Invalid email or password. Try admin@example.com / admin123', 'error');
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Failed to login. Please try again.', 'error');
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
    }
}

function togglePasswordVisibility() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // Toggle icon
    const icon = togglePasswordBtn.querySelector('i');
    if (type === 'text') {
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function showMessage(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `message ${type}`;
    statusMessage.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        statusMessage.style.opacity = '0';
        setTimeout(() => {
            statusMessage.style.display = 'none';
            statusMessage.style.opacity = '1';
        }, 500);
    }, 5000);
} 