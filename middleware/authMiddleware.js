import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  try {
    // Priorizar token de cookie (más seguro)
    let token = req.cookies?.token;
    
    // Fallback a Authorization header si no hay cookie
    if (!token) {
      const authHeader = req.headers['authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return res.status(401).json({ 
        error: 'Acceso denegado - Token requerido' 
      });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }
    
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
