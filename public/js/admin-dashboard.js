// Check authentication
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = getPath('/');
}

// Load recent users, projects and clients
async function loadDashboardData() {
    try {
        // Load recent users
        const usersResponse = await fetch(`${window.appConfig.apiUrl}/api/users`, {
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
        const projectsResponse = await fetch(`${window.appConfig.apiUrl}/api/projects`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!projectsResponse.ok) {
            throw new Error('Failed to load projects');
        }

        const projects = await projectsResponse.json();
        displayRecentProjects(projects.slice(0, 5)); // Show last 5 projects

        // Load recent clients
        const clientsResponse = await fetch(`${window.appConfig.apiUrl}/api/clients`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!clientsResponse.ok) {
            throw new Error('Failed to load clients');
        }

        const clients = await clientsResponse.json();
        displayRecentClients(clients.slice(0, 5)); // Show last 5 clients
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

function displayRecentClients(clients) {
    const recentClientsDiv = document.getElementById('recentClients');
    recentClientsDiv.innerHTML = clients.map(client => `
        <div class="dashboard-item">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6>${client.name}</h6>
                    <small class="text-muted">${client.location}</small>
                </div>
                <div>
                    <span class="badge bg-success">$${client.accountValue.toLocaleString()}</span>
                </div>
            </div>
            <small class="text-muted d-block mt-1">
                ${client.assignedMembers.map(member => member.name).join(', ') || 'No members assigned'}
            </small>
        </div>
    `).join('') || '<p class="text-muted">No clients found</p>';
}

// Load initial data
loadDashboardData();
