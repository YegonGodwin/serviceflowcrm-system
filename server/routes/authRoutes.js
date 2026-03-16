import express from 'express';
import { registerUser, loginUser, getUserProfile, getUsers, updateUserProfile } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);
router.get('/users', protect, authorize('admin'), getUsers);

export default router;