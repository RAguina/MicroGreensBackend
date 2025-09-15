import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import plantingRoutes from './routes/plantingRoutes.js';
import authRoutes from './routes/authRoutes.js';
import plantTypeRoutes from './routes/plantTypeRoutes.js';
import harvestRoutes from './routes/harvestRoutes.js';
import { prisma } from './lib/prisma.js';
import {
  generalLimiter,
  strictLimiter,
  sanitizeHeaders,
  logSensitiveOperations,
  additionalSecurityHeaders
} from './middleware/security.js';
import { setCSRFToken } from './middleware/csrfProtection.js';

dotenv.config();

const app = express();

// Trust proxy configuración específica para Vercel
// Esto permite que express-rate-limit funcione correctamente con X-Forwarded-For headers
// sin ser demasiado permisivo con la seguridad
if (process.env.NODE_ENV === 'production') {
  // Vercel siempre usa un solo proxy hop, por lo que confiamos en el primer proxy
  app.set('trust proxy', 1);
} else {
  // En desarrollo, no hay proxies
  app.set('trust proxy', false);
}

// Middlewares de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(additionalSecurityHeaders);
app.use(sanitizeHeaders);
app.use(logSensitiveOperations);

// CORS configurado para cross-site cookies
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://micro-greens-psi.vercel.app'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-CSRF-Token']
}));

// Rate limiting
app.use(generalLimiter);

// Body parsing y cookies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// CSRF protection - establece token en GET requests
app.use(setCSRFToken);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', strictLimiter); // Rate limiting estricto para write operations
app.use('/api/plantings', plantingRoutes);
app.use('/api/plant-types', plantTypeRoutes);
app.use('/api/harvests', harvestRoutes);

// Error handler global
app.use((error, req, res, next) => {
  console.error('Error global:', error);
  
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido en el body de la petición' });
  }
  
  res.status(500).json({ 
    error: 'Error interno del servidor',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Probar conexión a la base de datos con Prisma
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Conexión a la base de datos exitosa (Prisma)');
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Cerrando servidor...');
  await prisma.$disconnect();
  console.log('✅ Conexión a la base de datos cerrada');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Cerrando servidor...');
  await prisma.$disconnect();
  console.log('✅ Conexión a la base de datos cerrada');
  process.exit(0);
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await testDatabaseConnection();
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV}`);
});
