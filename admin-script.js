// admin-script.js - PERBAIKAN FUNGSI ADMIN

console.log('=== SISTEM DAFTAR ULANGAN ADMIN ===');
console.log('File admin-script.js dimuat');

// Fungsi untuk menampilkan data
function loadData() {
    console.log('=== LOAD DATA DIPANGGIL ===');
    
    try {
        // Ambil data dari localStorage
        const dataStr = localStorage.getItem('siswaData');
        console.log('Data string dari localStorage:', dataStr);
        
        const siswaData = dataStr ? JSON.parse(dataStr) : [];
        console.log('Data parsed:', siswaData);
        console.log('Jumlah data:', siswaData.length);
        
        // Update statistics
        const totalSiswa = document.getElementById('totalSiswa');
        const totalMtk = document.getElementById('totalMtk');
        const totalPkn = document.getElementById('totalPkn');
        const tableBody = document.getElementById('tableBody');
        const noDataMessage = document.getElementById('noDataMessage');
        const whatsappText = document.getElementById('whatsappText');
        
        if (!totalSiswa || !tableBody || !whatsappText) {
            console.error('Elemen penting tidak ditemukan!');
            return;
        }
        
        // Update statistik
        totalSiswa.textContent = siswaData.length;
        
        const mtkCount = siswaData.filter(siswa => 
            siswa.mapel && Array.isArray(siswa.mapel) && siswa.mapel.includes('mtk')
        ).length;
        
        const pknCount = siswaData.filter(siswa => 
            siswa.mapel && Array.isArray(siswa.mapel) && siswa.mapel.includes('pkn')
        ).length;
        
        totalMtk.textContent = mtkCount;
        totalPkn.textContent = pknCount;
        
        console.log('Statistik:', { total: siswaData.length, mtk: mtkCount, pkn: pknCount });
        
        // Update tabel
        if (siswaData.length > 0) {
            if (noDataMessage) noDataMessage.style.display = 'none';
            
            tableBody.innerHTML = '';
            
            siswaData.forEach((siswa, index) => {
                const row = document.createElement('tr');
                
                // Format mapel badges
                const mapelBadges = [];
                if (siswa.mapel && Array.isArray(siswa.mapel)) {
                    if (siswa.mapel.includes('mtk')) {
                        mapelBadges.push('<span class="mapel-badge badge-mtk">Matematika</span>');
                    }
                    if (siswa.mapel.includes('pkn')) {
                        mapelBadges.push('<span class="mapel-badge badge-pkn">PKN</span>');
                    }
                }
                
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td><strong>${siswa.nama || 'Tidak ada nama'}</strong></td>
                    <td>${mapelBadges.join(' ') || '-'}</td>
                    <td><code>${siswa.mapelKode || '-'}</code></td>
                    <td><small>${siswa.tanggal || '-'}</small></td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn delete" data-id="${siswa.id}" title="Hapus data">
                                <i class="fas fa-trash"></i> Hapus
                            </button>
                        </div>
                    </td>
                `;
                
                tableBody.appendChild(row);
            });
            
            // Tambah event listener untuk tombol hapus
            setTimeout(() => {
                document.querySelectorAll('.action-btn.delete').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const id = parseInt(this.getAttribute('data-id'));
                        console.log('Hapus data dengan ID:', id);
                        deleteData(id);
                    });
                });
            }, 100);
            
        } else {
            if (noDataMessage) noDataMessage.style.display = 'block';
            tableBody.innerHTML = '';
            console.log('Tidak ada data, tampilkan pesan');
        }
        
        // Update teks WhatsApp
        generateWhatsappText();
        
    } catch (error) {
        console.error('Error dalam loadData:', error);
        showAlert('Error memuat data: ' + error.message, 'error');
    }
}

// Fungsi hapus data
function deleteData(id) {
    console.log('=== DELETE DATA DIPANGGIL ===');
    console.log('ID yang akan dihapus:', id);
    
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) {
        return;
    }
    
    try {
        const dataStr = localStorage.getItem('siswaData');
        const siswaData = dataStr ? JSON.parse(dataStr) : [];
        
        const dataSebelum = siswaData.length;
        const updatedData = siswaData.filter(siswa => siswa.id !== id);
        const dataSesudah = updatedData.length;
        
        console.log('Sebelum hapus:', dataSebelum, 'Setelah hapus:', dataSesudah);
        
        if (dataSebelum === dataSesudah) {
            console.log('Data tidak ditemukan dengan ID:', id);
            showAlert('Data tidak ditemukan!', 'error');
            return;
        }
        
        localStorage.setItem('siswaData', JSON.stringify(updatedData));
        
        // Cari nama siswa yang dihapus untuk pesan
        const siswaDihapus = siswaData.find(s => s.id === id);
        const nama = siswaDihapus ? siswaDihapus.nama : 'Data';
        
        console.log('Data berhasil dihapus:', nama);
        showAlert(Data "${nama}" berhasil dihapus!, 'success');
        
        // Reload data
        loadData();
        
    } catch (error) {
        console.error('Error menghapus data:', error);
        showAlert('Error menghapus data: ' + error.message, 'error');
    }
}

// Fungsi generate teks WhatsApp
function generateWhatsappText() {
    console.log('=== GENERATE WHATSAPP TEXT DIPANGGIL ===');
    
    try {
        const dataStr = localStorage.getItem('siswaData');
        const siswaData = dataStr ? JSON.parse(dataStr) : [];
        const whatsappText = document.getElementById('whatsappText');
        
        if (!whatsappText) {
            console.error('Elemen whatsappText tidak ditemukan!');
            return;
        }
        
        if (siswaData.length === 0) {
            whatsappText.textContent = `NAMA NAMA YANG BELUM MENGERJAKAN ULANGAN

===KODE=====

MATEMATIKA = M
PKN = P

=======NAMA DAN KODE=====

[Belum ada data]`;
            return;
        }
        
        let text = `NAMA NAMA YANG BELUM MENGERJAKAN ULANGAN

===KODE=====

MATEMATIKA = M
PKN = P

=======NAMA DAN KODE=====
`;

        siswaData.forEach((siswa, index) => {
            text += ${index + 1}. ${siswa.nama || 'Tidak ada nama'} [${siswa.mapelKode || '-'}]\n;
        });

        text += \nTotal: ${siswaData.length} siswa;
        whatsappText.textContent = text;
        
        console.log('Teks WhatsApp berhasil digenerate');
        
    } catch (error) {
        console.error('Error generate WhatsApp text:', error);
    }
}

// Fungsi copy ke clipboard
function copyToClipboard(text) {
    console.log('=== COPY TO CLIPBOARD DIPANGGIL ===');
    
    if (!navigator.clipboard) {
        console.warn('Clipboard API tidak tersedia');
        // Fallback untuk browser lama
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showAlert('Teks berhasil disalin!', 'success');
        return;
    }
    
    navigator.clipboard.writeText(text).then(() => {
        console.log('Teks berhasil disalin ke clipboard');
        showAlert('Teks berhasil disalin ke clipboard!', 'success');
    }).catch(err => {
        console.error('Gagal menyalin teks:', err);
        showAlert('Gagal menyalin teks. Coba lagi.', 'error');
    });
}

// Fungsi export data
function exportData() {
    console.log('=== EXPORT DATA DIPANGGIL ===');
    
    try {
        const dataStr = localStorage.getItem('siswaData');
        const siswaData = dataStr ? JSON.parse(dataStr) : [];
        
        if (siswaData.length === 0) {
            showAlert('Tidak ada data untuk diexport.', 'error');
            return;
        }
        
        let exportText = DAFTAR ULANGAN - EKSPORT DATA\n;
        exportText += Tanggal: ${new Date().toLocaleDateString('id-ID')}\n;
        exportText += Waktu: ${new Date().toLocaleTimeString('id-ID')}\n;
        exportText += Total Siswa: ${siswaData.length}\n\n;
        exportText += NO | NAMA SISWA | MAPEL BELUM DIKERJAKAN | KODE | WAKTU INPUT\n;
        exportText += ---|------------|-----------------------|------|-------------\n;
        
        siswaData.forEach((siswa, index) => {
            const mapelList = [];
            if (siswa.mapel && Array.isArray(siswa.mapel)) {
                if (siswa.mapel.includes('mtk')) mapelList.push('Matematika');
                if (siswa.mapel.includes('pkn')) mapelList.push('PKN');
            }
            
            exportText += ${index + 1} | ${siswa.nama || ''} | ${mapelList.join(', ') || '-'} | ${siswa.mapelKode || '-'} | ${siswa.tanggal || '-'}\n;
        });
        
        // Buat blob dan download
        const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = daftar-ulangan-${new Date().toISOString().split('T')[0]}.txt;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('Data berhasil diexport');
        showAlert('Data berhasil diexport!', 'success');
        
    } catch (error) {
        console.error('Error exporting data:', error);
        showAlert('Error mengexport data: ' + error.message, 'error');
    }
}

// Fungsi show alert
function showAlert(message, type) {
    console.log('=== SHOW ALERT ===');
    console.log('Pesan:', message, 'Tipe:', type);
    
    const successAlert = document.getElementById('successAlert');
    const alertMessage = document.getElementById('alertMessage');
    
    if (!successAlert || !alertMessage) {
        console.error('Elemen alert tidak ditemukan!');
        return;
    }
    
    alertMessage.textContent = message;
    
    if (type === 'success') {
        successAlert.className = 'alert alert-success';
    } else {
        successAlert.className = 'alert alert-error';
    }
    
    successAlert.style.display = 'flex';
    
    setTimeout(() => {
        successAlert.style.display = 'none';
    }, 5000);
}

// Main function saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== DOM CONTENT LOADED - ADMIN PAGE ===');
    
    // Inisialisasi data jika belum ada
    if (!localStorage.getItem('siswaData')) {
        localStorage.setItem('siswaData', JSON.stringify([]));
        console.log('Data diinisialisasi');
    }
    
    // Load data pertama kali
    loadData();
    
    // Event Listeners
    const refreshBtn = document.getElementById('refreshBtn');
    const copyFormatBtn = document.getElementById('copyFormatBtn');
    const exportBtn = document.getElementById('exportBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyWhatsappBtn = document.getElementById('copyWhatsappBtn');
    const openWhatsappBtn = document.getElementById('openWhatsappBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    console.log('Tombol ditemukan:', {
        refreshBtn: !!refreshBtn,
        copyFormatBtn: !!copyFormatBtn,
        exportBtn: !!exportBtn,
        clearBtn: !!clearBtn,
        copyWhatsappBtn: !!copyWhatsappBtn,
        openWhatsappBtn: !!openWhatsappBtn,
        logoutBtn: !!logoutBtn
    });
    
    // Refresh Data
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            console.log('Tombol Refresh diklik');
            loadData();
        });
    }
    
    // Copy Format WhatsApp
    if (copyFormatBtn) {
        copyFormatBtn.addEventListener('click', function() {
            console.log('Tombol Copy Format diklik');
            generateWhatsappText();
            const whatsappText = document.getElementById('whatsappText');
            if (whatsappText) {
                copyToClipboard(whatsappText.textContent);
            }
        });
    }
    
    // Copy WhatsApp Text
    if (copyWhatsappBtn) {
        copyWhatsappBtn.addEventListener('click', function() {
            console.log('Tombol Copy WhatsApp diklik');
            const whatsappText = document.getElementById('whatsappText');
            if (whatsappText) {
                copyToClipboard(whatsappText.textContent);
            }
        });
    }
    
    // Open WhatsApp Web
    if (openWhatsappBtn) {
        openWhatsappBtn.addEventListener('click', function() {
            console.log('Tombol Open WhatsApp diklik');
            window.open('https://web.whatsapp.com', '_blank');
        });
    }
    
    // Export Data
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            console.log('Tombol Export diklik');
            exportData();
        });
    }
    
    // Clear All Data
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            console.log('Tombol Clear All diklik');
            if (confirm('Hapus SEMUA data siswa? Tindakan ini tidak dapat dibatalkan!')) {
                localStorage.removeItem('siswaData');
                localStorage.setItem('siswaData', JSON.stringify([]));
                showAlert('Semua data berhasil dihapus!', 'success');
                loadData();
            }
        });
    }
    
    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            console.log('Tombol Logout diklik');
            // Simple logout - langsung ke halaman siswa
            window.location.href = 'siswa.html';
        });
    }
    
    // Auto refresh setiap 30 detik
    setInterval(() => {
        console.log('Auto refresh data');
        loadData();
    }, 30000);
    
    // Debug functions
    window.adminDebugShowData = function() {
        const data = JSON.parse(localStorage.getItem('siswaData')) || [];
        console.log('=== DEBUG DATA ADMIN ===');
        console.log('Total data:', data.length);
        console.table(data);
        alert(Total data: ${data.length}\nLihat console untuk detail.);
    };
    
    console.log('=== INISIALISASI ADMIN SELESAI ===');
});
