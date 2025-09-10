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

const router = express.Router();

router.post('/plantings', validateCreatePlanting, createPlanting);        // Crear un nuevo registro de siembra
router.get('/plantings', validateQueryParams, getPlantings);              // Obtener todos los registros de siembra
router.get('/plantings/:id', validateIdParam, getPlantingById);           // Obtener un registro específico
router.put('/plantings/:id', validateUpdatePlanting, updatePlanting);     // Actualizar un registro de siembra
router.delete('/plantings/:id', validateIdParam, deletePlanting);         // Eliminar un registro de siembra

export default router;
