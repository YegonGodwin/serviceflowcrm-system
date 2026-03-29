import express from 'express';
import { 
    getEarnings, 
    initiatePayout, 
    payoutCallback, 
    generateMonthlyPayroll, 
    getPayrolls, 
    executePayroll 
} from '../controllers/earningsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
    .get(protect, authorize('admin', 'employee'), getEarnings);

// Payroll routes
router.route('/payroll')
    .get(protect, authorize('admin', 'employee'), getPayrolls)
    .post(protect, authorize('admin'), generateMonthlyPayroll);

router.route('/payroll/:id/execute')
    .post(protect, authorize('admin'), executePayroll);

router.route('/:id/payout')
    .post(protect, authorize('admin'), initiatePayout);

router.route('/payout-callback')
    .post(payoutCallback);

export default router;
