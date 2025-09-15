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

    // Cookie para almacenar el token (NO HttpOnly para incognito compatibility)
    res.cookie('csrf-token', csrfToken, {
      httpOnly: false, // Permite que JS lea la cookie para incognito mode
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

  const cookieToken = req.cookies['csrf-token'];
  const headerToken = req.headers['x-csrf-token'];

  // Caso especial: Si no hay cookie pero sí header (modo incógnito)
  // Aceptar el token del header como válido
  if (!cookieToken && headerToken) {
    // Establecer cookie para requests futuros (aunque en incógnito puede no persistir)
    res.cookie('csrf-token', headerToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000
    });

    return next();
  }

  if (!headerToken) {
    return res.status(403).json({
      error: 'CSRF token requerido en header X-CSRF-Token',
      code: 'CSRF_TOKEN_MISSING'
    });
  }

  if (!cookieToken) {
    return res.status(403).json({
      error: 'CSRF token requerido en cookie',
      code: 'CSRF_COOKIE_MISSING'
    });
  }

  if (cookieToken !== headerToken) {
    console.error('CSRF token mismatch for:', req.method, req.path);
    return res.status(403).json({
      error: 'CSRF token inválido',
      code: 'CSRF_TOKEN_INVALID'
    });
  }

  next();
};

// Middleware combinado para aplicar automáticamente
export const csrfProtection = [setCSRFToken, validateCSRFToken];