# Modulo: Comercial

**Archivo:** `src/app/modules/comercial/comercial.module.ts`
**Ruta:** `/comercial`
**Guard:** `ComercialGuard`

## Responsabilidad

Modulo mas grande y complejo del sistema. Gestiona todo el ciclo comercial: ventas, cotizaciones, clientes, comisiones, integraciones y reportes.

---

## Sub-modulos

### 1. Ciclo de Vendas (Ciclo de Ventas)

#### Cotacoes (Cotizaciones)
- CRUD completo de cotizaciones
- Formularios de materiales con calculos de descuento
- Duplicacion de cotizaciones
- Estados y flujo de aprobacion

#### Autorizacoes (Autorizaciones)
- Flujo de aprobacion de cotizaciones
- Panel de autorizaciones pendientes

#### Pedidos de Produccion
- Gestion de ordenes de produccion
- Panel de aprobacion de pedidos
- Integracion con telas/materiales

**APIs:**
```
GET/POST/PUT  /api/comercial/ciclo-vendas/cotacoes/*
GET/POST      /api/comercial/ciclo-vendas/autorizacoes/*
GET/POST      /api/comercial/ciclo-vendas/pedidos-producao/*
```

---

### 2. Cadastros (Registros)

#### Materiais (Materiales)
- Catalogo de materiales
- Precios y fichas tecnicas
- Busqueda avanzada

#### Clientes
- Lista, formulario, dashboard de clientes
- Pre-cadastro (pre-registro)
- Gestion de contactos por cliente

#### Contratos Comerciais
- Gestion de contratos comerciales
- Vencimientos y renovaciones

**APIs:**
```
GET/POST/PUT  /api/comercial/cadastros/materiais/*
GET/POST/PUT  /api/comercial/clientes/*
GET/POST      /api/comercial/cadastros/contratos-comerciais/*
```

---

### 3. Comissoes (Comisiones)

- Comisiones de representantes
- Comisiones de vendedores internos
- Gestion de equipos de venta

**APIs:**
```
GET/POST  /api/comercial/comissoes/*
```

---

### 4. Gestao (Gestion)

- Contratos y liberaciones
- Asociaciones comerciales
- Situacion de propuestas

**APIs:**
```
GET/POST  /api/comercial/gestao/*
```

---

### 5. Agenda

- Calendario de actividades comerciales
- Citas y visitas a clientes
- Integracion con Google Maps (@agm/core)

**APIs:**
```
GET/POST  /api/comercial/agenda/*
```

---

### 6. Kanban

- Vista Kanban de pedidos
- Gestion visual del pipeline de ventas
- Drag-and-drop de estados

---

### 7. Integracoes (Integraciones)

#### Arcelor Mittal
- Integracion de datos comerciales

#### Dagda
- Integracion con sistema externo Dagda

---

### 8. Akna

- Integracion con plataforma de email marketing
- Gestion de contactos y listas de distribucion
- Envio de campanas

---

### 9. Reportes

- Reportes de ventas por vendedor
- Reportes de clientes
- Exportacion a Excel (ExcelJS) y PDF (pdfmake/jspdf)

---

### 10. Lote

- Gestion de lotes de materiales
- Rutas en mapa (Google Maps)

---

## Componentes Principales

| Componente | Ubicacion | Funcion |
|---|---|---|
| CotacoesListaComponent | `ciclo-vendas/cotacoes/lista/` | Lista de cotizaciones con filtros |
| CotacoesFormularioComponent | `ciclo-vendas/cotacoes/formulario/` | Formulario CRUD de cotizaciones |
| ClientesListaComponent | `clientes/lista/` | Lista de clientes |
| ClientesDashboardComponent | `clientes/dashboard/` | Dashboard de cliente individual |
| AgendaComponent | `agenda/` | Calendario comercial |
| KanbanComponent | `kanban/` | Vista Kanban |
