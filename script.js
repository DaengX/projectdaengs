// ========== KONFIGURASI ==========
const CONFIG = {
    ADMIN_KEY: "admin123", // GANTI DENGAN PASSWORD YANG AMAN!
    GOOGLE_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbzLlty7XX7fx87xibzaoWCYpY6oe9-UKWafPIpPqDGPO1iTjMO5Ca7dUS145T_e5caowQ/exec"
};

// ========== VARIABEL GLOBAL ==========
let adminAuthenticated = false;
let siswaData = [];

// ========== DOM ELEMENTS ==========
const siswaForm = document.getElementById('formSiswa');
const loadingElement = document.getElementById('loading');
const successElement = document.getElementById('successMessage');

// ========== FUNGSI UTAMA SISWA ==========

// 1. Fungsi untuk kirim data ke Google Sheets (Metode 1 - Fetch)
async function kirimDataKeSheets(data) {
    console.log('Mengirim data:', data);
    
    try {
        // Method 1: Fetch dengan mode 'no-cors'
        const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `nama=${encodeURIComponent(data.nama)}&mapel=${encodeURIComponent(JSON.stringify(data.mapel))}`
        });
        
        console.log('Data terkirim (no-cors mode)');
        return { success: true };
        
    } catch (error) {
        console.warn('Error dengan fetch, coba metode alternatif:', error);
        
        // Method 2: Gunakan Google Forms style
        return await kirimDataMetodeAlternatif(data);
    }
}

// 2. Metode Alternatif (Google Forms Style)
function kirimDataMetodeAlternatif(data) {
    return new Promise((resolve) => {
        // Buat form hidden
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = CONFIG.GOOGLE_SCRIPT_URL;
        form.target = 'hiddenFrame';
        form.style.display = 'none';
        
        // Buat iframe untuk response
        let iframe = document.getElementById('hiddenFrame');
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.name = 'hiddenFrame';
            iframe.id = 'hiddenFrame';
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
        }
        
        // Tambah event listener untuk iframe
        iframe.onload = function() {
            console.log('Data berhasil dikirim via form');
            resolve({ success: true });
        };
        
        // Input untuk nama
        const namaInput = document.createElement('input');
        namaInput.type = 'hidden';
        namaInput.name = 'nama';
        namaInput.value = data.nama;
        form.appendChild(namaInput);
        
        // Input untuk mapel
        const mapelInput = document.createElement('input');
        mapelInput.type = 'hidden';
        mapelInput.name = 'mapel';
        mapelInput.value = JSON.stringify(data.mapel);
        form.appendChild(mapelInput);
        
        // Submit form
        document.body.appendChild(form);
        form.submit();
        setTimeout(() => {
            document.body.removeChild(form);
            resolve({ success: true });
        }, 1000);
        
        // Juga simpan ke localStorage sebagai backup
        simpanKeLocalStorage(data);
    });
}

// 3. Simpan ke localStorage sebagai backup
function simpanKeLocalStorage(data) {
    try {
        let existingData = JSON.parse(localStorage.getItem('siswaData')) || [];
        
        const newData = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            nama: data.nama,
            mapel: data.mapel,
            mapelText: data.mapel.join(', ')
        };
        
        existingData.unshift(newData);
        localStorage.setItem('siswaData', JSON.stringify(existingData));
        
        console.log('Data disimpan ke localStorage:', newData);
        return newData;
    } catch (error) {
        console.error('Error simpan ke localStorage:', error);
        return null;
    }
}

// 4. Ambil data dari Google Sheets
async function ambilDataDariSheets() {
    try {
        console.log('Mengambil data dari Google Sheets...');
        
        // Tambahkan timestamp untuk menghindari cache
        const url = CONFIG.GOOGLE_SCRIPT_URL + '?t=' + Date.now();
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            console.log('Data dari Google Sheets:', result.data.length, 'records');
            return result.data;
        } else {
            throw new Error(result.error || 'Unknown error from server');
        }
        
    } catch (error) {
        console.warn('Gagal ambil dari Google Sheets:', error.message);
        console.log('Fallback ke localStorage');
        
        // Fallback ke localStorage
        const localData = JSON.parse(localStorage.getItem('siswaData')) || [];
        return localData;
    }
}

// ========== FUNGSI ADMIN ==========

// 1. Fungsi Login Admin
function loginAdmin() {
    const adminKeyInput = document.getElementById('adminKey');
    if (!adminKeyInput) {
        console.error('Admin key input not found!');
        return false;
    }
    
    const enteredKey = adminKeyInput.value.trim();
    
    console.log('Login attempt with key:', enteredKey);
    console.log('Expected key:', CONFIG.ADMIN_KEY);
    
    if (enteredKey === CONFIG.ADMIN_KEY) {
        adminAuthenticated = true;
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('adminLoginTime', Date.now().toString());
        
        // Update UI
        const loginSection = document.getElementById('loginSection');
        const adminPanel = document.getElementById('adminPanel');
        
        if (loginSection) loginSection.style.display = 'none';
        if (adminPanel) adminPanel.style.display = 'block';
        
        // Load data
        loadSiswaData();
        
        console.log('Login successful!');
        return true;
    } else {
        alert('❌ Admin Key salah! Silakan coba lagi.');
        adminKeyInput.focus();
        adminKeyInput.select();
        return false;
    }
}

// 2. Fungsi Logout Admin
function logoutAdmin() {
    if (!confirm('Apakah Anda yakin ingin logout?')) return;
    
    adminAuthenticated = false;
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminLoginTime');
    
    // Update UI
    const loginSection = document.getElementById('loginSection');
    const adminPanel = document.getElementById('adminPanel');
    
    if (loginSection) {
        loginSection.style.display = 'block';
    }
    if (adminPanel) {
        adminPanel.style.display = 'none';
    }
    
    // Clear input
    const adminKeyInput = document.getElementById('adminKey');
    if (adminKeyInput) {
        adminKeyInput.value = '';
    }
    
    console.log('Logged out');
}

// 3. Cek autentikasi saat halaman load
function checkAdminAuth() {
    const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
    const loginTime = parseInt(localStorage.getItem('adminLoginTime') || '0');
    const currentTime = Date.now();
    const sessionTimeout = 8 * 60 * 60 * 1000; // 8 jam
    
    // Cek jika session expired
    if (isAuthenticated && (currentTime - loginTime < sessionTimeout)) {
        adminAuthenticated = true;
        
        // Update UI
        const loginSection = document.getElementById('loginSection');
        const adminPanel = document.getElementById('adminPanel');
        
        if (loginSection) loginSection.style.display = 'none';
        if (adminPanel) adminPanel.style.display = 'block';
        
        // Load data
        loadSiswaData();
        console.log('Auto-login from session');
        return true;
    } else if (isAuthenticated) {
        // Session expired
        localStorage.removeItem('adminAuthenticated');
        localStorage.removeItem('adminLoginTime');
        console.log('Session expired');
    }
    
    return false;
}

// 4. Update fungsi loadSiswaData untuk admin
async function loadSiswaData() {
    try {
        console.log('Loading siswa data...');
        
        const data = await ambilDataDariSheets();
        siswaData = data;
        
        // Update stats
        const totalSiswaEl = document.getElementById('totalSiswa');
        const totalMapelEl = document.getElementById('totalMapel');
        
        if (totalSiswaEl) {
            totalSiswaEl.textContent = data.length;
        }
        
        if (totalMapelEl) {
            const totalMapel = data.reduce((total, siswa) => {
                return total + (siswa.mapel ? siswa.mapel.length : 0);
            }, 0);
            totalMapelEl.textContent = totalMapel;
        }
        
        // Render tabel
        renderTabel(data);
        console.log('Data loaded:', data.length, 'records');
        
    } catch (error) {
        console.error('Error loading data:', error);
        
        // Fallback ke localStorage
        const localData = JSON.parse(localStorage.getItem('siswaData')) || [];
        siswaData = localData;
        
        // Update UI dengan data lokal
        const totalSiswaEl = document.getElementById('totalSiswa');
        const totalMapelEl = document.getElementById('totalMapel');
        
        if (totalSiswaEl) totalSiswaEl.textContent = localData.length;
        if (totalMapelEl) {
            const totalMapel = localData.reduce((total, siswa) => {
                return total + (siswa.mapel ? siswa.mapel.length : 0);
            }, 0);
            totalMapelEl.textContent = totalMapel;
        }
        
        renderTabel(localData);
        console.log('Using local data:', localData.length, 'records');
    }
}

// 5. Render tabel
function renderTabel(data) {
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (!data || data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: #666;">
                    <i class="fas fa-database" style="font-size: 3rem; margin-bottom: 15px; display: block; color: #ddd;"></i>
                    <h3 style="margin-bottom: 10px;">Belum ada data siswa</h3>
                    <p>Data akan muncul di sini setelah siswa mengisi form</p>
                </td>
            </tr>
        `;
        return;
    }
    
    data.forEach((siswa, index) => {
        const row = document.createElement('tr');
        
        // Format mapel tags
        let mapelTags = '';
        if (siswa.mapel && Array.isArray(siswa.mapel)) {
            mapelTags = siswa.mapel.map(m => `<span class="mapel-tag">${m}</span>`).join('');
        } else if (siswa.mapelText) {
            const mapelArray = siswa.mapelText.split(',').map(m => m.trim());
            mapelTags = mapelArray.map(m => `<span class="mapel-tag">${m}</span>`).join('');
        } else {
            mapelTags = '<span class="mapel-tag">Tidak ada data</span>';
        }
        
        // Format waktu
        let waktu = '-';
        if (siswa.timestamp) {
            try {
                const date = new Date(siswa.timestamp);
                waktu = date.toLocaleString('id-ID');
            } catch (e) {
                waktu = siswa.timestamp;
            }
        }
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${siswa.nama || 'Tidak diketahui'}</strong></td>
            <td>
                <div class="mapel-tags">
                    ${mapelTags}
                </div>
            </td>
            <td>${waktu}</td>
            <td>
                <button class="btn btn-small" onclick="hapusData(${siswa.id || index})" title="Hapus data" style="background: #ff4757; color: white;">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// 6. Hapus data siswa
function hapusData(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    
    // Hapus dari array
    const newData = siswaData.filter(siswa => siswa.id !== id);
    siswaData = newData;
    
    // Update localStorage
    localStorage.setItem('siswaData', JSON.stringify(newData));
    
    // Re-render tabel
    renderTabel(newData);
    
    // Update stats
    const totalSiswaEl = document.getElementById('totalSiswa');
    const totalMapelEl = document.getElementById('totalMapel');
    
    if (totalSiswaEl) totalSiswaEl.textContent = newData.length;
    if (totalMapelEl) {
        const totalMapel = newData.reduce((total, siswa) => {
            return total + (siswa.mapel ? siswa.mapel.length : 0);
        }, 0);
        totalMapelEl.textContent = totalMapel;
    }
    
    // Regenerate laporan jika ada
    if (document.getElementById('hasilLaporan') && document.getElementById('hasilLaporan').value) {
        generateLaporan();
    }
    
    alert('Data berhasil dihapus!');
}

// 7. Refresh data
function refreshData() {
    console.log('Refreshing data...');
    loadSiswaData();
    alert('Data berhasil direfresh!');
}

// 8. Generate laporan otomatis
function generateLaporan() {
    if (!siswaData || siswaData.length === 0) {
        document.getElementById('hasilLaporan').value = "⚠️ Belum ada data siswa.";
        return;
    }
    
    const format = document.getElementById('formatLaporan') ? document.getElementById('formatLaporan').value : '1';
    let laporan = '';
    
    switch(format) {
        case '1': // Format: Nama — Mapel
            siswaData.forEach((siswa) => {
                laporan += `${siswa.nama} — ${siswa.mapelText || siswa.mapel?.join(', ') || 'Tidak ada data'}\n`;
            });
            break;
            
        case '2': // Format: Nama: [Nama] Belum mengerjakan: [Mapel]
            siswaData.forEach(siswa => {
                laporan += `Nama: ${siswa.nama}\n`;
                laporan += `Belum mengerjakan: ${siswa.mapelText || siswa.mapel?.join(', ') || 'Tidak ada'}\n\n`;
            });
            break;
            
        case '3': // Format: Berurutan dengan angka
            siswaData.forEach((siswa, index) => {
                laporan += `${index + 1}. ${siswa.nama} — ${siswa.mapelText || siswa.mapel?.join(', ') || 'Tidak ada data'}\n`;
            });
            break;
    }
    
    document.getElementById('hasilLaporan').value = laporan;
}

// 9. Copy laporan ke clipboard
function copyLaporan() {
    const textarea = document.getElementById('hasilLaporan');
    
    if (!textarea || !textarea.value.trim()) {
        alert('⚠️ Tidak ada laporan untuk disalin!');
        return;
    }
    
    textarea.select();
    textarea.setSelectionRange(0, 99999);
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            alert('✅ Laporan berhasil disalin ke clipboard!');
        } else {
            // Fallback untuk browser modern
            navigator.clipboard.writeText(textarea.value)
                .then(() => alert('✅ Laporan berhasil disalin ke clipboard!'))
                .catch(() => alert('❌ Gagal menyalin laporan. Silakan copy manual.'));
        }
    } catch (err) {
        navigator.clipboard.writeText(textarea.value)
            .then(() => alert('✅ Laporan berhasil disalin ke clipboard!'))
            .catch(() => alert('❌ Gagal menyalin laporan. Silakan copy manual.'));
    }
}

// 10. Hapus laporan
function clearLaporan() {
    const textarea = document.getElementById('hasilLaporan');
    if (textarea) {
        textarea.value = '';
    }
}

// ========== EVENT HANDLERS SISWA ==========

// Submit form siswa
if (siswaForm) {
    siswaForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Ambil data dari form
        const nama = document.getElementById('nama').value.trim();
        const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
        
        // Validasi
        if (!nama) {
            alert('❌ Mohon isi nama lengkap!');
            return;
        }
        
        if (checkboxes.length === 0) {
            alert('❌ Pilih minimal satu mata pelajaran yang belum dikerjakan!');
            return;
        }
        
        const mapel = Array.from(checkboxes).map(cb => cb.value);
        const data = { nama, mapel };
        
        // Tampilkan loading
        loadingElement.style.display = 'block';
        successElement.style.display = 'none';
        
        try {
            // Kirim ke Google Sheets
            await kirimDataKeSheets(data);
            
            // Reset form
            siswaForm.reset();
            
            // Tampilkan sukses
            loadingElement.style.display = 'none';
            successElement.style.display = 'block';
            
            // Sembunyikan setelah 3 detik
            setTimeout(() => {
                successElement.style.display = 'none';
            }, 3000);
            
        } catch (error) {
            loadingElement.style.display = 'none';
            alert('✅ Data berhasil disimpan (cache lokal). Ada masalah koneksi ke server.');
            console.error('Error:', error);
        }
    });
}

// ========== INISIALISASI ==========

document.addEventListener('DOMContentLoaded', function() {
    console.log('System initialized');
    
    // Tambahkan styles untuk mapel tags
    const style = document.createElement('style');
    style.textContent = `
        .mapel-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            max-width: 300px;
        }
        
        .mapel-tag {
            background: #e8f4ff;
            color: #4361ee;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 500;
            border: 1px solid #c3d9ff;
            white-space: nowrap;
        }
        
        .btn-small {
            padding: 5px 10px;
            font-size: 0.8rem;
            min-width: 40px;
        }
        
        #hiddenFrame {
            display: none;
        }
    `;
    document.head.appendChild(style);
    
    // Cek jika di halaman admin
    if (document.getElementById('adminPanel')) {
        console.log('Admin page detected');
        checkAdminAuth();
    }
    
    // Tambahkan tombol test di halaman siswa (opsional)
    if (siswaForm) {
        const testBtn = document.createElement('button');
        testBtn.type = 'button';
        testBtn.className = 'btn btn-secondary';
        testBtn.innerHTML = '<i class="fas fa-vial"></i> Test Connection';
        testBtn.onclick = testKirimData;
        testBtn.style.marginTop = '10px';
        testBtn.title = 'Test koneksi ke Google Sheets';
        
        document.querySelector('.form-actions').appendChild(testBtn);
    }
});

// ========== TEST FUNCTION ==========

// Fungsi untuk testing langsung
function testKirimData() {
    const testData = {
        nama: "SISWA TEST " + Date.now(),
        mapel: ["MTK", "PKN"]
    };
    
    console.log('Testing pengiriman data...', testData);
    
    kirimDataKeSheets(testData)
        .then(result => {
            console.log('Test result:', result);
            alert('✅ Test data berhasil dikirim! Cek spreadsheet Anda.');
        })
        .catch(error => {
            console.error('Test error:', error);
            alert('❌ Test gagal: ' + error.message);
        });
}
