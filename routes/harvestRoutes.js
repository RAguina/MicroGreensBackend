import express from 'express';
import { 
  getHarvests, 
  getHarvestsByPlanting,
  getHarvestById, 
  createHarvest, 
  updateHarvest, 
  deleteHarvest 
} from '../controllers/harvestControllers.js';
import { optionalAuth, requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (or with optional auth)
router.get('/', optionalAuth, getHarvests);
router.get('/planting/:plantingId', optionalAuth, getHarvestsByPlanting);
router.get('/:id', optionalAuth, getHarvestById);

// Protected routes (Auth required for CUD operations)
router.post('/', requireAuth, createHarvest);
router.put('/:id', requireAuth, updateHarvest);
router.delete('/:id', requireAuth, deleteHarvest);

export default router;