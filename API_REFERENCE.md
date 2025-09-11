# 🌱 MicroGreens API - Quick Reference

> **Para integración con frontend** - Documentación esencial de endpoints con modelo híbrido escalable

## 🌐 Base URL
```
Production: [YOUR_VERCEL_URL]
Development: http://localhost:5001
```

## 🆕 **NUEVO: Modelo Híbrido v2.0**
- **PlantTypes**: Catálogo reutilizable de plantas con parámetros de cultivo
- **Plantings**: Con estados (PLANTED → HARVESTED) y relación a PlantType
- **Harvests**: Múltiples cosechas por siembra con métricas de calidad

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

## 🏷️ Plant Types (Catálogo)

### `GET /api/plant-types`
```
Query params: ?category=Microgreens&difficulty=Easy

Response:
[
  {
    "id": "uuid",
    "name": "Microgreen de Rúcula",
    "scientificName": "Eruca sativa",
    "category": "Microgreens",
    "description": "Microgreens de sabor picante...",
    "daysToGerminate": 2,
    "daysToHarvest": 10,
    "optimalTemp": 18.5,
    "optimalHumidity": 65.0,
    "lightRequirement": "Medium",
    "averageYield": 120.0,
    "marketPrice": 0.15,
    "difficulty": "Easy",
    "_count": { "plantings": 25 }
  }
]
```

### `POST /api/plant-types` 🔒 Admin
```json
// Request
{
  "name": "Microgreen de Brócoli",
  "scientificName": "Brassica oleracea",
  "category": "Microgreens",
  "daysToGerminate": 3,
  "daysToHarvest": 12,
  "optimalTemp": 20.0,
  "averageYield": 100.0,
  "difficulty": "Easy"
}
```

### `GET /api/plant-types/:id`
```
Response: objeto PlantType con plantings recientes
```

### `PUT /api/plant-types/:id` 🔒 Admin
### `DELETE /api/plant-types/:id` 🔒 Admin

---

## 🌱 Plantings CRUD (Actualizado)

### `GET /api/plantings`
```
Query params: ?page=1&limit=10&plantName=search&status=GROWING&plantTypeId=uuid

Response:
{
  "data": [
    {
      "id": "uuid",
      "plantName": "Microgreen de Rúcula", // Legacy field
      "datePlanted": "2024-10-01T00:00:00.000Z",
      "expectedHarvest": "2024-10-15T00:00:00.000Z",
      "domeDate": "2024-10-03T00:00:00.000Z",
      "lightDate": "2024-10-06T00:00:00.000Z",
      "quantity": 200,
      "status": "GROWING",
      "trayNumber": "A-12",
      "yield": 150.5, // Legacy field
      "notes": "Notes...",
      "plantType": {
        "id": "uuid",
        "name": "Microgreen de Rúcula",
        "category": "Microgreens",
        "daysToHarvest": 10,
        "averageYield": 120.0
      },
      "harvests": [
        {
          "id": "uuid",
          "harvestDate": "2024-10-15T00:00:00.000Z",
          "weight": 125.5,
          "quality": "EXCELLENT"
        }
      ],
      "_count": { "harvests": 2 }
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
// Request - NUEVO: con plantTypeId (recomendado) o plantName (legacy)
{
  "plantTypeId": "uuid", // Recomendado: referencia al catálogo
  "plantName": "Microgreen de Brócoli", // Legacy: solo si no usas plantTypeId
  "datePlanted": "2024-10-10",
  "expectedHarvest": "2024-10-25", // Auto-calculado si usas plantTypeId
  "domeDate": "2024-10-12", 
  "lightDate": "2024-10-15",
  "quantity": 300,
  "status": "PLANTED", // PLANTED, GERMINATING, GROWING, etc.
  "trayNumber": "B-05",
  "notes": "Optional notes"
}

// Response 201: objeto planting con plantType y harvests incluidos
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

## 🌾 Harvests (Cosechas)

### `GET /api/harvests`
```
Query params: ?page=1&limit=10&plantingId=uuid&quality=EXCELLENT

Response:
{
  "data": [
    {
      "id": "uuid",
      "harvestDate": "2024-10-15T00:00:00.000Z",
      "weight": 125.5,
      "quality": "EXCELLENT",
      "notes": "Cosecha perfecta",
      "pricePerGram": 0.15,
      "totalValue": 18.83,
      "appearance": 9,
      "taste": 8,
      "freshness": 10,
      "planting": {
        "id": "uuid",
        "plantName": "Microgreen de Rúcula",
        "plantType": {
          "id": "uuid",
          "name": "Microgreen de Rúcula"
        }
      }
    }
  ],
  "pagination": { ... }
}
```

### `GET /api/harvests/planting/:plantingId`
```
Response: array de todas las cosechas de una siembra específica
```

### `POST /api/harvests` 🔒
```json
// Request
{
  "plantingId": "uuid",
  "harvestDate": "2024-10-15",
  "weight": 125.5,
  "quality": "EXCELLENT", // EXCELLENT, GOOD, FAIR, POOR
  "notes": "Primera cosecha",
  "pricePerGram": 0.15, // Opcional
  "appearance": 9, // 1-10 scale
  "taste": 8,
  "freshness": 10
}

// Response 201: objeto harvest con planting incluido
// NOTA: Actualiza automáticamente el status de la siembra a HARVESTED
```

### `PUT /api/harvests/:id` 🔒
### `DELETE /api/harvests/:id` 🔒

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

## 🔧 Data Types (Modelo Híbrido v2.0)

### PlantType Object (NUEVO)
```typescript
interface PlantType {
  id: string;                    // UUID
  name: string;                  // Required, unique
  scientificName?: string;
  category?: string;             // "Microgreens", "Herbs", etc.
  description?: string;
  
  // Growing parameters
  daysToGerminate?: number;
  daysToHarvest?: number;
  optimalTemp?: number;          // Celsius
  optimalHumidity?: number;      // Percentage
  lightRequirement?: string;     // "Low", "Medium", "High"
  
  // Business data
  averageYield?: number;         // grams per tray
  marketPrice?: number;          // price per gram
  difficulty?: string;           // "Easy", "Medium", "Hard"
  
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
```

### Planting Object (Actualizado)
```typescript
interface Planting {
  id: string;                    // UUID
  
  // NUEVO: Relación con catálogo
  plantTypeId?: string;          // UUID referencia a PlantType
  plantType?: PlantType;         // Objeto incluido
  
  // Legacy field (deprecado pero compatible)
  plantName?: string;
  
  // Core data
  datePlanted: string;           // Required, ISO date
  expectedHarvest?: string;      // Auto-calculado con plantType
  domeDate?: string;
  lightDate?: string;
  quantity?: number;
  
  // NUEVO: Status tracking
  status: 'PLANTED' | 'GERMINATING' | 'GROWING' | 'READY_TO_HARVEST' | 'HARVESTED' | 'FAILED';
  
  // NUEVO: Ubicación física
  trayNumber?: string;
  
  // Legacy field (deprecado)
  yield?: number;                // Usar Harvest model
  
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  
  // NUEVO: Relaciones
  harvests?: Harvest[];
}
```

### Harvest Object (NUEVO)
```typescript
interface Harvest {
  id: string;                    // UUID
  plantingId: string;            // Required reference
  
  // Harvest data
  harvestDate: string;           // Required, ISO date
  weight: number;                // Required, grams
  quality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  notes?: string;
  
  // Market data
  pricePerGram?: number;         // Optional
  totalValue?: number;           // Auto-calculated
  
  // Quality metrics (1-10 scale)
  appearance?: number;
  taste?: number;
  freshness?: number;
  
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  
  // Relations
  planting?: Planting;
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

  // Plant Types (NUEVO)
  getPlantTypes(category = '', difficulty = '') {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (difficulty) params.append('difficulty', difficulty);
    return this.request(`/api/plant-types?${params}`);
  }

  createPlantType(data) {
    return this.request('/api/plant-types', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Harvests (NUEVO)
  getHarvests(page = 1, limit = 10, plantingId = '') {
    const params = new URLSearchParams({ page, limit });
    if (plantingId) params.append('plantingId', plantingId);
    return this.request(`/api/harvests?${params}`);
  }

  createHarvest(data) {
    return this.request('/api/harvests', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  getHarvestsByPlanting(plantingId) {
    return this.request(`/api/harvests/planting/${plantingId}`);
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
## 🚀 Ejemplos de Flujo con Modelo Híbrido

```javascript
// 1. Crear tipo de planta (Admin)
const rucula = await api.createPlantType({
  name: "Microgreen de Rúcula",
  scientificName: "Eruca sativa",
  category: "Microgreens",
  daysToHarvest: 10,
  averageYield: 120,
  difficulty: "Easy"
});

// 2. Crear siembra usando el tipo
const planting = await api.createPlanting({
  plantTypeId: rucula.id,
  datePlanted: "2024-10-01",
  quantity: 300,
  trayNumber: "A-12"
  // expectedHarvest se calcula automáticamente: "2024-10-11"
});

// 3. Actualizar estado durante crecimiento
await api.updatePlanting(planting.id, { 
  status: "GERMINATING" 
});

// 4. Registrar primera cosecha
const harvest1 = await api.createHarvest({
  plantingId: planting.id,
  harvestDate: "2024-10-11",
  weight: 125.5,
  quality: "EXCELLENT",
  pricePerGram: 0.15
  // totalValue: 18.83 (auto-calculado)
  // status de planting → "HARVESTED" (automático)
});

// 5. Segunda cosecha de la misma siembra
const harvest2 = await api.createHarvest({
  plantingId: planting.id,
  harvestDate: "2024-10-18",
  weight: 89.2,
  quality: "GOOD"
});
```

📖 Reference updated: 2025-09-11 (Modelo Híbrido v2.0)