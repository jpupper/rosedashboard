const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config');

// Middleware para verificar el token
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Middleware para verificar si es admin
const adminMiddleware = (req, res, next) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Acceso denegado' });
    }
    next();
};

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
        const { username, password, name, bio, isAdmin } = req.body;

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
            isAdmin: isAdmin || false
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
        const { username, name, bio, isAdmin } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Actualizar campos
        if (username) user.username = username;
        if (name) user.name = name;
        if (bio !== undefined) user.bio = bio;
        if (isAdmin !== undefined) user.isAdmin = isAdmin;

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

module.exports = router;
