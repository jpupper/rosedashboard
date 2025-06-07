const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
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

// Obtener todos los clientes (solo admin)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const clients = await Client.find()
            .populate('assignedMembers', 'name username')
            .populate('createdBy', 'name');
        res.json(clients);
    } catch (error) {
        console.error('Error getting clients:', error);
        res.status(500).json({ message: 'Error al obtener clientes' });
    }
});

// Crear nuevo cliente (solo admin)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { name, description, location, accountValue, assignedMembers, clientContact } = req.body;

        const client = new Client({
            name,
            description,
            location,
            accountValue,
            assignedMembers,
            clientContact,
            createdBy: req.user.id
        });

        await client.save();
        await client.populate('assignedMembers', 'name username');
        await client.populate('createdBy', 'name');
        
        res.status(201).json(client);
    } catch (error) {
        console.error('Error creating client:', error);
        res.status(500).json({ message: 'Error al crear cliente' });
    }
});

// Obtener un cliente específico
router.get('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const client = await Client.findById(req.params.id)
            .populate('assignedMembers', 'name username')
            .populate('createdBy', 'name');
            
        if (!client) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        res.json(client);
    } catch (error) {
        console.error('Error getting client:', error);
        res.status(500).json({ message: 'Error al obtener cliente' });
    }
});

// Actualizar cliente
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { name, description, location, accountValue, assignedMembers, clientContact } = req.body;

        const client = await Client.findById(req.params.id);
        if (!client) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        // Actualizar campos
        if (name) client.name = name;
        if (description !== undefined) client.description = description;
        if (location) client.location = location;
        if (accountValue !== undefined) client.accountValue = accountValue;
        if (assignedMembers) client.assignedMembers = assignedMembers;
        if (clientContact) client.clientContact = clientContact;

        await client.save();
        await client.populate('assignedMembers', 'name username');
        await client.populate('createdBy', 'name');
        
        res.json(client);
    } catch (error) {
        console.error('Error updating client:', error);
        res.status(500).json({ message: 'Error al actualizar cliente' });
    }
});

// Eliminar cliente
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const client = await Client.findByIdAndDelete(req.params.id);
        if (!client) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.json({ message: 'Cliente eliminado correctamente' });
    } catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({ message: 'Error al eliminar cliente' });
    }
});

module.exports = router;
