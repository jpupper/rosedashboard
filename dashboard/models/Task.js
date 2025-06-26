const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    assignedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    completed: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.Mixed,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    }
});

module.exports = mongoose.model('Task', taskSchema);
