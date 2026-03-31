# Modulo: Core (Home / Dashboard)

**Archivo:** `src/app/modules/core/core.module.ts`
**Ruta:** `/home`

## Responsabilidad

Dashboard principal despues del login. Pagina de inicio del sistema.

## Componentes de Layout

Los componentes de layout se encuentran en `src/app/core/` (no confundir con el modulo `modules/core/`):

| Componente | Ubicacion | Funcion |
|---|---|---|
| HeaderComponent | `core/header/` | Barra superior: notificaciones, indicador SAP, menu usuario |
| SidebarComponent | `core/sidebar/` | Menu lateral de navegacion por modulos |
| BodyComponent | `core/body/` | Contenedor principal del contenido |
| ModuleWrapperComponent | `core/module-wrapper/` | Wrapper para transicion entre modulos |
| NotFoundComponent | `core/not-found/` | Pagina 404 |
| ChangePasswordModalComponent | `core/change-password-modal/` | Modal para cambio de contrasena |

## Indicador de Conectividad SAP

El `HeaderComponent` incluye un badge de estado SAP con polling cada 120s:
- Usa propiedades Angular reactivas (`sapStatus`) con `[ngClass]` y `[ngSwitch]` (sin manipulacion directa del DOM)
- RxJS `interval` con `takeUntil(destroy$)` para cleanup automatico
- Solo muestra "Verificando SAP..." en la carga inicial; polls subsecuentes actualizan silenciosamente
- Estados: `checking` (naranja), `connected` (verde), `disconnected` (rojo) con transicion CSS suave
- Endpoint: `POST /api/sap/verificar_conexion_sap`

## APIs del Header

| Metodo | Endpoint | Descripcion |
|---|---|---|
| POST | `/api/sap/verificar_conexion_sap` | Verificacion de conectividad SAP (poll cada 120s) |
| GET | `/api/notificaciones` | Sistema de notificaciones |
