import express from 'express';
import { 
    createServiceRequest, 
    getServiceRequests, 
    getServiceRequestById, 
    updateServiceRequestStatus 
} from '../controllers/serviceRequestController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
    .post(protect, authorize('client'), createServiceRequest)
    .get(protect, getServiceRequests);

router.route('/:id')
    .get(protect, getServiceRequestById)
    .put(protect, authorize('admin', 'employee'), updateServiceRequestStatus);

export default router;