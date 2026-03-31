# Documentacion de Modulos - CRM360 Monterrey

## Indice

1. [App Module (Root)](#1-app-module-root)
2. [Login](#2-login)
3. [Core (Home/Dashboard)](#3-core-homedashboard)
4. [Comercial](#4-comercial)
5. [Abastecimento](#5-abastecimento)
6. [Admin](#6-admin)
7. [Controladoria](#7-controladoria)
8. [Corte-Dobra](#8-corte-dobra)
9. [Financeiro](#9-financeiro)
10. [Fiscal](#10-fiscal)
11. [Logistica](#11-logistica)
12. [Power BI](#12-power-bi)
13. [Sistemas](#13-sistemas)
14. [Sul Fluminense](#14-sul-fluminense)
15. [Tecnologia da Informacao](#15-tecnologia-da-informacao)
16. [TID Software](#16-tid-software)
17. [Shared (Servicios Compartidos)](#17-shared-servicios-compartidos)

---

## 1. App Module (Root)

**Archivo:** `src/app/app.module.ts`

**Responsabilidad:** Modulo raiz que inicializa la aplicacion.

**Configuracion:**
- Locale: `pt-BR` (Portugues Brasil)
- Interceptor: `JwtInterceptor` para autenticacion en cada request HTTP
- URL Serializer: `CustomUrlSerializer` para manejo de query params
- Traduccion: `ngx-translate` con archivos JSON en `assets/i18n/`

**Dependencias:**
- BrowserModule, BrowserAnimationsModule
- FormsModule, ReactiveFormsModule
- HttpClientModule
- TranslateModule, TooltipModule, ModalModule, BsDropdownModule
- SharedModule, PipesModule

**Routing:** `app-routing.module.ts`
- 15 rutas lazy-loaded
- Hash-based routing (`useHash: true`)
- Cada modulo protegido por `AuthGuard` + guard especifico del modulo
- Ruta wildcard `**` redirige a `/login`

---

## 2. Login

**Archivo:** `src/app/modules/login/login.component.ts`

**Responsabilidad:** Autenticacion de usuarios.

**API utilizada:**
- `POST /api/usuario/login` - Autenticacion principal
- `POST http://192.168.0.123:4100/api/Login` - Login SAP (red interna)

**Flujo:**
1. Usuario ingresa credenciales
2. Se envia POST al backend
3. Backend retorna JWT token + datos del usuario
4. Token se almacena en `localStorage` como `currentUser`
5. Redireccion a `/home` o URL previa

**Servicio:** `AuthService` (`shared/services/core/auth.service.ts`)

---

## 3. Core (Home/Dashboard)

**Archivo:** `src/app/modules/core/core.module.ts`

**Ruta:** `/home`

**Responsabilidad:** Dashboard principal despues del login. Incluye la pagina de inicio y componentes de layout.

**Componentes de Layout** (en `src/app/core/`):
- `HeaderComponent` - Barra superior con notificaciones, usuario, SAP sync
- `SidebarComponent` - Menu lateral de navegacion por modulos
- `BodyComponent` - Contenedor principal del contenido
- `ModuleWrapperComponent` - Wrapper para cambio entre modulos
- `NotFoundComponent` - Pagina 404
- `ChangePasswordModalComponent` - Modal para cambio de contrasena

**API del Header:**
- `GET/POST /api/sap/*` - Sincronizacion con SAP
- `GET /api/notificaciones` - Sistema de notificaciones

---

## 4. Comercial

**Archivo:** `src/app/modules/comercial/comercial.module.ts`

**Ruta:** `/comercial`

**Responsabilidad:** Modulo mas grande y complejo. Gestiona todo el ciclo comercial.

**Sub-modulos:**

### 4.1 Ciclo de Vendas (Ciclo de Ventas)
- **Cotacoes (Cotizaciones):** CRUD de cotizaciones, formularios de materiales, calculos de descuento, duplicacion, estados
- **Autorizacoes:** Flujo de aprobacion de cotizaciones
- **Pedidos de Produccion:** Gestion de ordenes de produccion, telas, panel de aprobacion

**APIs:**
- `GET/POST/PUT /api/comercial/ciclo-vendas/cotacoes/*`
- `GET/POST /api/comercial/ciclo-vendas/autorizacoes/*`
- `GET/POST /api/comercial/ciclo-vendas/pedidos-producao/*`

### 4.2 Cadastros (Registros)
- **Materiais:** Catalogo de materiales, precios, fichas tecnicas
- **Clientes:** Gestion completa de clientes, pre-registros, contactos
- **Contratos Comerciais:** Gestion de contratos

**APIs:**
- `GET/POST/PUT /api/comercial/cadastros/materiais/*`
- `GET/POST/PUT /api/comercial/clientes/*`
- `GET/POST /api/comercial/cadastros/contratos-comerciais/*`

### 4.3 Clientes
- Lista, formulario, dashboard de clientes
- Pre-cadastro (pre-registro)
- Gestion de contactos por cliente

**APIs:**
- `GET/POST/PUT /api/comercial/clientes/*`

### 4.4 Comissoes (Comisiones)
- Comisiones de representantes
- Comisiones de vendedores internos
- Gestion de equipos de venta

**APIs:**
- `GET/POST /api/comercial/comissoes/*`

### 4.5 Gestao (Gestion)
- Contratos, liberaciones, asociaciones
- Situacion de propuestas

**APIs:**
- `GET/POST /api/comercial/gestao/*`

### 4.6 Agenda
- Calendario de actividades comerciales
- Citas y visitas a clientes

**APIs:**
- `GET/POST /api/comercial/agenda/*`

### 4.7 Kanban
- Vista Kanban de pedidos
- Gestion visual del pipeline

### 4.8 Integracoes (Integraciones)
- **Arcelor Mittal:** Integracion de datos
- **Dagda:** Integracion de sistema externo

### 4.9 Akna
- Integracion con plataforma de email marketing
- Gestion de contactos y listas

### 4.10 Reportes
- Reportes de ventas, vendedores, clientes
- Exportacion a Excel y PDF

### 4.11 Lote
- Gestion de lotes
- Rutas en mapa (Google Maps integration)

---

## 5. Abastecimento

**Archivo:** `src/app/modules/abastecimento/abastecimento.module.ts`

**Ruta:** `/abastecimento`

**Guard:** `AbastecimentoGuard`

**Responsabilidad:** Gestion de abastecimiento y stock de materiales.

**Sub-modulos:**
- Control de inventario
- Solicitudes de abastecimiento
- Monitoreo de stock

**APIs:**
- `GET/POST /api/abastecimento/*`

---

## 6. Admin

**Archivo:** `src/app/modules/admin/admin.module.ts`

**Ruta:** `/admin`

**Guard:** `AdminGuard`

**Responsabilidad:** Administracion del sistema CRM.

**Sub-modulos:**
- **Perfis (Perfiles):** Gestion de roles y permisos
- **Usuarios:** CRUD de usuarios del sistema
- **Atividades:** Registro de actividades y logs de acceso

**APIs:**
- `GET/POST/PUT /api/admin/perfis/*`
- `GET/POST/PUT /api/admin/usuarios/*`
- `POST /api/core/registrar-acesso` - Log de accesos

---

## 7. Controladoria

**Archivo:** `src/app/modules/controladoria/controladoria.module.ts`

**Ruta:** `/controladoria`

**Guard:** `ControladoriaGuard`

**Responsabilidad:** Control contable y financiero.

**Sub-modulos:**
- **Fluxo de Caixa:** Flujo de caja con logs y historico
- **Associacoes:** Asociaciones PL/User, empresas, centros de costo
- **Reportes contables**

**APIs:**
- `GET/POST /api/controladoria/fluxo-caixa/*`
- `GET/POST /api/controladoria/associacoes/*`

---

## 8. Corte-Dobra

**Archivo:** `src/app/modules/corte-dobra/corte-dobra.module.ts`

**Ruta:** `/corte-dobra`

**Guard:** `CorteDobraGuard`

**Responsabilidad:** Gestion de operaciones de corte y doblado de materiales.

**Sub-modulos:**
- **Dashboard:** Panel analitico con graficos (amcharts4)
- **Analitico:** Analisis de transporte y operaciones
- **Gestion operativa**

**APIs:**
- `GET/POST /api/corte-dobra/*`
- `GET https://23.254.204.187/api/*` (URL alternativa)

---

## 9. Financeiro

**Archivo:** `src/app/modules/financeiro/financeiro.module.ts`

**Ruta:** `/financeiro`

**Guard:** `FinanceiroGuard`

**Responsabilidad:** Gestion financiera, cuentas por cobrar/pagar, facturacion.

**APIs:**
- `GET/POST /api/financeiro/*`

---

## 10. Fiscal

**Archivo:** `src/app/modules/fiscal/fiscal.module.ts`

**Ruta:** `/fiscal`

**Guard:** `FiscalGuard`

**Responsabilidad:** Gestion fiscal e impuestos (contexto brasileno).

**APIs:**
- `GET/POST /api/fiscal/*`

---

## 11. Logistica

**Archivo:** `src/app/modules/logistica/logistica.module.ts`

**Ruta:** `/logistica`

**Guard:** `LogisticaGuard`

**Responsabilidad:** Gestion logistica, entregas, almacenes.

**Sub-modulos:**
- **YMS (Yard Management System):**
  - Setores (Sectores): Gestion de areas del patio
  - Etapas: Flujo de etapas logisticas
  - Agendamentos: Programacion con drag-and-drop
  - Associacao de setores

**APIs:**
- `GET/POST/PUT /api/logistica/*`
- `GET/POST /api/logistica/yms/*`

---

## 12. Power BI

**Archivo:** `src/app/modules/power-bi/power-bi.module.ts`

**Ruta:** `/power-bi`

**Guard:** `PowerBiGuard`

**Responsabilidad:** Integracion con Microsoft Power BI para dashboards y reportes avanzados.

---

## 13. Sistemas

**Archivo:** `src/app/modules/sistemas/sistemas.module.ts`

**Ruta:** `/sistemas`

**Guard:** `SistemasGuard`

**Responsabilidad:** Configuracion de sistemas internos.

---

## 14. Sul Fluminense

**Archivo:** `src/app/modules/sul-fluminense/sul-fluminense.module.ts`

**Ruta:** `/sul-fluminense`

**Guard:** `SulFluminenseGuard`

**Responsabilidad:** Modulo regional para operaciones en la zona Sul Fluminense.

---

## 15. Tecnologia da Informacao

**Archivo:** `src/app/modules/tecnologia-informacao/tecnologia-informacao.module.ts`

**Ruta:** `/tecnologia-informacao`

**Guard:** `TecnologiaInformacaoGuard`

**Responsabilidad:** Gestion de TI interna.

**Sub-modulos:**
- **Estoque (Inventario TI):**
  - Painel de aprovacao (Panel de aprobacion)
  - Movimentacoes (Movimientos de inventario)
- **Controle de Linhas:** Gestion de lineas telefonicas/datos
  - Lista, formulario, documentos adjuntos

**APIs:**
- `GET/POST /api/tecnologia-informacao/estoque/*`
- `GET/POST /api/tecnologia-informacao/controle-linhas/*`

---

## 16. TID Software

**Archivo:** `src/app/modules/tid-software/tid-software.module.ts`

**Ruta:** `/tid-software`

**Guard:** `TidSoftwareGuard`

**Responsabilidad:** Integracion con software TID externo.

---

## 17. Shared (Servicios Compartidos)

**Ubicacion:** `src/app/shared/`

### 17.1 Servicios Core (`shared/services/core/`)

| Servicio | Archivo | Responsabilidad |
|---|---|---|
| AuthService | `auth.service.ts` | Login, logout, JWT, session |
| RouterService | `router.service.ts` | Navegacion y breadcrumbs |
| TitleService | `title.service.ts` | Titulo de pagina dinamico |
| PNotifyService | `pnotify.service.ts` | Notificaciones toast |
| PdfService | `pdf.service.ts` | Generacion de PDFs (pdfmake/jspdf) |
| XlsxService | `xlsx.service.ts` | Exportacion Excel (exceljs/xlsx) |
| DateService | `date.service.ts` | Utilidades de fecha (moment) |
| FunctionsService | `functions.service.ts` | Funciones utilitarias |
| FormRulesService | `form-rules.service.ts` | Reglas de validacion |
| MapService | `map.service.ts` | Google Maps |
| TranslationService | `translation.service.ts` | Traducciones i18n |

### 17.2 Servicios de Request (`shared/services/requests/`)

| Servicio | Endpoints |
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

### 17.3 Servicios Web Externos (`shared/services/ws/`)

| Servicio | API Externa |
|---|---|
| CepService | ViaCEP (`viacep.com.br`) - Busqueda de direccion por codigo postal |
| CnpjService | ReceitaWS - Validacion de CNPJ (registro empresarial brasileno) |

### 17.4 Componentes Compartidos (`shared/modules/`)

- **Breadcrumb** - Navegacion de migas de pan
- **BackButton** - Boton de retorno
- **ConfirmModal** - Modal de confirmacion generico
- **EmptyResult** - Pantalla de sin resultados
- **SpinnerFull** - Loading spinner a pantalla completa
- **SpinnerNavbar** - Loading en barra de navegacion
- **PermissionDenied** - Pagina de acceso denegado
- **XlsxExport** - Componente de exportacion Excel
- **TheadSorter** - Ordenacion de tablas

### 17.5 Pipes (`shared/pipes/`)
- Pipes de formato personalizados para el proyecto

### 17.6 Guards (`guards/`)

| Guard | Tipo | Responsabilidad |
|---|---|---|
| AuthGuard | CanActivate, CanLoad | Verifica autenticacion |
| FormDeactivateGuard | CanDeactivate | Previene salir de formularios sin guardar |
| [Modulo]Guard | CanActivate | Control de acceso por rol a cada modulo |

---

## Diagrama de Flujo de Navegacion

```
[Login] --> [AuthGuard] --> [Home/Dashboard]
                              |
              +---------------+---------------+
              |       |       |       |       |
           [Comercial] [Logistica] [Admin] [Financeiro] ...
              |
    +---------+---------+
    |         |         |
  [Ciclo   [Clientes] [Cadastros]
   Vendas]    |
    |       [Lista]
  [Cotacoes] [Form]
  [Pedidos]  [Dashboard]
  [Autorizacoes]
```

## Patron de Comunicacion con API

```
Component --> Service --> HttpClient --> JwtInterceptor --> API Backend
                                              |
                                        [Add Bearer Token]
                                        [Add X-User-Info]
                                        [Set Content-Type]
                                        [Handle 401 -> Logout]
```
