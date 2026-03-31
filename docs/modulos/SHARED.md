# Shared (Servicios y Componentes Compartidos)

**Ubicacion:** `src/app/shared/`

## Responsabilidad

Contiene todo el codigo reutilizable del proyecto: servicios, componentes, pipes, directivas y providers.

---

## Servicios Core (`shared/services/core/`)

| Servicio | Archivo | Responsabilidad |
|---|---|---|
| AuthService | `auth.service.ts` | Login, logout, JWT, sesion |
| RouterService | `router.service.ts` | Navegacion y breadcrumbs |
| TitleService | `title.service.ts` | Titulo de pagina dinamico |
| PNotifyService | `pnotify.service.ts` | Notificaciones toast (PNotify) |
| PdfService | `pdf.service.ts` | Generacion de PDFs (pdfmake + jspdf) |
| XlsxService | `xlsx.service.ts` | Exportacion Excel (ExcelJS + xlsx) |
| DateService | `date.service.ts` | Utilidades de fecha (moment) |
| FunctionsService | `functions.service.ts` | Funciones utilitarias generales |
| FormRulesService | `form-rules.service.ts` | Reglas de validacion de formularios |
| MapService | `map.service.ts` | Integracion Google Maps |
| TranslationService | `translation.service.ts` | Gestion de traducciones i18n |
| IconsFontsAwesomeService | `icons-fonts-awesome.service.ts` | Iconos FontAwesome |
| WindowService | `window.service.ts` | Inyeccion de referencia Window |

---

## Servicios de Request (`shared/services/requests/`)

Servicios para acceso a datos maestros compartidos entre modulos.

| Servicio | Endpoints Principales |
|---|---|
| GenericService | `/api/common/escritorios, linhas, empresas, depositos, classes, materiais, situacoes` |
| AtividadesService | Actividades del sistema |
| CidadesService | Ciudades |
| ContatosService | Contactos |
| EstadosService | Estados/provincias |
| EscritoriosService | Oficinas |
| ModulosService | Modulos del sistema |
| MoedasService | Monedas/divisas |
| SubmodulosService | Sub-modulos |

---

## Servicios Web Externos (`shared/services/ws/`)

| Servicio | API Externa | Proposito |
|---|---|---|
| CepService | ViaCEP (`viacep.com.br`) | Busqueda de direccion por codigo postal |
| CnpjService | ReceitaWS | Validacion de CNPJ (registro empresarial) |

---

## Componentes Compartidos (`shared/modules/`)

| Componente | Proposito |
|---|---|
| Breadcrumb | Navegacion de migas de pan |
| BackButton | Boton de retorno a pagina anterior |
| ConfirmModal | Modal de confirmacion generico (Si/No) |
| EmptyResult | Pantalla "sin resultados encontrados" |
| SpinnerFull | Loading spinner a pantalla completa |
| SpinnerNavbar | Loading indicator en barra de navegacion |
| PermissionDenied | Pagina de acceso denegado |
| XlsxExport | Componente de exportacion a Excel |
| TheadSorter | Ordenacion de columnas en tablas |

---

## Pipes (`shared/pipes/`)

Pipes de formato personalizados para transformaciones en templates.

---

## Guards (`guards/`)

| Guard | Tipo | Responsabilidad |
|---|---|---|
| AuthGuard | CanActivate, CanLoad | Verifica autenticacion JWT |
| FormDeactivateGuard | CanDeactivate | Previene salir de formularios sin guardar |
| ComercialGuard | CanActivate | Acceso al modulo Comercial |
| AdminGuard | CanActivate | Acceso al modulo Admin |
| AbastecimentoGuard | CanActivate | Acceso al modulo Abastecimento |
| ControladoriaGuard | CanActivate | Acceso al modulo Controladoria |
| CorteDobraGuard | CanActivate | Acceso al modulo Corte-Dobra |
| FinanceiroGuard | CanActivate | Acceso al modulo Financeiro |
| FiscalGuard | CanActivate | Acceso al modulo Fiscal |
| LogisticaGuard | CanActivate | Acceso al modulo Logistica |
| PowerBiGuard | CanActivate | Acceso al modulo Power BI |
| SistemasGuard | CanActivate | Acceso al modulo Sistemas |
| SulFluminenseGuard | CanActivate | Acceso al modulo Sul Fluminense |
| TecnologiaInformacaoGuard | CanActivate | Acceso al modulo TI |
| TidSoftwareGuard | CanActivate | Acceso al modulo TID Software |

---

## Interceptor (`interceptors/`)

### JwtInterceptor

**Archivo:** `interceptors/jwt.interceptor.ts`

Intercepta todas las peticiones HTTP para:
1. Agregar header `Authorization: Bearer {token}`
2. Agregar header `X-User-Info: btoa(JSON.stringify(user.info))`
3. Establecer `Content-Type: application/json`
4. Manejar respuestas 401 (sesion expirada) → logout automatico
