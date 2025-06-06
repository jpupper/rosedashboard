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
const userModal = new Modal('createUserModal');

// Event Listeners
createUserBtn.addEventListener('click', () => userModal.open());

createUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userData = {
        name: document.getElementById('name').value,
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        bio: document.getElementById('bio').value,
        isAdmin: document.getElementById('isAdmin').checked
    };

    try {
        const response = await fetch('/api/users', {
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
