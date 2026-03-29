import mongoose from 'mongoose';

const earningsSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    invoice: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice',
        required: true,
    },
    serviceRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceRequest',
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    commissionAmount: {
        type: Number,
        required: true,
    },
    commissionPercentage: {
        type: Number,
        default: 100, // Default 100%
    },
    status: {
        type: String,
        enum: ['pending', 'available', 'withdrawn'],
        default: 'pending',
    },
    payoutDate: {
        type: Date,
        default: null,
    },
    payoutReceiptNumber: {
        type: String,
        default: null,
    }
}, {
    timestamps: true,
});

const Earnings = mongoose.model('Earnings', earningsSchema);
export default Earnings;
