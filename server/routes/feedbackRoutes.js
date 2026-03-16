import express from 'express';
import { 
    createFeedback, 
    getFeedbacks 
} from '../controllers/feedbackController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
    .post(protect, authorize('client'), createFeedback)
    .get(protect, getFeedbacks);

export default router;