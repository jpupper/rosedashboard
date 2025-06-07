// Check authentication
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = window.appConfig.getPath('/');
}

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
        const response = await fetch(`${window.appConfig.apiUrl}/api/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const user = await response.json();
        
        if (!user || !user._id) {
            throw new Error('Error loading user');
        }

        // Fill form with user data
        document.getElementById('name').value = user.name;
        document.getElementById('username').value = user.username;
        document.getElementById('bio').value = user.bio || '';
        document.getElementById('role').value = user.role || 'other';
        document.getElementById('access').value = user.isAdmin ? 'admin' : 'user';

        // Hide password field for editing
        document.getElementById('password').required = false;
        document.getElementById('password').value = '';

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
        role: document.getElementById('role').value,
        isAdmin: document.getElementById('access').value === 'admin'
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

        const response = await fetch(`${window.appConfig.apiUrl}${url}`, {
            method,
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
        const response = await fetch(`${window.appConfig.apiUrl}/api/users`, {
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
            <td>@${user.username}</td>
            <td>${user.role || '-'}</td>
            <td>
                <span class="badge ${user.isAdmin ? 'bg-dark' : 'bg-secondary'}">
                    ${user.isAdmin ? 'Administrator' : 'User'}
                </span>
            </td>
            <td>
                <small class="text-muted">${user.bio || '-'}</small>
            </td>
            <td>
                <small class="text-muted">${new Date(user.createdAt).toLocaleDateString()}</small>
            </td>
            <td>
                <div class="btn-group">
                    <button onclick="editUser('${user._id}')" class="btn btn-sm btn-edit">Edit</button>
                    <button onclick="deleteUser('${user._id}')" class="btn btn-sm btn-delete">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Delete user function
async function deleteUser(userId) {
    /*if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
        return;
    }*/

    try {
        const response = await fetch(`${window.appConfig.apiUrl}/api/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            loadUsers(); // Recargar la lista de usuarios
        } else {
            const data = await response.json();
            alert(data.message || 'Error al eliminar usuario');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
    }
}

// Load initial data
loadUsers();
