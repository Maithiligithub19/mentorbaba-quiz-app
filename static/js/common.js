// Common JavaScript functions for all pages

// Global user state
let currentUser = null;

// Template rendering function
function renderTemplate(templateId, data) {
    const template = document.getElementById(templateId).innerHTML;
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || '');
}

// Load base template content
function loadPage(title, content, scripts = '') {
    const baseTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title} - QuizXMentor</title>
            <link rel="stylesheet" href="/css/style.css">
        </head>
        <body>
            <nav class="navbar">
                <div class="nav-brand">
                    <h2>QuizXMentor</h2>
                </div>
                <div class="nav-links" id="navLinks">
                    <!-- Navigation populated by updateNavigation() -->
                </div>
            </nav>

            <main class="main-content">
                ${content}
            </main>

            <footer class="footer">
                <p>&copy; 2024 QuizXMentor. All rights reserved.</p>
            </footer>

            <script src="/js/api-client.js"></script>
            <script src="/js/common.js"></script>
            ${scripts}
        </body>
        </html>
    `;
    
    document.documentElement.innerHTML = baseTemplate;
    updateNavigation();
}

// Update navigation based on authentication status
async function updateNavigation() {
    const navLinks = document.getElementById('navLinks');
    
    if (!navLinks) return; // Skip if no navLinks element
    
    try {
        await api.getCurrentUser();
        // User is logged in
        navLinks.innerHTML = `
            <a href="/dashboard.html">Dashboard</a>
            <button onclick="handleLogout()" class="nav-btn">Logout</button>
        `;
    } catch (error) {
        // User not logged in
        navLinks.innerHTML = `
            <a href="/login.html">Login</a>
            <a href="/register.html">Register</a>
        `;
    }
}

// Common message display
function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 5px;
        color: white;
        z-index: 1000;
        font-weight: bold;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        background-color: ${type === 'success' ? '#28a745' : '#dc3545'};
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}

// Common form validation
function validateForm(formData, rules) {
    const errors = [];
    
    for (const [field, rule] of Object.entries(rules)) {
        const value = formData[field];
        
        if (rule.required && (!value || value.trim() === '')) {
            errors.push(`${field} is required`);
        }
        
        if (rule.minLength && value && value.length < rule.minLength) {
            errors.push(`${field} must be at least ${rule.minLength} characters`);
        }
        
        if (rule.email && value && !/\S+@\S+\.\S+/.test(value)) {
            errors.push(`${field} must be a valid email`);
        }
    }
    
    return errors;
}

// Common loading indicator
function showLoading(show = true) {
    let loader = document.getElementById('loader');
    
    if (show) {
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'loader';
            loader.innerHTML = '<div class="spinner"></div><p style="color: white; margin-top: 1rem;">Processing...</p>';
            loader.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 9999;
            `;
            document.body.appendChild(loader);
        }
        loader.style.display = 'flex';
        
        // Disable upload button
        const uploadBtn = document.getElementById('uploadBtn');
        if (uploadBtn) {
            uploadBtn.disabled = true;
            uploadBtn.textContent = 'Uploading...';
        }
    } else {
        if (loader) {
            loader.style.display = 'none';
        }
        
        // Re-enable upload button
        const uploadBtn = document.getElementById('uploadBtn');
        if (uploadBtn) {
            uploadBtn.disabled = false;
            uploadBtn.textContent = 'Upload Questions';
        }
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    updateNavigation();
});