import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Generar JWT token
const generateToken = (userId, email, role) => {
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Generar refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Configurar cookies
const setCookies = (res, token, refreshToken) => {
  console.log('🍪 [AUTH] Setting up cookies with options:', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    environment: process.env.NODE_ENV
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  };

  console.log('🍪 [AUTH] Setting token cookie (24h expiry)...');
  res.cookie('token', token, {
    ...cookieOptions,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  });

  console.log('🍪 [AUTH] Setting refreshToken cookie (7d expiry)...');
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
  });

  console.log('✅ [AUTH] Both cookies set successfully');
};

export const register = async (req, res) => {
  try {
    console.log('📥 [FRONTEND REQUEST] Register request received:', {
      method: req.method,
      url: req.originalUrl,
      contentType: req.headers['content-type'],
      origin: req.headers.origin,
      realIP: req.ip
    });
    
    console.log('🔄 [AUTH] Register attempt:', { 
      email: req.body.email, 
      name: req.body.name,
      hasPassword: !!req.body.password,
      origin: req.headers.origin,
      userAgent: req.headers['user-agent']?.substring(0, 50) + '...'
    });

    const { email, password, name } = req.body;

    // Verificar si el usuario ya existe
    console.log('🔍 [AUTH] Checking existing user for email:', email);
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('❌ [AUTH] User already exists:', email);
      return res.status(400).json({ 
        error: 'Ya existe un usuario con este email' 
      });
    }

    // Hash de la contraseña
    console.log('🔒 [AUTH] Hashing password with bcrypt...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear usuario
    console.log('📝 [AUTH] Creating user in database...');
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    console.log('✅ [AUTH] User created successfully:', { id: user.id, email: user.email });

    // Generar tokens
    console.log('🎫 [AUTH] Generating JWT tokens...');
    const token = generateToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Establecer cookies
    console.log('🍪 [AUTH] Setting HTTP-only cookies...');
    setCookies(res, token, refreshToken);

    console.log('🎉 [AUTH] Registration completed successfully for:', email);
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user
    });
  } catch (error) {
    console.error('💥 [AUTH] Register error:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const login = async (req, res) => {
  try {
    console.log('📥 [FRONTEND REQUEST] Login request received:', {
      method: req.method,
      url: req.originalUrl,
      contentType: req.headers['content-type'],
      bodySize: JSON.stringify(req.body).length,
      hasBody: Object.keys(req.body).length > 0
    });
    
    console.log('🌐 [FRONTEND REQUEST] Headers & Origin:', {
      origin: req.headers.origin,
      referer: req.headers.referer,
      host: req.headers.host,
      forwarded: req.headers['x-forwarded-for']?.split(',')[0]?.trim(),
      realIP: req.ip
    });
    
    console.log('🔄 [AUTH] Login attempt:', { 
      email: req.body.email,
      hasPassword: !!req.body.password,
      origin: req.headers.origin,
      cookies: Object.keys(req.cookies || {}),
      userAgent: req.headers['user-agent']?.substring(0, 50) + '...'
    });

    const { email, password } = req.body;

    // Buscar usuario por email
    console.log('🔍 [AUTH] Looking for user:', email);
    const user = await prisma.user.findFirst({
      where: { 
        email,
        deletedAt: null
      }
    });

    if (!user) {
      console.log('❌ [AUTH] User not found:', email);
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    console.log('👤 [AUTH] User found:', { id: user.id, email: user.email, role: user.role });

    // Verificar contraseña
    console.log('🔒 [AUTH] Verifying password...');
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('❌ [AUTH] Invalid password for user:', email);
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    console.log('✅ [AUTH] Password verified successfully');

    // Generar tokens
    console.log('🎫 [AUTH] Generating JWT tokens...');
    const token = generateToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Establecer cookies
    console.log('🍪 [AUTH] Setting HTTP-only cookies...');
    setCookies(res, token, refreshToken);

    // Respuesta sin contraseña
    const { password: _, ...userWithoutPassword } = user;

    console.log('🎉 [AUTH] Login successful for:', email);
    res.status(200).json({
      message: 'Login exitoso',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('💥 [AUTH] Login error:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const logout = async (req, res) => {
  try {
    console.log('🚪 [AUTH] Logout attempt:', {
      userId: req.user?.userId || 'Unknown',
      origin: req.headers.origin,
      cookies: Object.keys(req.cookies || {})
    });

    // Limpiar cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    };

    console.log('🧹 [AUTH] Clearing authentication cookies...');
    res.clearCookie('token', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    console.log('✅ [AUTH] Logout successful, cookies cleared');
    res.status(200).json({
      message: 'Logout exitoso'
    });
  } catch (error) {
    console.error('💥 [AUTH] Logout error:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor'
    });
  }
};

export const getMe = async (req, res) => {
  try {
    console.log('👤 [AUTH] GetMe request:', {
      userId: req.user?.userId || 'Missing',
      origin: req.headers.origin,
      userAgent: req.headers['user-agent']?.substring(0, 50) + '...'
    });

    const userId = req.user.userId;

    console.log('🔍 [AUTH] Looking up user profile for:', userId);
    const user = await prisma.user.findFirst({
      where: { 
        id: userId,
        deletedAt: null
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            plantings: {
              where: {
                deletedAt: null
              }
            }
          }
        }
      }
    });

    if (!user) {
      console.log('❌ [AUTH] User not found in database:', userId);
      return res.status(404).json({ 
        error: 'Usuario no encontrado' 
      });
    }

    console.log('✅ [AUTH] User profile retrieved:', { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      plantingsCount: user._count.plantings
    });

    res.status(200).json({
      user: {
        ...user,
        plantingsCount: user._count.plantings
      }
    });
  } catch (error) {
    console.error('💥 [AUTH] GetMe error:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    console.log('🔄 [AUTH] Refresh token attempt:', {
      origin: req.headers.origin,
      cookies: Object.keys(req.cookies || {}),
      userAgent: req.headers['user-agent']?.substring(0, 50) + '...'
    });

    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      console.log('❌ [AUTH] No refresh token found in cookies');
      return res.status(401).json({ 
        error: 'Refresh token no encontrado' 
      });
    }

    console.log('🔍 [AUTH] Refresh token found, verifying...');
    // Verificar refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      console.log('❌ [AUTH] Token is not a refresh token:', decoded.type);
      return res.status(401).json({ 
        error: 'Token inválido' 
      });
    }

    console.log('✅ [AUTH] Refresh token verified, looking up user:', decoded.userId);
    // Buscar usuario
    const user = await prisma.user.findFirst({
      where: { 
        id: decoded.userId,
        deletedAt: null
      },
      select: {
        id: true,
        email: true,
        role: true
      }
    });

    if (!user) {
      console.log('❌ [AUTH] User not found for refresh token:', decoded.userId);
      return res.status(401).json({ 
        error: 'Usuario no encontrado' 
      });
    }

    console.log('👤 [AUTH] User found for refresh:', { id: user.id, email: user.email });
    console.log('🎫 [AUTH] Generating new token pair...');
    // Generar nuevos tokens
    const newToken = generateToken(user.id, user.email, user.role);
    const newRefreshToken = generateRefreshToken(user.id);

    // Establecer nuevas cookies
    setCookies(res, newToken, newRefreshToken);

    console.log('🎉 [AUTH] Token refresh successful for user:', user.email);
    res.status(200).json({
      message: 'Token refrescado exitosamente'
    });
  } catch (error) {
    console.error('💥 [AUTH] Refresh token error:', error.name, error.message);
    
    if (error.name === 'JsonWebTokenError') {
      console.log('❌ [AUTH] Invalid refresh token');
      return res.status(401).json({ error: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      console.log('⏰ [AUTH] Refresh token expired');
      return res.status(401).json({ error: 'Token expirado' });
    }

    console.log('❌ [AUTH] General refresh error');
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email } = req.body;

    // Verificar si el email ya existe (si se está cambiando)
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: { 
          email,
          id: { not: userId },
          deletedAt: null
        }
      });

      if (existingUser) {
        return res.status(400).json({ 
          error: 'Ya existe un usuario con este email' 
        });
      }
    }

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Si se cambió el email, generar nuevo token
    if (email && email !== req.user.email) {
      const newToken = generateToken(updatedUser.id, updatedUser.email, updatedUser.role);
      const newRefreshToken = generateRefreshToken(updatedUser.id);
      setCookies(res, newToken, newRefreshToken);
    }

    res.status(200).json({
      message: 'Perfil actualizado exitosamente',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado' 
      });
    }

    // Verificar contraseña actual
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(400).json({ 
        error: 'Contraseña actual incorrecta' 
      });
    }

    // Hash de la nueva contraseña
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    res.status(200).json({
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};