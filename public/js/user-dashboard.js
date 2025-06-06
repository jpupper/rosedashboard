// Check authentication
const token = localStorage.getItem('token');
const userId = localStorage.getItem('userId');
const isAdmin = localStorage.getItem('isAdmin') === 'true';

// Redirect if not authenticated or if admin
if (!token || !userId || isAdmin) {
    window.location.href = '/';
}

// Logout function
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userId');
    window.location.href = '/';
});

// Load user's projects
async function loadUserProjects() {
    try {
        // Fetch only the projects assigned to the current user
        const response = await fetch('/api/projects/assigned', {
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
                        <span class="field-label">Team:</span>
                        <span class="field-value">${project.assignedUsers?.map(user => user.name).join(', ') || 'No team members'}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Load initial data
loadUserProjects();
