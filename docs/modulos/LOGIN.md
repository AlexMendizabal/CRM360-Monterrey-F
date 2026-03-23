# Modulo: Login

**Archivo:** `src/app/modules/login/login.component.ts`
**Ruta:** `/login`

## Responsabilidad

Autenticacion de usuarios del sistema CRM360.

## Flujo de Autenticacion

1. Usuario ingresa credenciales (usuario + contrasena)
2. Se envia `POST /api/usuario/login` al backend
3. Backend valida y retorna JWT token + datos del usuario
4. Token se almacena en `localStorage` como `currentUser`
5. Redireccion a `/home` o a la URL previa (si existia)

## APIs

| Metodo | Endpoint | Descripcion |
|---|---|---|
| POST | `/api/usuario/login` | Autenticacion principal |
| POST | `http://192.168.0.123:4100/api/Login` | Login SAP (red interna) |

## Servicio Principal

**AuthService** (`shared/services/core/auth.service.ts`)

| Metodo | Descripcion |
|---|---|
| `login()` | Envia credenciales al backend |
| `logout()` | Limpia token y redirige a `/login` |
| `isLoggedIn()` | Verifica si hay sesion activa |
| `getCurrentUser()` | Retorna datos del usuario actual |

## Notas

- El login SAP usa una IP privada hardcodeada (`192.168.0.123:4100`) - solo funciona en red interna
- El token JWT se almacena en `localStorage` (ver BUG-006 en BUGS.md)
- La sesion expirada redirige automaticamente a `/login` via `JwtInterceptor`
