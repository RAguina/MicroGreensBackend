# MicroGreens Backend - Sistema de Hidroponía 🌱

## 📋 Descripción

Backend moderno para sistema de gestión de cultivos de microgreens desarrollado en Node.js con Express y Prisma. El sistema permite gestionar registros completos de siembra, seguimiento de crecimiento, fechas de cosecha y métricas de rendimiento en entornos hidropónicos controlados.

## 🚀 Stack Tecnológico

- **Node.js** - Entorno de ejecución JavaScript
- **Express.js** - Framework web rápido y minimalista
- **Prisma** - ORM moderno con type-safety completo
- **PostgreSQL** - Base de datos relacional (Neon Tech)
- **JWT** - Autenticación con cookies HttpOnly
- **Argon2** - Hashing seguro de contraseñas
- **Express Validator** - Validación robusta de datos
- **Express Rate Limit** - Limitación de velocidad de requests
- **Helmet** - Seguridad HTTP avanzada
- **CORS** - Cross-Origin Resource Sharing configurado
- **Morgan** - Logging de HTTP requests

## 📁 Estructura del Proyecto

```
backend/
├── prisma/
│   └── schema.prisma         # Schema de base de datos Prisma
├── lib/
│   └── prisma.js            # Cliente de Prisma configurado
├── controllers/
│   └── plantingControllers.js  # Lógica CRUD completa
├── middleware/
│   ├── authMiddleware.js    # Autenticación JWT
│   ├── validation.js        # Validaciones de entrada
│   └── security.js          # Middlewares de seguridad
├── routes/
│   └── plantingRoutes.js    # Rutas de la API con validación
├── app.js                   # Configuración principal del servidor
├── package.json             # Dependencias y scripts
└── .env                     # Variables de entorno
```

## 🛠️ Instalación y Configuración

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/RAguina/MicroGreensBackend.git
   cd backend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Crear archivo `.env` con:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
   PORT=5000
   JWT_SECRET=your_super_secure_jwt_secret_key
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

4. **Configurar base de datos**
   ```bash
   npm run db:push      # Sincronizar schema con DB
   npm run db:generate  # Generar cliente Prisma
   ```

5. **Iniciar servidor**
   ```bash
   npm start           # Producción
   npm run dev         # Desarrollo
   ```

## 📊 Modelo de Datos

### Planting (Siembra)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String (UUID) | ID único (Primary Key) |
| plantName | String | Nombre de la planta/microgreen |
| datePlanted | DateTime | Fecha de plantación |
| expectedHarvest | DateTime? | Fecha esperada de cosecha |
| domeDate | DateTime? | Fecha colocación del domo |
| lightDate | DateTime? | Fecha inicio luz directa |
| quantity | Int? | Cantidad de plantas |
| yield | Float? | Rendimiento de cosecha (gramos) |
| notes | String? | Notas adicionales |
| createdAt | DateTime | Fecha de creación |
| updatedAt | DateTime | Fecha de actualización |
| deletedAt | DateTime? | Fecha de borrado (soft delete) |

## 🔌 API Endpoints

### Health Check
- **GET** `/health` - Estado del servidor

### Plantings (Siembras) - CRUD Completo

#### GET `/api/plantings`
Obtiene todos los registros de siembra con paginación y filtros.

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10, máx: 100)
- `plantName` (opcional): Filtro por nombre de planta

**Respuesta:**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "plantName": "Microgreen de Rúcula",
      "datePlanted": "2024-10-01T00:00:00.000Z",
      "expectedHarvest": "2024-10-15T00:00:00.000Z",
      "domeDate": "2024-10-03T00:00:00.000Z",
      "lightDate": "2024-10-06T00:00:00.000Z",
      "quantity": 200,
      "yield": 150.5,
      "notes": "Primera siembra de rúcula",
      "createdAt": "2024-10-01T10:00:00.000Z",
      "updatedAt": "2024-10-01T10:00:00.000Z",
      "deletedAt": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### POST `/api/plantings`
Crea un nuevo registro de siembra.

**Body (Validado):**
```json
{
  "plantName": "Microgreen de Brócoli",
  "datePlanted": "2024-10-10",
  "expectedHarvest": "2024-10-25",
  "domeDate": "2024-10-12",
  "lightDate": "2024-10-15",
  "quantity": 300,
  "notes": "Semillas orgánicas seleccionadas"
}
```

#### GET `/api/plantings/:id`
Obtiene un registro específico por ID.

#### PUT `/api/plantings/:id`
Actualiza un registro de siembra existente.

#### DELETE `/api/plantings/:id`
Elimina un registro (soft delete).

## 🔐 Autenticación

**Próximamente:** Sistema de autenticación con JWT en cookies HttpOnly para máxima seguridad.

```javascript
// Ejemplo de implementación futura
app.use(cookieParser());
// JWT se enviará en cookie httpOnly, secure, sameSite
```

## 🛡️ Seguridad Implementada

- **Rate Limiting:** 100 req/15min general, 20 req/15min para escritura
- **Helmet.js:** Headers de seguridad HTTP configurados
- **CORS:** Configurado específicamente para el frontend
- **Validación:** Validación robusta con express-validator
- **Sanitización:** Headers y datos de entrada sanitizados
- **Logging:** Operaciones sensibles loggeadas
- **Error Handling:** Manejo seguro de errores sin exposición de datos

## 🗄️ Base de Datos

- **Provider:** Neon Tech (PostgreSQL serverless)
- **ORM:** Prisma con type-safety completo
- **Características:**
  - Auto-generación de tipos TypeScript
  - Timestamps automáticos
  - Soft deletes implementados
  - UUIDs como claves primarias
  - Conexiones optimizadas

## 📋 Scripts Disponibles

```bash
npm start           # Iniciar servidor
npm run dev         # Modo desarrollo
npm run db:generate # Generar cliente Prisma
npm run db:push     # Sincronizar schema con DB
npm run db:studio   # Abrir Prisma Studio (GUI)
```

## 🔧 Variables de Entorno

```env
DATABASE_URL=          # URL completa de PostgreSQL
PORT=5000             # Puerto del servidor
JWT_SECRET=           # Clave secreta para JWT (cambiar en producción)
NODE_ENV=development  # Entorno (development/production)
FRONTEND_URL=         # URL del frontend para CORS
```

## 🚀 Despliegue

El backend está preparado para desplegar en:
- **Vercel** (recomendado para Next.js)
- **Railway**
- **Heroku**
- **Render**

Con Prisma, la base de datos se conecta automáticamente usando `DATABASE_URL`.

## 📈 Próximas Funcionalidades

Ver [ROADMAP.md](./ROADMAP.md) para el plan completo de desarrollo.

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📞 Soporte

Para soporte técnico o consultas sobre el sistema, crear un issue en el repositorio.

---

**🌱 MicroGreens Backend** - Desarrollado con ❤️ para la agricultura vertical moderna

*Última actualización: 2025-09-10*