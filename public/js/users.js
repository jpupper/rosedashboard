// Check authentication
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/';
}

// Logout function
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/';
});

// DOM Elements
const createUserBtn = document.getElementById('createUserBtn');
const createUserForm = document.getElementById('createUserForm');
const usersList = document.getElementById('usersList');

// Initialize modal
const userModal = new Modal('createUserModal', {
    onClose: () => {
        createUserForm.dataset.editingId = '';
        document.getElementById('modalTitle').textContent = 'Create User';
        document.getElementById('submitBtn').textContent = 'Create';
    }
});

// Event Listeners
createUserBtn.addEventListener('click', () => {
    document.getElementById('modalTitle').textContent = 'Create User';
    document.getElementById('submitBtn').textContent = 'Create';
    userModal.open();
});

// Edit user function
async function editUser(userId) {
    try {
        const response = await fetch(`/api/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const user = await response.json();

        // Fill form with user data
        document.getElementById('name').value = user.name;
        document.getElementById('username').value = user.username;
        document.getElementById('bio').value = user.bio || '';
        document.getElementById('isAdmin').checked = user.isAdmin;

        // Update modal title and button
        document.getElementById('modalTitle').textContent = 'Edit User';
        document.getElementById('submitBtn').textContent = 'Save Changes';

        // Store editing ID
        createUserForm.dataset.editingId = userId;

        // Show modal
        userModal.open();
    } catch (error) {
        console.error('Error loading user:', error);
        alert('Error loading user data');
    }
}

createUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userData = {
        name: document.getElementById('name').value,
        username: document.getElementById('username').value,
        bio: document.getElementById('bio').value,
        isAdmin: document.getElementById('isAdmin').checked
    };

    // Only include password for new users
    if (!createUserForm.dataset.editingId) {
        userData.password = document.getElementById('password').value;
    }

    const editingId = createUserForm.dataset.editingId;
    const isEditing = Boolean(editingId);

    try {
        const url = isEditing ? `/api/users/${editingId}` : '/api/users';
        const method = isEditing ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            userModal.close();
            createUserForm.reset();
            loadUsers();
        } else {
            const data = await response.json();
            alert(data.message || 'Error al crear usuario');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
    }
});

// Load users
async function loadUsers() {
    try {
        const response = await fetch('/api/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

function displayUsers(users) {
    usersList.innerHTML = users.map(user => `
        <tr>
            <td>${user.name}</td>
            <td>${user.username}</td>
            <td>${user.isAdmin ? 'Administrador' : 'Usuario'}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="editUser('${user._id}')">Editar</button>
                <button class="btn btn-sm btn-danger" onclick="deleteUser('${user._id}')">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

// Load initial data
loadUsers();
