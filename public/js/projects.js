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
const createProjectBtn = document.getElementById('createProjectBtn');
const createProjectModal = document.getElementById('createProjectModal');
const closeBtn = createProjectModal.querySelector('.close');
const createProjectForm = document.getElementById('createProjectForm');
const projectsList = document.getElementById('projectsList');

// Event Listeners
createProjectBtn.addEventListener('click', () => {
    createProjectModal.classList.add('show');
});

closeBtn.addEventListener('click', () => {
    createProjectModal.classList.remove('show');
});

// Load users for project assignment
async function loadUsersForAssignment() {
    try {
        const response = await fetch('/api/users', {
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
        assignedUsers: getSelectedUsers()
    };

    const editingId = createProjectForm.dataset.editingId;
    const isEditing = Boolean(editingId);

    try {
        const url = isEditing ? `/api/projects/${editingId}` : '/api/projects';
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
            createProjectModal.classList.remove('show');
            createProjectModal.style.display = 'none';
            
            // Recargar lista de proyectos
            loadProjects();
        } else {
            const data = await response.json();
            alert(data.message || 'Error al crear proyecto');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
    }
});

// Load projects
async function loadProjects() {
    try {
        const response = await fetch('/api/projects', {
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
            <td>${project.createdBy?.name || 'Admin'}</td>
            <td>${new Date(project.createdAt).toLocaleDateString()}</td>
            <td>
                ${project.assignedUsers?.map(user => user.name).join(', ') || 'Sin asignaciones'}
            </td>
            <td>
                <button class="btn btn-sm btn-info" onclick="editProject('${project._id}')">Editar</button>
                <button class="btn btn-sm btn-danger" onclick="deleteProject('${project._id}')">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

// Cargar usuarios para asignación
async function loadUsersForAssignment() {
    try {
        const response = await fetch('/api/users', {
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

// Cargar usuarios cuando se abre el modal
createProjectBtn.addEventListener('click', () => {
    loadUsersForAssignment();
});

// Editar proyecto
async function editProject(projectId) {
    try {
        const response = await fetch(`/api/projects/${projectId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const project = await response.json();

        // Llenar el formulario
        document.getElementById('projectName').value = project.name;
        document.getElementById('projectDescription').value = project.description;

        // Cargar usuarios y marcar los asignados
        await loadUsersForAssignment();
        setSelectedUsers(project.assignedUsers.map(user => user._id));

        // Mostrar modal
        createProjectModal.classList.add('show');
        createProjectModal.style.display = 'block';

        // Guardar el ID del proyecto que se está editando
        createProjectForm.dataset.editingId = projectId;
    } catch (error) {
        console.error('Error loading project:', error);
        alert('Error al cargar el proyecto');
    }
}

// If we're in the create/edit form, load users
if (document.getElementById('userCheckboxes')) {
    loadUsersForAssignment();
}
