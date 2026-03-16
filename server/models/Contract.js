import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'cancelled', 'pending'],
        default: 'pending',
    },
    terms: {
        type: String,
        default: '',
    },
    paymentFrequency: {
        type: String,
        enum: ['monthly', 'quarterly', 'yearly', 'one-time'],
        default: 'monthly',
    },
    signedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

const Contract = mongoose.model('Contract', contractSchema);
export default Contract;