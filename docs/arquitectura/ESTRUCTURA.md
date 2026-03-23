# Estructura del Proyecto - CRM360 Monterrey Frontend

## Estructura de Directorios

```
CRM360-Monterrey-F/
│
├── src/                              # Codigo fuente
│   ├── app/
│   │   ├── app.module.ts             # Modulo raiz
│   │   ├── app.component.ts          # Componente raiz
│   │   ├── app-routing.module.ts     # Rutas principales (15 lazy-loaded)
│   │   │
│   │   ├── core/                     # Componentes de layout
│   │   │   ├── header/               # Barra superior (notificaciones, SAP, usuario)
│   │   │   ├── sidebar/              # Menu lateral de navegacion
│   │   │   ├── body/                 # Contenedor principal
│   │   │   ├── module-wrapper/       # Wrapper de cambio entre modulos
│   │   │   ├── not-found/            # Pagina 404
│   │   │   └── change-password-modal/# Modal cambio de contrasena
│   │   │
│   │   ├── modules/                  # Modulos de negocio (lazy-loaded)
│   │   │   ├── login/                # Autenticacion
│   │   │   ├── comercial/            # Ventas, cotizaciones, clientes (el mas grande)
│   │   │   ├── abastecimento/        # Gestion de inventario/stock
│   │   │   ├── admin/                # Administracion (usuarios, perfiles)
│   │   │   ├── controladoria/        # Control contable
│   │   │   ├── corte-dobra/          # Operaciones de corte y doblado
│   │   │   ├── financeiro/           # Finanzas (cuentas por cobrar/pagar)
│   │   │   ├── fiscal/               # Fiscal e impuestos
│   │   │   ├── logistica/            # Logistica y YMS
│   │   │   ├── power-bi/             # Dashboards Power BI (INACTIVO)
│   │   │   ├── servicos/             # Servicios
│   │   │   ├── sistemas/             # Configuracion de sistemas
│   │   │   ├── sul-fluminense/       # Operaciones regionales
│   │   │   ├── tecnologia-informacao/# TI (inventario, lineas)
│   │   │   └── tid-software/         # Integracion TID
│   │   │
│   │   ├── shared/                   # Codigo compartido
│   │   │   ├── services/
│   │   │   │   ├── core/             # AuthService, PdfService, XlsxService, etc.
│   │   │   │   ├── requests/         # Servicios de API genericos
│   │   │   │   └── ws/               # Servicios web externos (CEP, CNPJ)
│   │   │   ├── modules/              # Componentes compartidos (Breadcrumb, Modal, etc.)
│   │   │   ├── pipes/                # Pipes personalizados
│   │   │   ├── directives/           # Directivas personalizadas
│   │   │   ├── providers/            # Window, URL Serializer
│   │   │   └── templates/            # Templates reutilizables
│   │   │
│   │   ├── guards/                   # 14 guards de autorizacion
│   │   ├── interceptors/             # JWT HTTP interceptor
│   │   ├── models/                   # Interfaces TypeScript
│   │   ├── pipes/                    # Modulo de pipes
│   │   └── providers/                # Providers globales
│   │
│   ├── environments/                 # Configuraciones por ambiente
│   │   ├── environment.ts            # Desarrollo (proxy local)
│   │   ├── environment.prod.ts       # Produccion (IP directa)
│   │   ├── environment.staging.ts    # Staging/QA
│   │   └── environment.docker.ts     # Docker (proxy interno)
│   │
│   ├── assets/
│   │   ├── i18n/                     # Traducciones (pt.json, es.json, en.json)
│   │   ├── images/                   # Logos, iconos, fondos
│   │   └── scss/                     # Estilos compartidos
│   │
│   ├── index.html                    # HTML principal
│   ├── main.ts                       # Punto de entrada
│   ├── styles.scss                   # Estilos globales
│   └── polyfills.ts                  # Polyfills de navegador
│
├── docs/                             # Documentacion del proyecto
│   ├── docker/                       # Guias y config Docker
│   ├── arquitectura/                 # Arquitectura y stack
│   └── modulos/                      # Documentacion por modulo
│
├── dist/                             # Build compilado (generado)
├── e2e/                              # Tests E2E (Protractor)
├── node_modules/                     # Dependencias (generado)
│
├── Dockerfile                        # Build produccion (Node 14 + Nginx)
├── Dockerfile.dev                    # Build desarrollo (Node 16 + ng serve)
├── docker-compose.yml                # Orquestacion de servicios
├── nginx.conf                        # Config Nginx para produccion
├── .dockerignore                     # Exclusiones de build Docker
│
├── angular.json                      # Configuracion Angular CLI
├── package.json                      # Dependencias y scripts NPM
├── tsconfig.json                     # Configuracion TypeScript
├── proxy.config.json                 # Proxy API (desarrollo local)
├── proxy.config.docker.json          # Proxy API (desarrollo Docker)
└── README.md                         # Documentacion principal
```

## Patron de Arquitectura

### Lazy Loading

Todos los modulos de negocio se cargan bajo demanda (lazy loading) via `app-routing.module.ts`:

```typescript
{
  path: 'comercial',
  loadChildren: () => import('./modules/comercial/comercial.module').then(m => m.ComercialModule),
  canActivate: [AuthGuard, ComercialGuard]
}
```

Cada ruta esta protegida por:
1. **AuthGuard** - Verifica que el usuario tiene sesion activa (JWT valido)
2. **[Modulo]Guard** - Verifica que el usuario tiene permisos para ese modulo

### Flujo de Autenticacion

```
[Login] ──> POST /api/usuario/login ──> JWT Token
                                           │
                                           ▼
                                    localStorage.setItem('currentUser', token)
                                           │
                                           ▼
                                    JwtInterceptor agrega Bearer token
                                    a todas las peticiones HTTP
                                           │
                                           ▼
                                    AuthGuard verifica token en cada navegacion
```

### Patron de Comunicacion con API

```
Componente ──> Servicio ──> HttpClient ──> JwtInterceptor ──> Backend API
                                               │
                                        [Agrega headers:]
                                        - Authorization: Bearer {token}
                                        - X-User-Info: btoa(user.info)
                                        - Content-Type: application/json
                                               │
                                        [Maneja errores:]
                                        - 401 → Logout automatico
```

### Patron de Modulos

Cada modulo de negocio sigue esta estructura:

```
modulo/
├── modulo.module.ts            # Declaracion del modulo
├── modulo-routing.module.ts    # Rutas internas del modulo
├── services/                   # Servicios HTTP del modulo
├── sub-modulo-1/
│   ├── lista/                  # Componente de listado
│   │   ├── lista.component.ts
│   │   ├── lista.component.html
│   │   └── lista.component.scss
│   ├── formulario/             # Componente de formulario (CRUD)
│   │   ├── formulario.component.ts
│   │   ├── formulario.component.html
│   │   └── formulario.component.scss
│   └── dashboard/              # Componente de dashboard (si aplica)
└── sub-modulo-2/
    └── ...
```

## Ambientes

| Ambiente | Archivo | API URL | Comando |
|---|---|---|---|
| Desarrollo | `environment.ts` | `/api` (via proxy a localhost:8080) | `npm start` |
| Docker | `environment.docker.ts` | `/api` (via proxy Docker) | `npm run docker:dev` |
| Staging | `environment.staging.ts` | `https://23.254.204.187` | `npm run build:qas` |
| Produccion | `environment.prod.ts` | `https://23.254.204.187/api/` | `npm run build:prod` |

## Estadisticas

| Metrica | Cantidad |
|---|---|
| Modulos (*.module.ts) | 428 |
| Servicios (*.service.ts) | 334 |
| Modulos de negocio | 15 |
| Rutas lazy-loaded | 15 |
| Guards de autorizacion | 14 |
| Idiomas soportados | 3 (PT, ES, EN) |
