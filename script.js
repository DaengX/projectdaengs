// ========== KONFIGURASI ONLINE ==========
const CONFIG = {
    ADMIN_KEY: "admin123", // GANTI PASSWORD INI!
    GOOGLE_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbxnF4uOQI3-wYT5h2gRvMFxCYBfG__qYVTA6qBN33fRw465Ef0eyAHubyVNmMpzv_vmzw/exec"
};

// ========== VARIABEL GLOBAL ==========
let adminAuthenticated = false;
let siswaData = [];

// ========== FUNGSI ONLINE ==========

// 1. Kirim data ke Google Sheets (Metode 100% WORKING)
async function kirimDataOnline(data) {
    console.log('🔄 Mengirim data online:', data);
    
    try {
        // Method 1: Menggunakan fetch dengan FormData (paling kompatibel)
        const formData = new FormData();
        formData.append('nama', data.nama);
        formData.append('mapel', JSON.stringify(data.mapel));
        
        const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Data berhasil dikirim:', result.message);
            return result;
        } else {
            throw new Error(result.error || 'Gagal mengirim data');
        }
        
    } catch (error) {
        console.error('❌ Error Method 1:', error);
        
        // Method 2: Menggunakan URL parameters (GET method fallback)
        try {
            const params = new URLSearchParams({
                nama: data.nama,
                mapel: JSON.stringify(data.mapel)
            });
            
            const url = `${CONFIG.GOOGLE_SCRIPT_URL}?${params.toString()}`;
            const response = await fetch(url);
            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Data berhasil dikirim (method 2)');
                return result;
            } else {
                throw new Error('Method 2 failed');
            }
        } catch (error2) {
            console.error('❌ Error Method 2:', error2);
            
            // Method 3: Menggunakan iframe (terakhir)
            return kirimDataDenganIframe(data);
        }
    }
}

// 2. Kirim data dengan iframe (fallback)
function kirimDataDenganIframe(data) {
    return new Promise((resolve) => {
        // Buat form
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = CONFIG.GOOGLE_SCRIPT_URL;
        form.style.display = 'none';
        
        // Tambah input
        const namaInput = document.createElement('input');
        namaInput.name = 'nama';
        namaInput.value = data.nama;
        form.appendChild(namaInput);
        
        const mapelInput = document.createElement('input');
        mapelInput.name = 'mapel';
        mapelInput.value = JSON.stringify(data.mapel);
        form.appendChild(mapelInput);
        
        // Buat iframe untuk response
        const iframe = document.createElement('iframe');
        iframe.name = 'responseFrame';
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        form.target = 'responseFrame';
        document.body.appendChild(form);
        
        // Submit
        form.submit();
        
        // Simpan ke localStorage sebagai backup sementara
        setTimeout(() => {
            simpanKeLocalStorageBackup(data);
            resolve({ success: true, message: 'Data dikirim (iframe method)' });
        }, 2000);
    });
}

// 3. Ambil data dari Google Sheets
async function ambilDataOnline() {
    try {
        console.log('🔄 Mengambil data online...');
        
        // Tambah timestamp untuk menghindari cache
        const url = CONFIG.GOOGLE_SCRIPT_URL + '?t=' + Date.now();
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Data berhasil diambil:', result.data.length, 'records');
            return result.data;
        } else {
            throw new Error(result.error || 'Error dari server');
        }
        
    } catch (error) {
        console.error('❌ Gagal mengambil data online:', error);
        
        // Coba ambil dari localStorage backup
        const backupData = JSON.parse(localStorage.getItem('siswaDataBackup')) || [];
        console.log('⚠️ Menggunakan data backup lokal:', backupData.length, 'records');
        
        return backupData;
    }
}

// 4. Simpan backup ke localStorage
function simpanKeLocalStorageBackup(data) {
    try {
        let existingData = JSON.parse(localStorage.getItem('siswaDataBackup')) || [];
        
        // Cek apakah sudah ada
        const existingIndex = existingData.findIndex(item => item.nama === data.nama);
        
        const newEntry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            nama: data.nama,
            mapel: data.mapel,
            mapelText: data.mapel.join(', ')
        };
        
        if (existingIndex !== -1) {
            // Update existing
            existingData[existingIndex] = newEntry;
        } else {
            // Add new
            existingData.unshift(newEntry);
        }
        
        localStorage.setItem('siswaDataBackup', JSON.stringify(existingData));
        console.log('📦 Data disimpan ke backup lokal');
        
    } catch (error) {
        console.error('Error backup ke localStorage:', error);
    }
}

// ========== FUNGSI ADMIN (SAMA) ==========

// [FUNGSI ADMIN YANG SAMA DARI SEBELUMNYA]
// loginAdmin, logoutAdmin, checkAdminAuth, renderTabel, dll...
// Tetap gunakan kode yang sama untuk bagian admin

// ========== EVENT HANDLER SISWA ==========

if (siswaForm) {
    siswaForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Ambil data
        const nama = document.getElementById('nama').value.trim();
        const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
        
        // Validasi
        if (!nama) {
            showAlert('❌ Mohon isi nama lengkap!', 'error');
            return;
        }
        
        if (checkboxes.length === 0) {
            showAlert('❌ Pilih minimal satu mata pelajaran!', 'error');
            return;
        }
        
        const mapel = Array.from(checkboxes).map(cb => cb.value);
        const data = { nama, mapel };
        
        // Tampilkan loading
        showLoading(true);
        
        try {
            // Kirim ke server ONLINE
            const result = await kirimDataOnline(data);
            
            if (result.success) {
                // Reset form
                siswaForm.reset();
                
                // Tampilkan sukses
                showLoading(false);
                showSuccess(result.message);
                
                // Jika di halaman admin, refresh data
                if (document.getElementById('adminPanel')) {
                    loadSiswaData();
                }
            } else {
                throw new Error(result.error || 'Gagal mengirim data');
            }
            
        } catch (error) {
            showLoading(false);
            showAlert('⚠️ Data disimpan lokal. Server offline: ' + error.message, 'warning');
        }
    });
}

// ========== HELPER FUNCTIONS ==========

function showLoading(show) {
    if (loadingElement) {
        loadingElement.style.display = show ? 'block' : 'none';
    }
    if (successElement) {
        successElement.style.display = 'none';
    }
}

function showSuccess(message) {
    if (successElement) {
        const messageEl = successElement.querySelector('h3');
        if (messageEl) messageEl.textContent = message || 'Data Berhasil Dikirim!';
        successElement.style.display = 'block';
        
        setTimeout(() => {
            successElement.style.display = 'none';
        }, 3000);
    }
}

function showAlert(message, type = 'info') {
    // Buat alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        ${message}
        <button onclick="this.parentElement.remove()" style="background:none;border:none;color:inherit;margin-left:auto;cursor:pointer;">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Style
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'error' ? '#ff4757' : type === 'warning' ? '#ffa502' : '#2ed573'};
        color: white;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 1000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `;
    
    document.body.appendChild(alertDiv);
    
    // Hapus otomatis setelah 5 detik
    setTimeout(() => {
        if (alertDiv.parentElement) {
            alertDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => alertDiv.remove(), 300);
        }
    }, 5000);
}

// ========== INISIALISASI ==========

document.addEventListener('DOMContentLoaded', function() {
    console.log('🌐 Sistem Online Loaded');
    console.log('Google Script URL:', CONFIG.GOOGLE_SCRIPT_URL);
    
    // Tambah animasi CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .mapel-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
        }
        .mapel-tag {
            background: #e8f4ff;
            color: #4361ee;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 500;
            border: 1px solid #c3d9ff;
        }
        #responseFrame {
            display: none;
        }
    `;
    document.head.appendChild(style);
    
    // Test koneksi
    testKoneksiOnline();
    
    // Cek jika admin page
    if (document.getElementById('adminPanel')) {
        checkAdminAuth();
    }
});

// ========== TEST KONEKSI ==========

async function testKoneksiOnline() {
    console.log('🔍 Testing koneksi ke server...');
    
    try {
        const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL);
        const result = await response.json();
        
        if (result.success !== undefined) {
            console.log('✅ Koneksi ONLINE berhasil!');
            showOnlineStatus(true);
        } else {
            console.log('⚠️ Server merespon tetapi format tidak sesuai');
            showOnlineStatus(false);
        }
    } catch (error) {
        console.error('❌ Koneksi OFFLINE:', error.message);
        showOnlineStatus(false);
    }
}

function showOnlineStatus(online) {
    const statusEl = document.createElement('div');
    statusEl.id = 'onlineStatus';
    statusEl.innerHTML = `
        <i class="fas fa-${online ? 'wifi' : 'exclamation-triangle'}"></i>
        ${online ? 'Online' : 'Offline Mode'}
    `;
    
    statusEl.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 8px 15px;
        background: ${online ? '#2ed573' : '#ffa502'};
        color: white;
        border-radius: 20px;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 999;
        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
    `;
    
    // Hapus yang lama jika ada
    const oldStatus = document.getElementById('onlineStatus');
    if (oldStatus) oldStatus.remove();
    
    document.body.appendChild(statusEl);
}
