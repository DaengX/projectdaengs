// ==================== GLOBAL VARIABLES ====================
let students = JSON.parse(localStorage.getItem('students')) || [];

// ==================== DOM ELEMENTS ====================
const elements = {
    studentName: document.getElementById('studentName'),
    mathCheckbox: document.getElementById('mathCheckbox'),
    pknCheckbox: document.getElementById('pknCheckbox'),
    saveBtn: document.getElementById('saveBtn'),
    resetBtn: document.getElementById('resetBtn'),
    studentTableBody: document.getElementById('studentTableBody'),
    copyTextArea: document.getElementById('copyTextArea'),
    copyTextBtn: document.getElementById('copyTextBtn'),
    notification: document.getElementById('notification'),
    notificationText: document.getElementById('notificationText'),
    totalStudents: document.getElementById('totalStudents'),
    mathStudents: document.getElementById('mathStudents'),
    pknStudents: document.getElementById('pknStudents'),
    bothStudents: document.getElementById('bothStudents'),
    formTabBtn: document.getElementById('formTabBtn'),
    adminTabBtn: document.getElementById('adminTabBtn'),
    formTab: document.getElementById('formTab'),
    adminTab: document.getElementById('adminTab')
};

// ==================== NOTIFICATION SYSTEM ====================
function showNotification(message, type = 'success') {
    elements.notificationText.textContent = message;
    
    if (type === 'success') {
        elements.notification.style.backgroundColor = '#4cc9f0';
    } else if (type === 'error') {
        elements.notification.style.backgroundColor = '#f72585';
    } else if (type === 'warning') {
        elements.notification.style.backgroundColor = '#ff9e00';
    }
    
    elements.notification.classList.add('show');
    
    setTimeout(() => {
        elements.notification.classList.remove('show');
    }, 3000);
}

// ==================== LOCAL STORAGE ====================
function saveToLocalStorage() {
    localStorage.setItem('students', JSON.stringify(students));
}

// ==================== GENERATE ID ====================
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ==================== RENDER STUDENT TABLE ====================
function renderStudentTable() {
    elements.studentTableBody.innerHTML = '';
    
    if (students.length === 0) {
        elements.studentTableBody.innerHTML = `
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
            
            let subjectBadges = '';
            if (student.math && student.pkn) {
                subjectBadges = '<span class="badge-math subject-badge">M</span> <span class="badge-pkn subject-badge">P</span>';
            } else if (student.math) {
                subjectBadges = '<span class="badge-math subject-badge">M</span>';
            } else if (student.pkn) {
                subjectBadges = '<span class="badge-pkn subject-badge">P</span>';
            }
            
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
                        <button class="action-btn delete" data-id="${student.id}">
                            <i class="fas fa-trash-alt"></i> Hapus
                        </button>
                    </div>
                </td>
            `;
            
            elements.studentTableBody.appendChild(row);
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

// ==================== UPDATE STATISTICS ====================
function updateStatistics() {
    const total = students.length;
    const mathCount = students.filter(s => s.math).length;
    const pknCount = students.filter(s => s.pkn).length;
    const bothCount = students.filter(s => s.math && s.pkn).length;
    
    elements.totalStudents.textContent = total;
    elements.mathStudents.textContent = mathCount;
    elements.pknStudents.textContent = pknCount;
    elements.bothStudents.textContent = bothCount;
}

// ==================== UPDATE COPY TEXT ====================
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
    
    elements.copyTextArea.value = text;
}

// ==================== ADD STUDENT ====================
function addStudent() {
    const name = elements.studentName.value.trim();
    const math = elements.mathCheckbox.checked;
    const pkn = elements.pknCheckbox.checked;
    
    if (!name) {
        showNotification('Nama siswa harus diisi!', 'error');
        elements.studentName.focus();
        return;
    }
    
    if (!math && !pkn) {
        showNotification('Pilih minimal satu mata pelajaran!', 'error');
        return;
    }
    
    const newStudent = {
        id: generateId(),
        name: name,
        math: math,
        pkn: pkn
    };
    
    students.push(newStudent);
    saveToLocalStorage();
    renderStudentTable();
    resetForm();
    showNotification(Data "${name}" berhasil disimpan!);
    switchToAdminTab();
}

// ==================== DELETE STUDENT ====================
function deleteStudent(id) {
    if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
        students = students.filter(student => student.id !== id);
        saveToLocalStorage();
        renderStudentTable();
        showNotification('Data siswa berhasil dihapus!', 'warning');
    }
}

// ==================== RESET FORM ====================
function resetForm() {
    elements.studentName.value = '';
    elements.mathCheckbox.checked = false;
    elements.pknCheckbox.checked = false;
    elements.studentName.focus();
}

// ==================== COPY TO CLIPBOARD ====================
function copyToClipboard() {
    elements.copyTextArea.select();
    elements.copyTextArea.setSelectionRange(0, 99999);
    
    navigator.clipboard.writeText(elements.copyTextArea.value)
        .then(() => {
            showNotification('Teks berhasil disalin ke clipboard!');
        })
        .catch(err => {
            console.error('Gagal menyalin teks: ', err);
            showNotification('Gagal menyalin teks', 'error');
        });
}

// ==================== TAB SWITCHING ====================
function switchToAdminTab() {
    elements.formTabBtn.classList.remove('active');
    elements.adminTabBtn.classList.add('active');
    elements.formTab.classList.remove('active');
    elements.adminTab.classList.add('active');
}

function switchToFormTab() {
    elements.adminTabBtn.classList.remove('active');
    elements.formTabBtn.classList.add('active');
    elements.adminTab.classList.remove('active');
    elements.formTab.classList.add('active');
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Save button
    elements.saveBtn.addEventListener('click', addStudent);
    
    // Reset button
    elements.resetBtn.addEventListener('click', resetForm);
    
    // Copy text button
    elements.copyTextBtn.addEventListener('click', copyToClipboard);
    
    // Tab buttons
    elements.formTabBtn.addEventListener('click', switchToFormTab);
    elements.adminTabBtn.addEventListener('click', switchToAdminTab);
    
    // Enter key in name input
    elements.studentName.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addStudent();
        }
    });
}

// ==================== INITIALIZATION ====================
function init() {
    // Add sample data if empty
    if (students.length === 0) {
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
    elements.studentName.focus();
}

// ==================== START APPLICATION ====================
// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', init);
