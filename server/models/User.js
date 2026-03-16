import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'client', 'employee'],
        default: 'client',
    },
    avatar: {
        type: String,
        default: '',
    },
    phone: {
        type: String,
        default: '',
    },
    address: {
        type: String,
        default: '',
    },
    // Specific fields for Client
    companyName: {
        type: String,
        default: '',
    },
    // Specific fields for Employee
    position: {
        type: String,
        default: '',
    },
    department: {
        type: String,
        default: '',
    },
    salary: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);
export default User;