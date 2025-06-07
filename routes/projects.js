const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
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

// Obtener todos los proyectos (admin ve todos, usuarios ven solo los suyos)
router.get('/', authMiddleware, async (req, res) => {
    try {
        let projects;
        if (req.user.isAdmin) {
            projects = await Project.find()
                .populate(['assignedUsers', 'client']);
        } else {
            projects = await Project.find({
                $or: [
                    { createdBy: req.user.id },
                    { assignedUsers: req.user.id }
                ]
            })
            .populate('createdBy', 'name')
            .populate(['assignedUsers', 'client']);
        }

        // Formatear la respuesta para manejar proyectos creados por admin
        const formattedProjects = projects.map(project => {
            const proj = project.toObject();
            if (proj.createdBy === 'admin') {
                proj.createdBy = { name: 'Administrador' };
            }
            return proj;
        });

        res.json(formattedProjects);
    } catch (error) {
        console.error('Error getting projects:', error);
        res.status(500).json({ message: 'Error al obtener proyectos' });
    }
});

// Get projects assigned to current user
router.get('/assigned', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; // Get the authenticated user's ID
        
        const projects = await Project.find({
            'assignedUsers': userId
        }).populate('assignedUsers', 'name username');
        
        res.json({
            success: true,
            projects: projects
        });
    } catch (error) {
        console.error('Error getting assigned projects:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting assigned projects'
        });
    }
});

// Crear nuevo proyecto
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, description, client, categories, state, assignedUsers } = req.body;

        const project = new Project({
            name,
            description,
            client: client || undefined,
            categories: categories || [],
            state: state || 'kickoff',
            createdBy: req.user.isAdmin ? 'admin' : req.user.id,
            assignedUsers: assignedUsers || []
        });

        await project.save();
        await project.populate('assignedUsers', 'name username');
        
        // Formatear la respuesta
        const projectResponse = project.toObject();
        if (projectResponse.createdBy === 'admin') {
            projectResponse.createdBy = { name: 'Administrador' };
        }
        
        res.status(201).json(projectResponse);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ message: 'Error al crear proyecto' });
    }
});

// Obtener un proyecto específico
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate(['assignedUsers', 'client']);

        if (!project) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }

        // Verificar acceso
        if (!req.user.isAdmin && project.createdBy.toString() !== req.user.id && 
            !project.assignedUsers.some(user => user._id.toString() === req.user.id)) {
            return res.status(403).json({ message: 'Acceso denegado' });
        }

        // Formatear la respuesta
        const projectResponse = project.toObject();
        if (projectResponse.createdBy === 'admin') {
            projectResponse.createdBy = { name: 'Administrador' };
        }

        res.json(projectResponse);
    } catch (error) {
        console.error('Error getting project:', error);
        res.status(500).json({ message: 'Error al obtener proyecto' });
    }
});

// Actualizar proyecto
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }

        // Verificar acceso
        if (!req.user.isAdmin && project.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Acceso denegado' });
        }

        const { name, description, client, categories, state, assignedUsers } = req.body;
        if (name) project.name = name;
        if (description) project.description = description;
        if (client !== undefined) project.client = client || undefined;
        if (categories) project.categories = categories;
        if (state) project.state = state;
        if (assignedUsers) project.assignedUsers = assignedUsers;

        await project.save();
        await project.populate('assignedUsers', 'name username');
        
        // Formatear la respuesta
        const projectResponse = project.toObject();
        if (projectResponse.createdBy === 'admin') {
            projectResponse.createdBy = { name: 'Administrador' };
        }

        res.json(projectResponse);
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ message: 'Error al actualizar proyecto' });
    }
});

// Eliminar proyecto
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }

        // Verificar acceso
        if (!req.user.isAdmin && project.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Acceso denegado' });
        }

        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: 'Proyecto eliminado correctamente' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ message: 'Error al eliminar proyecto' });
    }
});

module.exports = router;
