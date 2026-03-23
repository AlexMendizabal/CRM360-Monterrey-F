# Modulo: Admin (Administracion)

**Archivo:** `src/app/modules/admin/admin.module.ts`
**Ruta:** `/admin`
**Guard:** `AdminGuard`

## Responsabilidad

Administracion del sistema CRM: gestion de usuarios, roles, permisos y logs de actividad.

## Sub-modulos

### Perfis (Perfiles)
- Gestion de roles y permisos del sistema
- Asignacion de perfiles a usuarios
- Control de acceso por modulo

### Usuarios
- CRUD completo de usuarios
- Activacion/desactivacion de cuentas
- Asignacion de perfiles

### Atividades (Actividades)
- Registro de actividades del sistema
- Logs de acceso de usuarios
- Historial de operaciones

## APIs

| Metodo | Endpoint | Descripcion |
|---|---|---|
| GET/POST/PUT | `/api/admin/perfis/*` | Gestion de perfiles |
| GET/POST/PUT | `/api/admin/usuarios/*` | Gestion de usuarios |
| POST | `/api/core/registrar-acesso` | Log de accesos |
