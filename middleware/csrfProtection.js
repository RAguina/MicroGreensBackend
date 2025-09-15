import crypto from 'crypto';

// Generar token CSRF seguro
const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Middleware para establecer CSRF token en GET requests
export const setCSRFToken = (req, res, next) => {
  // Solo establecer en GET requests que no tengan token
  if (req.method === 'GET' && !req.cookies['csrf-token']) {
    const csrfToken = generateCSRFToken();
    
    console.log('🛡️ [CSRF] Setting CSRF token for new session');
    
    // Cookie para almacenar el token (HttpOnly para seguridad)
    res.cookie('csrf-token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    });
    
    // Header para que el cliente pueda leerlo
    res.set('X-CSRF-Token', csrfToken);
  }
  
  next();
};

// Middleware para validar CSRF token en requests mutadores
export const validateCSRFToken = (req, res, next) => {
  // Solo validar en requests que modifican data
  const mutatingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  
  if (!mutatingMethods.includes(req.method)) {
    return next();
  }
  
  console.log('🛡️ [CSRF] Validating CSRF token for:', req.method, req.path);
  
  const cookieToken = req.cookies['csrf-token'];
  const headerToken = req.headers['x-csrf-token'];
  
  console.log('🛡️ [CSRF] Cookie token present:', !!cookieToken);
  console.log('🛡️ [CSRF] Header token present:', !!headerToken);
  
  if (!cookieToken || !headerToken) {
    console.log('❌ [CSRF] Missing CSRF token');
    return res.status(403).json({ 
      error: 'CSRF token requerido',
      code: 'CSRF_TOKEN_MISSING'
    });
  }
  
  if (cookieToken !== headerToken) {
    console.log('❌ [CSRF] CSRF token mismatch');
    return res.status(403).json({ 
      error: 'CSRF token inválido',
      code: 'CSRF_TOKEN_INVALID'
    });
  }
  
  console.log('✅ [CSRF] CSRF token validated successfully');
  next();
};

// Middleware combinado para aplicar automáticamente
export const csrfProtection = [setCSRFToken, validateCSRFToken];