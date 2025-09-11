import { body, param, query, validationResult } from 'express-validator';

// Middleware para manejar errores de validación
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Validaciones para crear siembra (modelo híbrido)
export const validateCreatePlanting = [
  // Validación custom: plantTypeId OR plantName debe estar presente
  body()
    .custom((value, { req }) => {
      const { plantTypeId, plantName } = req.body;
      if (!plantTypeId && !plantName) {
        throw new Error('Se debe proporcionar plantTypeId o plantName');
      }
      return true;
    }),

  body('plantTypeId')
    .optional()
    .isLength({ min: 20, max: 30 })
    .matches(/^[a-z0-9]+$/)
    .withMessage('plantTypeId debe ser un ID válido'),

  body('plantName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('El nombre debe tener entre 1 y 100 caracteres')
    .trim(),

  body('datePlanted')
    .notEmpty()
    .withMessage('La fecha de plantación es requerida')
    .isISO8601()
    .withMessage('La fecha debe tener formato válido (YYYY-MM-DD)'),
    
  body('expectedHarvest')
    .optional()
    .isISO8601()
    .withMessage('La fecha de cosecha debe tener formato válido (YYYY-MM-DD)'),
    
  body('domeDate')
    .optional()
    .isISO8601()
    .withMessage('La fecha del domo debe tener formato válido (YYYY-MM-DD)'),
    
  body('lightDate')
    .optional()
    .isISO8601()
    .withMessage('La fecha de luz debe tener formato válido (YYYY-MM-DD)'),
    
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La cantidad debe ser un número entero mayor a 0'),
    
  body('yield')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El rendimiento debe ser un número mayor o igual a 0'),
    
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Las notas no pueden exceder los 1000 caracteres')
    .trim(),

  // Nuevos campos del modelo híbrido
  body('status')
    .optional()
    .isIn(['PLANTED', 'GERMINATING', 'GROWING', 'READY_TO_HARVEST', 'HARVESTED', 'FAILED'])
    .withMessage('Status debe ser: PLANTED, GERMINATING, GROWING, READY_TO_HARVEST, HARVESTED o FAILED'),

  body('trayNumber')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('El número de bandeja debe tener entre 1 y 50 caracteres')
    .trim(),
    
  handleValidationErrors
];

// Validaciones para actualizar siembra
export const validateUpdatePlanting = [
  param('id')
    .isLength({ min: 20, max: 30 })
    .matches(/^[a-z0-9]+$/)
    .withMessage('El ID debe ser válido'),

  body('plantTypeId')
    .optional()
    .isLength({ min: 20, max: 30 })
    .matches(/^[a-z0-9]+$/)
    .withMessage('plantTypeId debe ser un ID válido'),
    
  body('plantName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('El nombre debe tener entre 1 y 100 caracteres')
    .trim(),
    
  body('datePlanted')
    .optional()
    .isISO8601()
    .withMessage('La fecha de plantación debe tener formato válido (YYYY-MM-DD)'),
    
  body('expectedHarvest')
    .optional()
    .isISO8601()
    .withMessage('La fecha de cosecha debe tener formato válido (YYYY-MM-DD)'),
    
  body('domeDate')
    .optional()
    .isISO8601()
    .withMessage('La fecha del domo debe tener formato válido (YYYY-MM-DD)'),
    
  body('lightDate')
    .optional()
    .isISO8601()
    .withMessage('La fecha de luz debe tener formato válido (YYYY-MM-DD)'),
    
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La cantidad debe ser un número entero mayor a 0'),
    
  body('yield')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El rendimiento debe ser un número mayor o igual a 0'),
    
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Las notas no pueden exceder los 1000 caracteres')
    .trim(),

  // Nuevos campos del modelo híbrido
  body('status')
    .optional()
    .isIn(['PLANTED', 'GERMINATING', 'GROWING', 'READY_TO_HARVEST', 'HARVESTED', 'FAILED'])
    .withMessage('Status debe ser: PLANTED, GERMINATING, GROWING, READY_TO_HARVEST, HARVESTED o FAILED'),

  body('trayNumber')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('El número de bandeja debe tener entre 1 y 50 caracteres')
    .trim(),
    
  handleValidationErrors
];

// Validaciones para obtener/eliminar por ID
export const validateIdParam = [
  param('id')
    .isLength({ min: 20, max: 30 })
    .matches(/^[a-z0-9]+$/)
    .withMessage('El ID debe ser válido'),
    
  handleValidationErrors
];

// Validaciones para query parameters
export const validateQueryParams = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entre 1 y 100'),
    
  query('plantName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('El nombre de búsqueda debe tener entre 1 y 100 caracteres')
    .trim(),

  // Nuevos filtros del modelo híbrido
  query('status')
    .optional()
    .isIn(['PLANTED', 'GERMINATING', 'GROWING', 'READY_TO_HARVEST', 'HARVESTED', 'FAILED'])
    .withMessage('Status debe ser: PLANTED, GERMINATING, GROWING, READY_TO_HARVEST, HARVESTED o FAILED'),

  query('plantTypeId')
    .optional()
    .isLength({ min: 20, max: 30 })
    .matches(/^[a-z0-9]+$/)
    .withMessage('plantTypeId debe ser un ID válido'),
    
  handleValidationErrors
];