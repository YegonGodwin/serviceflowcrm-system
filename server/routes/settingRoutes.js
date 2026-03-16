import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
    .get(protect, getSettings)
    .put(protect, authorize('admin'), updateSettings);

export default router;