import express from 'express';
import { 
  getPlantTypes, 
  getPlantTypeById, 
  createPlantType, 
  updatePlantType, 
  deletePlantType 
} from '../controllers/plantTypeControllers.js';
import { optionalAuth, requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (or with optional auth)
router.get('/', optionalAuth, getPlantTypes);
router.get('/:id', optionalAuth, getPlantTypeById);

// Protected routes (Admin only)
router.post('/', requireAuth, requireAdmin, createPlantType);
router.put('/:id', requireAuth, requireAdmin, updatePlantType);
router.delete('/:id', requireAuth, requireAdmin, deletePlantType);

export default router;