document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Store token
            localStorage.setItem('token', data.token);
            
            // Redirect based on user role
            // Store user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('isAdmin', data.user.isAdmin);
            localStorage.setItem('userId', data.user._id || data.user.id); // Handle both _id and id formats
            
            // Store user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('isAdmin', data.user.isAdmin);
            localStorage.setItem('userId', data.user._id || data.user.id); // Handle both _id and id formats
            
            // Always redirect to profile first
            window.location.href = '/profile.html';
        } else {
            alert(data.message || 'Error al iniciar sesión');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
    }
});
