// Check authentication
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = window.appConfig.apiUrl + '/';
}

// Get DOM elements
const profileForm = document.getElementById('profileForm');
const logoutBtn = document.getElementById('logoutBtn');

// Show/hide menu items based on user access
const isAdmin = localStorage.getItem('isAdmin') === 'true';
document.querySelectorAll('.admin-only').forEach(el => {
    el.style.display = isAdmin ? 'block' : 'none';
});
document.querySelectorAll('.user-only').forEach(el => {
    el.style.display = !isAdmin ? 'block' : 'none';
});

// Load user profile
async function loadProfile() {
    try {
        const response = await fetch(`${window.appConfig.apiUrl}/api/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load profile');
        }

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Error loading profile');
        }

        // Fill form with user data
        document.getElementById('name').value = data.user.name || '';
        document.getElementById('username').value = data.user.username || '';
        document.getElementById('role').value = data.user.role || 'other';
        document.getElementById('bio').value = data.user.bio || '';
        document.getElementById('access').value = data.user.isAdmin ? 'Administrator' : 'User';
        
        // Clear password fields
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    } catch (error) {
        console.error('Error:', error);
        alert('Error loading profile data');
    }
}

// Handle form submission
profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    const userData = {
        name: document.getElementById('name').value,
        username: document.getElementById('username').value,
        role: document.getElementById('role').value,
        bio: document.getElementById('bio').value
    };

    // Only include password if it's being changed
    if (newPassword) {
        userData.password = newPassword;
    }

    try {
        const response = await fetch(`${window.appConfig.apiUrl}/api/users/me`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            throw new Error('Failed to update profile');
        }

        const data = await response.json();
        
        if (data.success) {
            alert('Profile updated successfully');
        } else {
            throw new Error(data.message || 'Error updating profile');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error updating profile');
    }
});

// Logout handler
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userId');
    window.location.href = window.appConfig.apiUrl + '/';
});

// Load initial data
loadProfile();
