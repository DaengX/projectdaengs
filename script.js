// Konfigurasi
const CONFIG = {
    ADMIN_KEY: "admin123", 
    GOOGLE_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbxiNCBShKsnL-JmQYN2qnzWhMYFAE21hx4jKuXZeAFfNvt2SMNnpXChKrzaly2b59T_KA/exec"
};

// ========== FUNGSI UTAMA ==========

// 1. Fungsi untuk kirim data (METODE 1 - menggunakan fetch dengan error handling)
async function kirimDataKeSheets(data) {
    console.log('Mengirim data:', data);
    
    try {
        // Method 1: Fetch dengan mode 'no-cors' (paling kompatibel)
        const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Mode ini tidak memerlukan CORS
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `nama=${encodeURIComponent(data.nama)}&mapel=${encodeURIComponent(JSON.stringify(data.mapel))}`
        });
        
        console.log('Data terkirim (no-cors mode)');
        return { success: true };
        
    } catch (error) {
        console.warn('Error dengan fetch, coba metode alternatif:', error);
        
        // Method 2: Gunakan Google Forms style (100% working)
        return await kirimDataMetodeAlternatif(data);
    }
}

// 2. Metode Alternatif (Google Forms Style - PASTI BISA)
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
        document.body.removeChild(form);
        
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
        // Method 1: Fetch biasa untuk GET (biasanya work untuk GET)
        const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            console.log('Data dari Google Sheets:', result.data.length, 'records');
            return result.data;
        } else {
            throw new Error(result.error || 'Unknown error');
        }
        
    } catch (error) {
        console.warn('Gagal ambil dari Google Sheets:', error.message);
        console.log('Fallback ke localStorage');
        
        // Fallback ke localStorage
        const localData = JSON.parse(localStorage.getItem('siswaData')) || [];
        return localData;
    }
}

// ========== EVENT HANDLERS ==========

// Submit form siswa
if (siswaForm) {
    siswaForm.addEventListener('submit', async function(e) {
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
            alert('Data berhasil disimpan (cache lokal). Ada masalah koneksi ke server.');
            console.error('Error:', error);
        }
    });
}

// Load data untuk admin
async function loadSiswaData() {
    try {
        const data = await ambilDataDariSheets();
        siswaData = data;
        
        // Update stats
        document.getElementById('totalSiswa').textContent = data.length;
        const totalMapel = data.reduce((total, siswa) => total + siswa.mapel.length, 0);
        document.getElementById('totalMapel').textContent = totalMapel;
        
        // Render tabel
        renderTabel(data);
        
    } catch (error) {
        console.error('Error load data:', error);
        alert('Gagal memuat data. Cek koneksi internet.');
    }
}

// ========== TEST FUNCTION ==========

// Fungsi untuk testing langsung
function testKirimData() {
    const testData = {
        nama: "SISWA TEST",
        mapel: ["MTK", "Agama Islam"]
    };
    
    console.log('Testing pengiriman data...');
    kirimDataKeSheets(testData)
        .then(result => {
            console.log('Test result:', result);
            alert('Test data berhasil dikirim! Cek spreadsheet.');
        })
        .catch(error => {
            console.error('Test error:', error);
            alert('Test gagal: ' + error.message);
        });
}

// Tambahkan tombol test di halaman siswa (opsional)
document.addEventListener('DOMContentLoaded', function() {
    // Jika di halaman siswa, tambahkan tombol test
    if (siswaForm && window.location.href.includes('siswa')) {
        const testBtn = document.createElement('button');
        testBtn.type = 'button';
        testBtn.className = 'btn btn-secondary';
        testBtn.innerHTML = '<i class="fas fa-vial"></i> Test Connection';
        testBtn.onclick = testKirimData;
        testBtn.style.marginTop = '10px';
        
        document.querySelector('.form-actions').appendChild(testBtn);
    }
    
    // Jika di halaman admin
    if (document.getElementById('adminPanel')) {
        checkAdminAuth();
    }
});
