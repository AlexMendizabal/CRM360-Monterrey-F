# CRM360 Monterrey - Frontend

## Descripcion General

CRM360 Monterrey es una aplicacion empresarial CRM (Customer Relationship Management) desarrollada en **Angular 10.1.5** para la gestion comercial, logistica, financiera y administrativa. El frontend se conecta a una API REST backend desplegada en contenedores Docker.

**Version:** 1.2.1 | **Nombre interno:** mtcorp-app | **Angular CLI:** 10.1.6

## Inicio Rapido

### Opcion 1: Docker (Recomendado)

```bash
# Produccion (Nginx + build optimizado)
npm run docker:prod

# Desarrollo (hot-reload)
npm install --legacy-peer-deps    # Solo la primera vez
npm run docker:dev

# Detener
npm run docker:stop
```

> Ver [docs/docker/GUIA-DOCKER.md](docs/docker/GUIA-DOCKER.md) para la guia completa.

### Opcion 2: Local (sin Docker)

```bash
npm install --legacy-peer-deps
npm start                          # http://localhost:4200
```

> Requiere backend corriendo en `localhost:8080`.

## Stack Tecnologico

| Tecnologia | Version | Proposito |
|---|---|---|
| Angular | 10.1.5 | Framework principal |
| TypeScript | 4.0.3 | Lenguaje |
| Bootstrap | 4.4.1 | Framework CSS |
| ngx-bootstrap | 5.6.2 | Componentes Bootstrap |
| ngx-translate | 12.0.0 | Internacionalizacion |
| Docker + Nginx | 1.24-alpine | Despliegue produccion |
| Node.js | 14/16 | Build / Desarrollo |

> Ver [docs/arquitectura/STACK-TECNOLOGICO.md](docs/arquitectura/STACK-TECNOLOGICO.md) para el stack completo.

## Arquitectura Docker

```
┌────────────────────────────────────────────────┐
│              crm360-network (bridge)            │
│                                                 │
│  ┌─────────────────┐   ┌────────────────────┐  │
│  │ crm360-front-*  │──>│    crm360-app      │  │
│  │ Nginx:80 / ng:  │   │  Backend API :80   │  │
│  │ Puerto: 4200    │   │  Puerto: 8080      │  │
│  └─────────────────┘   └────────────────────┘  │
└────────────────────────────────────────────────┘
```

| Servicio | Imagen | Puerto |
|---|---|---|
| `crm360-front-prod` | Dockerfile (Node 14 + Nginx) | 4200 |
| `crm360-front-dev` | Dockerfile.dev (Node 16) | 4200 |
| `crm360-app` | crm360-monterrey-b-origin-app | 8080 |

## Modulos de Negocio

El sistema cuenta con **15 modulos** cargados bajo demanda (lazy loading):

| Modulo | Ruta | Descripcion | Docs |
|---|---|---|---|
| Login | `/login` | Autenticacion | [LOGIN.md](docs/modulos/LOGIN.md) |
| Core | `/home` | Dashboard principal | [CORE.md](docs/modulos/CORE.md) |
| Comercial | `/comercial` | Ventas, cotizaciones, clientes | [COMERCIAL.md](docs/modulos/COMERCIAL.md) |
| Abastecimento | `/abastecimento` | Inventario y stock | [ABASTECIMENTO.md](docs/modulos/ABASTECIMENTO.md) |
| Admin | `/admin` | Usuarios, perfiles, permisos | [ADMIN.md](docs/modulos/ADMIN.md) |
| Controladoria | `/controladoria` | Control contable | [CONTROLADORIA.md](docs/modulos/CONTROLADORIA.md) |
| Corte-Dobra | `/corte-dobra` | Corte y doblado industrial | [CORTE-DOBRA.md](docs/modulos/CORTE-DOBRA.md) |
| Financeiro | `/financeiro` | Finanzas | [FINANCEIRO.md](docs/modulos/FINANCEIRO.md) |
| Fiscal | `/fiscal` | Fiscal e impuestos | [FISCAL.md](docs/modulos/FISCAL.md) |
| Logistica | `/logistica` | Logistica y YMS | [LOGISTICA.md](docs/modulos/LOGISTICA.md) |
| Power BI | `/power-bi` | Dashboards (**INACTIVO**) | [POWER-BI.md](docs/modulos/POWER-BI.md) |
| Servicos | `/servicos` | Servicios | [SERVICOS.md](docs/modulos/SERVICOS.md) |
| Sistemas | `/sistemas` | Configuracion de sistemas | [SISTEMAS.md](docs/modulos/SISTEMAS.md) |
| Sul Fluminense | `/sul-fluminense` | Operaciones regionales | [SUL-FLUMINENSE.md](docs/modulos/SUL-FLUMINENSE.md) |
| TI | `/tecnologia-informacao` | Inventario TI, lineas | [TECNOLOGIA-INFORMACAO.md](docs/modulos/TECNOLOGIA-INFORMACAO.md) |
| TID Software | `/tid-software` | Integracion TID | [TID-SOFTWARE.md](docs/modulos/TID-SOFTWARE.md) |

> Servicios y componentes compartidos: [SHARED.md](docs/modulos/SHARED.md)

## Scripts NPM

```bash
# --- Desarrollo ---
npm start                  # Servidor local con proxy (localhost:4200)
npm run build:dev          # Build de desarrollo

# --- Docker ---
npm run docker:dev         # Contenedor desarrollo (hot-reload)
npm run docker:prod        # Contenedor produccion (Nginx)
npm run docker:stop        # Detener contenedores

# --- Builds ---
npm run build:prod         # Build produccion
npm run build:qas          # Build staging/QA
npm run build:docker       # Build configuracion Docker

# --- Calidad ---
npm test                   # Tests unitarios (Karma + Jasmine)
npm run lint               # Linting (TSLint)
npm run e2e                # Tests E2E (Protractor)
```

## Ambientes

| Ambiente | Comando | API |
|---|---|---|
| Desarrollo local | `npm start` | localhost:8080 (proxy) |
| Docker desarrollo | `npm run docker:dev` | crm360-app:80 (Docker network) |
| Docker produccion | `npm run docker:prod` | crm360-app:80 (Nginx proxy) |
| Staging/QA | `npm run build:qas` | https://23.254.204.187 |
| Produccion | `npm run build:prod` | https://23.254.204.187/api/ |

## Integraciones Externas

| Sistema | Proposito | Estado |
|---|---|---|
| SAP | ERP / Login alterno | Activo (red interna) |
| Akna | Email marketing | Activo |
| Arcelor Mittal | Integracion comercial | Activo |
| Power BI | Dashboards | **INACTIVO** |
| Google Maps | Mapas en agenda | Activo |
| ViaCEP / ReceitaWS | Validaciones brasilenas | Activo |

## Documentacion

Toda la documentacion detallada esta en la carpeta [docs/](docs/):

| Seccion | Contenido |
|---|---|
| [docs/docker/](docs/docker/) | Guia Docker, configuracion, troubleshooting |
| [docs/arquitectura/](docs/arquitectura/) | Estructura del proyecto, stack tecnologico |
| [docs/modulos/](docs/modulos/) | Documentacion detallada de cada modulo |
| [docs/DEPENDENCIAS.md](docs/DEPENDENCIAS.md) | Analisis de dependencias NPM |
| [docs/BUGS.md](docs/BUGS.md) | Bugs conocidos y recomendaciones |

> Ver [docs/README.md](docs/README.md) para el indice completo de documentacion.

## Problemas Conocidos

1. **Angular 10 esta EOL** - Sin soporte de seguridad desde Dic 2021
2. **@angular/material 16** incompatible teoricamente con Angular 10
3. **Ivy deshabilitado** - Usa View Engine legacy
4. **120+ URLs de API hardcodeadas** en servicios
5. **Tests deshabilitados globalmente** (`skipTests: true`)

> Ver [docs/BUGS.md](docs/BUGS.md) para detalles completos.

## Estado del Proyecto

| Aspecto | Estado |
|---|---|
| Backend | Docker (`crm360-app`, puerto 8080) |
| Frontend | Docker (Nginx prod / ng serve dev) |
| Idioma | Migracion activa PT → ES |
| CI/CD | No configurado |
| Tests | No existen (skipTests habilitado) |
| SAP | Activo en red interna |
| Power BI | Presente pero INACTIVO |
