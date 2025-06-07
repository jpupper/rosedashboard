// Check authentication
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = window.appConfig.getPath('/');
}

// DOM Elements
const createClientBtn = document.getElementById('createClientBtn');
const createClientForm = document.getElementById('createClientForm');
const clientsList = document.getElementById('clientsList');
const usersList = document.getElementById('usersList');

// Initialize modal
const clientModal = new Modal('createClientModal', {
    onClose: () => {
        createClientForm.dataset.editingId = '';
        document.getElementById('modalTitle').textContent = 'Create Client';
        document.getElementById('submitBtn').textContent = 'Create';
        createClientForm.reset();
    }
});

// Event Listeners
createClientBtn.addEventListener('click', () => {
    document.getElementById('modalTitle').textContent = 'Create Client';
    document.getElementById('submitBtn').textContent = 'Create';
    loadUsers(); // Cargar usuarios para asignación
    clientModal.open();
});

// Load users for assignment
async function loadUsers() {
    try {
        const response = await fetch(`${window.appConfig.apiUrl}/api/users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const users = await response.json();
        
        usersList.innerHTML = users.map(user => `
            <div class="form-check">
                <input class="form-check-input" type="radio" name="assignedMember" 
                       value="${user._id}" id="user_${user._id}" required>
                <label class="form-check-label" for="user_${user._id}">
                    ${user.name} (${user.username})
                </label>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading users:', error);
        usersList.innerHTML = '<div class="text-danger">Error al cargar usuarios</div>';
    }
}

// Edit client function
async function editClient(clientId) {
    try {
        const response = await fetch(`${window.appConfig.apiUrl}/api/clients/${clientId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const client = await response.json();

        // Load users first
        await loadUsers();

        // Fill form with client data
        document.getElementById('name').value = client.name;
        document.getElementById('description').value = client.description || '';
        document.getElementById('location').value = client.location;
        document.getElementById('accountValue').value = client.accountValue;
        document.getElementById('contactName').value = client.clientContact.name;
        document.getElementById('contactEmail').value = client.clientContact.email || '';
        document.getElementById('contactPhone').value = client.clientContact.phone || '';

        // Select assigned member
        const radioBtn = document.querySelector(`input[value="${client.assignedMember._id}"]`);
        if (radioBtn) radioBtn.checked = true;

        // Update modal title and button
        document.getElementById('modalTitle').textContent = 'Edit Client';
        document.getElementById('submitBtn').textContent = 'Save Changes';

        // Store editing ID
        createClientForm.dataset.editingId = clientId;

        // Show modal
        clientModal.open();
    } catch (error) {
        console.error('Error loading client:', error);
        alert('Error loading client data');
    }
}

// Delete client function
async function deleteClient(clientId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
        return;
    }

    try {
        const response = await fetch(`${window.appConfig.apiUrl}/api/clients/${clientId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            loadClients(); // Recargar la lista de clientes
        } else {
            const data = await response.json();
            alert(data.message || 'Error al eliminar cliente');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
    }
}

// Form submit handler
createClientForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const clientData = {
        name: document.getElementById('name').value,
        description: document.getElementById('description').value,
        location: document.getElementById('location').value,
        accountValue: parseFloat(document.getElementById('accountValue').value),
        assignedMember: document.querySelector('input[name="assignedMember"]:checked').value,
        clientContact: {
            name: document.getElementById('contactName').value,
            email: document.getElementById('contactEmail').value,
            phone: document.getElementById('contactPhone').value
        }
    };

    const editingId = createClientForm.dataset.editingId;
    const isEditing = Boolean(editingId);

    try {
        const url = isEditing ? 
            `${window.appConfig.apiUrl}/api/clients/${editingId}` : 
            `${window.appConfig.apiUrl}/api/clients`;
        
        const response = await fetch(url, {
            method: isEditing ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(clientData)
        });

        if (response.ok) {
            clientModal.close();
            createClientForm.reset();
            loadClients();
        } else {
            const data = await response.json();
            alert(data.message || 'Error al procesar el cliente');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
    }
});

// Load clients function
async function loadClients() {
    try {
        const response = await fetch(`${window.appConfig.apiUrl}/api/clients`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const clients = await response.json();
        displayClients(clients);
    } catch (error) {
        console.error('Error loading clients:', error);
        clientsList.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Error al cargar clientes</td></tr>';
    }
}

// Display clients function
function displayClients(clients) {
    clientsList.innerHTML = clients.map(client => `
        <tr>
            <td>${client.name}</td>
            <td>${client.location}</td>
            <td>$${client.accountValue.toLocaleString()}</td>
            <td>${client.assignedMember.name}</td>
            <td>
                <div>${client.clientContact.name}</div>
                <small class="text-muted">
                    ${client.clientContact.email ? `Email: ${client.clientContact.email}<br>` : ''}
                    ${client.clientContact.phone ? `Phone: ${client.clientContact.phone}` : ''}
                </small>
            </td>
            <td><small>${client.description || '-'}</small></td>
            <td><small class="text-muted">${new Date(client.createdAt).toLocaleDateString()}</small></td>
            <td>
                <div class="btn-group">
                    <button onclick="editClient('${client._id}')" class="btn btn-sm btn-edit">Edit</button>
                    <button onclick="deleteClient('${client._id}')" class="btn btn-sm btn-delete">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load initial data
loadClients();
