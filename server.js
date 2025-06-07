const express = require('express');
const app = express();
const http = require('http').createServer(app);
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const config = require('./config');

// Import models
const User = require('./models/User');
require('./models/Project');
require('./models/Task');

const PORT = process.env.PORT || 3343;

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const clientRoutes = require('./routes/clients');
const taskRoutes = require('./routes/tasks');
// Función para inicializar la base de datos
async function initializeDatabase() {
    try {
        // Verificar si ya existe un usuario admin
        const adminExists = await User.findOne({ username: config.ADMIN_CREDENTIALS.username });
        
        if (!adminExists) {
            // Crear usuario admin
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash(config.ADMIN_CREDENTIALS.password, 10);
            
            const adminUser = new User({
                name: 'Administrator',
                username: config.ADMIN_CREDENTIALS.username,
                password: hashedPassword,
                isAdmin: true,
                role: 'admin'
            });

            await adminUser.save();
            console.log('Admin user created successfully');
        } else {
            console.log('Admin user already exists');
        }
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}


// Middlewares
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Servir archivos estáticos con prefijo /rose
app.use('/rose', express.static(path.join(__dirname, 'public')));

// Rutas de exportación sin autenticación
app.get('/rose/api/export/projects', async (req, res) => {
    try {
        const Project = mongoose.model('Project');
        const projects = await Project.find()
            .populate('client')
            .populate('assignedUsers', '-password')
            .populate({
                path: 'tasks',
                populate: {
                    path: 'assignedUsers',
                    select: '-password'
                }
            });

        res.json({
            success: true,
            timestamp: new Date(),
            projects: projects
        });
    } catch (error) {
        console.error('Error exporting projects:', error);
        res.status(500).json({ success: false, message: 'Error exporting projects' });
    }
});

app.get('/rose/api/export/clients', async (req, res) => {
    try {
        const Client = mongoose.model('Client');
        const clients = await Client.find()
            .populate({
                path: 'projects',
                populate: [
                    { path: 'assignedUsers', select: '-password' },
                    { path: 'tasks' }
                ]
            });

        res.json({
            success: true,
            timestamp: new Date(),
            clients: clients
        });
    } catch (error) {
        console.error('Error exporting clients:', error);
        res.status(500).json({ success: false, message: 'Error exporting clients' });
    }
});

app.get('/rose/api/export/users', async (req, res) => {
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

// Use routes con prefijo /rose
app.use('/rose/api/auth', authRoutes);
app.use('/rose/api/users', userRoutes);
app.use('/rose/api/projects', projectRoutes);
app.use('/rose/api/clients', clientRoutes);
app.use('/rose/api/tasks', taskRoutes);

// Ruta principal para /rose
app.get('/rose', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Database connection
mongoose.connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));



// Función para iniciar el servidor
async function startServer() {
    try {
        // Conectar a la base de datos
        await mongoose.connect(config.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Iniciar el servidor HTTP
        http.listen(PORT, () => {
            console.log(`Servidor escuchando en el puerto ${PORT}`);
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
    }
}

startServer();
