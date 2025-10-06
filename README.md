# 🎨 Plan de Acción — Frontend (React + Vite + Tailwind)

SPA que consume la API FastAPI.  
**Backend PROD**: https://fastapi-back-600959037813.us-east1.run.app

---

## 🧱 Stack
- React + Vite (TypeScript)
- Tailwind CSS
- React Router DOM
- Fetch API con JWT

---

## 📂 Estructura del repo
```
.
├─ public/
├─ src/
├─ .env.development
├─ .env.production
├─ index.html
├─ package.json
├─ tailwind.config.js
├─ postcss.config.js
├─ tsconfig.json
└─ vite.config.ts
```

---

## ✅ Requisitos
- Node.js 18+
- npm 9+ (o PNPM/Yarn)

---

## 🚀 Setup local

1) Clonar e instalar
```bash
git clone https://github.com/nedo8680/plan-accion-front-end.git
cd plan-accion-front-end
npm i
```

2) Variables de entorno (desarrollo)
```env
# .env (o usa .env.development)
VITE_API_URL=http://localhost:8000
```

3) Ejecutar
```bash
npm run dev
```
- Frontend: `http://localhost:5173`

---

## 🔐 Autenticación
1. Login en el backend: `POST /auth/token` (x-www-form-urlencoded).  
2. Guardar token (p. ej. `localStorage`).  
3. Enviar `Authorization: Bearer <token>` en cada llamada.

---

## 📦 Scripts
- `npm run dev` — desarrollo
- `npm run build` — build de producción (`dist/`)
- `npm run preview` — previsualizar build

---

## ☁️ Deploy en Netlify

1) **New site from Git** → conectar este repo.  
2) **Environment variables**:
```env
VITE_API_URL=https://fastapi-back-600959037813.us-east1.run.app
```
3) **Build settings**  
```
Build command: npm run build
Publish directory: dist
```
4) **Routing SPA**: añade `public/_redirects` con:
```
/*  /index.html  200
```
5) En el backend agrega el dominio de Netlify a `CORS_ORIGINS`.

---

## 🐳 Docker (opcional)

**Dockerfile** (sirve `dist/` con Nginx):
```dockerfile
# Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
RUN printf "server { listen 80; root /usr/share/nginx/html; location / { try_files \$uri /index.html; } }\n" > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
```

**Build & Run**
```bash
docker build -t plan-frontend .
docker run -d -p 5173:80 plan-frontend
# http://localhost:5173
```

---

## 🧪 Prueba punta a punta
1. Backend local (`uvicorn app.main:app --reload`) o URL de Cloud Run.  
2. Front local (`npm run dev`) o Netlify.  
3. Login → crear Plan → crear Seguimiento.

---

## 🧰 Troubleshooting
| Problema | Causa | Solución |
|---|---|---|
| `401 Unauthorized` | Token ausente / expirado | Reautenticar y limpiar `localStorage` |
| CORS bloquea | Origen no permitido | Agrega el dominio real en `CORS_ORIGINS` del backend |
| Rutas rotas en prod | Falta fallback SPA | Asegura `public/_redirects` |
| Imágenes no cargan | Ruta incorrecta | Usa `/img.png` (assets en `/public`) |

---

## 📄 Licencia
MIT 
