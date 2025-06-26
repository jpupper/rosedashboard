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

// Load user's projects
async function loadUserProjects() {
    try {
        // Fetch only the projects assigned to the current user
        const response = await fetch(`${window.appConfig.apiUrl}/api/projects/assigned`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load projects');
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Error loading projects');
        }
        
        // Display the projects
        displayProjects(data.projects || []);
    } catch (error) {
        console.error('Error loading projects:', error);
        const projectsList = document.getElementById('userProjects');
        projectsList.innerHTML = `
            <div class="alert alert-danger" role="alert">
                Error loading projects. Please try again later.
            </div>
        `;
    }
}

function displayProjects(projects) {
    const projectsList = document.getElementById('userProjects');
    if (projects.length === 0) {
        projectsList.innerHTML = `
            <div class="text-center text-muted p-4">
                No projects assigned yet.
            </div>
        `;
        return;
    }

    projectsList.innerHTML = projects.map(project => `
        <div class="dashboard-item">
            <div class="d-flex flex-column">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="mb-0">
                        <a href="${window.appConfig.frontendUrl}/user/project-details.html?id=${project._id}" class="text-decoration-none">
                            ${project.name}
                        </a>
                    </h6>
                    <small class="text-muted">${new Date(project.createdAt).toLocaleDateString()}</small>
                </div>
                <div class="dashboard-fields">
                    <div class="field-row">
                        <span class="field-label">Description:</span>
                        <span class="field-value">${project.description || 'No description'}</span>
                    </div>
                    <div class="field-row">
                        <span class="field-label">State:</span>
                        <span class="field-value">${project.state}</span>
                    </div>
                    <div class="field-row">
                        <span class="field-label">Team:</span>
                        <span class="field-value">${project.assignedUsers?.map(user => user.name).join(', ') || 'No team members'}</span>
                    </div>
                    <div class="mt-2">
                        <a href="${window.appConfig.frontendUrl}/user/project-details.html?id=${project._id}" class="btn btn-sm btn-primary">
                            View Details & Tasks
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Load initial data
loadUserProjects();
