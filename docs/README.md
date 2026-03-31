# Documentacion CRM360 Monterrey - Indice General

## Estructura de Documentacion

```
docs/
├── README.md                    # Este archivo (indice)
│
├── docker/                      # Documentacion Docker
│   ├── GUIA-DOCKER.md           # Guia completa: comandos, arquitectura, troubleshooting
│   └── CONFIGURACION.md         # Detalle tecnico de cada archivo de configuracion
│
├── arquitectura/                # Arquitectura del proyecto
│   ├── ESTRUCTURA.md            # Estructura de directorios, patrones, ambientes
│   └── STACK-TECNOLOGICO.md     # Stack completo, versiones, integraciones
│
├── modulos/                     # Documentacion por modulo de negocio
│   ├── LOGIN.md                 # Autenticacion
│   ├── CORE.md                  # Home/Dashboard y componentes de layout
│   ├── COMERCIAL.md             # Ventas, cotizaciones, clientes (el mas extenso)
│   ├── ABASTECIMENTO.md         # Inventario y stock
│   ├── ADMIN.md                 # Usuarios, perfiles, permisos
│   ├── CONTROLADORIA.md         # Control contable
│   ├── CORTE-DOBRA.md           # Operaciones industriales
│   ├── FINANCEIRO.md            # Finanzas
│   ├── FISCAL.md                # Fiscal e impuestos
│   ├── LOGISTICA.md             # Logistica y YMS
│   ├── POWER-BI.md              # Dashboards Power BI (INACTIVO)
│   ├── SERVICOS.md              # Servicios
│   ├── SISTEMAS.md              # Configuracion de sistemas
│   ├── SUL-FLUMINENSE.md        # Operaciones regionales
│   ├── TECNOLOGIA-INFORMACAO.md # TI (inventario, lineas)
│   ├── TID-SOFTWARE.md          # Integracion TID
│   └── SHARED.md                # Servicios, componentes y guards compartidos
│
├── DEPENDENCIAS.md              # Analisis de dependencias NPM y compatibilidad
├── BUGS.md                      # Bugs conocidos, problemas de seguridad, recomendaciones
└── MODULOS.md                   # (Legacy) Documentacion consolidada de modulos
```

---

## Guia Rapida por Tema

### Quiero levantar el proyecto con Docker
→ [docker/GUIA-DOCKER.md](docker/GUIA-DOCKER.md)

### Quiero entender la configuracion Docker en detalle
→ [docker/CONFIGURACION.md](docker/CONFIGURACION.md)

### Quiero entender la estructura del proyecto
→ [arquitectura/ESTRUCTURA.md](arquitectura/ESTRUCTURA.md)

### Quiero saber que tecnologias usa el proyecto
→ [arquitectura/STACK-TECNOLOGICO.md](arquitectura/STACK-TECNOLOGICO.md)

### Quiero conocer un modulo especifico
→ [modulos/](modulos/) (un archivo por modulo)

### Quiero ver las dependencias NPM
→ [DEPENDENCIAS.md](DEPENDENCIAS.md)

### Quiero ver bugs y problemas conocidos
→ [BUGS.md](BUGS.md)

---

## Cambios Recientes (Docker)

Se implemento la contenerizacion completa del frontend con Docker:

1. **Dockerfile** (produccion) - Build multi-stage: Node 14 compila Angular → Nginx 1.24-alpine sirve archivos estaticos
2. **Dockerfile.dev** (desarrollo) - Node 16 con `ng serve` y hot-reload via volumenes
3. **docker-compose.yml** - Orquesta 3 servicios: frontend-prod, frontend-dev, backend
4. **nginx.conf** - Servidor web con gzip, SPA routing, proxy reverso al backend, cache de assets
5. **.dockerignore** - Exclusiones para optimizar builds
6. **proxy.config.docker.json** - Proxy de API para desarrollo dentro de Docker
7. **environment.docker.ts** - Configuracion Angular para Docker
8. **Scripts NPM** - `docker:dev`, `docker:prod`, `docker:stop`, `build:docker`, `start:docker`
