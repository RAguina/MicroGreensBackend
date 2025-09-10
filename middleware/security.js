import rateLimit from 'express-rate-limit';

// Rate limiter general para todas las rutas
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana de 15 min
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo en 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter más estricto para operaciones de escritura (POST, PUT, DELETE)
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // máximo 20 requests por ventana de 15 min
  message: {
    error: 'Demasiadas operaciones de escritura desde esta IP, intenta de nuevo en 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Sanitizar headers de entrada
export const sanitizeHeaders = (req, res, next) => {
  // Remover headers potencialmente peligrosos
  delete req.headers['x-forwarded-host'];
  delete req.headers['x-forwarded-server'];
  
  // Validar Content-Type para requests POST/PUT
  if (['POST', 'PUT'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (contentType && !contentType.includes('application/json')) {
      return res.status(415).json({
        error: 'Tipo de contenido no soportado. Use application/json.'
      });
    }
  }
  
  next();
};

// Middleware para loggear operaciones sensibles
export const logSensitiveOperations = (req, res, next) => {
  const sensitiveRoutes = ['/plantings'];
  const sensitiveMethods = ['POST', 'PUT', 'DELETE'];
  
  if (sensitiveRoutes.some(route => req.path.includes(route)) && 
      sensitiveMethods.includes(req.method)) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - IP: ${req.ip}`);
  }
  
  next();
};

// Headers de seguridad adicionales
export const additionalSecurityHeaders = (req, res, next) => {
  // Prevenir sniffing de MIME types
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevenir clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Habilitar XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Política de referrer
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
};