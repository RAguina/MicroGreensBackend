# 🔌 MicroGreens Backend - API Documentation

> **Para el equipo de Frontend:** Esta es la documentación completa de la API del backend. Incluye todos los endpoints disponibles, autenticación, ejemplos de requests/responses y mejores prácticas.

## 🌐 Base URL

```
Development: http://localhost:5001
Production: TBD
```

## 🔐 Autenticación

### ✅ Estado Actual - IMPLEMENTADO
- **✅ Completo:** Sistema de autenticación JWT con cookies HttpOnly implementado
- Los endpoints de plantings funcionan **CON O SIN autenticación** (desarrollo flexible)
- Sistema completo de usuarios con roles (ADMIN, GROWER, VIEWER)

### Cómo Funciona
```http
# JWT se envía automáticamente en cookie HttpOnly (MÁS SEGURO)
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Cookie: refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# También soporta Authorization header como fallback
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**🔐 Características de Seguridad:**
- **JWT en cookies HttpOnly** (previene XSS attacks)
- **Refresh tokens** de 7 días para sesiones largas
- **Access tokens** de 24 horas para seguridad
- **Cookies secure** en producción
- **Validación robusta** de contraseñas
- **Roles de usuario** para permisos granulares

**🚀 Para el Frontend:**
- Las cookies se manejan **automáticamente**
- Solo necesitas `credentials: 'include'` en fetch
- No manejes tokens manualmente
- El sistema detecta automáticamente si estás loggeado

---

## 🔐 Authentication API - Endpoints de Autenticación

### POST `/api/auth/register` - Registro de Usuario

Crea una nueva cuenta de usuario con validación completa.

**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "MiPassword123",
  "name": "Juan Pérez"
}
```

**Body Schema:**
| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|------------|
| `email` | string | ✅ | Email válido, único |
| `password` | string | ✅ | Min 8 chars, 1 mayúscula, 1 minúscula, 1 número |
| `name` | string | ✅ | 2-50 caracteres |

**Response Success (201):**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "usuario@example.com",
    "name": "Juan Pérez",
    "role": "GROWER",
    "createdAt": "2024-10-10T15:30:00.000Z"
  }
}
```

**Cookies establecidas automáticamente:**
- `token` (HttpOnly, 24h)
- `refreshToken` (HttpOnly, 7d)

### POST `/api/auth/login` - Iniciar Sesión

Autentica un usuario existente.

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "MiPassword123"
}
```

**Response Success (200):**
```json
{
  "message": "Login exitoso",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "usuario@example.com",
    "name": "Juan Pérez",
    "role": "GROWER",
    "createdAt": "2024-10-10T15:30:00.000Z"
  }
}
```

### POST `/api/auth/logout` - Cerrar Sesión

Cierra la sesión del usuario y limpia las cookies.

**Request:**
```http
POST /api/auth/logout
```

**Response Success (200):**
```json
{
  "message": "Logout exitoso"
}
```

### GET `/api/auth/me` - Usuario Actual

Obtiene información del usuario loggeado. **Requiere autenticación.**

**Request:**
```http
GET /api/auth/me
Cookie: token=...
```

**Response Success (200):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "usuario@example.com",
    "name": "Juan Pérez",
    "role": "GROWER",
    "createdAt": "2024-10-10T15:30:00.000Z",
    "updatedAt": "2024-10-10T15:30:00.000Z",
    "plantingsCount": 5
  }
}
```

### POST `/api/auth/refresh` - Refrescar Token

Genera nuevos tokens usando el refresh token.

**Request:**
```http
POST /api/auth/refresh
Cookie: refreshToken=...
```

**Response Success (200):**
```json
{
  "message": "Token refrescado exitosamente"
}
```

### PUT `/api/auth/profile` - Actualizar Perfil

Actualiza información del usuario. **Requiere autenticación.**

**Request:**
```http
PUT /api/auth/profile
Cookie: token=...
Content-Type: application/json

{
  "name": "Juan Carlos Pérez",
  "email": "nuevoemail@example.com"
}
```

### PUT `/api/auth/password` - Cambiar Contraseña

Cambia la contraseña del usuario. **Requiere autenticación.**

**Request:**
```http
PUT /api/auth/password
Cookie: token=...
Content-Type: application/json

{
  "currentPassword": "PasswordActual123",
  "newPassword": "NuevoPassword456",
  "confirmPassword": "NuevoPassword456"
}
```

---

## 📊 Health Check

### GET `/health`
Verificar estado del servidor y base de datos.

**Request:**
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-10-10T15:30:00.000Z",
  "environment": "development"
}
```

**Status Codes:**
- `200` - Servidor funcionando correctamente
- `500` - Error en servidor o base de datos

---

## 🌱 Plantings API - CRUD Completo

### 1. GET `/api/plantings` - Listar Siembras

Obtiene lista paginada de siembras con filtros opcionales.

**Request:**
```http
GET /api/plantings?page=1&limit=10&plantName=rucula
```

**Query Parameters:**
| Parámetro | Tipo | Descripción | Default | Máximo |
|-----------|------|-------------|---------|---------|
| `page` | number | Número de página | 1 | - |
| `limit` | number | Elementos por página | 10 | 100 |
| `plantName` | string | Filtro por nombre de planta | - | 100 chars |

**Response Success (200):**
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
      "notes": "Primera siembra de rúcula orgánica",
      "createdAt": "2024-10-01T10:00:00.000Z",
      "updatedAt": "2024-10-01T12:30:00.000Z",
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

**Response Error (400):**
```json
{
  "error": "Datos de entrada inválidos",
  "details": [
    {
      "field": "page",
      "message": "La página debe ser un número entero mayor a 0",
      "value": "abc"
    }
  ]
}
```

**Ejemplo de uso en React:**
```javascript
const fetchPlantings = async (page = 1, searchTerm = '') => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '10'
    });
    
    if (searchTerm) {
      params.append('plantName', searchTerm);
    }
    
    const response = await fetch(`http://localhost:5000/api/plantings?${params}`);
    
    if (!response.ok) {
      throw new Error('Error fetching plantings');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```

---

### 2. POST `/api/plantings` - Crear Siembra

Crea un nuevo registro de siembra con validación completa.

**Request:**
```http
POST /api/plantings
Content-Type: application/json

{
  "plantName": "Microgreen de Brócoli",
  "datePlanted": "2024-10-10",
  "expectedHarvest": "2024-10-25",
  "domeDate": "2024-10-12",
  "lightDate": "2024-10-15",
  "quantity": 300,
  "yield": null,
  "notes": "Semillas orgánicas seleccionadas de proveedor local"
}
```

**Body Schema:**
| Campo | Tipo | Requerido | Descripción | Validación |
|-------|------|-----------|-------------|------------|
| `plantName` | string | ✅ | Nombre de la planta | 1-100 chars |
| `datePlanted` | string (ISO8601) | ✅ | Fecha de plantación | Formato YYYY-MM-DD |
| `expectedHarvest` | string (ISO8601) | ❌ | Fecha esperada de cosecha | Formato YYYY-MM-DD |
| `domeDate` | string (ISO8601) | ❌ | Fecha colocación del domo | Formato YYYY-MM-DD |
| `lightDate` | string (ISO8601) | ❌ | Fecha inicio luz directa | Formato YYYY-MM-DD |
| `quantity` | number | ❌ | Cantidad de plantas | Entero > 0 |
| `yield` | number | ❌ | Rendimiento en gramos | Float ≥ 0 |
| `notes` | string | ❌ | Notas adicionales | Máx 1000 chars |

**Response Success (201):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "plantName": "Microgreen de Brócoli",
  "datePlanted": "2024-10-10T00:00:00.000Z",
  "expectedHarvest": "2024-10-25T00:00:00.000Z",
  "domeDate": "2024-10-12T00:00:00.000Z",
  "lightDate": "2024-10-15T00:00:00.000Z",
  "quantity": 300,
  "yield": null,
  "notes": "Semillas orgánicas seleccionadas de proveedor local",
  "createdAt": "2024-10-10T14:30:00.000Z",
  "updatedAt": "2024-10-10T14:30:00.000Z",
  "deletedAt": null
}
```

**Ejemplo de uso en React:**
```javascript
const createPlanting = async (plantingData) => {
  try {
    const response = await fetch('http://localhost:5000/api/plantings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(plantingData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error creating planting');
    }

    const newPlanting = await response.json();
    return newPlanting;
  } catch (error) {
    console.error('Error creating planting:', error);
    throw error;
  }
};

// Uso:
const handleSubmit = async (formData) => {
  try {
    const newPlanting = await createPlanting({
      plantName: formData.plantName,
      datePlanted: formData.datePlanted.toISOString().split('T')[0], // YYYY-MM-DD
      expectedHarvest: formData.expectedHarvest ? formData.expectedHarvest.toISOString().split('T')[0] : undefined,
      quantity: parseInt(formData.quantity) || undefined,
      notes: formData.notes || undefined
    });
    
    console.log('Planting created:', newPlanting);
    // Actualizar UI, mostrar success message, etc.
  } catch (error) {
    // Mostrar error message al usuario
  }
};
```

---

### 3. GET `/api/plantings/:id` - Obtener Siembra por ID

Obtiene un registro específico de siembra.

**Request:**
```http
GET /api/plantings/550e8400-e29b-41d4-a716-446655440000
```

**Response Success (200):**
```json
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
  "updatedAt": "2024-10-01T12:30:00.000Z",
  "deletedAt": null
}
```

**Response Error (404):**
```json
{
  "error": "Registro de siembra no encontrado"
}
```

**Response Error (400 - ID inválido):**
```json
{
  "error": "Datos de entrada inválidos",
  "details": [
    {
      "field": "id",
      "message": "El ID debe ser un UUID válido",
      "value": "invalid-id"
    }
  ]
}
```

---

### 4. PUT `/api/plantings/:id` - Actualizar Siembra

Actualiza un registro existente de siembra.

**Request:**
```http
PUT /api/plantings/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "yield": 175.8,
  "notes": "Cosecha completada - excelente rendimiento"
}
```

**Body Schema:** Todos los campos son opcionales, solo envía los que quieras actualizar.

**Response Success (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "plantName": "Microgreen de Rúcula",
  "datePlanted": "2024-10-01T00:00:00.000Z",
  "expectedHarvest": "2024-10-15T00:00:00.000Z",
  "domeDate": "2024-10-03T00:00:00.000Z",
  "lightDate": "2024-10-06T00:00:00.000Z",
  "quantity": 200,
  "yield": 175.8,
  "notes": "Cosecha completada - excelente rendimiento",
  "createdAt": "2024-10-01T10:00:00.000Z",
  "updatedAt": "2024-10-15T16:45:00.000Z",
  "deletedAt": null
}
```

**Ejemplo de uso en React:**
```javascript
const updatePlanting = async (id, updates) => {
  try {
    const response = await fetch(`http://localhost:5000/api/plantings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error updating planting');
    }

    const updatedPlanting = await response.json();
    return updatedPlanting;
  } catch (error) {
    console.error('Error updating planting:', error);
    throw error;
  }
};

// Ejemplo: Actualizar yield al cosechar
const handleHarvest = async (plantingId, harvestedAmount) => {
  try {
    const updated = await updatePlanting(plantingId, {
      yield: harvestedAmount,
      notes: `Cosechado el ${new Date().toLocaleDateString()}`
    });
    
    console.log('Planting updated:', updated);
  } catch (error) {
    // Handle error
  }
};
```

---

### 5. DELETE `/api/plantings/:id` - Eliminar Siembra

Elimina un registro (soft delete - no se borra físicamente).

**Request:**
```http
DELETE /api/plantings/550e8400-e29b-41d4-a716-446655440000
```

**Response Success (200):**
```json
{
  "message": "Registro de siembra eliminado exitosamente"
}
```

**Response Error (404):**
```json
{
  "error": "Registro de siembra no encontrado"
}
```

**Nota:** El registro se marca como eliminado (`deletedAt` se establece) pero permanece en la base de datos para auditoría.

---

## ⚡ Rate Limiting

Para proteger la API, implementamos rate limiting:

- **General:** 100 requests por 15 minutos por IP
- **Endpoints de escritura (POST/PUT/DELETE):** 20 requests por 15 minutos por IP

**Headers de respuesta:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1634567890
```

**Error Response (429):**
```json
{
  "error": "Demasiadas solicitudes desde esta IP, intenta de nuevo en 15 minutos."
}
```

---

## 🛡️ Manejo de Errores

### Status Codes Estándar

| Code | Descripción | Cuándo ocurre |
|------|-------------|---------------|
| `200` | OK | Request exitoso |
| `201` | Created | Recurso creado exitosamente |
| `400` | Bad Request | Datos de entrada inválidos |
| `404` | Not Found | Recurso no encontrado |
| `415` | Unsupported Media Type | Content-Type incorrecto |
| `429` | Too Many Requests | Rate limit excedido |
| `500` | Internal Server Error | Error interno del servidor |

### Estructura de Errores

**Error de Validación (400):**
```json
{
  "error": "Datos de entrada inválidos",
  "details": [
    {
      "field": "plantName",
      "message": "El nombre de la planta es requerido",
      "value": ""
    },
    {
      "field": "datePlanted",
      "message": "La fecha debe tener formato válido (YYYY-MM-DD)",
      "value": "invalid-date"
    }
  ]
}
```

**Error Genérico:**
```json
{
  "error": "Descripción del error",
  "details": "Detalles adicionales (solo en desarrollo)"
}
```

---

## 🔧 Headers Requeridos

### Para POST/PUT requests:
```http
Content-Type: application/json
```

### Para requests con autenticación (futuro):
```http
# Opción 1: Cookie (recomendado)
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Opción 2: Header Authorization
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📋 Ejemplos de Integración

### React Hook Personalizado

```javascript
// hooks/usePlantings.js
import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

export const usePlantings = (page = 1, searchTerm = '') => {
  const [plantings, setPlantings] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlantings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (searchTerm) {
        params.append('plantName', searchTerm);
      }
      
      const response = await fetch(`${API_BASE_URL}/plantings?${params}`);
      
      if (!response.ok) {
        throw new Error('Error fetching plantings');
      }
      
      const data = await response.json();
      setPlantings(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createPlanting = async (plantingData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/plantings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(plantingData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error creating planting');
      }

      const newPlanting = await response.json();
      
      // Actualizar lista local
      setPlantings(prev => [newPlanting, ...prev]);
      
      return newPlanting;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const updatePlanting = async (id, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/plantings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error updating planting');
      }

      const updatedPlanting = await response.json();
      
      // Actualizar lista local
      setPlantings(prev => 
        prev.map(p => p.id === id ? updatedPlanting : p)
      );
      
      return updatedPlanting;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const deletePlanting = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/plantings/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error deleting planting');
      }

      // Remover de lista local
      setPlantings(prev => prev.filter(p => p.id !== id));
      
      return true;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  useEffect(() => {
    fetchPlantings();
  }, [page, searchTerm]);

  return {
    plantings,
    pagination,
    loading,
    error,
    refetch: fetchPlantings,
    createPlanting,
    updatePlanting,
    deletePlanting
  };
};
```

### Componente de Ejemplo

```jsx
// components/PlantingsList.jsx
import React, { useState } from 'react';
import { usePlantings } from '../hooks/usePlantings';

const PlantingsList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    plantings,
    pagination,
    loading,
    error,
    createPlanting,
    updatePlanting,
    deletePlanting
  } = usePlantings(currentPage, searchTerm);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page
  };

  const handleCreatePlanting = async (formData) => {
    try {
      await createPlanting({
        plantName: formData.plantName,
        datePlanted: formData.datePlanted,
        expectedHarvest: formData.expectedHarvest,
        quantity: parseInt(formData.quantity) || undefined,
        notes: formData.notes || undefined
      });
      
      // Show success message
    } catch (error) {
      // Show error message
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <input
        type="text"
        placeholder="Buscar por nombre de planta..."
        value={searchTerm}
        onChange={handleSearch}
      />
      
      <div>
        {plantings.map(planting => (
          <div key={planting.id}>
            <h3>{planting.plantName}</h3>
            <p>Plantado: {new Date(planting.datePlanted).toLocaleDateString()}</p>
            <p>Cantidad: {planting.quantity || 'No especificada'}</p>
            {planting.yield && <p>Rendimiento: {planting.yield}g</p>}
            
            <button onClick={() => updatePlanting(planting.id, { yield: 100 })}>
              Actualizar Rendimiento
            </button>
            <button onClick={() => deletePlanting(planting.id)}>
              Eliminar
            </button>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      <div>
        <button 
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage(p => p - 1)}
        >
          Anterior
        </button>
        
        <span>
          Página {pagination.page} de {pagination.totalPages}
        </span>
        
        <button 
          disabled={currentPage >= pagination.totalPages}
          onClick={() => setCurrentPage(p => p + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default PlantingsList;
```

---

## 🚀 Próximas Actualizaciones

### Autenticación (Próxima versión)
Endpoints que se añadirán:
```
POST /api/auth/register    - Registro de usuario
POST /api/auth/login       - Login (establece cookie HttpOnly)
POST /api/auth/logout      - Logout (limpia cookie)
GET  /api/auth/me          - Obtener usuario actual
POST /api/auth/refresh     - Refrescar token
```

### Mejoras Planificadas
- Upload de imágenes para siembras
- Dashboard con métricas y gráficos
- Endpoints para reportes y estadísticas
- Integración con sensores IoT
- Notificaciones push

---

## 🤝 Soporte

Si tienes preguntas sobre la API o encuentras algún problema:

1. Revisa esta documentación
2. Verifica que el servidor esté ejecutándose (`GET /health`)
3. Consulta los logs del servidor para errores específicos
4. Crea un issue en el repositorio de GitHub

---

**🌱 Happy Coding!** - El equipo de MicroGreens Backend

*Documentación actualizada: 2025-09-10*