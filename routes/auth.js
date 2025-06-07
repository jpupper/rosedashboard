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
            // Find or create admin user in the database
            let adminUser = await User.findOne({ username: config.ADMIN_CREDENTIALS.username });
            
            if (!adminUser) {
                const bcrypt = require('bcryptjs');
                const hashedPassword = await bcrypt.hash(config.ADMIN_CREDENTIALS.password, 10);
                
                adminUser = new User({
                    username: config.ADMIN_CREDENTIALS.username,
                    password: hashedPassword,
                    name: 'Administrator',
                    isAdmin: true
                });
                await adminUser.save();
            }
            
            const token = jwt.sign(
                { id: adminUser._id, isAdmin: true },
                config.JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            return res.json({
                token,
                user: {
                    _id: adminUser._id,
                    username: adminUser.username,
                    isAdmin: true
                }
            });
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

        res.json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error del servidor' });
    }
});

module.exports = router;
