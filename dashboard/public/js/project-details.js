// Check authentication
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = window.appConfig.getPath('/');
}

// Get project ID from URL
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get('id');
if (!projectId) {
    window.location.href = window.appConfig.getPath('/admin/projects.html');
}

// DOM Elements
const projectName = document.getElementById('projectName');
const projectDescription = document.getElementById('projectDescription');
const projectClient = document.getElementById('projectClient');
const projectState = document.getElementById('projectState');
const projectCategories = document.getElementById('projectCategories');
const assignedUsers = document.getElementById('assignedUsers');
const tasksList = document.getElementById('tasksList');
const adminControls = document.getElementById('adminControls');
const createTaskBtn = document.getElementById('createTaskBtn');
const createTaskForm = document.getElementById('createTaskForm');

// Get current user info
let currentUser;
try {
    currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser) {
        window.location.href = window.appConfig.getPath('/');
        throw new Error('No user found');
    }
    
    // Show admin controls if user is admin
    if (currentUser.isAdmin) {
        adminControls.style.display = 'block';
    }
} catch (error) {
    console.error('Error loading user:', error);
    window.location.href = window.appConfig.getPath('/');
}

// Initialize modal
const taskModal = new Modal('createTaskModal', {
    onOpen: () => loadUsersForAssignment()
});

// Event Listeners
createTaskBtn.addEventListener('click', () => taskModal.open());

// Load project details
async function loadProjectDetails() {
    try {
        const response = await fetch(`${window.appConfig.apiUrl}/api/projects/${projectId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const project = await response.json();

        // Update project info
        projectName.textContent = project.name;
        projectDescription.textContent = project.description;
        projectClient.textContent = project.client ? project.client.name : 'No client';
        projectState.textContent = project.state;
        projectCategories.textContent = project.categories?.join(', ') || 'No categories';

        // Update assigned users
        assignedUsers.innerHTML = project.assignedUsers.map(user => `
            <div class="mb-2">
                <span class="badge bg-secondary">${user.name}</span>
            </div>
        `).join('');

        loadProjectTasks();
    } catch (error) {
        console.error('Error loading project:', error);
        alert('Error loading project details');
    }
}

// Load tasks
async function loadProjectTasks() {
    try {
        const response = await fetch(`${window.appConfig.apiUrl}/api/tasks/project/${projectId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const tasks = await response.json();
        displayTasks(tasks);
    } catch (error) {
        console.error('Error loading tasks:', error);
        tasksList.innerHTML = '<div class="alert alert-danger">Error loading tasks</div>';
    }
}

// Display tasks
function displayTasks(tasks) {
    tasksList.innerHTML = tasks.map(task => {
        const isAssigned = task.assignedUsers.some(user => user._id === currentUser.id);
        return `
            <div class="task-item ${isAssigned ? 'assigned' : ''} ${task.completed ? 'completed' : ''}">
                <div class="task-title">
                    <h6>${task.title}</h6>
                    <div class="task-actions">
                        ${isAssigned || currentUser.isAdmin ? `
                            <button onclick="toggleTaskComplete('${task._id}', ${!task.completed})" 
                                    class="btn btn-sm ${task.completed ? 'btn-secondary' : 'btn-success'}">
                                ${task.completed ? 'Mark Incomplete' : 'Mark Complete'}
                            </button>
                        ` : ''}
                        ${currentUser.isAdmin ? `
                            <button onclick="editTask('${task._id}')" class="btn btn-sm btn-edit">Edit</button>
                            <button onclick="deleteTask('${task._id}')" class="btn btn-sm btn-delete">Delete</button>
                        ` : ''}
                    </div>
                </div>
                <p class="mb-1">${task.description}</p>
                <small class="text-muted">
                    Assigned to: ${task.assignedUsers.map(user => user.name).join(', ') || 'No one'}
                </small>
                ${task.completed ? `
                    <br>
                    <small class="text-success">
                        Completed on ${new Date(task.completedAt).toLocaleDateString()}
                    </small>
                ` : ''}
            </div>
        `;
    }).join('') || '<p class="text-muted">No tasks found</p>';
}

// Variable to store project assigned users
let projectAssignedUsers = [];

// Load users for task assignment
async function loadUsersForAssignment() {
    try {
        const response = await fetch(`${window.appConfig.apiUrl}/api/projects/${projectId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const project = await response.json();
        projectAssignedUsers = project.assignedUsers || [];
        
        const userCheckboxes = document.getElementById('taskUserCheckboxes');
        
        if (projectAssignedUsers.length === 0) {
            userCheckboxes.innerHTML = '<div class="alert alert-warning">No users assigned to this project</div>';
            return;
        }
        
        userCheckboxes.innerHTML = projectAssignedUsers.map(user => `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="${user._id}" id="user_${user._id}">
                <label class="form-check-label" for="user_${user._id}">
                    ${user.name} (${user.username})
                </label>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading project users:', error);
        document.getElementById('taskUserCheckboxes').innerHTML = '<div class="text-danger">Error loading project users</div>';
    }
}

// Get selected users from checkboxes
function getSelectedUsers() {
    return Array.from(document.querySelectorAll('#taskUserCheckboxes input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);
}

// Create task
createTaskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const taskData = {
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        projectId: projectId,
        assignedUsers: getSelectedUsers()
    };

    try {
        const response = await fetch(`${window.appConfig.apiUrl}/api/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(taskData)
        });

        if (response.ok) {
            createTaskForm.reset();
            taskModal.close();
            loadProjectTasks();
        } else {
            const data = await response.json();
            alert(data.message || 'Error creating task');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error connecting to server');
    }
});

// Toggle task complete status
async function toggleTaskComplete(taskId, completed) {
    try {
        const response = await fetch(`${window.appConfig.apiUrl}/api/tasks/${taskId}/toggle-complete`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            loadProjectTasks();
        } else {
            const data = await response.json();
            alert(data.message || 'Error updating task');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error connecting to server');
    }
}

// Delete task
async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }

    try {
        const response = await fetch(`${window.appConfig.apiUrl}/api/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            loadProjectTasks();
        } else {
            const data = await response.json();
            alert(data.message || 'Error deleting task');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error connecting to server');
    }
}

// Load initial data
loadProjectDetails();
