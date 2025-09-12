import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  try {
    console.log('🔐 [AUTH MIDDLEWARE] Checking authentication for:', req.method, req.path);
    console.log('🔐 [AUTH MIDDLEWARE] Available cookies:', Object.keys(req.cookies || {}));
    console.log('🔐 [AUTH MIDDLEWARE] Authorization header:', req.headers['authorization'] ? 'Present' : 'Missing');
    
    // Priorizar token de cookie (más seguro)
    let token = req.cookies?.token;
    console.log('🍪 [AUTH MIDDLEWARE] Token from cookie:', token ? 'Present' : 'Missing');
    
    // Fallback a Authorization header si no hay cookie
    if (!token) {
      const authHeader = req.headers['authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
        console.log('🔑 [AUTH MIDDLEWARE] Token from Bearer header:', token ? 'Present' : 'Missing');
      }
    }

    if (!token) {
      console.log('❌ [AUTH MIDDLEWARE] No token found');
      return res.status(401).json({ 
        error: 'Acceso denegado - Token requerido' 
      });
    }

    console.log('✅ [AUTH MIDDLEWARE] Token found, verifying...');
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    console.log('🎉 [AUTH MIDDLEWARE] Token verified successfully for user:', verified.userId);
    next();
  } catch (error) {
    console.log('💥 [AUTH MIDDLEWARE] JWT Error:', error.name, error.message);
    
    if (error.name === 'JsonWebTokenError') {
      console.log('❌ [AUTH MIDDLEWARE] Invalid token');
      return res.status(401).json({ error: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      console.log('⏰ [AUTH MIDDLEWARE] Token expired');
      return res.status(401).json({ 
        error: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    console.log('❌ [AUTH MIDDLEWARE] General auth error');
    return res.status(401).json({ error: 'Error de autenticación' });
  }
};

// Middleware para verificar roles
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Usuario no autenticado' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Permisos insuficientes para esta acción',
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Middleware opcional de autenticación (no falla si no hay token)
export const optionalAuth = (req, res, next) => {
  try {
    let token = req.cookies?.token;
    
    if (!token) {
      const authHeader = req.headers['authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (token) {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      req.user = verified;
    }
    
    next();
  } catch (error) {
    // En optional auth, ignoramos errores de token y continuamos
    next();
  }
};

// Aliases comunes para facilitar uso
export const requireAuth = authMiddleware;
export const requireAdmin = requireRole('ADMIN');
export const requireGrowerOrAdmin = requireRole('GROWER', 'ADMIN');
