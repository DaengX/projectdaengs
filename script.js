// script.js - PERBAIKAN FUNGSI INPUT SISWA

console.log('=== SISTEM DAFTAR ULANGAN SISWA ===');
console.log('File script.js dimuat');

// Inisialisasi data jika belum ada
function initData() {
    if (!localStorage.getItem('siswaData')) {
        localStorage.setItem('siswaData', JSON.stringify([]));
        console.log('Data diinisialisasi: []');
    }
    return JSON.parse(localStorage.getItem('siswaData'));
}

// Fungsi utama saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Siswa Page');
    
    // Inisialisasi data
    initData();
    
    // Elements - Pastikan semua elemen ada
    const namaInput = document.getElementById('nama');
    const mtkOption = document.getElementById('mtkOption');
    const pknOption = document.getElementById('pknOption');
    const submitBtn = document.getElementById('submitBtn');
    const successAlert = document.getElementById('successAlert');
    const errorAlert = document.getElementById('errorAlert');
    const successText = document.getElementById('successText');
    const errorText = document.getElementById('errorText');
    
    console.log('Elements ditemukan:', {
        namaInput: !!namaInput,
        mtkOption: !!mtkOption,
        pknOption: !!pknOption,
        submitBtn: !!submitBtn
    });
    
    // Inisialisasi variabel
    let selectedMapels = [];
    
    // 1. FUNGSI UNTUK MEMILIH MAPEL
    function toggleMapel(mapel) {
        console.log('Toggle mapel:', mapel);
        const index = selectedMapels.indexOf(mapel);
        
        if (index === -1) {
            // Tambah mapel
            selectedMapels.push(mapel);
            console.log('Mapel ditambahkan:', mapel, 'List sekarang:', selectedMapels);
            
            // Update tampilan
            if (mapel === 'mtk' && mtkOption) {
                mtkOption.classList.add('selected');
            } else if (mapel === 'pkn' && pknOption) {
                pknOption.classList.add('selected');
            }
        } else {
            // Hapus mapel
            selectedMapels.splice(index, 1);
            console.log('Mapel dihapus:', mapel, 'List sekarang:', selectedMapels);
            
            // Update tampilan
            if (mapel === 'mtk' && mtkOption) {
                mtkOption.classList.remove('selected');
            } else if (mapel === 'pkn' && pknOption) {
                pknOption.classList.remove('selected');
            }
        }
    }
    
    // 2. EVENT LISTENER UNTUK MAPEL
    if (mtkOption) {
        mtkOption.addEventListener('click', function(e) {
            console.log('MTK diklik');
            toggleMapel('mtk');
        });
        
        // Debug: cek event listener
        console.log('Event listener MTK ditambahkan');
    }
    
    if (pknOption) {
        pknOption.addEventListener('click', function(e) {
            console.log('PKN diklik');
            toggleMapel('pkn');
        });
        
        console.log('Event listener PKN ditambahkan');
    }
    
    // 3. FUNGSI SIMPAN DATA
    function saveData() {
        console.log('=== FUNGSI SAVE DATA DIPANGGIL ===');
        
        if (!namaInput) {
            console.error('Nama input tidak ditemukan!');
            return;
        }
        
        const nama = namaInput.value.trim();
        console.log('Nama yang diinput:', nama);
        console.log('Mapel yang dipilih:', selectedMapels);
        
        // VALIDASI
        if (!nama) {
            console.log('Validasi gagal: Nama kosong');
            if (errorText) errorText.textContent = 'Harap isi nama lengkap!';
            if (errorAlert) errorAlert.style.display = 'flex';
            if (successAlert) successAlert.style.display = 'none';
            return;
        }
        
        if (selectedMapels.length === 0) {
            console.log('Validasi gagal: Tidak ada mapel dipilih');
            if (errorText) errorText.textContent = 'Harap pilih minimal satu mata pelajaran!';
            if (errorAlert) errorAlert.style.display = 'flex';
            if (successAlert) successAlert.style.display = 'none';
            return;
        }
        
        // AMBIL DATA YANG SUDAH ADA
        let existingData = [];
        try {
            const dataStr = localStorage.getItem('siswaData');
            console.log('Data dari localStorage:', dataStr);
            existingData = dataStr ? JSON.parse(dataStr) : [];
            console.log('Data existing (parsed):', existingData);
        } catch (error) {
            console.error('Error parsing data:', error);
            existingData = [];
        }
        
        // CEK DUPLIKAT NAMA
        const isDuplicate = existingData.some(siswa => {
            const namaSiswa = siswa.nama ? siswa.nama.toLowerCase() : '';
            return namaSiswa === nama.toLowerCase();
        });
        
        if (isDuplicate) {
            console.log('Duplikat ditemukan untuk nama:', nama);
            if (errorText) errorText.textContent = Nama "${nama}" sudah terdaftar!;
            if (errorAlert) errorAlert.style.display = 'flex';
            if (successAlert) successAlert.style.display = 'none';
            return;
        }
        
        // FORMAT KODE MAPEL
        const mapelCodes = [];
        if (selectedMapels.includes('mtk')) mapelCodes.push('M');
        if (selectedMapels.includes('pkn')) mapelCodes.push('P');
        
        // BUAT DATA BARU
        const newSiswa = {
            id: Date.now(), // ID unik
            nama: nama,
            mapel: selectedMapels.slice(), // Copy array
            mapelKode: mapelCodes.join(' & '),
            tanggal: new Date().toLocaleString('id-ID')
        };
        
        console.log('Data baru dibuat:', newSiswa);
        
        // SIMPAN KE LOCALSTORAGE
        existingData.push(newSiswa);
        try {
            localStorage.setItem('siswaData', JSON.stringify(existingData));
            console.log('Data berhasil disimpan ke localStorage');
            
            // Verifikasi penyimpanan
            const savedData = JSON.parse(localStorage.getItem('siswaData'));
            console.log('Data setelah disimpan:', savedData);
            
        } catch (error) {
            console.error('Error menyimpan data:', error);
            if (errorText) errorText.textContent = 'Gagal menyimpan data!';
            if (errorAlert) errorAlert.style.display = 'flex';
            if (successAlert) successAlert.style.display = 'none';
            return;
        }
        
        // TAMPILKAN SUKSES
        if (successText) successText.textContent = Data ${nama} berhasil disimpan!;
        if (successAlert) {
            successAlert.style.display = 'flex';
            console.log('Alert sukses ditampilkan');
        }
        if (errorAlert) errorAlert.style.display = 'none';
        
        // RESET FORM
        if (namaInput) namaInput.value = '';
        selectedMapels = [];
        
        if (mtkOption) mtkOption.classList.remove('selected');
        if (pknOption) pknOption.classList.remove('selected');
        
        // FEEDBACK TOMBOL
        if (submitBtn) {
            const originalHTML = submitBtn.innerHTML;
            const originalBg = submitBtn.style.backgroundColor;
            
            submitBtn.innerHTML = '<i class="fas fa-check"></i> DATA TERSIMPAN!';
            submitBtn.style.backgroundColor = '#28a745';
            
            setTimeout(() => {
                submitBtn.innerHTML = originalHTML;
                submitBtn.style.backgroundColor = originalBg;
            }, 2000);
        }
        
        // AUTO HIDE ALERT
        setTimeout(() => {
            if (successAlert) successAlert.style.display = 'none';
        }, 5000);
        
        console.log('=== DATA BERHASIL DISIMPAN ===');
    }
    
    // 4. EVENT LISTENER UNTUK TOMBOL SIMPAN
    if (submitBtn) {
        submitBtn.addEventListener('click', function(e) {
            console.log('=== TOMBOL SIMPAN DIKLIK ===');
            e.preventDefault();
            saveData();
        });
        
        console.log('Event listener submitBtn ditambahkan');
    }
    
    // 5. ENTER KEY UNTUK SUBMIT
    if (namaInput) {
        namaInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                console.log('Enter key ditekan');
                e.preventDefault();
                if (submitBtn) submitBtn.click();
            }
        });
    }
    
    // 6. FUNGSI DEBUG/TEST
    window.debugShowData = function() {
        const data = JSON.parse(localStorage.getItem('siswaData')) || [];
        console.log('=== DEBUG DATA ===');
        console.log('Total data:', data.length);
        console.table(data);
        alert(Total data: ${data.length}\nLihat console untuk detail.);
    };
    
    window.debugClearData = function() {
        if (confirm('Hapus SEMUA data siswa?')) {
            localStorage.removeItem('siswaData');
            initData();
            console.log('Semua data dihapus');
            alert('Semua data berhasil dihapus!');
        }
    };
    
    window.debugAddTestData = function() {
        const testData = {
            id: Date.now(),
            nama: 'Siswa Contoh',
            mapel: ['mtk', 'pkn'],
            mapelKode: 'M & P',
            tanggal: new Date().toLocaleString('id-ID')
        };
        
        const existingData = JSON.parse(localStorage.getItem('siswaData')) || [];
        existingData.push(testData);
        localStorage.setItem('siswaData', JSON.stringify(existingData));
        
        console.log('Data test ditambahkan:', testData);
        alert('Data test berhasil ditambahkan!');
    };
    
    console.log('=== INISIALISASI SELESAI ===');
});
