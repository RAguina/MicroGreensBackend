import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  refreshToken,
  updateProfile,
  changePassword,
  generateCSRFToken
} from '../controllers/authControllers.js';
import {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword
} from '../middleware/authValidation.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validateCSRFToken } from '../middleware/csrfProtection.js';

const router = express.Router();

// Endpoint para obtener CSRF token (sin protección CSRF)
router.get('/csrf', generateCSRFToken);

// Rutas públicas con CSRF protection
router.post('/register', validateCSRFToken, validateRegister, register);
router.post('/login', validateCSRFToken, validateLogin, login);
router.post('/logout', validateCSRFToken, logout);
router.post('/refresh', validateCSRFToken, refreshToken);

// Rutas protegidas (requieren autenticación)
router.get('/me', authMiddleware, getMe);
router.put('/profile', validateCSRFToken, authMiddleware, validateUpdateProfile, updateProfile);
router.put('/password', validateCSRFToken, authMiddleware, validateChangePassword, changePassword);

export default router;