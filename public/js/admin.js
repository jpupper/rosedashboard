// Check if user is authenticated and is admin
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/';
}

// Logout function
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/';
});

// Load users and projects
async function loadData() {
    try {
        // Load users
        const usersResponse = await fetch('/api/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const users = await usersResponse.json();
        displayUsers(users);

        // Load projects
        const projectsResponse = await fetch('/api/projects', {
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
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = users.map(user => `
        <div class="card mb-2">
            <div class="card-body">
                <h6 class="card-title">${user.name}</h6>
                <p class="card-text">Username: ${user.username}</p>
                <p class="card-text">Role: ${user.isAdmin ? 'Admin' : 'User'}</p>
            </div>
        </div>
    `).join('');
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
loadData();
