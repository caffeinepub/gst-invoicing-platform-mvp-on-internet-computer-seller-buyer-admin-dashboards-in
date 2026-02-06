/*
============================================
STANDALONE GST DEMO - JAVASCRIPT
============================================
Vanilla ES6 JavaScript for SPA-style navigation and state management.
No external dependencies or frameworks.

STATE SHAPE:
- isAuthenticated: boolean
- currentView: string
- invoices: array of invoice objects
- gstFiled: boolean
- filingDate: string

KEY FUNCTIONS:
- Authentication: validateLoginForm, handleLogin, handleLogout
- Navigation: showView, setupNavigation
- Invoice Management: validateInvoiceForm, addInvoice, viewInvoice, deleteInvoice
- GST Returns: validateGstForm, fileGstReturn
- API Requests: apiRequest (with fetch, graceful fallback for file:// mode)
- State Updates: updateDashboard, renderInvoiceTable

FETCH BEHAVIOR:
- Uses placeholder REST API URLs
- Gracefully handles failures (CORS, network, file:// protocol)
- Falls back to local state management when API unavailable
============================================
*/

// ==================== STATE MANAGEMENT ====================
const appState = {
    isAuthenticated: false,
    currentView: 'login',
    invoices: [],
    gstFiled: false,
    filingDate: null
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format currency to Indian Rupee format
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount);
}

/**
 * Format date to readable string
 */
function formatDate(date) {
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date);
}

/**
 * Generate unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Show message in a message container
 */
function showMessage(containerId, message, type = 'info') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.textContent = message;
    container.className = `message ${type} show`;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        container.classList.remove('show');
    }, 5000);
}

/**
 * Hide message
 */
function hideMessage(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.classList.remove('show');
    }
}

// ==================== API REQUEST WRAPPER ====================

/**
 * API request wrapper using fetch()
 * Gracefully handles failures in file:// mode or offline scenarios
 */
async function apiRequest(endpoint, options = {}) {
    // Placeholder API base URL
    const API_BASE = 'https://api.example.com/gst';
    const url = `${API_BASE}${endpoint}`;
    
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.warn('API request failed (expected in file:// mode):', error.message);
        // Fallback to local state management
        return null;
    }
}

// ==================== AUTHENTICATION ====================

/**
 * Validate login form
 */
function validateLoginForm(username, password) {
    const errors = [];
    
    if (!username || username.trim().length === 0) {
        errors.push('Username is required');
    }
    
    if (!password || password.trim().length === 0) {
        errors.push('Password is required');
    }
    
    if (password && password.length < 6) {
        errors.push('Password must be at least 6 characters');
    }
    
    return errors;
}

/**
 * Handle login
 */
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Client-side validation
    const errors = validateLoginForm(username, password);
    
    if (errors.length > 0) {
        showMessage('login-message', errors.join('. '), 'error');
        return;
    }
    
    // Attempt API login (will fallback to local validation)
    const apiResult = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    });
    
    // Demo credentials validation (fallback)
    if (username === 'admin' && password === 'admin123') {
        appState.isAuthenticated = true;
        localStorage.setItem('gst_auth', 'true');
        
        showMessage('login-message', 'Login successful! Redirecting...', 'success');
        
        setTimeout(() => {
            showView('dashboard');
            updateDashboard();
        }, 1000);
    } else {
        showMessage('login-message', 'Invalid username or password', 'error');
    }
}

/**
 * Handle logout
 */
function handleLogout() {
    appState.isAuthenticated = false;
    appState.invoices = [];
    appState.gstFiled = false;
    appState.filingDate = null;
    
    localStorage.removeItem('gst_auth');
    
    // Clear forms
    document.getElementById('login-form').reset();
    
    showView('login');
}

// ==================== NAVIGATION ====================

/**
 * Show specific view
 */
function showView(viewName) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    // Show requested view
    const targetView = document.getElementById(`${viewName}-view`);
    if (targetView) {
        targetView.classList.add('active');
        appState.currentView = viewName;
        
        // Update active nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.view === viewName) {
                link.classList.add('active');
            }
        });
        
        // Close mobile menu if open
        document.querySelectorAll('.navbar-menu').forEach(menu => {
            menu.classList.remove('active');
        });
    }
}

/**
 * Setup navigation event listeners
 */
function setupNavigation() {
    // Handle all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = link.dataset.view;
            if (view) {
                showView(view);
                
                // Update view-specific data
                if (view === 'dashboard') {
                    updateDashboard();
                } else if (view === 'invoices') {
                    renderInvoiceTable();
                } else if (view === 'gst-returns') {
                    updateGstSummary();
                }
            }
        });
    });
    
    // Handle logout buttons
    document.querySelectorAll('[id^="logout-btn"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    });
    
    // Handle mobile menu toggles
    document.querySelectorAll('.mobile-menu-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const menu = toggle.parentElement.querySelector('.navbar-menu');
            if (menu) {
                menu.classList.toggle('active');
            }
        });
    });
}

// ==================== DASHBOARD ====================

/**
 * Update dashboard summary cards
 */
function updateDashboard() {
    // Total invoices
    document.getElementById('total-invoices').textContent = appState.invoices.length;
    
    // Calculate total GST payable
    const totalGst = appState.invoices.reduce((sum, invoice) => {
        return sum + invoice.gstAmount;
    }, 0);
    document.getElementById('gst-payable').textContent = formatCurrency(totalGst);
    
    // Filing status
    const statusEl = document.getElementById('filing-status');
    const dateEl = document.getElementById('filing-date');
    
    if (appState.gstFiled && appState.filingDate) {
        statusEl.textContent = 'Filed';
        statusEl.style.color = 'var(--color-success)';
        dateEl.textContent = `Filed on ${appState.filingDate}`;
    } else {
        statusEl.textContent = 'Not Filed';
        statusEl.style.color = 'var(--color-warning)';
        dateEl.textContent = 'No recent filing';
    }
}

// ==================== INVOICE MANAGEMENT ====================

/**
 * Validate invoice form
 */
function validateInvoiceForm(formData) {
    const errors = [];
    
    if (!formData.invoiceNumber || formData.invoiceNumber.trim().length === 0) {
        errors.push('Invoice number is required');
    }
    
    if (!formData.buyerName || formData.buyerName.trim().length === 0) {
        errors.push('Buyer name is required');
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
        errors.push('Valid amount is required');
    }
    
    if (!formData.gstRate || formData.gstRate === '') {
        errors.push('GST rate is required');
    }
    
    return errors;
}

/**
 * Add new invoice
 */
async function addInvoice(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = {
        invoiceNumber: form.invoiceNumber.value,
        buyerName: form.buyerName.value,
        amount: parseFloat(form.amount.value),
        gstRate: parseFloat(form.gstRate.value),
        description: form.description.value
    };
    
    // Validate form
    const errors = validateInvoiceForm(formData);
    if (errors.length > 0) {
        showMessage('invoice-message', errors.join('. '), 'error');
        return;
    }
    
    // Calculate GST
    const gstAmount = (formData.amount * formData.gstRate) / 100;
    const totalAmount = formData.amount + gstAmount;
    
    // Create invoice object
    const invoice = {
        id: generateId(),
        ...formData,
        gstAmount,
        totalAmount,
        date: new Date()
    };
    
    // Attempt API call
    await apiRequest('/invoices', {
        method: 'POST',
        body: JSON.stringify(invoice)
    });
    
    // Add to local state
    appState.invoices.push(invoice);
    
    // Update UI
    renderInvoiceTable();
    updateDashboard();
    
    // Show success message
    showMessage('invoice-message', 'Invoice added successfully!', 'success');
    
    // Reset form
    form.reset();
}

/**
 * Render invoice table
 */
function renderInvoiceTable() {
    const tbody = document.getElementById('invoice-table-body');
    
    if (appState.invoices.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No invoices yet. Add your first invoice above.</td></tr>';
        return;
    }
    
    tbody.innerHTML = appState.invoices.map(invoice => `
        <tr>
            <td><strong>${invoice.invoiceNumber}</strong></td>
            <td>${invoice.buyerName}</td>
            <td>${formatCurrency(invoice.amount)}</td>
            <td>${formatCurrency(invoice.gstAmount)} (${invoice.gstRate}%)</td>
            <td><strong>${formatCurrency(invoice.totalAmount)}</strong></td>
            <td>${formatDate(invoice.date)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-secondary btn-icon" onclick="viewInvoice('${invoice.id}')">View</button>
                    <button class="btn btn-danger btn-icon" onclick="deleteInvoice('${invoice.id}')">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * View invoice details in modal
 */
function viewInvoice(invoiceId) {
    const invoice = appState.invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;
    
    const modal = document.getElementById('invoice-modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <div class="invoice-detail-row">
            <span>Invoice Number:</span>
            <span>${invoice.invoiceNumber}</span>
        </div>
        <div class="invoice-detail-row">
            <span>Buyer Name:</span>
            <span>${invoice.buyerName}</span>
        </div>
        <div class="invoice-detail-row">
            <span>Date:</span>
            <span>${formatDate(invoice.date)}</span>
        </div>
        <div class="invoice-detail-row">
            <span>Base Amount:</span>
            <span>${formatCurrency(invoice.amount)}</span>
        </div>
        <div class="invoice-detail-row">
            <span>GST Rate:</span>
            <span>${invoice.gstRate}%</span>
        </div>
        <div class="invoice-detail-row">
            <span>GST Amount:</span>
            <span>${formatCurrency(invoice.gstAmount)}</span>
        </div>
        <div class="invoice-detail-row">
            <span>Total Amount:</span>
            <span><strong>${formatCurrency(invoice.totalAmount)}</strong></span>
        </div>
        ${invoice.description ? `
        <div class="invoice-detail-row">
            <span>Description:</span>
            <span>${invoice.description}</span>
        </div>
        ` : ''}
    `;
    
    modal.classList.add('show');
}

/**
 * Delete invoice
 */
async function deleteInvoice(invoiceId) {
    if (!confirm('Are you sure you want to delete this invoice?')) {
        return;
    }
    
    // Attempt API call
    await apiRequest(`/invoices/${invoiceId}`, {
        method: 'DELETE'
    });
    
    // Remove from local state
    appState.invoices = appState.invoices.filter(inv => inv.id !== invoiceId);
    
    // Update UI
    renderInvoiceTable();
    updateDashboard();
}

// ==================== GST RETURNS ====================

/**
 * Validate GST form
 */
function validateGstForm(formData) {
    const errors = [];
    
    if (!formData.returnPeriod || formData.returnPeriod === '') {
        errors.push('Return period is required');
    }
    
    if (!formData.gstin || formData.gstin.trim().length === 0) {
        errors.push('GSTIN is required');
    }
    
    // Validate GSTIN format (basic check)
    const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (formData.gstin && !gstinPattern.test(formData.gstin)) {
        errors.push('Invalid GSTIN format');
    }
    
    return errors;
}

/**
 * Update GST summary
 */
function updateGstSummary() {
    const totalInvoices = appState.invoices.length;
    const totalTaxable = appState.invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalGst = appState.invoices.reduce((sum, inv) => sum + inv.gstAmount, 0);
    
    document.getElementById('gst-total-invoices').textContent = totalInvoices;
    document.getElementById('gst-taxable-amount').textContent = formatCurrency(totalTaxable);
    document.getElementById('gst-total-payable').textContent = formatCurrency(totalGst);
}

/**
 * File GST return
 */
async function fileGstReturn(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = {
        returnPeriod: form.returnPeriod.value,
        gstin: form.gstin.value
    };
    
    // Validate form
    const errors = validateGstForm(formData);
    if (errors.length > 0) {
        showMessage('gst-message', errors.join('. '), 'error');
        return;
    }
    
    // Check if there are invoices
    if (appState.invoices.length === 0) {
        showMessage('gst-message', 'No invoices available to file GST return', 'error');
        return;
    }
    
    // Attempt API call
    await apiRequest('/gst/file', {
        method: 'POST',
        body: JSON.stringify({
            ...formData,
            invoices: appState.invoices
        })
    });
    
    // Update state
    appState.gstFiled = true;
    appState.filingDate = formatDate(new Date());
    
    // Show success message
    showMessage('gst-message', `GST Return filed successfully for ${formData.returnPeriod}!`, 'success');
    
    // Update dashboard
    updateDashboard();
    
    // Reset form
    form.reset();
    updateGstSummary();
}

// ==================== MODAL HANDLING ====================

/**
 * Close modal
 */
function closeModal() {
    const modal = document.getElementById('invoice-modal');
    modal.classList.remove('show');
}

// ==================== INITIALIZATION ====================

/**
 * Initialize app on DOM load
 */
document.addEventListener('DOMContentLoaded', () => {
    // Check for existing auth (persistence)
    const savedAuth = localStorage.getItem('gst_auth');
    if (savedAuth === 'true') {
        appState.isAuthenticated = true;
        showView('dashboard');
        updateDashboard();
    } else {
        showView('login');
    }
    
    // Setup navigation
    setupNavigation();
    
    // Setup form handlers
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('invoice-form').addEventListener('submit', addInvoice);
    document.getElementById('gst-form').addEventListener('submit', fileGstReturn);
    
    // Setup modal close
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('invoice-modal').addEventListener('click', (e) => {
        if (e.target.id === 'invoice-modal') {
            closeModal();
        }
    });
    
    // Make functions globally available for inline onclick handlers
    window.viewInvoice = viewInvoice;
    window.deleteInvoice = deleteInvoice;
    
    console.log('GST Portal initialized successfully');
    console.log('Demo credentials: username: admin, password: admin123');
});
