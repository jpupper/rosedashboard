const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: false
    },
    categories: [{
        type: String,
        trim: true
    }],
    state: {
        type: String,
        enum: ['kickoff', 'milestones', 'deadline'],
        default: 'kickoff'
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
    assignedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }]
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

module.exports = mongoose.model('Project', projectSchema);
