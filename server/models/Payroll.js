import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    month: {
        type: Number,
        required: true, // 1-12
    },
    year: {
        type: Number,
        required: true,
    },
    earnings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Earnings',
    }],
    totalAmount: {
        type: Number,
        required: true,
        default: 0,
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'paid', 'failed'],
        default: 'pending',
    },
    payoutDate: {
        type: Date,
        default: null,
    },
    payoutReceiptNumber: {
        type: String,
        default: null, // M-Pesa Transaction ID
    },
    remarks: {
        type: String,
        default: '',
    }
}, {
    timestamps: true,
});

// Compound index to ensure one payroll per employee per month
payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

const Payroll = mongoose.model('Payroll', payrollSchema);
export default Payroll;
