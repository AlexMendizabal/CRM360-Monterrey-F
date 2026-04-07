# Bugs, Errores y Problemas Conocidos - CRM360 Monterrey

## Indice

1. [Criticos - Incompatibilidades de Version](#1-criticos---incompatibilidades-de-version)
2. [Altos - URLs Hardcodeadas](#2-altos---urls-hardcodeadas)
3. [Altos - Seguridad](#3-altos---seguridad)
4. [Medios - Memory Leaks](#4-medios---memory-leaks)
5. [Medios - Console.log en Produccion](#5-medios---consolelog-en-produccion)
6. [Bajos - Codigo Muerto y Comentado](#6-bajos---codigo-muerto-y-comentado)
7. [Bajos - Configuracion](#7-bajos---configuracion)
8. [Recomendaciones Generales](#8-recomendaciones-generales)

---

## Correcciones Realizadas (2026-04-03)

### Environments (BUG-004, BUG-005, BUG-014)
- **environment.prod.ts**: Eliminado espacio al inicio de `URL_MTCORP`, agregado `/api/` faltante
- **environment.staging.ts**: Mismo fix
- **environment.ts**: Limpiados comentarios viejos
- **Todos los environments**: Agregado `SAP_API` para centralizar IP SAP (antes hardcodeada)

### Seguridad (BUG-008)
- **app.module.ts**: Eliminada API Key de Google Maps del codigo comentado + import muerto `AgmCoreModule`

### URLs Hardcodeadas (BUG-004, BUG-005, BUG-015)
- **auth.service.ts**: `changePassword()` y `loginSAP()` ahora usan `environment.URL_MTCORP` y `environment.SAP_API`
- **generic.service.ts**: URL hardcodeada reemplazada por `environment.URL_MTCORP`
- **header.component.ts**: URL SAP hardcodeada reemplazada por `environment.URL_MTCORP`
- **url-rewrite.interceptor.ts**: `PROD_BASE` ahora usa `environment.URL_MTCORP`
- **Modulo ofertas** (3 servicios): URLs de produccion reemplazadas por `environment.API`

### Codigo muerto y debugging (BUG-010, BUG-011, BUG-012)
- **jwt.interceptor.ts**: Eliminado bloque debug comentado (idVendedor = 1)
- **auth.service.ts**: Limpiado codigo comentado en `sessionExpired()`
- **login.component.ts**: Eliminado bloque SAP con credenciales hardcodeadas, usuario debug 'Xuxa'
- **header.component.ts**: Eliminados 3 bloques `finalize` vacios, bloque `getModulos` comentado viejo
- **Modulo ofertas**: 103 console.log eliminados en 10 archivos

### Routing (NUEVOS)
- **ciclo-vendas-routing.module.ts**: Eliminada ruta duplicada `ofertas` que cargaba `cotacoes.module`, eliminada ruta duplicada `autorizaciones`
- **ofertas-routing.module.ts**: Guard import corregido (local en vez de cotacoes), ruta duplicada `registrar` eliminada, parametro `:codCotacao` renombrado a `:codOferta`

### Template Error (NUEVO)
- **finalizacion.component.html**: Agregado `</div>` faltante que cerraba `modal-body` — causaba error de compilacion

### Memory Leaks (BUG-009)
- **ofertas/lista.component.ts**: Implementado `OnDestroy` + `takeUntil(destroy$)` en subscripcion `activatedRoute.params`
- **ofertas/formulario.component.ts**: Agregado `takeUntil(destroy$)` en 5 subscripciones sin cleanup

### Calidad de codigo
- **lista.service.ts**: Limpiados imports no usados
- **formulario.service.ts**: Eliminado import `forkJoin` no usado
- **lista.component.ts**: Variable `campanhasSOfertasServiceervice` renombrada a `ofertasService`

---

## 1. Criticos - Incompatibilidades de Version

### BUG-001: @angular/material 16 incompatible con Angular 10

**Severidad:** MEDIA (funciona actualmente pero es riesgo latente)

**Descripcion:** El `package.json` declara `@angular/material: ^16.0.0` pero el proyecto usa Angular 10.1.5. Angular Material 16 requiere Angular 16. **NOTA:** Segun el equipo, se agrego para detalles especificos y funciona actualmente, pero la incompatibilidad teorica es un riesgo para actualizaciones futuras.

**Archivo:** `package.json:26`

**Solucion:** Al migrar Angular, alinear la version de Material con la version de Angular correspondiente.

---

### BUG-002: Angular 10 esta End of Life (EOL)

**Severidad:** CRITICA

**Descripcion:** Angular 10 dejo de recibir soporte en diciembre 2021. No recibe parches de seguridad ni bugfixes.

**Impacto:** Vulnerabilidades de seguridad sin parche, incompatibilidad con librerias modernas.

**Solucion:** Planificar migracion progresiva: Angular 10 -> 11 -> 12 -> ... -> 17+

---

### BUG-003: Ivy deshabilitado (View Engine legacy)

**Severidad:** ALTA

**Descripcion:** `angular.json` tiene `"enableIvy": false`. View Engine fue removido en Angular 13+, bloqueando cualquier actualizacion futura.

**Archivo:** `angular.json` (angularCompilerOptions)

**Solucion:** Habilitar Ivy y resolver cualquier incompatibilidad antes de migrar versiones.

---

## 2. Altos - URLs Hardcodeadas

### BUG-004: 120+ URLs de API hardcodeadas en servicios

**Severidad:** ALTA

**Descripcion:** Los servicios tienen URLs de API hardcodeadas directamente en vez de usar `environment.ts`. Esto impide cambiar entre ambientes sin modificar codigo.

**Ejemplos:**

| Archivo | Linea | URL Hardcodeada |
|---|---|---|
| `shared/services/core/auth.service.ts` | 18 | `http://23.254.204.187/api/usuario` |
| `shared/services/core/auth.service.ts` | 60 | `http://23.254.204.187/api/core/contra-senha` |
| `shared/services/requests/generic.service.ts` | 12 | `http://23.254.204.187/api/common` |
| `modules/comercial/services/clientes.service.ts` | 15 | `http://23.254.204.187/api/comercial/clientes` |
| `core/header/header.component.ts` | - | `http://23.254.204.187/api/sap` |
| `core/header/notificaciones/notificaciones.service.ts` | 52 | `http://23.254.204.187/api` |

**El archivo `environment.ts` EXISTE con `URL_MTCORP` pero NO se usa en la mayoria de servicios.**

**Solucion:** Reemplazar todas las URLs hardcodeadas con `environment.URL_MTCORP`:
```typescript
// ANTES (mal)
private readonly API = 'http://23.254.204.187/api/usuario';

// DESPUES (bien)
private readonly API = `${environment.URL_MTCORP}usuario`;
```

---

### BUG-005: IP privada SAP hardcodeada

**Severidad:** ALTA

**Descripcion:** El servicio de login SAP usa IP privada `192.168.0.123:4100` directamente en el codigo.

**Archivo:** `shared/services/core/auth.service.ts:47`

**Solucion:** Agregar `SAP_API` al `environment.ts` y usarlo dinamicamente.

---

## 3. Altos - Seguridad

### BUG-006: Token JWT en localStorage

**Severidad:** ALTA

**Descripcion:** El token JWT se almacena en `localStorage`, vulnerable a ataques XSS. Si un atacante inyecta JavaScript, puede robar el token.

**Archivo:** `shared/services/core/auth.service.ts:86`

**Solucion:** Considerar usar `HttpOnly cookies` para almacenar tokens, o implementar Content Security Policy (CSP) estricta.

---

### BUG-007: Informacion de usuario en header como base64 (no cifrada)

**Severidad:** MEDIA

**Descripcion:** El interceptor envia `X-User-Info: btoa(JSON.stringify(user.info))` - esto es solo encoding base64, NO es cifrado. Cualquiera puede decodificarlo.

**Archivo:** `interceptors/jwt.interceptor.ts:38`

**Solucion:** Si la informacion del usuario es sensible, enviar solo el token y que el backend extraiga la info del JWT.

---

### BUG-008: API Key de Google Maps expuesta en codigo comentado

**Severidad:** MEDIA

**Descripcion:** Hay una API key de Google Maps comentada pero visible en el codigo fuente.

**Archivo:** `app.module.ts:56-58`
```typescript
/* AgmCoreModule.forRoot({
    apiKey: 'AIzaSyDl5b7STz9xYNDhybTTer2POVncX9FYqCc'
}) */
```

**Solucion:** Remover la key del codigo y usar variables de ambiente. Revocar la key si fue expuesta publicamente.

---

## 4. Medios - Memory Leaks

### BUG-009: Subscripciones sin unsubscribe

**Severidad:** MEDIA

**Descripcion:** Multiples componentes usan `.subscribe()` sin limpiar subscripciones en `ngOnDestroy()`, causando memory leaks.

**Ejemplo critico:**
- `modules/logistica/yms/setores/lista/lista.component.ts:160` - `showDetailPanelSubscription` nunca se limpia
- `modules/comercial/reporte/lista/lista.component.ts` - Multiples subscripciones sin cleanup

**Solucion:** Implementar patron `takeUntil` o `async pipe`:
```typescript
private destroy$ = new Subject<void>();

ngOnInit() {
  this.service.getData()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => { ... });
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

---

## 5. Medios - Console.log en Produccion

### BUG-010: 284+ console.log en codigo de produccion

**Severidad:** MEDIA

**Descripcion:** Cientos de `console.log`, `console.error` dejados en el codigo, exponiendo datos internos en la consola del navegador.

**Archivos mas afectados:**

| Archivo | Cantidad |
|---|---|
| `modules/comercial/reporte/lista/lista.component.ts` | 15+ |
| `modules/logistica/yms/etapas/associacao-setores/associacao-setores.component.ts` | 6+ |
| `modules/comercial/ciclo-vendas/cotacoes/lista/lista.component.ts` | 10+ |
| `modules/comercial/ciclo-vendas/pedidos-producao-telas/lista/lista.component.ts` | 5+ |
| `modules/tecnologia-informacao/controle-linhas/*/` | 5+ |

**Solucion:**
1. Eliminar todos los `console.log` de debugging
2. Implementar un `LoggerService` con niveles (debug/info/warn/error)
3. Deshabilitar logs en produccion automaticamente

---

## 6. Bajos - Codigo Muerto y Comentado

### BUG-011: Codigo debug comentado extensivamente

**Severidad:** BAJA

**Descripcion:** 50+ bloques de codigo comentado (console.log, variables, logica) contaminan el codigo. Dificulta la lectura y mantenimiento.

**Archivos mas afectados:**
- `modules/comercial/ciclo-vendas/cotacoes/lista/lista.component.ts` (20+ lineas)
- `modules/comercial/ciclo-vendas/pedidos-producao-telas/lista/lista.component.ts` (15+ lineas)
- `modules/corte-dobra/dashboard/dashboard.service.ts`
- `modules/comercial/templates/filtro-vendedor-escritorio*/`
- `core/sidebar/sidebar.component.ts`

**Solucion:** Limpiar todo el codigo comentado. Si es necesario conservar historial, para eso esta Git.

---

### BUG-012: Codigo debug comentado en interceptor

**Severidad:** BAJA

**Descripcion:** El `JwtInterceptor` tiene un bloque de debug comentado que cambiaba el `idVendedor` a 1.

**Archivo:** `interceptors/jwt.interceptor.ts:28-31`
```typescript
// ERROR MODULO COMERCIAL - LISTA CLIENTES
// La idVendedor del administrador es 88
// Y no permite acceder a Registros ("Cadastros") del cliente
/* user.info.idVendedor = 1; */
```

**Solucion:** Remover este codigo debug y documentar el bug real (admin con idVendedor 88 no puede acceder a cadastros de cliente) como un issue formal.

---

## 7. Bajos - Configuracion

### BUG-013: skipTests habilitado globalmente

**Severidad:** BAJA

**Descripcion:** `angular.json` tiene `skipTests: true` para todos los esquematicos. No se generan tests al crear componentes, servicios, etc.

**Impacto:** El proyecto probablemente tiene cobertura de tests cercana a 0%.

---

### BUG-014: Inconsistencia HTTP/HTTPS entre ambientes

**Severidad:** MEDIA

**Descripcion:**
- Development: `http://23.254.204.187/api/` (HTTP sin SSL)
- Production: `https://23.254.204.187` (HTTPS pero sin `/api/` al final)
- Staging: `https://23.254.204.187` (igual que produccion)

La inconsistencia en el trailing `/api/` puede causar URLs rotas.

---

### BUG-015: environment.ts importado pero no usado

**Severidad:** MEDIA

**Descripcion:** `generic.service.ts` importa `environment` (linea 6) pero luego usa URL hardcodeada (linea 12). Patron repetido en multiples servicios.

---

## 8. Recomendaciones Generales

### Prioridad 1 (Inmediata)
1. ❌ Resolver incompatibilidad de `@angular/material` version (pendiente migracion)
2. ✅ PARCIAL - Centralizar URLs de API: core services, header, interceptor y modulo ofertas migrados a `environment`. Quedan ~150 servicios usando URL hardcodeada (funciona via `UrlRewriteInterceptor`)
3. ✅ PARCIAL - Eliminados 103 `console.log` del modulo ofertas. Quedan ~180 en otros modulos
4. ✅ Removida Google Maps API key del codigo

### Prioridad 2 (Corto plazo)
5. ✅ PARCIAL - Implementado `takeUntil` en ofertas/lista y ofertas/formulario. Falta en otros modulos
6. ✅ PARCIAL - Limpiado codigo comentado en auth.service, jwt.interceptor, login, header. Falta en otros modulos
7. ❌ Habilitar Ivy compiler
8. ❌ Implementar LoggerService

### Prioridad 3 (Mediano plazo)
9. ❌ Planificar migracion de Angular 10 a version LTS actual
10. ❌ Implementar tests unitarios (cobertura actual ~0%)
11. ❌ Migrar de TSLint (deprecated) a ESLint
12. ❌ Evaluar reemplazo de jQuery por soluciones Angular nativas
13. ❌ Migrar Protractor (deprecated) a Cypress o Playwright
14. ❌ Evaluar seguridad de almacenamiento de JWT
