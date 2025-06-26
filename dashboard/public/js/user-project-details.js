// Check authentication
const token = localStorage.getItem('token');
let currentUser;

try {
    currentUser = JSON.parse(localStorage.getItem('user'));
} catch (error) {
    console.error('Error parsing user:', error);
}

// Redirect if not authenticated or if admin
if (!token || !currentUser || currentUser.isAdmin) {
    window.location.href = window.appConfig.getPath('/');
}

// Get project ID from URL
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get('id');
if (!projectId) {
    window.location.href = window.appConfig.getPath('/user/dashboard.html');
}

// DOM Elements
const projectName = document.getElementById('projectName');
const projectDescription = document.getElementById('projectDescription');
const projectClient = document.getElementById('projectClient');
const projectState = document.getElementById('projectState');
const projectCategories = document.getElementById('projectCategories');
const assignedUsers = document.getElementById('assignedUsers');
const tasksList = document.getElementById('tasksList');

// Load project details
async function loadProjectDetails() {
    try {
        const response = await fetch(`${window.appConfig.apiUrl}/api/projects/${projectId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load project');
        }

        const project = await response.json();

        // Verify user has access to this project
        if (!project.assignedUsers.some(user => user._id === currentUser._id)) {
            window.location.href = window.appConfig.getPath('/user/dashboard.html');
            return;
        }

        // Update project info
        projectName.textContent = project.name;
        projectDescription.textContent = project.description;
        projectClient.textContent = project.client ? project.client.name : 'No client';
        projectState.textContent = project.state;
        projectCategories.textContent = project.categories?.join(', ') || 'No categories';

        // Update assigned users
        assignedUsers.innerHTML = project.assignedUsers.map(user => `
            <div class="mb-2">
                <span class="badge ${user._id === currentUser._id ? 'bg-primary' : 'bg-secondary'}">
                    ${user.name}
                </span>
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
        
        if (!response.ok) {
            throw new Error('Failed to load tasks');
        }

        const tasks = await response.json();
        
        // Filter tasks assigned to current user
        const userTasks = tasks.filter(task => 
            task.assignedUsers.some(user => user._id === currentUser._id)
        );
        
        displayTasks(userTasks);
    } catch (error) {
        console.error('Error loading tasks:', error);
        tasksList.innerHTML = '<div class="alert alert-danger">Error loading tasks</div>';
    }
}

// Display tasks
function displayTasks(tasks) {
    if (!tasks || tasks.length === 0) {
        tasksList.innerHTML = `
            <div class="text-center text-muted p-4">
                No tasks assigned to you in this project.
            </div>
        `;
        return;
    }

    tasksList.innerHTML = tasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}">
            <div class="task-title">
                <h6 class="mb-0">${task.title}</h6>
                <button onclick="toggleTaskComplete('${task._id}', ${!task.completed})" 
                        class="btn btn-sm ${task.completed ? 'btn-secondary' : 'btn-success'}">
                    ${task.completed ? 'Mark Incomplete' : 'Mark Complete'}
                </button>
            </div>
            <p class="mb-2">${task.description}</p>
            ${task.completed ? `
                <small class="text-success">
                    Completed on ${new Date(task.completedAt).toLocaleDateString()}
                </small>
            ` : ''}
        </div>
    `).join('');
}

// Toggle task complete status
async function toggleTaskComplete(taskId, completed) {
    try {
        const response = await fetch(`${window.appConfig.apiUrl}/api/tasks/${taskId}/toggle-complete`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to update task');
        }

        // Reload tasks to show updated status
        loadProjectTasks();
    } catch (error) {
        console.error('Error updating task:', error);
        alert('Error updating task status. Please try again.');
    }
}

// Load initial data
loadProjectDetails();

// Make toggleTaskComplete available globally
window.toggleTaskComplete = toggleTaskComplete;
