# Guia de Docker - CRM360 Monterrey Frontend

## Descripcion General

El proyecto utiliza Docker para contenerizar tanto el frontend (Angular) como el backend (API REST). Se proporcionan dos modos de ejecucion:

- **Produccion:** Build optimizado servido con Nginx
- **Desarrollo:** Hot-reload con `ng serve` para desarrollo rapido

## Requisitos Previos

- Docker Desktop instalado y corriendo
- Docker Compose v2+
- Para desarrollo: `node_modules` instalados localmente (`npm install --legacy-peer-deps`)
- Imagen del backend disponible localmente: `crm360-monterrey-b-origin-app:latest`

## Comandos Rapidos

```bash
# --- PRODUCCION ---
npm run docker:prod
# o directamente:
docker-compose up crm360-front-prod crm360-app --build

# --- DESARROLLO (hot-reload) ---
npm run docker:dev
# o directamente:
docker-compose up crm360-front-dev crm360-app --build

# --- DETENER TODOS LOS CONTENEDORES ---
npm run docker:stop
# o directamente:
docker-compose down

# --- RECONSTRUIR SIN CACHE ---
docker-compose build --no-cache crm360-front-prod

# --- VER LOGS ---
docker-compose logs -f crm360-front-prod
docker-compose logs -f crm360-front-dev
docker-compose logs -f crm360-app
```

## Arquitectura Docker

```
┌─────────────────────────────────────────────────────────┐
│                   crm360-network (bridge)                │
│                                                          │
│  ┌──────────────────┐    ┌────────────────────────────┐  │
│  │  crm360-front-*  │    │       crm360-app           │  │
│  │                  │    │                            │  │
│  │  PROD: Nginx:80  │───>│  Backend API               │  │
│  │  DEV:  ng:4200   │    │  Puerto interno: 80        │  │
│  │                  │    │                            │  │
│  │  Puerto: 4200    │    │  Puerto: 8080              │  │
│  └──────────────────┘    └────────────────────────────┘  │
│         ↑                          ↑                     │
└─────────|──────────────────────────|─────────────────────┘
          │                          │
     localhost:4200             localhost:8080
      (navegador)              (API directa)
```

## Modo Produccion

### Como funciona

1. **Stage 1 (Build):** Usa `node:14-slim` para compilar Angular con optimizaciones de produccion
2. **Stage 2 (Serve):** Copia el build a `nginx:1.24-alpine` que sirve los archivos estaticos
3. Nginx hace proxy de `/api/*` hacia el contenedor del backend

### Dockerfile (Produccion)

```dockerfile
# Stage 1: Build con Node 14
FROM node:14-slim AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm cache clean --force && npm install --legacy-peer-deps
COPY . .
RUN node --max_old_space_size=8192 ./node_modules/@angular/cli/bin/ng build --prod --configuration=production --build-optimizer

# Stage 2: Serve con Nginx
FROM nginx:1.24-alpine
COPY --from=build /app/dist/mtcorp-app /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Notas importantes

- Se asignan **8GB de RAM** al proceso de Node para el build (`--max_old_space_size=8192`) debido al tamano del proyecto
- Se usa `--legacy-peer-deps` porque hay dependencias con conflictos de version (ej: `@angular/material 16` con Angular 10)
- El build genera archivos en `dist/mtcorp-app/`
- El puerto expuesto al host es **4200** (mapeado desde el puerto 80 interno de Nginx)

## Modo Desarrollo

### Como funciona

1. Usa `node:16-slim` con `ng serve` para hot-reload
2. Monta el codigo fuente local como volumen (cambios se reflejan en tiempo real)
3. Usa `proxy.config.docker.json` para conectar con el backend via Docker network

### Dockerfile.dev (Desarrollo)

```dockerfile
FROM node:16-slim
WORKDIR /app
EXPOSE 4200
CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--port", "4200", \
     "--proxy-config", "proxy.config.docker.json", "--disable-host-check"]
```

### Requisito importante

Antes de levantar el contenedor de desarrollo, **debes tener `node_modules` instalados localmente**:

```bash
npm install --legacy-peer-deps
```

Esto es porque el `Dockerfile.dev` NO ejecuta `npm install`. En su lugar, monta todo el directorio del proyecto como volumen, incluyendo `node_modules/`.

## Servicios Docker Compose

| Servicio | Imagen | Puerto Host | Puerto Interno | Proposito |
|---|---|---|---|---|
| `crm360-front-prod` | Build local (Dockerfile) | 4200 | 80 | Frontend produccion (Nginx) |
| `crm360-front-dev` | Build local (Dockerfile.dev) | 4200 | 4200 | Frontend desarrollo (ng serve) |
| `crm360-app` | `crm360-monterrey-b-origin-app:latest` | 8080 | 80 | Backend API REST |

> **Nota:** No levantes `crm360-front-prod` y `crm360-front-dev` simultaneamente ya que ambos usan el puerto 4200.

## Red Docker

Todos los servicios se conectan a la red `crm360-network` (driver bridge), lo que permite:

- Frontend accede al backend como `http://crm360-app:80`
- No es necesario exponer puertos entre contenedores
- Aislamiento de red del resto de contenedores Docker

## Proxy de API

### Produccion (Nginx)

En produccion, Nginx maneja el proxy de API:

```nginx
location /api/ {
    proxy_pass http://crm360-app:80/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_connect_timeout 60s;
    proxy_read_timeout 120s;
}
```

### Desarrollo (proxy.config.docker.json)

En desarrollo, Angular CLI maneja el proxy:

```json
{
  "/api/*": {
    "target": "http://host.docker.internal:8080",
    "secure": false,
    "changeOrigin": true
  }
}
```

> `host.docker.internal` es un DNS especial de Docker que apunta al host (tu maquina).

## Troubleshooting

### El build de produccion falla con "out of memory"

El proyecto es grande (~428 modulos). Si el build falla por memoria:

```bash
# Aumentar memoria de Docker Desktop (Settings > Resources > Memory > 8GB+)
# O ajustar el parametro en el Dockerfile:
RUN node --max_old_space_size=12288 ./node_modules/@angular/cli/bin/ng build --prod
```

### El contenedor de desarrollo no encuentra node_modules

```bash
# Instalar dependencias localmente primero:
npm install --legacy-peer-deps

# Luego levantar el contenedor:
docker-compose up crm360-front-dev crm360-app --build
```

### El backend no responde

Verificar que la imagen del backend existe:

```bash
docker images | grep crm360-monterrey-b-origin
```

Si no existe, necesitas construirla desde el repositorio del backend.

### Los cambios no se reflejan en desarrollo

Verificar que el volumen esta montado correctamente:

```bash
docker-compose exec crm360-front-dev ls -la /app/src
```

### Limpiar todo y empezar de cero

```bash
docker-compose down --volumes --rmi local
docker system prune -f
```
