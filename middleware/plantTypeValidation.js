import { body, param, query } from 'express-validator';

// Validación para crear PlantType
export const validateCreatePlantType = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre de la planta es requerido')
    .isLength({ min: 1, max: 100 })
    .withMessage('El nombre debe tener entre 1 y 100 caracteres'),

  body('scientificName')
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage('El nombre científico no puede exceder 150 caracteres'),

  body('category')
    .optional()
    .trim()
    .isIn(['Microgreens', 'Herbs', 'Leafy Greens', 'Sprouts', 'Other'])
    .withMessage('Categoría debe ser: Microgreens, Herbs, Leafy Greens, Sprouts o Other'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres'),

  body('daysToGerminate')
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage('Días para germinar debe ser un número entre 1 y 30'),

  body('daysToHarvest')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Días para cosechar debe ser un número entre 1 y 365'),

  body('optimalTemp')
    .optional()
    .isFloat({ min: -5, max: 50 })
    .withMessage('Temperatura óptima debe estar entre -5°C y 50°C'),

  body('optimalHumidity')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Humedad óptima debe estar entre 0% y 100%'),

  body('lightRequirement')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Requerimiento de luz debe ser: Low, Medium o High'),

  body('averageYield')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Rendimiento promedio debe ser un número positivo'),

  body('marketPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Precio de mercado debe ser un número positivo'),

  body('difficulty')
    .optional()
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Dificultad debe ser: Easy, Medium o Hard')
];

// Validación para actualizar PlantType
export const validateUpdatePlantType = [
  param('id')
    .isUUID()
    .withMessage('ID debe ser un UUID válido'),

  // Mismas validaciones que create pero todas opcionales
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El nombre de la planta no puede estar vacío')
    .isLength({ min: 1, max: 100 })
    .withMessage('El nombre debe tener entre 1 y 100 caracteres'),

  body('scientificName')
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage('El nombre científico no puede exceder 150 caracteres'),

  body('category')
    .optional()
    .trim()
    .isIn(['Microgreens', 'Herbs', 'Leafy Greens', 'Sprouts', 'Other'])
    .withMessage('Categoría debe ser: Microgreens, Herbs, Leafy Greens, Sprouts o Other'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres'),

  body('daysToGerminate')
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage('Días para germinar debe ser un número entre 1 y 30'),

  body('daysToHarvest')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Días para cosechar debe ser un número entre 1 y 365'),

  body('optimalTemp')
    .optional()
    .isFloat({ min: -5, max: 50 })
    .withMessage('Temperatura óptima debe estar entre -5°C y 50°C'),

  body('optimalHumidity')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Humedad óptima debe estar entre 0% y 100%'),

  body('lightRequirement')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Requerimiento de luz debe ser: Low, Medium o High'),

  body('averageYield')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Rendimiento promedio debe ser un número positivo'),

  body('marketPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Precio de mercado debe ser un número positivo'),

  body('difficulty')
    .optional()
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Dificultad debe ser: Easy, Medium o Hard')
];

// Validación para ID de parámetro
export const validatePlantTypeId = [
  param('id')
    .isUUID()
    .withMessage('ID debe ser un UUID válido')
];

// Validación para query parameters
export const validatePlantTypeQuery = [
  query('category')
    .optional()
    .isIn(['Microgreens', 'Herbs', 'Leafy Greens', 'Sprouts', 'Other'])
    .withMessage('Categoría debe ser: Microgreens, Herbs, Leafy Greens, Sprouts o Other'),

  query('difficulty')
    .optional()
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Dificultad debe ser: Easy, Medium o Hard')
];