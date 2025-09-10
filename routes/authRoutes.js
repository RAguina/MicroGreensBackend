import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  refreshToken,
  updateProfile,
  changePassword
} from '../controllers/authControllers.js';
import {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword
} from '../middleware/authValidation.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas públicas
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);

// Rutas protegidas (requieren autenticación)
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, validateUpdateProfile, updateProfile);
router.put('/password', authMiddleware, validateChangePassword, changePassword);

export default router;