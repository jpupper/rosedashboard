const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if it's the admin user
        if (username === config.ADMIN_CREDENTIALS.username && 
            password === config.ADMIN_CREDENTIALS.password) {
            const token = jwt.sign(
                { id: 'admin', isAdmin: true },
                config.JWT_SECRET,
                { expiresIn: '24h' }
            );
            return res.json({ token, user: { username, isAdmin: true } });
        }

        // Check regular user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }

        const token = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            config.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, user: { username: user.username, isAdmin: user.isAdmin } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

module.exports = router;
