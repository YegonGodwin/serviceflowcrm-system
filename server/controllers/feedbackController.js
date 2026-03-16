import Feedback from '../models/Feedback.js';

export const createFeedback = async (req, res) => {
    const { serviceRequest, rating, message, isPublic } = req.body;

    const feedback = await Feedback.create({
        client: req.user._id,
        serviceRequest,
        rating,
        message,
        isPublic,
    });

    if (feedback) {
        res.status(201).json(feedback);
    } else {
        res.status(400).json({ message: 'Invalid feedback data' });
    }
};

export const getFeedbacks = async (req, res) => {
    let query = {};
    if (req.user.role === 'client') {
        query.client = req.user._id;
    } else if (req.user.role === 'admin') {
        // Admin can see all feedback
    } else {
        query.isPublic = true;
    }

    const feedbacks = await Feedback.find(query).populate('client', 'name email').populate('serviceRequest', 'title');
    res.json(feedbacks);
};