// Check authentication
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/';
}

// Load recent users and projects
async function loadDashboardData() {
    try {
        // Load recent users
        const usersResponse = await fetch('/api/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!usersResponse.ok) {
            throw new Error('Failed to load users');
        }

        const users = await usersResponse.json();
        displayRecentUsers(users.slice(0, 5)); // Show last 5 users

        // Load recent projects
        const projectsResponse = await fetch('/api/projects', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!projectsResponse.ok) {
            throw new Error('Failed to load projects');
        }

        const projects = await projectsResponse.json();
        displayRecentProjects(projects.slice(0, 5)); // Show last 5 projects
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

function displayRecentUsers(users) {
    const recentUsersDiv = document.getElementById('recentUsers');
    recentUsersDiv.innerHTML = users.map(user => `
        <div class="dashboard-item">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6>${user.name}</h6>
                    <small class="text-muted">@${user.username}</small>
                </div>
                <div>
                    <span class="badge ${user.isAdmin ? 'bg-dark' : 'bg-secondary'}">
                        ${user.isAdmin ? 'Administrator' : 'User'}
                    </span>
                </div>
            </div>
            <small class="text-muted d-block mt-1">${user.role || 'No role specified'}</small>
        </div>
    `).join('') || '<p class="text-muted">No users found</p>';
}

function displayRecentProjects(projects) {
    const recentProjectsDiv = document.getElementById('recentProjects');
    recentProjectsDiv.innerHTML = projects.map(project => `
        <div class="dashboard-item">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6>${project.name}</h6>
                    <small class="text-muted">${project.description || 'No description'}</small>
                </div>
                <div>
                    <span class="badge bg-primary">${project.status || 'Active'}</span>
                </div>
            </div>
            <small class="text-muted d-block mt-1">
                ${project.assignedUsers?.length || 0} users assigned
            </small>
        </div>
    `).join('') || '<p class="text-muted">No projects found</p>';
}

// Load initial data
loadDashboardData();
