import express from 'express';
import { 
    createInvoice, 
    getInvoices, 
    updateInvoiceStatus,
    payInvoice,
    initiateMpesaPayment,
    mpesaCallback
} from '../controllers/invoiceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
    .post(protect, authorize('admin'), createInvoice)
    .get(protect, getInvoices);

router.route('/mpesa-callback')
    .post(mpesaCallback);

router.route('/:id/status')
    .put(protect, authorize('admin'), updateInvoiceStatus);

router.route('/:id/pay')
    .put(protect, authorize('client'), payInvoice);

router.route('/:id/mpesa-pay')
    .post(protect, authorize('client'), initiateMpesaPayment);

export default router;