// script.js - Untuk halaman siswa
document.addEventListener('DOMContentLoaded', function() {
    console.log('Halaman siswa dimuat');
    
    // Inisialisasi localStorage jika belum ada
    if (!localStorage.getItem('siswaData')) {
        localStorage.setItem('siswaData', JSON.stringify([]));
    }
    
    // Elements
    const mtkOption = document.getElementById('mtkOption');
    const pknOption = document.getElementById('pknOption');
    const submitBtn = document.getElementById('submitBtn');
    const successAlert = document.getElementById('successAlert');
    const errorAlert = document.getElementById('errorAlert');
    const successText = document.getElementById('successText');
    const errorText = document.getElementById('errorText');
    const namaInput = document.getElementById('nama');
    
    let selectedMapels = [];
    
    // Fungsi toggle mapel
    function toggleMapel(mapel) {
        const index = selectedMapels.indexOf(mapel);
        
        if (index === -1) {
            selectedMapels.push(mapel);
            console.log('Mapel ditambahkan:', mapel);
        } else {
            selectedMapels.splice(index, 1);
            console.log('Mapel dihapus:', mapel);
        }
        
        // Update tampilan
        if (mapel === 'mtk') {
            mtkOption.classList.toggle('selected');
        } else if (mapel === 'pkn') {
            pknOption.classList.toggle('selected');
        }
    }
    
    // Event listeners untuk mapel
    if (mtkOption) {
        mtkOption.addEventListener('click', function() {
            toggleMapel('mtk');
        });
    }
    
    if (pknOption) {
        pknOption.addEventListener('click', function() {
            toggleMapel('pkn');
        });
    }
    
    // Event listener untuk submit
    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            console.log('Tombol simpan diklik');
            
            const nama = namaInput.value.trim();
            
            // Validasi
            if (!nama || selectedMapels.length === 0) {
                errorText.textContent = 'Harap isi nama dan pilih minimal satu mata pelajaran!';
                errorAlert.style.display = 'flex';
                successAlert.style.display = 'none';
                return;
            }
            
            // Ambil data yang ada
            const existingData = JSON.parse(localStorage.getItem('siswaData')) || [];
            
            // Cek duplikat
            const isDuplicate = existingData.some(siswa => 
                siswa.nama.toLowerCase() === nama.toLowerCase()
            );
            
            if (isDuplicate) {
                errorText.textContent = Nama "${nama}" sudah terdaftar!;
                errorAlert.style.display = 'flex';
                successAlert.style.display = 'none';
                return;
            }
            
            // Format kode mapel
            const mapelCodes = [];
            if (selectedMapels.includes('mtk')) mapelCodes.push('M');
            if (selectedMapels.includes('pkn')) mapelCodes.push('P');
            
            // Buat data baru
            const newSiswa = {
                id: Date.now(),
                nama: nama,
                mapel: [...selectedMapels],
                mapelKode: mapelCodes.join(' & '),
                tanggal: new Date().toLocaleString('id-ID')
            };
            
            console.log('Data baru:', newSiswa);
            
            // Simpan ke localStorage
            existingData.push(newSiswa);
            localStorage.setItem('siswaData', JSON.stringify(existingData));
            
            // Tampilkan success
            successText.textContent = Data ${nama} berhasil disimpan!;
            successAlert.style.display = 'flex';
            errorAlert.style.display = 'none';
            
            // Reset form
            namaInput.value = '';
            selectedMapels = [];
            mtkOption.classList.remove('selected');
            pknOption.classList.remove('selected');
            
            // Auto hide alert
            setTimeout(() => {
                successAlert.style.display = 'none';
            }, 5000);
            
            // Feedback tombol
            const originalHTML = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Tersimpan!';
            submitBtn.style.background = '#28a745';
            
            setTimeout(() => {
                submitBtn.innerHTML = originalHTML;
                submitBtn.style.background = '';
            }, 2000);
        });
    }
    
    // Enter untuk submit
    if (namaInput) {
        namaInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                submitBtn.click();
            }
        });
    }
});
