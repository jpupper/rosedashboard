// Check if user is authenticated and is admin
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = getPath('/');
}

// Logout function
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = getPath('/');
});

// Load users and projects
async function loadData() {
    try {
        // Load users
        const usersResponse = await fetch(`${window.appConfig.apiUrl}/api/users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const users = await usersResponse.json();
        displayUsers(users);

        // Load projects
        const projectsResponse = await fetch(`${window.appConfig.apiUrl}/api/projects`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const projects = await projectsResponse.json();
        displayProjects(projects);
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function displayUsers(users) {
    const usersList = document.getElementById('recentUsers');
    usersList.innerHTML = users.map(user => `
        <div class="dashboard-item">
            <div class="d-flex flex-column">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="mb-0">${user.name}</h6>
                    <span class="badge ${user.isAdmin ? 'bg-dark' : 'bg-secondary'} rounded-pill">
                        ${user.isAdmin ? 'Admin' : 'User'}
                    </span>
                </div>
                <div class="dashboard-fields">
                    <div class="field-row">
                        <span class="field-label">Username:</span>
                        <span class="field-value">@${user.username}</span>
                    </div>
                    <div class="field-row">
                        <span class="field-label">User Type:</span>
                        <span class="field-value">${user.isAdmin ? 'Administrator' : 'Regular User'}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function displayProjects(projects) {
    const projectsList = document.getElementById('recentProjects');
    projectsList.innerHTML = projects.map(project => `
        <div class="dashboard-item">
            <div class="d-flex flex-column">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="mb-0">${project.name}</h6>
                    <small class="text-muted">${new Date(project.createdAt).toLocaleDateString()}</small>
                </div>
                <div class="dashboard-fields">
                    <div class="field-row">
                        <span class="field-label">Description:</span>
                        <span class="field-value">${project.description || 'No description'}</span>
                    </div>
                    <div class="field-row">
                        <span class="field-label">Created by:</span>
                        <span class="field-value">${project.createdBy?.name || 'Admin'}</span>
                    </div>
                    <div class="field-row">
                        <span class="field-label">Assigned Users:</span>
                        <span class="field-value">${project.assignedUsers?.map(user => user.name).join(', ') || 'No assignments'}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Load initial data
loadData();
