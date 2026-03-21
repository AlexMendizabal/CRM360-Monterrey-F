# CRM360 Monterrey - Frontend (mtcorp-app)

## Descripcion General

CRM360 Monterrey es una aplicacion empresarial CRM (Customer Relationship Management) desarrollada en **Angular 10.1.5** para la gestion comercial, logistica, financiera y administrativa de una corporacion. La aplicacion se conecta a una API REST backend desplegada en `23.254.204.187`.

**Version:** 1.2.1
**Nombre interno:** mtcorp-app
**Generado con:** Angular CLI 10.1.6

## Stack Tecnologico

| Tecnologia | Version | Proposito |
|---|---|---|
| Angular | 10.1.5 | Framework principal |
| TypeScript | 4.0.3 | Lenguaje de programacion |
| Angular CLI | 10.1.6 | Herramienta de build/dev |
| Bootstrap | 4.4.1 | Framework CSS / Layout |
| Angular Material | 16.0.0 | Componentes UI (ver nota en BUGS) |
| ngx-bootstrap | 5.6.2 | Componentes Bootstrap para Angular |
| RxJS | 6.6.3 | Programacion reactiva |
| ngx-translate | 12.0.0 | Internacionalizacion (i18n) |
| jQuery | 3.7.0 | Manipulacion DOM (legacy) |
| Ivy | Deshabilitado | Usa View Engine legacy |

## Arquitectura General

```
src/app/
├── core/                    # Componentes layout (Header, Sidebar, Body)
├── guards/                  # Guards de autenticacion y autorizacion
├── interceptors/            # JWT Interceptor para HTTP
├── models/                  # Interfaces TypeScript
├── modules/                 # 15+ modulos de negocio (lazy-loaded)
│   ├── abastecimento/       # Gestion de abastecimiento/stock
│   ├── admin/               # Administracion del sistema
│   ├── comercial/           # Modulo comercial (el mas extenso)
│   ├── controladoria/       # Contabilidad y control
│   ├── core/                # Dashboard/Home
│   ├── corte-dobra/         # Corte y doblado industrial
│   ├── financeiro/          # Finanzas
│   ├── fiscal/              # Fiscal/impuestos
│   ├── login/               # Autenticacion
│   ├── logistica/           # Logistica (YMS, entregas)
│   ├── power-bi/            # Integracion Power BI
│   ├── servicos/            # Servicios
│   ├── sistemas/            # Sistemas
│   ├── sul-fluminense/      # Regional Sul Fluminense
│   ├── tecnologia-informacao/ # TI (inventario, lineas)
│   └── tid-software/        # Integracion TID Software
└── shared/                  # Servicios, pipes, directivas compartidas
    ├── services/core/       # Auth, PDF, XLSX, Date, Router, PNotify
    ├── services/requests/   # Servicios de API genericos
    ├── services/ws/         # Servicios web externos (CEP, CNPJ)
    ├── modules/             # Componentes compartidos
    ├── pipes/               # Pipes personalizados
    └── directives/          # Directivas personalizadas
```

## Estadisticas del Proyecto

| Metrica | Cantidad |
|---|---|
| Modulos (*.module.ts) | 428 |
| Servicios (*.service.ts) | 334 |
| Modulos de negocio principales | 15 |
| Rutas lazy-loaded | 15 |
| Guards de autorizacion | 14 |

## Autenticacion

- **Metodo:** JWT (JSON Web Token)
- **Flujo:** Login -> Token en localStorage -> JwtInterceptor agrega Bearer token
- **Guard:** `AuthGuard` protege todas las rutas excepto `/login`
- **Sesion expirada:** Redireccion automatica a `/login`

## Ambientes

| Ambiente | Comando | URL API |
|---|---|---|
| Development | `npm start` | `http://23.254.204.187/api/` (via proxy) |
| Staging/QA | `npm run build:qas` | `https://23.254.204.187` |
| Production | `npm run build:prod` | `https://23.254.204.187` |

## Scripts NPM

```bash
npm start              # Servidor de desarrollo con proxy
npm run build:prod     # Build de produccion
npm run build:qas      # Build de staging/QA
npm run build:dev      # Build de desarrollo optimizado
npm test               # Tests unitarios (Karma + Jasmine)
npm run lint           # Linting con TSLint
npm run e2e            # Tests E2E con Protractor
```

## Integraciones Externas

| Sistema | Proposito | Tipo |
|---|---|---|
| SAP | ERP / Login alterno | API interna (192.168.x.x) |
| Akna | Email marketing | API externa |
| Arcelor Mittal | Integracion comercial | API |
| Dagda | Integracion de datos | API |
| Power BI | Dashboards / Reportes | **INACTIVO** |
| Google Maps / AGM | Mapas en modulo Agenda | API |
| ViaCEP | Codigos postales Brasil | API publica |
| ReceitaWS | Validacion CNPJ | API publica |

## Documentacion Detallada

Consultar la carpeta `docs/` para documentacion completa:

- [docs/MODULOS.md](docs/MODULOS.md) - Descripcion detallada de cada modulo, sub-modulos, APIs y flujos
- [docs/BUGS.md](docs/BUGS.md) - Bugs encontrados, problemas de seguridad y recomendaciones
- [docs/DEPENDENCIAS.md](docs/DEPENDENCIAS.md) - Analisis de todas las dependencias, versiones y compatibilidad

## Notas Importantes / Problemas Conocidos

1. **Angular 10 esta EOL** - Sin soporte de seguridad desde Dic 2021
2. **@angular/material 16** es incompatible con Angular 10 (requiere Angular 16)
3. **Ivy deshabilitado** - Usa View Engine legacy, bloqueando migracion a Angular 13+
4. **120+ URLs de API hardcodeadas** en servicios (no usan `environment.ts`)
5. **284+ console.log** dejados en codigo
6. **Tests deshabilitados globalmente** (`skipTests: true` en angular.json)

Ver [docs/BUGS.md](docs/BUGS.md) para detalles completos y soluciones recomendadas.

## Estado del Proyecto

- **Backend:** Documentado con archivos .md locales, corriendo en Docker (`http://localhost:8080/`), sin Swagger
- **Idioma:** Migracion activa de portugues a espanol (usando ngx-translate)
- **CI/CD:** No configurado
- **Tests:** No existen (skipTests habilitado globalmente)
- **SAP:** Activo en red interna (`192.168.0.123:4100`)
- **Power BI:** Modulo presente pero NO funcional
- **Google Maps:** Usado en modulo Agenda (AgmCoreModule comentado en app.module, debe habilitarse)
- **@angular/material 16:** Funciona actualmente para detalles especificos pese a incompatibilidad teorica
