import express from 'express';
import { 
  createPlanting, 
  getPlantings, 
  getPlantingById, 
  updatePlanting, 
  deletePlanting 
} from '../controllers/plantingControllers.js';
import {
  validateCreatePlanting,
  validateUpdatePlanting,
  validateIdParam,
  validateQueryParams
} from '../middleware/validation.js';
import { optionalAuth, authMiddleware, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Usar autenticación opcional para GET (funciona con o sin auth)
router.get('/plantings', optionalAuth, validateQueryParams, getPlantings);       
router.get('/plantings/:id', optionalAuth, validateIdParam, getPlantingById);    

// Usar autenticación opcional para POST (permite desarrollo sin auth)
router.post('/plantings', optionalAuth, validateCreatePlanting, createPlanting);

// Usar autenticación opcional para PUT/DELETE (permite desarrollo sin auth)
router.put('/plantings/:id', optionalAuth, validateUpdatePlanting, updatePlanting);
router.delete('/plantings/:id', optionalAuth, validateIdParam, deletePlanting);

// TODO: Cuando esté listo para producción, cambiar optionalAuth por authMiddleware
// router.post('/plantings', authMiddleware, validateCreatePlanting, createPlanting);
// router.put('/plantings/:id', authMiddleware, validateUpdatePlanting, updatePlanting);
// router.delete('/plantings/:id', authMiddleware, requireRole('ADMIN', 'GROWER'), validateIdParam, deletePlanting);

export default router;
