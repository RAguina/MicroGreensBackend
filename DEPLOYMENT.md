# 🚀 Deployment Guide - MicroGreens Backend

## 📋 Variables de Entorno para Vercel

### **🔧 Configuración Requerida en Vercel Dashboard:**

Ir a tu proyecto en Vercel → Settings → Environment Variables y agregar estas variables:

```env
# 🗄️ BASE DE DATOS
DATABASE_URL=tu_url_completa_de_neon_tech_aqui

# 🔐 SEGURIDAD 
JWT_SECRET=tu_jwt_secret_generado_aqui

# 🌍 ENTORNO
NODE_ENV=production

# 🌐 CORS - URL del frontend en Vercel
FRONTEND_URL=https://tu-frontend-app.vercel.app

# 📡 PUERTO (opcional)
PORT=5000
```

### **🚨 IMPORTANTE - Antes del Deploy:**

1. **Generar JWT_SECRET seguro:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Obtener DATABASE_URL de Neon Tech:**
   - Ir a tu dashboard de Neon
   - Copiar la URL de conexión completa
   - Formato: `postgresql://user:pass@host:5432/db?sslmode=require`

3. **Actualizar FRONTEND_URL:**
   - Obtener la URL real de tu frontend deployado en Vercel
   - Ejemplo: `https://microgreens-frontend-abc123.vercel.app`
   - ⚠️ NO incluir barra final `/`

---

## 🔧 Configuración Local

### **Setup para desarrollo:**

1. **Copiar variables de entorno:**
   ```bash
   cp .env.example .env
   ```

2. **Completar .env con tus valores:**
   ```env
   DATABASE_URL="tu_url_de_neon_tech_aqui"
   JWT_SECRET="tu_secreto_generado_aqui"
   FRONTEND_URL=http://localhost:3000
   ```

3. **Instalar dependencias:**
   ```bash
   npm install
   ```

4. **Sincronizar base de datos:**
   ```bash
   npm run db:push
   npm run db:generate
   ```

---

## 📝 Deploy en Vercel

### **1. Conectar Repositorio:**
- Ir a vercel.com
- Import Git Repository
- Seleccionar: `https://github.com/RAguina/MicroGreensBackend.git`

### **2. Configurar Build Settings:**
- **Framework Preset:** Other
- **Build Command:** (dejar vacío)
- **Output Directory:** (dejar vacío)
- **Install Command:** `npm install`

### **3. Agregar Variables de Entorno:**
- En el dashboard, ir a Settings → Environment Variables
- Agregar las variables listadas arriba con TUS valores reales

### **4. Deploy:**
- Click "Deploy"
- Vercel detectará automáticamente el `vercel.json`

---

## 🔍 Verificar Deploy

### **Health Check:**
```bash
curl https://tu-backend-app.vercel.app/health
```

**Respuesta esperada:**
```json
{
  "status": "OK",
  "timestamp": "2024-10-10T15:30:00.000Z",
  "environment": "production"
}
```

### **Test de CORS:**
```bash
curl -H "Origin: https://tu-frontend-app.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://tu-backend-app.vercel.app/api/plantings
```

---

## 🐛 Troubleshooting

### **Error: Database Connection**
- ✅ Verificar que `DATABASE_URL` esté correcta en Vercel
- ✅ Confirmar que Neon Tech esté activo
- ✅ Revisar logs en Vercel Dashboard → Functions

### **Error: CORS**
- ✅ Verificar que `FRONTEND_URL` coincida exactamente
- ✅ No incluir barra final `/` en `FRONTEND_URL`
- ✅ Incluir `credentials: 'include'` en fetch del frontend

### **Error: JWT**
- ✅ Verificar que `JWT_SECRET` esté configurado
- ✅ Regenerar secreto si es necesario
- ✅ Verificar que las cookies se estén enviando

### **Error: 404 en rutas**
- ✅ Verificar que `vercel.json` esté en la raíz
- ✅ Confirmar que todas las rutas apunten a `/app.js`

---

## 📊 Monitoreo Post-Deploy

### **URLs Importantes:**
- Backend: `https://tu-backend-app.vercel.app`
- Health: `https://tu-backend-app.vercel.app/health`
- API Docs: Revisar `API_DOCUMENTATION.md`

### **Logs en Vercel:**
- Dashboard → Functions → Ver logs en tiempo real
- Monitorear errores de autenticación
- Verificar conexiones a base de datos

---

## 🔄 Updates y Re-Deploy

### **Deploy Automático:**
- Push a `main` branch → Deploy automático
- Vercel detecta cambios y redeploya

### **Variables de Entorno:**
- Cambios en variables requieren re-deploy manual
- Settings → Environment Variables → Save → Redeploy

---

## 🌟 Optimizaciones de Producción

### **Performance:**
- ✅ Rate limiting configurado
- ✅ Compression habilitada  
- ✅ Security headers configurados

### **Seguridad:**
- ✅ HTTPS forzado en Vercel
- ✅ Cookies HttpOnly y Secure
- ✅ CORS específico configurado
- ✅ Variables sensibles en Vercel (no en código)

### **Monitoring:**
- Considerar Vercel Analytics
- Configurar alertas de uptime
- Monitorear usage de Neon Tech

---

## 📋 Checklist Final

**Antes del primer deploy:**
- [ ] `.env` configurado localmente con TUS valores
- [ ] Variables de entorno configuradas en Vercel
- [ ] JWT_SECRET generado con comando crypto
- [ ] DATABASE_URL obtenida de Neon Tech
- [ ] FRONTEND_URL apunta a la URL real del frontend
- [ ] vercel.json existe en la raíz
- [ ] Base de datos Neon Tech activa y accesible

**Después del deploy:**
- [ ] Health check responde OK
- [ ] CORS funciona con frontend  
- [ ] Autenticación funciona correctamente
- [ ] APIs de plantings responden
- [ ] Logs sin errores críticos
- [ ] Frontend puede conectarse al backend

---

## 🔐 Generación de Secretos

### **JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### **Validar variables:**
```bash
# Verificar que todas las variables estén configuradas
echo $DATABASE_URL
echo $JWT_SECRET  
echo $FRONTEND_URL
```

---

**🚀 ¡Listo para producción!** - Backend seguro y deployado

*Guía actualizada: 2025-09-10*