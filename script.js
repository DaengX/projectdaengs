// ========== VARIABLES ==========
let students = JSON.parse(localStorage.getItem('students')) || [];

// ========== DOM ELEMENTS ==========
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
const formTabBtn = document.getElementById('formTabBtn');
const adminTabBtn = document.getElementById('adminTabBtn');
const formTab = document.getElementById('formTab');
const adminTab = document.getElementById('adminTab');

// ========== NOTIFICATION ==========
function showNotification(message, type = 'success') {
    notificationText.textContent = message;
    
    if (type === 'success') {
        notification.style.backgroundColor = '#4cc9f0';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#f72585';
    } else if (type === 'warning') {
        notification.style.backgroundColor = '#ff9e00';
    }
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// ========== LOCAL STORAGE ==========
function saveToLocalStorage() {
    localStorage.setItem('students', JSON.stringify(students));
}

// ========== GENERATE ID ==========
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ========== RENDER TABLE ==========
function renderStudentTable() {
    studentTableBody.innerHTML = '';
    
    if (students.length === 0) {
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
        students.forEach((student, index) => {
            const row = document.createElement('tr');
            
            // Determine badges
            let badges = '';
            if (student.math && student.pkn) {
                badges = '<span class="badge-math subject-badge">M</span> <span class="badge-pkn subject-badge">P</span>';
            } else if (student.math) {
                badges = '<span class="badge-math subject-badge">M</span>';
            } else if (student.pkn) {
                badges = '<span class="badge-pkn subject-badge">P</span>';
            }
            
            // Determine text
            let text = '';
            if (student.math && student.pkn) {
                text = 'Matematika & PKN';
            } else if (student.math) {
                text = 'Matematika';
            } else if (student.pkn) {
                text = 'PKN';
            }
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${student.name}</td>
                <td>
                    ${badges}
                    ${text}
                </td>
                <td>
                    <div class="actions">
                        <button class="action-btn delete" data-id="${student.id}">
                            <i class="fas fa-trash-alt"></i> Hapus
                        </button>
                    </div>
                </td>
            `;
            
            studentTableBody.appendChild(row);
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.action-btn.delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                deleteStudent(id);
            });
        });
    }
    
    updateStatistics();
    updateCopyText();
}

// ========== UPDATE STATISTICS ==========
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

// ========== UPDATE COPY TEXT ==========
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

// ========== ADD STUDENT ==========
function addStudent() {
    const name = studentNameInput.value.trim();
    const math = mathCheckbox.checked;
    const pkn = pknCheckbox.checked;
    
    // Validation
    if (!name) {
        showNotification('Nama siswa harus diisi!', 'error');
        studentNameInput.focus();
        return;
    }
    
    if (!math && !pkn) {
        showNotification('Pilih minimal satu mata pelajaran!', 'error');
        return;
    }
    
    // Create new student
    const newStudent = {
        id: generateId(),
        name: name,
        math: math,
        pkn: pkn
    };
    
    // Add to array
    students.push(newStudent);
    
    // Save to localStorage
    saveToLocalStorage();
    
    // Update UI
    renderStudentTable();
    
    // Reset form
    resetForm();
    
    // Show notification
    showNotification(Data "${name}" berhasil disimpan!);
    
    // Switch to admin tab
    switchToAdminTab();
}

// ========== DELETE STUDENT ==========
function deleteStudent(id) {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
        // Remove from array
        students = students.filter(student => student.id !== id);
        
        // Save to localStorage
        saveToLocalStorage();
        
        // Update UI
        renderStudentTable();
        
        // Show notification
        showNotification('Data siswa berhasil dihapus!', 'warning');
    }
}

// ========== RESET FORM ==========
function resetForm() {
    studentNameInput.value = '';
    mathCheckbox.checked = false;
    pknCheckbox.checked = false;
    studentNameInput.focus();
}

// ========== COPY TO CLIPBOARD ==========
function copyToClipboard() {
    copyTextArea.select();
    copyTextArea.setSelectionRange(0, 99999);
    
    // Modern clipboard API
    navigator.clipboard.writeText(copyTextArea.value)
        .then(() => {
            showNotification('Teks berhasil disalin ke clipboard!');
        })
        .catch(err => {
            console.error('Gagal menyalin teks: ', err);
            showNotification('Gagal menyalin teks', 'error');
        });
}

// ========== TAB SWITCHING ==========
function switchToAdminTab() {
    formTabBtn.classList.remove('active');
    adminTabBtn.classList.add('active');
    formTab.classList.remove('active');
    adminTab.classList.add('active');
}

function switchToFormTab() {
    adminTabBtn.classList.remove('active');
    formTabBtn.classList.add('active');
    adminTab.classList.remove('active');
    formTab.classList.add('active');
}

// ========== EVENT LISTENERS ==========
function setupEventListeners() {
    // Save button
    saveBtn.addEventListener('click', addStudent);
    
    // Reset button
    resetBtn.addEventListener('click', resetForm);
    
    // Copy text button
    copyTextBtn.addEventListener('click', copyToClipboard);
    
    // Tab buttons
    formTabBtn.addEventListener('click', switchToFormTab);
    adminTabBtn.addEventListener('click', switchToAdminTab);
    
    // Enter key in name input
    studentNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addStudent();
        }
    });
}

// ========== INITIALIZE ==========
function init() {
    console.log('Initializing application...');
    
    // Add sample data if empty
    if (students.length === 0) {
        console.log('Adding sample data...');
        students = [
            { id: generateId(), name: 'Candra', math: true, pkn: true },
            { id: generateId(), name: 'Daeng', math: true, pkn: false },
            { id: generateId(), name: 'Budi', math: false, pkn: true },
            { id: generateId(), name: 'Siti', math: true, pkn: false }
        ];
        saveToLocalStorage();
    }
    
    // Render initial table
    renderStudentTable();
    
    // Setup event listeners
    setupEventListeners();
    
    // Focus on name input
    studentNameInput.focus();
    
    console.log('Application initialized successfully');
}

// ========== START APPLICATION ==========
// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', init);

// Make deleteStudent function globally available
window.deleteStudent = deleteStudent;
