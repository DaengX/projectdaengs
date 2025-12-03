// Konfigurasi
const CONFIG = {
    ADMIN_KEY: "admin455", // Ganti setelah deploy!
    GOOGLE_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbyLHyQD_28sjsgOD04_ZE-5CVAMYWDuYuLTf2-OwAelk56euXBcgX5na-p6vg660U4xWQ/exec" // Diisi setelah membuat Google Apps Script
};

// State aplikasi
let adminAuthenticated = false;
let siswaData = [];

// DOM Elements
const siswaForm = document.getElementById('formSiswa');
const loadingElement = document.getElementById('loading');
const successElement = document.getElementById('successMessage');
const adminLink = document.getElementById('adminLink');

// Format waktu
function formatWaktu(timestamp) {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Validasi Admin Key (simpan di localStorage untuk sementara)
function loginAdmin() {
    const adminKeyInput = document.getElementById('adminKey');
    const enteredKey = adminKeyInput.value.trim();
    
    if (enteredKey === CONFIG.ADMIN_KEY) {
        adminAuthenticated = true;
        localStorage.setItem('adminAuthenticated', 'true');
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        
        // Load data dari localStorage atau Google Sheets
        loadSiswaData();
    } else {
        alert('Admin Key salah!');
        adminKeyInput.focus();
    }
}

// Logout admin
function logoutAdmin() {
    adminAuthenticated = false;
    localStorage.removeItem('adminAuthenticated');
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('adminKey').value = '';
}

// Cek autentikasi saat load halaman admin
function checkAdminAuth() {
    if (localStorage.getItem('adminAuthenticated') === 'true') {
        adminAuthenticated = true;
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        loadSiswaData();
    }
}

// Simpan data siswa ke localStorage (sementara)
function simpanDataSiswa(data) {
    // Ambil data yang sudah ada
    let existingData = JSON.parse(localStorage.getItem('siswaData')) || [];
    
    // Tambah data baru
    const newData = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        nama: data.nama,
        mapel: data.mapel,
        mapelText: data.mapel.join(', ')
    };
    
    existingData.unshift(newData);
    localStorage.setItem('siswaData', JSON.stringify(existingData));
    
    return newData;
}

// Load data siswa dari localStorage
function loadSiswaData() {
    const data = JSON.parse(localStorage.getItem('siswaData')) || [];
    siswaData = data;
    
    // Update stats
    document.getElementById('totalSiswa').textContent = data.length;
    
    const totalMapel = data.reduce((total, siswa) => total + siswa.mapel.length, 0);
    document.getElementById('totalMapel').textContent = totalMapel;
    
    // Render tabel
    renderTabel(data);
}

// Render tabel data
function renderTabel(data) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';
    
    if (data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px;">
                    <i class="fas fa-database" style="font-size: 2rem; color: #ccc; margin-bottom: 15px; display: block;"></i>
                    <p style="color: #666;">Belum ada data siswa</p>
                </td>
            </tr>
        `;
        return;
    }
    
    data.forEach((siswa, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${siswa.nama}</strong></td>
            <td>
                <div class="mapel-tags">
                    ${siswa.mapel.map(m => `<span class="mapel-tag">${m}</span>`).join('')}
                </div>
            </td>
            <td>${formatWaktu(siswa.timestamp)}</td>
            <td>
                <button class="btn btn-small" onclick="hapusData(${siswa.id})" title="Hapus data">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Generate laporan otomatis
function generateLaporan() {
    if (siswaData.length === 0) {
        document.getElementById('hasilLaporan').value = "Belum ada data siswa.";
        return;
    }
    
    const format = document.getElementById('formatLaporan').value;
    let laporan = '';
    
    switch(format) {
        case '1': // Format: Nama — Mapel
            siswaData.forEach((siswa, index) => {
                laporan += `${siswa.nama} — ${siswa.mapelText}\n`;
            });
            break;
            
        case '2': // Format: Nama: [Nama] Belum mengerjakan: [Mapel]
            siswaData.forEach(siswa => {
                laporan += `Nama: ${siswa.nama}\n`;
                laporan += `Belum mengerjakan: ${siswa.mapelText}\n\n`;
            });
            break;
            
        case '3': // Format: Berurutan dengan angka
            siswaData.forEach((siswa, index) => {
                laporan += `${index + 1}. ${siswa.nama} — ${siswa.mapelText}\n`;
            });
            break;
    }
    
    document.getElementById('hasilLaporan').value = laporan;
}

// Copy laporan ke clipboard
function copyLaporan() {
    const textarea = document.getElementById('hasilLaporan');
    
    if (!textarea.value.trim()) {
        alert('Tidak ada laporan untuk disalin!');
        return;
    }
    
    textarea.select();
    textarea.setSelectionRange(0, 99999); // Untuk mobile
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            alert('Laporan berhasil disalin ke clipboard!');
        } else {
            alert('Gagal menyalin laporan. Silakan coba manual.');
        }
    } catch (err) {
        // Fallback untuk browser modern
        navigator.clipboard.writeText(textarea.value)
            .then(() => alert('Laporan berhasil disalin ke clipboard!'))
            .catch(() => alert('Gagal menyalin laporan. Silakan coba manual.'));
    }
}

// Hapus data siswa
function hapusData(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    
    const newData = siswaData.filter(siswa => siswa.id !== id);
    localStorage.setItem('siswaData', JSON.stringify(newData));
    loadSiswaData();
    
    // Regenerate laporan jika ada
    if (document.getElementById('hasilLaporan').value) {
        generateLaporan();
    }
}

// Hapus laporan
function clearLaporan() {
    document.getElementById('hasilLaporan').value = '';
}

// Refresh data
function refreshData() {
    loadSiswaData();
}

// Submit form siswa
if (siswaForm) {
    siswaForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Ambil data dari form
        const nama = document.getElementById('nama').value.trim();
        const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
        
        // Validasi
        if (!nama) {
            alert('Mohon isi nama lengkap!');
            return;
        }
        
        if (checkboxes.length === 0) {
            alert('Pilih minimal satu mata pelajaran yang belum dikerjakan!');
            return;
        }
        
        // Ambil nilai checkbox yang dipilih
        const mapel = Array.from(checkboxes).map(cb => cb.value);
        
        // Tampilkan loading
        loadingElement.style.display = 'block';
        successElement.style.display = 'none';
        
        // Simpan data (sementara ke localStorage)
        setTimeout(() => {
            const data = {
                nama: nama,
                mapel: mapel
            };
            
            simpanDataSiswa(data);
            
            // Reset form
            siswaForm.reset();
            
            // Tampilkan success message
            loadingElement.style.display = 'none';
            successElement.style.display = 'block';
            
            // Sembunyikan success message setelah 3 detik
            setTimeout(() => {
                successElement.style.display = 'none';
            }, 3000);
            
        }, 1000); // Simulasi delay pengiriman
    });
}

// Inisialisasi
document.addEventListener('DOMContentLoaded', function() {
    // Cek jika di halaman admin
    if (document.getElementById('adminPanel')) {
        checkAdminAuth();
    }
    
    // Tambahkan styles untuk tags mapel
    const style = document.createElement('style');
    style.textContent = `
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
    `;
    document.head.appendChild(style);
});
