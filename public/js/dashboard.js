// Check if user is authenticated
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/';
}

// Logout function
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/';
});

// Load projects
async function loadProjects() {
    try {
        const response = await fetch('/api/projects/user', {
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
    const projectsList = document.getElementById('projectsList');
    projectsList.innerHTML = projects.map(project => `
        <div class="card mb-2">
            <div class="card-body">
                <h6 class="card-title">${project.name}</h6>
                <p class="card-text">${project.description}</p>
            </div>
        </div>
    `).join('');
}

// Load initial data
loadProjects();
