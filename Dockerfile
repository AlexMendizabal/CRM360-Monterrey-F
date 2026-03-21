# =============================================
# Dockerfile - PRODUCCION
# Build multi-stage: Node (build) + Nginx (serve)
# =============================================

# --- Stage 1: Build ---
FROM node:14-slim AS build

WORKDIR /app

# Copiar package.json primero para cache de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm cache clean --force && npm install --legacy-peer-deps --prefer-offline || npm install --legacy-peer-deps

# Copiar codigo fuente
COPY . .

# Build de produccion
RUN node --max_old_space_size=8192 ./node_modules/@angular/cli/bin/ng build --prod --configuration=production --build-optimizer

# --- Stage 2: Serve con Nginx ---
FROM nginx:1.24-alpine

# Copiar build de Angular al directorio de Nginx
COPY --from=build /app/dist/mtcorp-app /usr/share/nginx/html

# Copiar configuracion de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
