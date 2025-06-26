// Create and inject user menu
function createUserMenu() {
    const menuHtml = `
        <nav class="navbar navbar-expand-lg navbar-dark">
            <div class="container-fluid">
                <a class="navbar-brand" href="${window.appConfig.getPath('/')}">Rose Dashboard</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto">
                        <li class="nav-item">
                            <a class="nav-link" href="${window.appConfig.frontendUrl}/profile.html">Profile</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="${window.appConfig.frontendUrl}/user/dashboard.html">My Projects</a>
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
        localStorage.removeItem('user');
        window.location.href = window.appConfig.frontendUrl + '/';
    });
}

// Create menu if user is not admin
let user;
try {
    user = JSON.parse(localStorage.getItem('user'));
    if (user && !user.isAdmin) {
        createUserMenu();
    }
} catch (error) {
    console.error('Error loading user:', error);
    window.location.href = window.appConfig.frontendUrl + '/';
}
