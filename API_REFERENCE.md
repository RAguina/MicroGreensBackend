# 🌱 MicroGreens API - Quick Reference

> **Para integración con frontend** - Documentación esencial de endpoints

## 🌐 Base URL
```
Production: [YOUR_VERCEL_URL]
Development: http://localhost:5001
```

## 🔐 Autenticación

**JWT con cookies HttpOnly** - Automático, incluir `credentials: 'include'` en fetch.

```javascript
// Configuración base para todas las requests
const apiCall = async (url, options = {}) => {
  return fetch(url, {
    ...options,
    credentials: 'include', // Importante para cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
};
```

---

## 🔑 Auth Endpoints

### `POST /api/auth/register`
```json
// Request
{
  "email": "user@example.com",
  "password": "Password123",
  "name": "User Name"
}

// Response 201
{
  "message": "Usuario registrado exitosamente",
  "user": { "id": "uuid", "email": "...", "name": "...", "role": "GROWER" }
}
```

### `POST /api/auth/login`
```json
// Request
{
  "email": "user@example.com", 
  "password": "Password123"
}

// Response 200
{
  "message": "Login exitoso",
  "user": { "id": "uuid", "email": "...", "name": "...", "role": "GROWER" }
}
```

### `POST /api/auth/logout`
```json
// Response 200
{ "message": "Logout exitoso" }
```

### `GET /api/auth/me` 🔒
```json
// Response 200
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name", 
    "role": "GROWER",
    "plantingsCount": 5
  }
}
```

### `PUT /api/auth/profile` 🔒
```json
// Request (campos opcionales)
{
  "name": "New Name",
  "email": "new@example.com"
}
```

### `PUT /api/auth/password` 🔒
```json
// Request
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass456",
  "confirmPassword": "NewPass456"
}
```

---

## 🌱 Plantings CRUD

### `GET /api/plantings`
```
Query params: ?page=1&limit=10&plantName=search

Response:
{
  "data": [
    {
      "id": "uuid",
      "plantName": "Microgreen de Rúcula",
      "datePlanted": "2024-10-01T00:00:00.000Z",
      "expectedHarvest": "2024-10-15T00:00:00.000Z",
      "domeDate": "2024-10-03T00:00:00.000Z",
      "lightDate": "2024-10-06T00:00:00.000Z",
      "quantity": 200,
      "yield": 150.5,
      "notes": "Notes...",
      "createdAt": "...",
      "updatedAt": "..."
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

### `POST /api/plantings`
```json
// Request (solo plantName y datePlanted requeridos)
{
  "plantName": "Microgreen de Brócoli",
  "datePlanted": "2024-10-10",
  "expectedHarvest": "2024-10-25",
  "domeDate": "2024-10-12", 
  "lightDate": "2024-10-15",
  "quantity": 300,
  "yield": null,
  "notes": "Optional notes"
}

// Response 201: objeto planting creado
```

### `GET /api/plantings/:id`
```
Response 200: objeto planting individual
Response 404: { "error": "Registro de siembra no encontrado" }
```

### `PUT /api/plantings/:id`
```json
// Request (todos los campos opcionales)
{
  "yield": 175.8,
  "notes": "Cosecha completada"
}

// Response 200: objeto planting actualizado
```

### `DELETE /api/plantings/:id`
```json
// Response 200
{ "message": "Registro de siembra eliminado exitosamente" }
```

---

## 📊 Health Check

### `GET /health`
```json
{
  "status": "OK",
  "timestamp": "2024-10-10T15:30:00.000Z", 
  "environment": "production"
}
```

---

## 🚨 Error Responses

```json
// 400 - Validation Error
{
  "error": "Datos de entrada inválidos",
  "details": [
    {
      "field": "plantName",
      "message": "El nombre de la planta es requerido",
      "value": ""
    }
  ]
}

// 401 - Auth Error  
{
  "error": "Acceso denegado - Token requerido"
}

// 404 - Not Found
{
  "error": "Registro de siembra no encontrado"
}

// 429 - Rate Limited
{
  "error": "Demasiadas solicitudes desde esta IP, intenta de nuevo en 15 minutos."
}
```

---

## 🔧 Data Types

### Planting Object
```typescript
interface Planting {
  id: string;                    // UUID
  plantName: string;             // Required, 1-100 chars
  datePlanted: string;           // Required, ISO date "YYYY-MM-DD"
  expectedHarvest?: string;      // Optional, ISO date
  domeDate?: string;             // Optional, ISO date  
  lightDate?: string;            // Optional, ISO date
  quantity?: number;             // Optional, integer > 0
  yield?: number;                // Optional, float ≥ 0
  notes?: string;                // Optional, max 1000 chars
  createdAt: string;             // Auto ISO datetime
  updatedAt: string;             // Auto ISO datetime
  deletedAt?: string;            // Soft delete timestamp
}
```

### User Object
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'GROWER' | 'VIEWER';
  createdAt: string;
  updatedAt: string;
  plantingsCount?: number;       // Only in /me response
}
```

---

## ⚡ Quick Integration

```javascript
// Basic API client
class MicroGreensAPI {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...options
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API Error');
    }

    return response.json();
  }

  // Auth
  login(email, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  logout() {
    return this.request('/api/auth/logout', { method: 'POST' });
  }

  getMe() {
    return this.request('/api/auth/me');
  }

  // Plantings
  getPlantings(page = 1, limit = 10, search = '') {
    const params = new URLSearchParams({ page, limit });
    if (search) params.append('plantName', search);
    return this.request(`/api/plantings?${params}`);
  }

  createPlanting(data) {
    return this.request('/api/plantings', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  updatePlanting(id, data) {
    return this.request(`/api/plantings/${id}`, {
      method: 'PUT', 
      body: JSON.stringify(data)
    });
  }

  deletePlanting(id) {
    return this.request(`/api/plantings/${id}`, { method: 'DELETE' });
  }
}

// Usage
const api = new MicroGreensAPI('https://your-backend.vercel.app');
```

---

## 🛡️ Security Notes

- **Rate Limiting:** 100 req/15min general, 20 req/15min for writes
- **Authentication:** Optional for plantings (development), will be required in production
- **CORS:** Configured for your frontend domain
- **Cookies:** HttpOnly, Secure in production, SameSite protection

🔒 = Requires authentication  
📖 Reference updated: 2025-09-10