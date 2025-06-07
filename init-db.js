const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('./config');

// Modelo de Usuario
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    role: { type: String },
    bio: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function initializeDatabase() {
    try {
        // Conectar a MongoDB
        await mongoose.connect(config.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Verificar si ya existe un usuario admin
        const adminExists = await User.findOne({ username: config.ADMIN_CREDENTIALS.username });
        
        if (!adminExists) {
            // Crear usuario admin
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
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

initializeDatabase();
