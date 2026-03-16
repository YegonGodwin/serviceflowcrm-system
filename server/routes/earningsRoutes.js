import express from 'express';
import { getEarnings, initiatePayout, payoutCallback } from '../controllers/earningsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
    .get(protect, authorize('admin', 'employee'), getEarnings);

router.route('/:id/payout')
    .post(protect, authorize('admin'), initiatePayout);

router.route('/payout-callback')
    .post(payoutCallback);

export default router;
