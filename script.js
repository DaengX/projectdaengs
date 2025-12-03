// =============================================
// GLOBAL VARIABLES & CONSTANTS
// =============================================
const STORAGE_KEY = 'dataSiswa';
const ADMIN_PASSWORD = 'admin123';

// 🔗 GANTI URL INI DENGAN LINK API ANDA
const API_URL = 'https://projectdaengs.vercel.app/api.php'; // Jika file di folder yang sama
// const API_URL = 'https://sekolahanda.com/api.php'; // Jika di hosting

let dataSiswa = [];

// =============================================
// UTILITY FUNCTIONS
// =============================================

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error, warning)
 */
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = 'toast';
    toast.classList.add(type);
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            showToast('✔ Data berhasil disalin ke clipboard!');
        })
        .catch(err => {
            console.error('Failed to copy: ', err);
            showToast('❌ Gagal menyalin data', 'error');
        });
}

/**
 * Format date to readable string
 * @param {string} isoString - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Get unique classes from data
 * @returns {Array} Array of unique classes
 */
function getUniqueClasses() {
    const classes = dataSiswa.map(item => item.kelas);
    return [...new Set(classes)];
}

// =============================================
// SERVER API FUNCTIONS
// =============================================

/**
 * Save data to server API
 * @param {object} data - Data to save
 * @returns {Promise} Promise with result
 */
async function saveToServer(data) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result;
        
    } catch (error) {
        console.error('Error saving to server:', error);
        // Fallback to localStorage
        return saveToLocalStorage(data);
    }
}

/**
 * Load data from server API
 * @returns {Promise} Promise with data array
 */
async function loadFromServer() {
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
        
    } catch (error) {
        console.error('Error loading from server:', error);
        // Fallback to localStorage
        return loadFromLocalStorage();
    }
}

/**
 * Delete all data from server
 * @returns {Promise} Promise with result
 */
async function deleteFromServer() {
    try {
        const response = await fetch(API_URL, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result;
        
    } catch (error) {
        console.error('Error deleting from server:', error);
        return { success: false, message: 'Gagal menghapus dari server' };
    }
}

// =============================================
// LOCALSTORAGE FALLBACK FUNCTIONS
// =============================================

/**
 * Save data to localStorage (fallback)
 * @param {object} data - Data to save
 * @returns {object} Result object
 */
function saveToLocalStorage(data) {
    try {
        const storedData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        
        const newData = {
            id: Date.now(),
            nama: data.nama,
            kelas: data.kelas,
            mapel: data.mapel,
            waktu: new Date().toISOString()
        };
        
        storedData.push(newData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
        
        return { 
            success: true, 
            message: 'Data disimpan ke penyimpanan lokal' 
        };
        
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return { 
            success: false, 
            message: 'Gagal menyimpan data' 
        };
    }
}

/**
 * Load data from localStorage (fallback)
 * @returns {Array} Data array
 */
function loadFromLocalStorage() {
    try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return [];
    }
}

/**
 * Delete all data from localStorage (fallback)
 */
function deleteFromLocalStorage() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return { success: true, message: 'Data lokal dihapus' };
    } catch (error) {
        console.error('Error deleting from localStorage:', error);
        return { success: false, message: 'Gagal menghapus data lokal' };
    }
}

// =============================================
// SISWA PAGE FUNCTIONS
// =============================================

/**
 * Initialize siswa page
 */
function initSiswaPage() {
    const form = document.getElementById('siswaForm');
    if (!form) return;
    
    form.addEventListener('submit', handleSiswaSubmit);
}

/**
 * Handle siswa form submission
 * @param {Event} e - Form submit event
 */
async function handleSiswaSubmit(e) {
    e.preventDefault();
    
    // Get form values
    const nama = document.getElementById('nama').value.trim();
    const kelas = document.getElementById('kelas').value;
    
    // Get selected mapel
    const mapelCheckboxes = document.querySelectorAll('.checkbox-item input[type="checkbox"]:checked');
    const mapel = Array.from(mapelCheckboxes).map(cb => cb.value);
    
    // Validation
    if (!nama) {
        showToast('❌ Nama harus diisi!', 'error');
        document.getElementById('nama').focus();
        return;
    }
    
    if (mapel.length === 0) {
        showToast('❌ Pilih minimal satu mata pelajaran!', 'error');
        return;
    }
    
    // Create data object
    const data = {
        nama: nama,
        kelas: kelas,
        mapel: mapel
    };
    
    // Disable submit button during processing
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
    submitBtn.disabled = true;
    
    try {
        // Save to server (with localStorage fallback)
        const result = await saveToServer(data);
        
        if (result.success) {
            showToast('✔ ' + result.message);
            
            // Reset form
            e.target.reset();
            document.getElementById('kelas').value = 'XI TSM B';
        } else {
            showToast('❌ ' + result.message, 'error');
        }
    } catch (error) {
        showToast('❌ Terjadi kesalahan saat mengirim data', 'error');
    } finally {
        // Re-enable submit button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// =============================================
// ADMIN PAGE FUNCTIONS
// =============================================

/**
 * Initialize admin page
 */
function initAdminPage() {
    // Check if user is already logged in
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
    
    if (isLoggedIn) {
        showDashboard();
    } else {
        initLogin();
    }
}

/**
 * Initialize login functionality
 */
function initLogin() {
    const loginForm = document.getElementById('loginForm');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    if (!loginForm) return;
    
    // Toggle password visibility
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.innerHTML = type === 'password' ? 
                '<i class="fas fa-eye"></i>' : 
                '<i class="fas fa-eye-slash"></i>';
        });
    }
    
    // Handle login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const password = passwordInput.value.trim();
        
        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            showDashboard();
        } else {
            showToast('❌ Password salah!', 'error');
            passwordInput.value = '';
            passwordInput.focus();
        }
    });
}

/**
 * Show dashboard and hide login
 */
function showDashboard() {
    const loginScreen = document.getElementById('loginScreen');
    const dashboard = document.getElementById('dashboard');
    
    if (loginScreen) loginScreen.style.display = 'none';
    if (dashboard) {
        dashboard.style.display = 'block';
        initDashboard();
    }
}

/**
 * Initialize dashboard functionality
 */
function initDashboard() {
    // Initialize event listeners
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
    document.getElementById('refreshBtn')?.addEventListener('click', refreshData);
    document.getElementById('copyBtn')?.addEventListener('click', copyAllData);
    document.getElementById('deleteBtn')?.addEventListener('click', deleteAllData);
    document.getElementById('filterKelas')?.addEventListener('change', filterKelas);
    
    // Load initial data
    refreshData();
    populateClassFilter();
}

/**
 * Handle logout
 */
function handleLogout() {
    sessionStorage.removeItem('adminLoggedIn');
    window.location.reload();
}

/**
 * Refresh data from server
 */
async function refreshData() {
    const refreshBtn = document.getElementById('refreshBtn');
    const originalText = refreshBtn?.innerHTML;
    
    if (refreshBtn) {
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memuat...';
        refreshBtn.disabled = true;
    }
    
    try {
        // Load from server
        dataSiswa = await loadFromServer();
        
        // Update UI
        renderTable();
        updateStats();
        
        showToast('✔ Data berhasil dimuat dari server');
    } catch (error) {
        showToast('❌ Gagal memuat data dari server', 'error');
    } finally {
        if (refreshBtn) {
            refreshBtn.innerHTML = originalText;
            refreshBtn.disabled = false;
        }
    }
}

/**
 * Copy all data to clipboard
 */
async function copyAllData() {
    if (dataSiswa.length === 0) {
        showToast('❌ Tidak ada data untuk disalin!', 'warning');
        return;
    }
    
    const filterKelas = document.getElementById('filterKelas')?.value;
    let filteredData = dataSiswa;
    
    if (filterKelas && filterKelas !== 'semua') {
        filteredData = dataSiswa.filter(item => item.kelas === filterKelas);
    }
    
    if (filteredData.length === 0) {
        showToast('❌ Tidak ada data untuk kelas ini!', 'warning');
        return;
    }
    
    const kelas = filterKelas === 'semua' ? 'Semua Kelas' : filterKelas;
    let text = `Daftar siswa yang belum mengerjakan ulangan (${kelas}):\n\n`;
    
    filteredData.forEach((item, index) => {
        text += `${index + 1}. ${item.nama} - ${item.mapel.join(', ')}\n`;
    });
    
    text += `\nTotal: ${filteredData.length} siswa\n`;
    text += `Diakses pada: ${new Date().toLocaleDateString('id-ID', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })}`;
    
    copyToClipboard(text);
}

/**
 * Delete all data from server
 */
async function deleteAllData() {
    if (dataSiswa.length === 0) {
        showToast('❌ Tidak ada data untuk dihapus!', 'warning');
        return;
    }
    
    if (!confirm('Apakah Anda yakin ingin menghapus semua data?\nTindakan ini tidak dapat dibatalkan!')) {
        return;
    }
    
    const deleteBtn = document.getElementById('deleteBtn');
    const originalText = deleteBtn?.innerHTML;
    
    if (deleteBtn) {
        deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menghapus...';
        deleteBtn.disabled = true;
    }
    
    try {
        // Try to delete from server first
        const serverResult = await deleteFromServer();
        
        // Also delete from localStorage as backup
        const localResult = deleteFromLocalStorage();
        
        // Clear local data
        dataSiswa = [];
        
        // Update UI
        renderTable();
        updateStats();
        
        if (serverResult.success) {
            showToast('✔ ' + serverResult.message);
        } else {
            showToast('✔ ' + localResult.message);
        }
    } catch (error) {
        showToast('❌ Gagal menghapus data', 'error');
    } finally {
        if (deleteBtn) {
            deleteBtn.innerHTML = originalText;
            deleteBtn.disabled = false;
        }
    }
}

/**
 * Filter data by class
 */
function filterKelas() {
    renderTable();
    updateStats();
}

/**
 * Render data table
 */
function renderTable() {
    const tableBody = document.getElementById('tableBody');
    const emptyState = document.getElementById('emptyState');
    const tableInfo = document.getElementById('tableInfo');
    const filterKelas = document.getElementById('filterKelas')?.value;
    
    if (!tableBody || !emptyState) return;
    
    // Clear table
    tableBody.innerHTML = '';
    
    // Filter data
    let filteredData = dataSiswa;
    if (filterKelas && filterKelas !== 'semua') {
        filteredData = dataSiswa.filter(item => item.kelas === filterKelas);
    }
    
    // Show empty state if no data
    if (filteredData.length === 0) {
        tableBody.style.display = 'none';
        emptyState.style.display = 'block';
        
        const kelasText = filterKelas === 'semua' ? '' : ` untuk kelas ${filterKelas}`;
        if (tableInfo) {
            tableInfo.textContent = `0 data ditemukan${kelasText}`;
        }
        return;
    }
    
    // Hide empty state and show table
    emptyState.style.display = 'none';
    tableBody.style.display = 'table-row-group';
    
    // Populate table
    filteredData.forEach((item, index) => {
        const row = document.createElement('tr');
        
        // Format mapel as tags
        const mapelTags = item.mapel.map(mapel => 
            `<span class="mapel-tag">${mapel}</span>`
        ).join('');
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <strong>${item.nama}</strong>
                <div class="form-hint">${formatDate(item.waktu)}</div>
            </td>
            <td>${item.kelas}</td>
            <td>${mapelTags}</td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Update table info
    if (tableInfo) {
        const kelasText = filterKelas === 'semua' ? '' : ` untuk kelas ${filterKelas}`;
        tableInfo.textContent = `${filteredData.length} data ditemukan${kelasText}`;
    }
}

/**
 * Update statistics
 */
function updateStats() {
    const totalSiswa = document.getElementById('totalSiswa');
    const totalMapel = document.getElementById('totalMapel');
    const filterKelas = document.getElementById('filterKelas')?.value;
    
    // Filter data for stats
    let filteredData = dataSiswa;
    if (filterKelas && filterKelas !== 'semua') {
        filteredData = dataSiswa.filter(item => item.kelas === filterKelas);
    }
    
    if (totalSiswa) {
        totalSiswa.textContent = filteredData.length;
    }
    
    if (totalMapel) {
        const total = filteredData.reduce((sum, item) => sum + item.mapel.length, 0);
        totalMapel.textContent = total;
    }
}

/**
 * Populate class filter dropdown
 */
function populateClassFilter() {
    const filterSelect = document.getElementById('filterKelas');
    if (!filterSelect) return;
    
    // Keep the existing options (Semua Kelas and XI TSM B)
    const currentOptions = Array.from(filterSelect.options).map(opt => opt.value);
    
    // Add unique classes from data
    const uniqueClasses = getUniqueClasses();
    uniqueClasses.forEach(className => {
        if (!currentOptions.includes(className)) {
            const option = document.createElement('option');
            option.value = className;
            option.textContent = className;
            filterSelect.appendChild(option);
        }
    });
}

// =============================================
// PAGE INITIALIZATION
// =============================================

/**
 * Initialize the page based on current URL
 */
function initPage() {
    const currentPage = window.location.pathname;
    
    // Initialize based on page
    if (currentPage.includes('siswa.html') || currentPage.endsWith('/')) {
        initSiswaPage();
    } else if (currentPage.includes('admin.html')) {
        initAdminPage();
    }
    
    // Add styles for mapel tags
    const style = document.createElement('style');
    style.textContent = `
        .mapel-tag {
            display: inline-block;
            background-color: #EFF6FF;
            color: #3B82F6;
            padding: 0.25rem 0.75rem;
            border-radius: 50px;
            font-size: 0.875rem;
            margin: 0.25rem;
            font-weight: 500;
        }
        
        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none !important;
        }
        
        .fa-spinner {
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initPage);

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        saveToServer,
        loadFromServer,
        saveToLocalStorage,
        loadFromLocalStorage,
        showToast,
        copyToClipboard,
        formatDate
    };
}
