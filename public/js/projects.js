// Check authentication
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = window.appConfig.getPath('/');
}

// DOM Elements
const createProjectBtn = document.getElementById('createProjectBtn');
const createProjectForm = document.getElementById('createProjectForm');
const projectsList = document.getElementById('projectsList');

// Initialize modal
const projectModal = new Modal('createProjectModal', {
    onOpen: () => {
        loadUsersForAssignment();
        loadClientsForAssignment();
    },
    onClose: () => {
        if (createProjectForm.dataset.editingId) {
            createProjectForm.dataset.editingId = '';
        }
    }
});

// Event Listeners
createProjectBtn.addEventListener('click', () => projectModal.open());

// Load clients for project assignment
async function loadClientsForAssignment() {
    try {
        const response = await fetch(`${window.appConfig.apiUrl}/api/clients`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const clients = await response.json();
        const clientSelect = document.getElementById('projectClient');
        
        // Mantener la opción por defecto
        const defaultOption = clientSelect.options[0];
        clientSelect.innerHTML = '';
        clientSelect.appendChild(defaultOption);
        
        // Agregar las opciones de clientes
        clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client._id;
            option.textContent = client.name;
            clientSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading clients:', error);
        document.getElementById('projectClient').innerHTML = '<option>Error loading clients</option>';
    }
}

// Load users for project assignment
async function loadUsersForAssignment() {
    try {
        const response = await fetch(`${window.appConfig.apiUrl}/api/users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const users = await response.json();
        const userCheckboxes = document.getElementById('userCheckboxes');
        
        userCheckboxes.innerHTML = users.map(user => `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="${user._id}" id="user_${user._id}">
                <label class="form-check-label" for="user_${user._id}">
                    ${user.name} (${user.username})
                </label>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading users:', error);
        document.getElementById('userCheckboxes').innerHTML = '<div class="text-danger">Error al cargar usuarios</div>';
    }
}

createProjectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const projectData = {
        name: document.getElementById('projectName').value,
        description: document.getElementById('projectDescription').value,
        client: document.getElementById('projectClient').value || undefined,
        categories: document.getElementById('projectCategories').value.split(',').map(cat => cat.trim()).filter(cat => cat),
        state: document.getElementById('projectState').value,
        assignedUsers: getSelectedUsers()
    };

    const editingId = createProjectForm.dataset.editingId;
    const isEditing = Boolean(editingId);

    try {
        const url = isEditing ? `${window.appConfig.apiUrl}/api/projects/${editingId}` : `${window.appConfig.apiUrl}/api/projects`;
        const method = isEditing ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(projectData)
        });

        if (response.ok) {
            // Limpiar formulario y cerrar modal
            createProjectForm.reset();
            createProjectForm.dataset.editingId = ''; // Limpiar ID de edición
            projectModal.close();
            
            // Recargar lista de proyectos
            loadProjects();
        } else {
            const data = await response.json();
            alert(data.message || 'Error creating project');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error connecting to server');
    }
});

// Load projects
async function loadProjects() {
    try {
        const response = await fetch(`${window.appConfig.apiUrl}/api/projects`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const projects = await response.json();
        displayProjects(projects);
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

function displayProjects(projects) {
    projectsList.innerHTML = projects.map(project => `
        <tr>
            <td>${project.name}</td>
            <td>${project.description}</td>
            <td>${project.client ? project.client.name : 'No client'}</td>
            <td>${project.categories?.join(', ') || 'No categories'}</td>
            <td>${project.state}</td>
            <td>${project.createdBy?.name || 'Admin'}</td>
            <td>${new Date(project.createdAt).toLocaleDateString()}</td>
            <td>
                ${project.assignedUsers?.map(user => user.name).join(', ') || 'No assignments'}
            </td>
            <td>
                <div class="btn-group">
                    <button onclick="editProject('${project._id}')" class="btn btn-sm btn-edit">Edit</button>
                    <button onclick="deleteProject('${project._id}')" class="btn btn-sm btn-delete">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Cargar usuarios para asignación
async function loadUsersForAssignment() {
    try {
        const response = await fetch(`${window.appConfig.apiUrl}/api/users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const users = await response.json();
        const userCheckboxes = document.getElementById('userCheckboxes');
        
        userCheckboxes.innerHTML = users.map(user => `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="${user._id}" id="user_${user._id}">
                <label class="form-check-label" for="user_${user._id}">
                    ${user.name} (${user.username})
                </label>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading users:', error);
        document.getElementById('userCheckboxes').innerHTML = '<div class="text-danger">Error al cargar usuarios</div>';
    }
}

// Función para obtener usuarios seleccionados
function getSelectedUsers() {
    return Array.from(document.querySelectorAll('#userCheckboxes input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);
}

// Función para marcar usuarios asignados
function setSelectedUsers(userIds) {
    document.querySelectorAll('#userCheckboxes input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = userIds.includes(checkbox.value);
    });
}

// Load initial data
loadProjects();

// La carga de usuarios ahora se maneja en la función openModal

// Editar proyecto
async function editProject(projectId) {
    try {
        const response = await fetch(`${window.appConfig.apiUrl}/api/projects/${projectId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const project = await response.json();

        // Llenar el formulario
        document.getElementById('projectName').value = project.name;
        document.getElementById('projectDescription').value = project.description;
        document.getElementById('projectClient').value = project.client?._id || '';
        document.getElementById('projectCategories').value = project.categories?.join(', ') || '';
        document.getElementById('projectState').value = project.state;

        // Cargar usuarios y marcar los asignados
        await loadUsersForAssignment();
        setSelectedUsers(project.assignedUsers.map(user => user._id));

        // Mostrar modal
        projectModal.open();

        // Guardar el ID del proyecto que se está editando
        createProjectForm.dataset.editingId = projectId;
    } catch (error) {
        console.error('Error loading project:', error);
        alert('Error loading project');
    }
}

// Delete project function
async function deleteProject(projectId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
        return;
    }

    try {
        const response = await fetch(`${window.appConfig.apiUrl}/api/projects/${projectId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            loadProjects(); // Recargar la lista de proyectos
        } else {
            const data = await response.json();
            alert(data.message || 'Error al eliminar proyecto');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
    }
}

// If we're in the create/edit form, load initial data
if (document.getElementById('userCheckboxes')) {
    loadUsersForAssignment();
    loadClientsForAssignment();
}
