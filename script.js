// =============================================
// GLOBAL VARIABLES & CONSTANTS
// =============================================
const STORAGE_KEY = 'dataSiswa';
const ADMIN_PASSWORD = 'admin123';
let dataSiswa = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

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
function handleSiswaSubmit(e) {
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
        return;
    }
    
    if (mapel.length === 0) {
        showToast('❌ Pilih minimal satu mata pelajaran!', 'error');
        return;
    }
    
    // Create data object
    const data = {
        id: Date.now(), // Unique ID
        nama: nama,
        kelas: kelas,
        mapel: mapel,
        waktu: new Date().toISOString()
    };
    
    // Save to localStorage
    dataSiswa.push(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataSiswa));
    
    // Show success message
    showToast('✔ Data berhasil dikirim!');
    
    // Reset form
    form.reset();
    document.getElementById('kelas').value = 'XI TSM B';
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
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
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
    renderTable();
    updateStats();
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
 * Refresh data
 */
function refreshData() {
    dataSiswa = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    renderTable();
    updateStats();
    showToast('✔ Data berhasil diperbarui!');
}

/**
 * Copy all data to clipboard
 */
function copyAllData() {
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
    text += `Diakses pada: ${new Date().toLocaleDateString('id-ID')}`;
    
    copyToClipboard(text);
}

/**
 * Delete all data
 */
function deleteAllData() {
    if (dataSiswa.length === 0) {
        showToast('❌ Tidak ada data untuk dihapus!', 'warning');
        return;
    }
    
    if (confirm('Apakah Anda yakin ingin menghapus semua data? Tindakan ini tidak dapat dibatalkan.')) {
        localStorage.removeItem(STORAGE_KEY);
        dataSiswa = [];
        renderTable();
        updateStats();
        showToast('✔ Semua data berhasil dihapus!');
    }
}

/**
 * Filter data by class
 */
function filterKelas() {
    renderTable();
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
        tableInfo.textContent = `0 data ditemukan${kelasText}`;
        return;
    }
    
    // Hide empty state and show table
    emptyState.style.display = 'none';
    tableBody.style.display = 'table-row-group';
    
    // Populate table
    filteredData.forEach((item, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <strong>${item.nama}</strong>
                <div class="form-hint">${formatDate(item.waktu)}</div>
            </td>
            <td>${item.kelas}</td>
            <td>
                ${item.mapel.map(mapel => 
                    `<span class="mapel-tag">${mapel}</span>`
                ).join('')}
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Update table info
    const kelasText = filterKelas === 'semua' ? '' : ` untuk kelas ${filterKelas}`;
    tableInfo.textContent = `${filteredData.length} data ditemukan${kelasText}`;
}

/**
 * Update statistics
 */
function updateStats() {
    const totalSiswa = document.getElementById('totalSiswa');
    const totalMapel = document.getElementById('totalMapel');
    
    if (totalSiswa) {
        totalSiswa.textContent = dataSiswa.length;
    }
    
    if (totalMapel) {
        const total = dataSiswa.reduce((sum, item) => sum + item.mapel.length, 0);
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
    
    if (currentPage.includes('siswa.html')) {
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
            color: var(--primary);
            padding: 0.25rem 0.75rem;
            border-radius: 50px;
            font-size: 0.875rem;
            margin: 0.25rem;
        }
    `;
    document.head.appendChild(style);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initPage);
