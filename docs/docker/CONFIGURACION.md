# Configuracion Docker - Detalle Tecnico

## Archivos de Configuracion

| Archivo | Proposito |
|---|---|
| `Dockerfile` | Build multi-stage para produccion (Node 14 + Nginx 1.24) |
| `Dockerfile.dev` | Contenedor de desarrollo con hot-reload (Node 16) |
| `docker-compose.yml` | Orquestacion de todos los servicios |
| `nginx.conf` | Configuracion del servidor web en produccion |
| `.dockerignore` | Archivos excluidos del contexto de build |
| `proxy.config.docker.json` | Proxy de API para desarrollo en Docker |

---

## docker-compose.yml

```yaml
services:

  # Frontend Produccion - Nginx + Build optimizado
  crm360-front-prod:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: crm360-front-prod
    ports:
      - "4200:80"            # Host:4200 -> Nginx:80
    restart: unless-stopped
    depends_on:
      - crm360-app
    networks:
      - crm360-network

  # Frontend Desarrollo - ng serve + hot-reload
  crm360-front-dev:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: crm360-front-dev
    ports:
      - "4200:4200"          # Host:4200 -> ng serve:4200
    volumes:
      - .:/app               # Monta codigo fuente local
    restart: unless-stopped
    depends_on:
      - crm360-app
    networks:
      - crm360-network

  # Backend - Imagen local pre-construida
  crm360-app:
    image: crm360-monterrey-b-origin-app:latest
    pull_policy: never       # No intenta descargar de Docker Hub
    container_name: crm360-app
    ports:
      - "8080:80"            # Host:8080 -> Backend:80
    networks:
      - crm360-network

networks:
  crm360-network:
    driver: bridge
```

### Decisiones de diseno

- **`pull_policy: never`** en el backend: La imagen se construye localmente desde el repo del backend, no existe en Docker Hub
- **`restart: unless-stopped`**: Los contenedores se reinician automaticamente excepto si se detienen manualmente
- **`depends_on`**: Asegura que el backend arranque antes que el frontend
- **Volumenes en dev**: Monta `.:/app` para que los cambios locales se reflejen inmediatamente

---

## nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Compresion Gzip para mejor rendimiento
    gzip on;
    gzip_types text/plain text/css application/json application/javascript
               text/xml application/xml text/javascript;
    gzip_min_length 256;

    # SPA Routing - todas las rutas van a index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy reverso hacia el backend
    location /api/ {
        proxy_pass http://crm360-app:80/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_read_timeout 120s;
    }

    # Cache agresivo para assets estaticos (1 ano)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Configuracion explicada

| Directiva | Proposito |
|---|---|
| `try_files $uri $uri/ /index.html` | Soporte para Angular hash routing - cualquier ruta no encontrada sirve `index.html` |
| `proxy_pass http://crm360-app:80/` | Redirige peticiones `/api/*` al contenedor backend via red Docker |
| `gzip on` | Comprime respuestas para reducir ancho de banda |
| `expires 1y` + `immutable` | Cache agresivo de assets - Angular usa content hashing en nombres de archivo |
| `proxy_read_timeout 120s` | Timeout de 2 minutos para peticiones largas al backend |

---

## .dockerignore

```
node_modules
dist
.git
.gitignore
*.md
docs
e2e
.editorconfig
.vscode
```

### Proposito

Excluir archivos innecesarios del contexto de build para:
- **Reducir tamano** del contexto enviado al Docker daemon
- **Acelerar builds** al no copiar `node_modules` (se instalan dentro del contenedor)
- **Evitar conflictos** entre `node_modules` del host y del contenedor

---

## Configuraciones de Proxy

### proxy.config.json (Desarrollo local sin Docker)

```json
{
  "/api/*": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}
```

Usado con: `npm start` (fuera de Docker)

### proxy.config.docker.json (Desarrollo en Docker)

```json
{
  "/api/*": {
    "target": "http://host.docker.internal:8080",
    "secure": false,
    "changeOrigin": true
  }
}
```

Usado con: `Dockerfile.dev` (dentro de Docker)

> **Diferencia clave:** Dentro de Docker, `localhost` se refiere al propio contenedor. `host.docker.internal` es el DNS especial que apunta al host (tu maquina).

---

## Environments de Angular para Docker

**Archivo:** `src/environments/environment.docker.ts`

```typescript
export const environment = {
  production: false,
  API: '/api',
  URL_MTCORP: '/api/',
  SAP_API: '/api/'
};
```

Se usa URLs relativas (`/api`) que son interceptadas por el proxy (ng serve o Nginx) y redirigidas al backend.

---

## Scripts NPM Relacionados

Definidos en `package.json`:

```json
{
  "docker:dev": "docker-compose up crm360-front-dev crm360-app --build",
  "docker:prod": "docker-compose up crm360-front-prod crm360-app --build",
  "docker:stop": "docker-compose down",
  "build:docker": "ng build --configuration=docker",
  "start:docker": "ng serve --host 0.0.0.0 --port 4200 --proxy-config proxy.config.docker.json --disable-host-check"
}
```

| Script | Uso |
|---|---|
| `docker:dev` | Levanta frontend (dev) + backend en Docker |
| `docker:prod` | Levanta frontend (prod) + backend en Docker |
| `docker:stop` | Detiene todos los contenedores |
| `build:docker` | Build Angular con configuracion Docker (sin contenedor) |
| `start:docker` | Ejecuta ng serve con proxy Docker (sin contenedor) |
