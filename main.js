
let users = [];


let currentEditId = null;


const totalUsersElement = document.getElementById('totalUsers');
const todayAddedElement = document.getElementById('todayAdded');
const totalSpecialtiesElement = document.getElementById('totalSpecialties');


const usersTableBody = document.getElementById('usersTableBody');
const tableContainer = document.getElementById('tableContainer');
const noUsersMessage = document.getElementById('noUsersMessage');
const noResultsMessage = document.getElementById('noResultsMessage');


const searchInput = document.getElementById('searchInput');
const filterSpecialty = document.getElementById('filterSpecialty');

const userModal = document.getElementById('userModal');
const modalTitle = document.getElementById('modalTitle');
const addUserBtn = document.getElementById('addUserBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalOverlay = document.getElementById('modalOverlay');
const cancelBtn = document.getElementById('cancelBtn');


const userForm = document.getElementById('userForm');
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const userAge = document.getElementById('userAge');
const userSpecialty = document.getElementById('userSpecialty');


const nameError = document.getElementById('nameError');
const emailError = document.getElementById('emailError');
const ageError = document.getElementById('ageError');
const specialtyError = document.getElementById('specialtyError');


const deleteModal = document.getElementById('deleteModal');
const deleteUserName = document.getElementById('deleteUserName');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const deleteModalOverlay = document.getElementById('deleteModalOverlay');


const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');


const defaultUsers = [
    {
        id: Date.now() + 1,
        name: 'Ali Housseny Muhammmed',
        email: 'alihouseny61@gmail.com',
        age: 19,
        specialty: 'Legend'
    },
    {
        id: Date.now() + 2,
        name: 'Yousef Elshaer',
        email: 'yousef@yahoo.com',
        age: 20,
        specialty: 'Software Engineer'
    },
    {
        id: Date.now() + 3,
        name: 'Ali ElHadad',
        email: 'alihousseny2005@gmail.com',
        age: 19,
        specialty: 'CEO'
    },    
    {
        id: Date.now() + 4,
        name: 'MESSI',
        email: 'messi@goat.com',
        age: 27,
        specialty: 'GOAT IN FOOTBALL'
    },
    {
        id: Date.now() + 5,
        name: 'El Zamalek',
        email: 'zsc1911@centueryclub.com',
        age:115,
        specialty: 'The white knight'
    }
];


function loadUsersFromStorage() {
    const storedUsers = localStorage.getItem('users');
    
    if (storedUsers) {

        users = JSON.parse(storedUsers);
    } else {
   
        users = [...defaultUsers];
        saveUsersToStorage();
    }
}


function saveUsersToStorage() {
    localStorage.setItem('users', JSON.stringify(users));
}

function displayUsers(usersToDisplay = users) {
  
    usersTableBody.innerHTML = '';


    if (usersToDisplay.length === 0) {

        tableContainer.classList.add('hidden');
        
        if (searchInput.value || filterSpecialty.value) {
      
            noResultsMessage.classList.remove('hidden');
            noUsersMessage.classList.add('hidden');
        } else {
         
            noUsersMessage.classList.remove('hidden');
            noResultsMessage.classList.add('hidden');
        }
        return;
    }


    tableContainer.classList.remove('hidden');
    noUsersMessage.classList.add('hidden');
    noResultsMessage.classList.add('hidden');

  
    usersToDisplay.forEach((user, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.age}</td>
            <td><span class="specialty-badge ${getSpecialtyClass(user.specialty)}">${user.specialty}</span></td>
            <td>
                <button class="btn btn-edit" onclick="editUser(${user.id})">
                    <i class="fas fa-edit"></i> edit
                </button>
                <button class="btn btn-delete" onclick="showDeleteConfirmation(${user.id})">
                    <i class="fas fa-trash"></i> delete
                </button>
            </td>
        `;
        usersTableBody.appendChild(row);
    });

    updateStatistics();
}

function getSpecialtyClass(specialty) {
    const specialtyMap = {
        'Web Developer': 'web',
        'Back-End': 'sbaak',
        'Fron-End': 'na2aa4',
        'FullStack': 'knowhtml',
        'Software Engineer': 'software',
        'else': 'other'
    };
    return specialtyMap[specialty] || 'other';
}


function updateStatistics() {
    totalUsersElement.textContent = users.length;

    todayAddedElement.textContent = Math.min(users.length, 3);

    const uniqueSpecialties = [...new Set(users.map(user => user.specialty))];
    totalSpecialtiesElement.textContent = uniqueSpecialties.length;
}



function openAddUserModal() {
    currentEditId = null;
    modalTitle.textContent = 'Add a new user';
    userForm.reset();
    clearErrors();
    userModal.classList.remove('hidden');
    setTimeout(() => userModal.classList.add('active'), 10);
}



function closeModal() {
    userModal.classList.remove('active');
    setTimeout(() => {
        userModal.classList.add('hidden');
        userForm.reset();
        clearErrors();
        currentEditId = null;
    }, 300);
}


function clearErrors() {
    nameError.textContent = '';
    emailError.textContent = '';
    ageError.textContent = '';
    specialtyError.textContent = '';
}

function validateForm() {
    let isValid = true;
    clearErrors();


    if (userName.value.trim() === '') {
        nameError.textContent = 'Name required';
        isValid = false;
    } else if (userName.value.trim().length < 3) {
        nameError.textContent = 'The name must be at least 3 letters long.';
        isValid = false;
    }

   
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (userEmail.value.trim() === '') {
        emailError.textContent = 'Email address required';
        isValid = false;
    } else if (!emailRegex.test(userEmail.value)) {
        emailError.textContent = 'Invalid email address';
        isValid = false;
    }

  
    const age = parseInt(userAge.value);
    if (!userAge.value) {
        ageError.textContent = 'Age is required*';
        isValid = false;
    } else if (age < 10 || age > 120) {
        ageError.textContent = 'The age should be between 10 and 120';
        isValid = false;
    }

 
    if (userSpecialty.value === '') {
        specialtyError.textContent = 'اSpecialization is required';
        isValid = false;
    }

    return isValid;
}


function handleFormSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    const userData = {
        name: userName.value.trim(),
        email: userEmail.value.trim(),
        age: parseInt(userAge.value),
        specialty: userSpecialty.value
    };

    if (currentEditId === null) {
  
        userData.id = Date.now(); 
        users.push(userData);
        showToast('User added successfully');
    } else {
       
        const userIndex = users.findIndex(u => u.id === currentEditId);
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...userData };
            showToast('The user has been successfully updated! ');
        }
    }

    saveUsersToStorage();


    displayUsers();

    closeModal();
}


function editUser(userId) {

    const user = users.find(u => u.id === userId);
    
    if (!user) return;


    currentEditId = userId;
    modalTitle.textContent = 'Modify user data';
    
    userName.value = user.name;
    userEmail.value = user.email;
    userAge.value = user.age;
    userSpecialty.value = user.specialty;


    userModal.classList.remove('hidden');
    setTimeout(() => userModal.classList.add('active'), 10);
}



let userToDeleteId = null;

function showDeleteConfirmation(userId) {
    const user = users.find(u => u.id === userId);
    
    if (!user) return;

    userToDeleteId = userId;
    deleteUserName.textContent = user.name;
    
    deleteModal.classList.remove('hidden');
    setTimeout(() => deleteModal.classList.add('active'), 10);
}


function deleteUser() {

    const userIndex = users.findIndex(u => u.id === userToDeleteId);
    
    if (userIndex !== -1) {
        users.splice(userIndex, 1);
        saveUsersToStorage();
        displayUsers();
        showToast('The user has been successfully deleted!');
    }

    closeDeleteModal();
}

function closeDeleteModal() {
    deleteModal.classList.remove('active');
    setTimeout(() => {
        deleteModal.classList.add('hidden');
        userToDeleteId = null;
    }, 300);
}


function searchAndFilter() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const filterValue = filterSpecialty.value;

    let filteredUsers = users;

 
    if (searchTerm) {
        filteredUsers = filteredUsers.filter(user => 
            user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
        );
    }

  
    if (filterValue) {
        filteredUsers = filteredUsers.filter(user => 
            user.specialty === filterValue
        );
    }

    displayUsers(filteredUsers);
}


function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('active'), 10);

    setTimeout(() => {
        toast.classList.remove('active');
        setTimeout(() => toast.classList.add('hidden'), 300);
    }, 3000);
}





addUserBtn.addEventListener('click', openAddUserModal);
userForm.addEventListener('submit', handleFormSubmit);

closeModalBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);


confirmDeleteBtn.addEventListener('click', deleteUser);
cancelDeleteBtn.addEventListener('click', closeDeleteModal);
deleteModalOverlay.addEventListener('click', closeDeleteModal);

searchInput.addEventListener('input', searchAndFilter);
filterSpecialty.addEventListener('change', searchAndFilter);

function init() {
    loadUsersFromStorage();
    displayUsers();
    updateStatistics();
    console.log('The user management system has been successfully loaded! ');
}


init();

const scrollTopBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollTopBtn.classList.add('show');
    } else {
        scrollTopBtn.classList.remove('show');
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

function createConfetti() {
    const colors = ['#ee7752', '#e73c7e', '#23a6d5', '#23d5ab'];
    
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.3 + 's';
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 3000);
        }, i * 30);
    }
}

const originalShowToast = showToast;
showToast = function(message) {
    originalShowToast(message);
    createConfetti();
};

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn')) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.left = e.offsetX + 'px';
        ripple.style.top = e.offsetY + 'px';
        e.target.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }
});

const themeToggle = document.getElementById('themeToggle');
let currentTheme = 0;
const themes = [
    'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
    'linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c)',
    'linear-gradient(-45deg, #0f2027, #203a43, #2c5364, #4ca1af)',
    'linear-gradient(-45deg, #fc4a1a, #f7b733, #4facfe, #00f2fe)',
    'linear-gradient(-45deg, #8E2DE2, #4A00E0, #DA22FF, #9733EE)'
];

themeToggle.addEventListener('click', () => {
    currentTheme = (currentTheme + 1) % themes.length;
    document.body.style.background = themes[currentTheme];
    document.body.style.backgroundSize = '400% 400%';
    document.body.style.animation = 'gradientBG 15s ease infinite';
    
    themeToggle.style.transform = 'rotate(360deg) scale(1.2)';
    setTimeout(() => {
        themeToggle.style.transform = 'rotate(0deg) scale(1)';
    }, 300);
});

document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('page-transition');
});

document.querySelectorAll('.stat-card').forEach(card => {
    card.classList.add('shine-effect');
});

document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openAddUserModal();
    }
    

    if (e.key === 'Escape') {
        closeModal();
        closeDeleteModal();
    }
    

    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInput.focus();
    }
});

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '0';
            entry.target.style.transform = 'translateX(-20px)';
            setTimeout(() => {
                entry.target.style.transition = 'all 0.5s ease';
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
            }, 100);
        }
    });
});


const observeTableRows = () => {
    document.querySelectorAll('.users-table tbody tr').forEach(row => {
        observer.observe(row);
    });
};


const originalDisplayUsers = displayUsers;
displayUsers = function(usersToDisplay) {
    originalDisplayUsers(usersToDisplay);
    setTimeout(observeTableRows, 100);
};

usersTableBody.addEventListener('dblclick', (e) => {
    const row = e.target.closest('tr');
    if (row) {
        const editBtn = row.querySelector('.btn-edit');
        if (editBtn) editBtn.click();
    }
});


const formFields = [userName, userEmail, userAge, userSpecialty];
formFields.forEach(field => {
    field.addEventListener('input', () => {
        if (!currentEditId) {
            localStorage.setItem('draft_' + field.id, field.value);
        }
    });
});

const originalOpenModal = openAddUserModal;
openAddUserModal = function() {
    originalOpenModal();
    
 
    formFields.forEach(field => {
        const draft = localStorage.getItem('draft_' + field.id);
        if (draft) field.value = draft;
    });
};


const originalHandleFormSubmit = handleFormSubmit;
handleFormSubmit = function(e) {
    originalHandleFormSubmit(e);
    

    formFields.forEach(field => {
        localStorage.removeItem('draft_' + field.id);
    });
};

console.log(' Enhanced features loaded!');
console.log(' Keyboard shortcuts:');
console.log('   Ctrl/Cmd + N: Add new user');
console.log('   Ctrl/Cmd + F: Focus search');
console.log('   Escape: Close modal');
console.log('   Double-click row: Edit user');

