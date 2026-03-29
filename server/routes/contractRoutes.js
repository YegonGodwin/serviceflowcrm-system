import express from 'express';
import { 
    createContract, 
    getContracts,
    getContractById,
    updateContract,
    signContract
} from '../controllers/contractController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, authorize('admin'), createContract);
router.get('/', protect, getContracts);
router.get('/:id', protect, getContractById);

// Move the specific one to the top
router.put('/:id/sign', protect, authorize('client'), signContract);
router.put('/:id', protect, authorize('admin'), updateContract);

export default router;
