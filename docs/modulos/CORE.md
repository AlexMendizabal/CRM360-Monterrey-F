# Modulo: Core (Home / Dashboard)

**Archivo:** `src/app/modules/core/core.module.ts`
**Ruta:** `/home`

## Responsabilidad

Dashboard principal despues del login. Pagina de inicio del sistema.

## Componentes de Layout

Los componentes de layout se encuentran en `src/app/core/` (no confundir con el modulo `modules/core/`):

| Componente | Ubicacion | Funcion |
|---|---|---|
| HeaderComponent | `core/header/` | Barra superior: notificaciones, sincronizacion SAP, menu usuario |
| SidebarComponent | `core/sidebar/` | Menu lateral de navegacion por modulos |
| BodyComponent | `core/body/` | Contenedor principal del contenido |
| ModuleWrapperComponent | `core/module-wrapper/` | Wrapper para transicion entre modulos |
| NotFoundComponent | `core/not-found/` | Pagina 404 |
| ChangePasswordModalComponent | `core/change-password-modal/` | Modal para cambio de contrasena |

## APIs del Header

| Metodo | Endpoint | Descripcion |
|---|---|---|
| GET/POST | `/api/sap/*` | Sincronizacion con sistema SAP |
| GET | `/api/notificaciones` | Sistema de notificaciones |
