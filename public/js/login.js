document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${window.appConfig.apiUrl}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Store user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('isAdmin', data.user.isAdmin);
            localStorage.setItem('userId', data.user._id || data.user.id);
            
            // Redirect based on user type
            if (data.user.isAdmin) {
                window.location.href = '/admin/dashboard.html';
            } else {
                window.location.href = '/user/dashboard.html';
            }
        } else {
            alert(data.message || 'Error al iniciar sesión');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
    }
});
