import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
    companyName: {
        type: String,
        default: 'ServiceFlow Solutions',
    },
    companyEmail: {
        type: String,
        default: 'info@serviceflow.co.ke',
    },
    companyPhone: {
        type: String,
        default: '+254 795 411 930',
    },
    companyAddress: {
        type: String,
        default: 'Kimathi St, Nairobi, Kenya',
    },
    companyWebsite: {
        type: String,
        default: 'https://serviceflow.co.ke',
    },
    departments: {
        type: [String],
        default: ['Computer Repair', 'Sales', 'Software'],
    },
}, {
    timestamps: true,
});

const Setting = mongoose.model('Setting', settingSchema);
export default Setting;