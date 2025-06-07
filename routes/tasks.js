const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
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

// Obtener todas las tareas de un proyecto
router.get('/project/:projectId', authMiddleware, async (req, res) => {
    try {
        const tasks = await Task.find({ project: req.params.projectId })
            .populate('assignedUsers', 'name username')
            .populate('project', 'name');
            
        res.json(tasks);
    } catch (error) {
        console.error('Error getting tasks:', error);
        res.status(500).json({ message: 'Error al obtener tareas' });
    }
});

// Obtener tareas asignadas al usuario actual
router.get('/assigned', authMiddleware, async (req, res) => {
    try {
        const tasks = await Task.find({ assignedUsers: req.user.id })
            .populate('assignedUsers', 'name username')
            .populate('project', 'name');
            
        res.json(tasks);
    } catch (error) {
        console.error('Error getting assigned tasks:', error);
        res.status(500).json({ message: 'Error al obtener tareas asignadas' });
    }
});

// Crear nueva tarea (solo admin)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { title, description, projectId, assignedUsers } = req.body;

        // Verificar que el proyecto existe
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }

        const task = new Task({
            title,
            description,
            project: projectId,
            assignedUsers: assignedUsers || [],
            createdBy: req.user.isAdmin ? 'admin' : req.user.id
        });

        await task.save();
        await task.populate('assignedUsers', 'name username');
        
        res.status(201).json(task);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'Error al crear tarea' });
    }
});

// Marcar tarea como completada/no completada
router.put('/:id/toggle-complete', authMiddleware, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }

        // Verificar que el usuario está asignado a la tarea
        if (!task.assignedUsers.includes(req.user.id) && !req.user.isAdmin) {
            return res.status(403).json({ message: 'No estás asignado a esta tarea' });
        }

        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date() : null;
        
        await task.save();
        await task.populate('assignedUsers', 'name username');
        
        res.json(task);
    } catch (error) {
        console.error('Error toggling task:', error);
        res.status(500).json({ message: 'Error al actualizar tarea' });
    }
});

// Actualizar tarea (solo admin)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }

        const { title, description, assignedUsers } = req.body;
        if (title) task.title = title;
        if (description) task.description = description;
        if (assignedUsers) task.assignedUsers = assignedUsers;

        await task.save();
        await task.populate('assignedUsers', 'name username');
        
        res.json(task);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Error al actualizar tarea' });
    }
});

// Eliminar tarea (solo admin)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }

        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: 'Tarea eliminada correctamente' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Error al eliminar tarea' });
    }
});

module.exports = router;
