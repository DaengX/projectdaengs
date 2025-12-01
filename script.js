// Data siswa (disimpan di localStorage)
let students = JSON.parse(localStorage.getItem('students')) || [];

// Elemen DOM
const studentNameInput = document.getElementById('studentName');
const mathCheckbox = document.getElementById('mathCheckbox');
const pknCheckbox = document.getElementById('pknCheckbox');
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');
const studentTableBody = document.getElementById('studentTableBody');
const copyTextArea = document.getElementById('copyTextArea');
const copyTextBtn = document.getElementById('copyTextBtn');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notificationText');
const totalStudentsEl = document.getElementById('totalStudents');
const mathStudentsEl = document.getElementById('mathStudents');
const pknStudentsEl = document.getElementById('pknStudents');
const bothStudentsEl = document.getElementById('bothStudents');
const formTabBtn = document.getElementById('form-tab-btn');
const adminTabBtn = document.getElementById('admin-tab-btn');
const formTab = document.getElementById('form-tab');
const adminTab = document.getElementById('admin-tab');

// Fungsi untuk menampilkan notifikasi
function showNotification(message, type = 'success') {
    notificationText.textContent = message;
    
    // Atur warna notifikasi berdasarkan tipe
    if (type === 'success') {
        notification.style.backgroundColor = '#4cc9f0';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#f72585';
    } else if (type === 'warning') {
        notification.style.backgroundColor = '#ff9e00';
    }
    
    notification.classList.add('show');
    
    // Sembunyikan notifikasi setelah 3 detik
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Fungsi untuk menyimpan data ke localStorage
function saveToLocalStorage() {
    localStorage.setItem('students', JSON.stringify(students));
}

// Fungsi untuk menghasilkan ID unik
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Fungsi untuk merender tabel siswa
function renderStudentTable() {
    // Kosongkan isi tabel
    studentTableBody.innerHTML = '';
    
    if (students.length === 0) {
        // Tampilkan pesan jika tidak ada data
        studentTableBody.innerHTML = `
            <tr id="emptyRow">
                <td colspan="4">
                    <div class="empty-state">
                        <i class="fas fa-user-slash"></i>
                        <p>Belum ada data siswa. Tambahkan data melalui form.</p>
                    </div>
                </td>
            </tr>
        `;
    } else {
        // Tampilkan data siswa
        students.forEach((student, index) => {
            const row = document.createElement('tr');
            
            // Tentukan badge mata pelajaran
            let subjectBadges = '';
            if (student.math && student.pkn) {
                subjectBadges = '<span class="badge-math subject-badge">M</span> <span class="badge-pkn subject-badge">P</span>';
            } else if (student.math) {
                subjectBadges = '<span class="badge-math subject-badge">M</span>';
            } else if (student.pkn) {
                subjectBadges = '<span class="badge-pkn subject-badge">P</span>';
            }
            
            // Tentukan teks mata pelajaran
            let subjectText = '';
            if (student.math && student.pkn) {
                subjectText = 'Matematika & PKN';
            } else if (student.math) {
                subjectText = 'Matematika';
            } else if (student.pkn) {
                subjectText = 'PKN';
            }
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${student.name}</td>
                <td>
                    ${subjectBadges}
                    ${subjectText}
                </td>
                <td>
                    <div class="actions">
                        <button class="action-btn delete" onclick="deleteStudent('${student.id}')">
                            <i class="fas fa-trash-alt"></i> Hapus
                        </button>
                    </div>
                </td>
            `;
            
            studentTableBody.appendChild(row);
        });
    }
    
    // Update statistik
    updateStatistics();
    
    // Update teks untuk disalin
    updateCopyText();
}

// Fungsi untuk memperbarui statistik
function updateStatistics() {
    const total = students.length;
    const mathCount = students.filter(s => s.math).length;
    const pknCount = students.filter(s => s.pkn).length;
    const bothCount = students.filter(s => s.math && s.pkn).length;
    
    totalStudentsEl.textContent = total;
    mathStudentsEl.textContent = mathCount;
    pknStudentsEl.textContent = pknCount;
    bothStudentsEl.textContent = bothCount;
}

// Fungsi untuk memperbarui teks untuk disalin
function updateCopyText() {
    let text = `NAMA NAMA YANG BELUM MENGERJAKAN ULANGAN

===KODE=====

MATEMATIKA = M
PKN = P

=======NAMA DAN KODE=====

`;
    
    if (students.length > 0) {
        students.forEach((student, index) => {
            let codes = [];
            if (student.math) codes.push('M');
            if (student.pkn) codes.push('P');
            
            text += ${index + 1}. ${student.name} [${codes.join(' & ')}]\n;
        });
    } else {
        text += "Belum ada data siswa.";
    }
    
    copyTextArea.value = text;
}

// Fungsi untuk menambahkan siswa baru
function addStudent() {
    const name = studentNameInput.value.trim();
    const math = mathCheckbox.checked;
    const pkn = pknCheckbox.checked;
    
    // Validasi input
    if (!name) {
        showNotification('Nama siswa harus diisi!', 'error');
        studentNameInput.focus();
        return;
    }
    
    if (!math && !pkn) {
        showNotification('Pilih minimal satu mata pelajaran!', 'error');
        return;
    }
    
    // Buat objek siswa baru
    const newStudent = {
        id: generateId(),
        name: name,
        math: math,
        pkn: pkn
    };
    
    // Tambahkan ke array
    students.push(newStudent);
    
    // Simpan ke localStorage
    saveToLocalStorage();
    
    // Render ulang tabel
    renderStudentTable();
    
    // Reset form
    resetForm();
    
    // Tampilkan notifikasi
    showNotification(Data "${name}" berhasil disimpan!);
    
    // Otomatis beralih ke tab admin
    switchToAdminTab();
}

// Fungsi untuk menghapus siswa
function deleteStudent(id) {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
        // Hapus siswa dari array
        students = students.filter(student => student.id !== id);
        
        // Simpan ke localStorage
        saveToLocalStorage();
        
        // Render ulang tabel
        renderStudentTable();
        
        // Tampilkan notifikasi
        showNotification('Data siswa berhasil dihapus!', 'warning');
    }
}

// Fungsi untuk mereset form
function resetForm() {
    studentNameInput.value = '';
    mathCheckbox.checked = false;
    pknCheckbox.checked = false;
    studentNameInput.focus();
}

// Fungsi untuk menyalin teks ke clipboard
function copyToClipboard() {
    copyTextArea.select();
    copyTextArea.setSelectionRange(0, 99999); // Untuk perangkat mobile
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showNotification('Teks berhasil disalin ke clipboard!');
        } else {
            showNotification('Gagal menyalin teks', 'error');
        }
    } catch (err) {
        console.error('Gagal menyalin teks: ', err);
        
        // Fallback menggunakan Clipboard API modern
        navigator.clipboard.writeText(copyTextArea.value)
            .then(() => {
                showNotification('Teks berhasil disalin ke clipboard!');
            })
            .catch(() => {
                showNotification('Gagal menyalin teks', 'error');
            });
    }
}

// Fungsi untuk beralih ke tab admin
function switchToAdminTab() {
    formTabBtn.classList.remove('active');
    adminTabBtn.classList.add('active');
    formTab.classList.remove('active');
    adminTab.classList.add('active');
}

// Fungsi untuk beralih ke tab form
function switchToFormTab() {
    adminTabBtn.classList.remove('active');
    formTabBtn.classList.add('active');
    adminTab.classList.remove('active');
    formTab.classList.add('active');
}

// Event Listeners
saveBtn.addEventListener('click', addStudent);

resetBtn.addEventListener('click', resetForm);

copyTextBtn.addEventListener('click', copyToClipboard);

// Event listener untuk tombol tab
formTabBtn.addEventListener('click', switchToFormTab);
adminTabBtn.addEventListener('click', switchToAdminTab);

// Event listener untuk menekan Enter di input nama
studentNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addStudent();
    }
});

// Inisialisasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    // Tambahkan data contoh jika localStorage kosong
    if (students.length === 0) {
        const exampleStudents = [
            { id: generateId(), name: 'Candra', math: true, pkn: true },
            { id: generateId(), name: 'Daeng', math: true, pkn: false },
            { id: generateId(), name: 'Budi', math: false, pkn: true },
            { id: generateId(), name: 'Siti', math: true, pkn: false }
        ];
        
        students = exampleStudents;
        saveToLocalStorage();
    }
    
    // Render tabel awal
    renderStudentTable();
    studentNameInput.focus();
    
    // Ekspos fungsi deleteStudent ke scope global
    window.deleteStudent = deleteStudent;
});
