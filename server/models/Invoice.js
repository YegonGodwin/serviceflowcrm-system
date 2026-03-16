import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    serviceRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceRequest',
        default: null,
    },
    contract: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contract',
        default: null,
    },
    invoiceNumber: {
        type: String,
        required: true,
        unique: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['paid', 'unpaid', 'partially-paid', 'cancelled'],
        default: 'unpaid',
    },
    dueDate: {
        type: Date,
        required: true,
    },
    paymentDate: {
        type: Date,
        default: null,
    },
    paymentMethod: {
        type: String,
        enum: ['bank-transfer', 'cash', 'mpesa', 'other'],
        default: 'mpesa',
    },
    mpesaCheckoutRequestID: {
        type: String,
        default: null,
    },
    mpesaReceiptNumber: {
        type: String,
        default: null,
    },
}, {
    timestamps: true,
});

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;