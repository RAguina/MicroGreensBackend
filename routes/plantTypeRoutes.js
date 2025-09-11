import express from 'express';
import { 
  getPlantTypes, 
  getPlantTypeById, 
  createPlantType, 
  updatePlantType, 
  deletePlantType 
} from '../controllers/plantTypeControllers.js';
import { optionalAuth, requireAuth, requireAdmin } from '../middleware/authMiddleware.js';
import { 
  validateCreatePlantType,
  validateUpdatePlantType,
  validatePlantTypeId,
  validatePlantTypeQuery
} from '../middleware/plantTypeValidation.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Public routes (or with optional auth)
router.get('/', optionalAuth, validatePlantTypeQuery, handleValidationErrors, getPlantTypes);
router.get('/:id', optionalAuth, validatePlantTypeId, handleValidationErrors, getPlantTypeById);

// Protected routes (Admin only for now, can be opened to GROWER later)
router.post('/', requireAuth, requireAdmin, validateCreatePlantType, handleValidationErrors, createPlantType);
router.put('/:id', requireAuth, requireAdmin, validateUpdatePlantType, handleValidationErrors, updatePlantType);
router.delete('/:id', requireAuth, requireAdmin, validatePlantTypeId, handleValidationErrors, deletePlantType);

export default router;