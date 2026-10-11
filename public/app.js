const API_BASE = '/api';

// DOM Elements
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const userProfileBar = document.getElementById('user-profile-bar');
const userEmailDisplay = document.getElementById('user-email-display');
const logoutBtn = document.getElementById('logout-btn');

const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

const createTaskForm = document.getElementById('create-task-form');
const taskTitleInput = document.getElementById('task-title');
const tasksList = document.getElementById('tasks-list');
const tasksLoading = document.getElementById('tasks-loading');
const tasksEmpty = document.getElementById('tasks-empty');
const taskCountBadge = document.getElementById('task-count-badge');

const meEmail = document.getElementById('me-email');
const meId = document.getElementById('me-id');
const refreshMeBtn = document.getElementById('refresh-me-btn');
const toast = document.getElementById('toast');

// State
let token = localStorage.getItem('token');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    if (token) {
        verifySession();
    } else {
        showAuth();
    }
});

// Event Listeners
function setupEventListeners() {
    // Tab switching
    tabLogin.addEventListener('click', () => switchTab('login'));
    tabRegister.addEventListener('click', () => switchTab('register'));

    // Auth Forms
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);

    // Logout
    logoutBtn.addEventListener('click', handleLogout);

    // Tasks
    createTaskForm.addEventListener('submit', handleCreateTask);
    refreshMeBtn.addEventListener('click', fetchUserProfile);
}

// Switch between Login and Register tabs
function switchTab(tab) {
    if (tab === 'login') {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    } else {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    }
}

// Show Toast Notification
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    setTimeout(() => {
        toast.className = 'toast hidden';
    }, 4000);
}

// Helper: Fetch with Authorization Bearer Header
async function fetchWithAuth(url, options = {}) {
    options.headers = {
        ...options.headers,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    const res = await fetch(url, options);

    // Handle 401 Unauthorized (Token missing or expired)
    if (res.status === 401) {
        showToast('Session expired or unauthorized. Please log in again.', 'error');
        handleLogout();
        throw new Error('Unauthorized');
    }

    return res;
}

// Handle User Registration
async function handleRegister(e) {
    e.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (data.success) {
            showToast('Registration successful! Please log in.', 'success');
            registerForm.reset();
            switchTab('login');
        } else {
            showToast(data.message || 'Registration failed', 'error');
        }
    } catch (err) {
        showToast('Network error during registration', 'error');
    }
}

// Handle User Login
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (data.success) {
            token = data.token;
            localStorage.setItem('token', token);
            showToast('Login successful!', 'success');
            loginForm.reset();
            verifySession();
        } else {
            showToast(data.message || 'Login failed', 'error');
        }
    } catch (err) {
        showToast('Network error during login', 'error');
    }
}

// Logout Mechanism
function handleLogout() {
    token = null;
    localStorage.removeItem('token');
    showAuth();
    showToast('Logged out successfully', 'success');
}

// Verify Current Session using /me endpoint
async function verifySession() {
    try {
        const res = await fetchWithAuth(`${API_BASE}/auth/me`);
        const data = await res.json();

        if (data.success) {
            showDashboard(data.user);
            fetchTasks();
        }
    } catch (err) {
        // Handled by fetchWithAuth 401 logic
    }
}

// Fetch User Profile (/me endpoint test)
async function fetchUserProfile() {
    try {
        const res = await fetchWithAuth(`${API_BASE}/auth/me`);
        const data = await res.json();

        if (data.success) {
            meEmail.textContent = data.user.email;
            meId.textContent = data.user._id;
            userEmailDisplay.textContent = data.user.email;
            showToast('User profile reloaded via /me endpoint', 'success');
        }
    } catch (err) {}
}

// View Controllers
function showAuth() {
    authSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
    userProfileBar.classList.add('hidden');
}

function showDashboard(user) {
    authSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    userProfileBar.classList.remove('hidden');
    
    userEmailDisplay.textContent = user.email;
    meEmail.textContent = user.email;
    meId.textContent = user._id;
}

// Fetch Tasks from Protected API
async function fetchTasks() {
    tasksLoading.classList.remove('hidden');
    tasksEmpty.classList.add('hidden');
    tasksList.innerHTML = '';

    try {
        const res = await fetchWithAuth(`${API_BASE}/tasks`);
        const data = await res.json();

        tasksLoading.classList.add('hidden');

        if (data.success) {
            renderTasks(data.tasks);
        }
    } catch (err) {
        tasksLoading.classList.add('hidden');
    }
}

// Render Tasks List
function renderTasks(tasks) {
    taskCountBadge.textContent = `${tasks.length} Tasks`;

    if (tasks.length === 0) {
        tasksEmpty.classList.remove('hidden');
        return;
    }

    tasksEmpty.classList.add('hidden');
    tasksList.innerHTML = tasks.map(task => `
        <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task._id}">
            <div class="task-left">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask('${task._id}', this.checked)">
                <span class="task-text">${escapeHtml(task.title)}</span>
            </div>
            <button class="btn-delete" onclick="deleteTask('${task._id}')" title="Delete Task">🗑️</button>
        </li>
    `).join('');
}

// Create New Task
async function handleCreateTask(e) {
    e.preventDefault();
    const title = taskTitleInput.value.trim();
    if (!title) return;

    try {
        const res = await fetchWithAuth(`${API_BASE}/tasks`, {
            method: 'POST',
            body: JSON.stringify({ title })
        });

        const data = await res.json();
        if (data.success) {
            showToast('Task added successfully', 'success');
            taskTitleInput.value = '';
            fetchTasks();
        } else {
            showToast(data.message || 'Validation error', 'error');
        }
    } catch (err) {}
}

// Toggle Task Completion
async function toggleTask(id, completed) {
    try {
        const res = await fetchWithAuth(`${API_BASE}/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ completed })
        });

        const data = await res.json();
        if (data.success) {
            fetchTasks();
        }
    } catch (err) {}
}

// Delete Task
async function deleteTask(id) {
    try {
        const res = await fetchWithAuth(`${API_BASE}/tasks/${id}`, {
            method: 'DELETE'
        });

        const data = await res.json();
        if (data.success) {
            showToast('Task deleted', 'success');
            fetchTasks();
        }
    } catch (err) {}
}

// Utility: Escape HTML
function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}
