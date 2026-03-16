import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    serviceRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceRequest',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    message: {
        type: String,
        default: '',
    },
    isPublic: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;