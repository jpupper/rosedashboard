// Create and inject admin menu
function createAdminMenu() {
    const menuHtml = `
        <nav class="navbar navbar-expand-lg navbar-dark">
            <div class="container-fluid">
                <a class="navbar-brand" href="${getPath('/')}">Rose Dashboard</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto">
                        <li class="nav-item">
                            <a class="nav-link" href="${window.appConfig.apiUrl}/profile.html">Profile</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="${window.appConfig.apiUrl}/admin/dashboard.html">Dashboard</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="${window.appConfig.apiUrl}/admin/users.html">Users</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="${window.appConfig.apiUrl}/admin/projects.html">Projects</a>
                        </li>
                    </ul>
                    <button class="btn btn-light" id="logoutBtn">Logout</button>
                </div>
            </div>
        </nav>
    `;

    // Insert menu at the start of body
    document.body.insertAdjacentHTML('afterbegin', menuHtml);

    // Set active menu item based on current page
    const currentUrl = window.location.href;
    document.querySelectorAll('.nav-link').forEach(link => {
        if (currentUrl === link.getAttribute('href')) {
            link.classList.add('active');
        }
    });

    // Add logout handler
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('userId');
        window.location.href = window.appConfig.apiUrl + '/';
    });
}

// Only create admin menu if user is admin
if (localStorage.getItem('isAdmin') === 'true') {
    createAdminMenu();
}
