const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    accountValue: {
        type: Number,
        required: true
    },
    assignedMembers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    clientContact: {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            trim: true
        },
        phone: {
            type: String,
            trim: true
        }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Client', clientSchema);
