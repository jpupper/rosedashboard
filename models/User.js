const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    bio: { type: String, default: '' },
    role: { type: String, default: '' },
    isAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    assignedProjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }],
    socialMedia: {
        whatsapp: { type: String, default: '' },
        telegram: { type: String, default: '' },
        email: { type: String, default: '' },
        slackUser: { type: String, default: '' },
        instagram: { type: String, default: '' }
    }
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
