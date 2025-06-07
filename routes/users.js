const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config');

// Middleware para verificar el token
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            throw new Error('No token provided');
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);
        
        if (!decoded || !decoded.id) {
            throw new Error('Invalid token');
        }

        const user = await User.findById(decoded.id);

        if (!user) {
            throw new Error('User not found');
        }

        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth error:', error.message);
        res.status(401).json({
            success: false,
            message: 'Please authenticate'
        });
    }
};

// Middleware para verificar si es admin
const adminMiddleware = (req, res, next) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Acceso denegado' });
    }
    next();
};

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: user
        });
    } catch (error) {
        console.error('Error getting user profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting user profile'
        });
    }
});

// Update current user profile
router.put('/me', authMiddleware, async (req, res) => {
    try {
        const { name, username, password, role, bio, socialMedia } = req.body;
        const userId = req.user.id;

        // Check if username is taken by another user
        if (username) {
            const existingUser = await User.findOne({ username, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Username already taken'
                });
            }
        }

        // Build update object
        const updateData = {};
        if (name) updateData.name = name;
        if (username) updateData.username = username;
        if (bio !== undefined) updateData.bio = bio;
        if (role !== undefined) updateData.role = role;
        if (socialMedia !== undefined) updateData.socialMedia = socialMedia;

        // Handle password update
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: user
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user profile'
        });
    }
});

// Obtener todos los usuarios (solo admin)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios' });
    }
});

// Crear nuevo usuario (solo admin)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { username, password, name, bio, isAdmin, socialMedia } = req.body;

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Crear nuevo usuario
        const user = new User({
            username,
            password,
            name,
            bio,
            isAdmin: isAdmin || false,
            socialMedia: socialMedia || {}
        });

        await user.save();
        
        // Enviar respuesta sin la contraseña
        const userResponse = user.toObject();
        delete userResponse.password;
        
        res.status(201).json(userResponse);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error al crear usuario' });
    }
});

// Obtener un usuario específico
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuario' });
    }
});

// Actualizar usuario
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { username, name, bio, isAdmin, socialMedia } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Actualizar campos
        if (username) user.username = username;
        if (name) user.name = name;
        if (bio !== undefined) user.bio = bio;
        if (isAdmin !== undefined) user.isAdmin = isAdmin;
        if (socialMedia !== undefined) user.socialMedia = socialMedia;

        await user.save();
        
        const userResponse = user.toObject();
        delete userResponse.password;
        
        res.json(userResponse);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar usuario' });
    }
});

// Eliminar usuario
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar usuario' });
    }
});

// Export all users
router.get('/export', async (req, res) => {
    try {

        const users = await User.find()
            .select('-password')
            .populate({
                path: 'assignedProjects',
                populate: [
                    { path: 'client' },
                    { path: 'tasks' }
                ]
            });

        res.json({
            success: true,
            timestamp: new Date(),
            users: users
        });
    } catch (error) {
        console.error('Error exporting users:', error);
        res.status(500).json({ success: false, message: 'Error exporting users' });
    }
});

module.exports = router;
