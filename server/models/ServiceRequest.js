import mongoose from 'mongoose';

const serviceRequestSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'assigned', 'in-progress', 'completed', 'cancelled'],
        default: 'pending',
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    scheduledDate: {
        type: Date,
        default: null,
    },
    completionDate: {
        type: Date,
        default: null,
    },
    cost: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

const ServiceRequest = mongoose.model('ServiceRequest', serviceRequestSchema);
export default ServiceRequest;