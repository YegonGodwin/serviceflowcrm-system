import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['contract_expiry', 'contract_overdue', 'system'],
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    metadata: {
        contractId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Contract'
        }
    },
    isRead: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;