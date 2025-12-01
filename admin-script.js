// admin-script.js - Untuk halaman admin
document.addEventListener('DOMContentLoaded', function() {
    console.log('Halaman admin dimuat');
    
    // Elements
    const refreshBtn = document.getElementById('refreshBtn');
    const copyFormatBtn = document.getElementById('copyFormatBtn');
    const exportBtn = document.getElementById('exportBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyWhatsappBtn = document.getElementById('copyWhatsappBtn');
    const openWhatsappBtn = document.getElementById('openWhatsappBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const tableBody = document.getElementById('tableBody');
    const noDataMessage = document.getElementById('noDataMessage');
    const successAlert = document.getElementById('successAlert');
    const alertMessage = document.getElementById('alertMessage');
    const totalSiswa = document.getElementById('totalSiswa');
    const totalMtk = document.getElementById('totalMtk');
    const totalPkn = document.getElementById('totalPkn');
    const whatsappText = document.getElementById('whatsappText');
    
    // Inisialisasi data jika belum ada
    if (!localStorage.getItem('siswaData')) {
        localStorage.setItem('siswaData', JSON.stringify([]));
    }
    
    // Load data pertama kali
    loadData();
    
    // Event listeners
    refreshBtn.addEventListener('click', function() {
        console.log('Refresh data');
        loadData();
    });
    
    copyFormatBtn.addEventListener('click', function() {
        console.log('Copy format WhatsApp');
        generateWhatsappText();
        copyToClipboard(whatsappText.textContent);
    });
    
    copyWhatsappBtn.addEventListener('click', function() {
        console.log('Copy teks WhatsApp');
        copyToClipboard(whatsappText.textContent);
    });
    
    openWhatsappBtn.addEventListener('click', function() {
        console.log('Buka WhatsApp');
        window.open('https://web.whatsapp.com', '_blank');
    });
    
    exportBtn.addEventListener('click', function() {
        console.log('Export data');
        exportData();
    });
    
    clearBtn.addEventListener('click', function() {
        console.log('Hapus semua data');
        if (confirm('Hapus SEMUA data siswa? Tindakan ini tidak dapat dibatalkan!')) {
            localStorage.removeItem('siswaData');
            showAlert('Semua data berhasil dihapus!', 'success');
            loadData();
        }
    });
    
    logoutBtn.addEventListener('click', function() {
        console.log('Logout');
        // Simple logout - cukup redirect ke siswa.html
        window.location.href = 'siswa.html';
    });
    
    // Fungsi load data
    function loadData() {
        try {
            const siswaData = JSON.parse(localStorage.getItem('siswaData')) || [];
            console.log('Data ditemukan:', siswaData.length, 'siswa');
            
            // Update stats
            totalSiswa.textContent = siswaData.length;
            
            const mtkCount = siswaData.filter(s => s.mapel && s.mapel.includes('mtk')).length;
            const pknCount = siswaData.filter(s => s.mapel && s.mapel.includes('pkn')).length;
            
            totalMtk.textContent = mtkCount;
            totalPkn.textContent = pknCount;
            
            // Update table
            if (siswaData.length > 0) {
                noDataMessage.style.display = 'none';
                tableBody.innerHTML = '';
                
                siswaData.forEach((siswa, index) => {
                    const row = document.createElement('tr');
                    
                    // Format mapel badges
                    const mapelBadges = [];
                    if (siswa.mapel && siswa.mapel.includes('mtk')) {
                        mapelBadges.push('<span class="mapel-badge badge-mtk">Matematika</span>');
                    }
                    if (siswa.mapel && siswa.mapel.includes('pkn')) {
                        mapelBadges.push('<span class="mapel-badge badge-pkn">PKN</span>');
                    }
                    
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td><strong>${siswa.nama || ''}</strong></td>
                        <td>${mapelBadges.join(' ')}</td>
                        <td><code>${siswa.mapelKode || ''}</code></td>
                        <td><small>${siswa.tanggal || ''}</small></td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn delete" data-id="${siswa.id}">
                                    <i class="fas fa-trash"></i> Hapus
                                </button>
                            </div>
                        </td>
                    `;
                    
                    tableBody.appendChild(row);
                });
                
                // Add event listeners untuk tombol hapus
                document.querySelectorAll('.action-btn.delete').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const id = parseInt(this.getAttribute('data-id'));
                        deleteData(id);
                    });
                });
                
            } else {
                noDataMessage.style.display = 'block';
                tableBody.innerHTML = '';
            }
            
            // Update WhatsApp text
            generateWhatsappText();
            
        } catch (error) {
            console.error('Error loading data:', error);
            showAlert('Error memuat data', 'error');
        }
    }
    
    // Fungsi hapus data
    function deleteData(id) {
        if (!confirm('Hapus data ini?')) {
            return;
        }
        
        try {
            const siswaData = JSON.parse(localStorage.getItem('siswaData')) || [];
            const updatedData = siswaData.filter(s => s.id !== id);
            
            localStorage.setItem('siswaData', JSON.stringify(updatedData));
            showAlert('Data berhasil dihapus!', 'success');
            loadData();
            
        } catch (error) {
            console.error('Error deleting data:', error);
            showAlert('Error menghapus data', 'error');
        }
    }
    
    // Fungsi generate WhatsApp text
    function generateWhatsappText() {
        try {
            const siswaData = JSON.parse(localStorage.getItem('siswaData')) || [];
            
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
                text += ${index + 1}. ${siswa.nama} [${siswa.mapelKode}]\n;
            });

            text += \nTotal: ${siswaData.length} siswa;
            whatsappText.textContent = text;
            
        } catch (error) {
            console.error('Error generating WhatsApp text:', error);
        }
    }
    
    // Fungsi copy ke clipboard
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            showAlert('Teks berhasil disalin ke clipboard!', 'success');
        }).catch(err => {
            console.error('Error copying text:', err);
            showAlert('Gagal menyalin teks', 'error');
        });
    }
    
    // Fungsi export data
    function exportData() {
        try {
            const siswaData = JSON.parse(localStorage.getItem('siswaData')) || [];
            
            if (siswaData.length === 0) {
                showAlert('Tidak ada data untuk diexport', 'error');
                return;
            }
            
            let exportText = DAFTAR ULANGAN\n;
            exportText += Tanggal: ${new Date().toLocaleDateString('id-ID')}\n;
            exportText += Total: ${siswaData.length} siswa\n\n;
            
            siswaData.forEach((siswa, index) => {
                exportText += ${index + 1}. ${siswa.nama} - ${siswa.mapelKode}\n;
            });
            
            const blob = new Blob([exportText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = daftar-ulangan-${new Date().getTime()}.txt;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showAlert('Data berhasil diexport!', 'success');
            
        } catch (error) {
            console.error('Error exporting data:', error);
            showAlert('Error mengexport data', 'error');
        }
    }
    
    // Fungsi show alert
    function showAlert(message, type) {
        alertMessage.textContent = message;
        successAlert.className = type === 'success' ? 'alert success' : 'alert error';
        successAlert.style.display = 'flex';
        
        setTimeout(() => {
            successAlert.style.display = 'none';
        }, 5000);
    }
    
    // Auto refresh setiap 30 detik
    setInterval(loadData, 30000);
});
