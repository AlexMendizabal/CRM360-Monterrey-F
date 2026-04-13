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

#### Ofertas POS (Oferta POS)
- **Ruta:** `/comercial/ciclo-vendas/@id/ofertas`
- **ID Actividad:** 107 (Submódulo: CADASTROS)
- **Componentes:** lista, formulario, carrito, logistica, modals (cliente/seleccionar, cliente/vista, material/almacenes, material/datomaestro, material/materiales)
- **Servicios:**
  - `ofertas.service.ts` — permisos de acceso, lista general (usa endpoints de cotacoes)
  - `lista/lista.service.ts` — listado de ofertas, impresion, envio SAP, vigencia
  - `formulario/formulario.service.ts` — clientes, materiales, almacenes, ejecutivos, condiciones de pago, registrar/editar oferta, cross-sell, up-sell
- **Guards:** `cliente-resolver`, `data-resolver`, `permissoes-resolver`, `profile-resolver`
- **Nota:** Comparte algunos endpoints de backend con cotacoes (imprimir-cotacao, calculadora, enviar_sap)
- **Validaciones del carrito:**
  - No permite agregar materiales con stock disponible <= 0
  - Ajusta cantidad automaticamente si excede `stock - comprometido`
  - Columna "Total Bruto Bs" formateada a 4 decimales
  - Descuento del usuario se preserva (no se sobreescribe con respuesta de API)
- **API Calculadora:** `POST /api/comercial/ciclo-vendas/cotacoes/calculadora` — Responde `{ success, data[{ valorUnitario, valorItem, valorTotal, aliquotaIpi, aliquotaIcms, tonelada, qtde }] }`. El campo `aliquotaIpi` NO representa el descuento del usuario.

#### Autorizacoes (Autorizaciones)
- Flujo de aprobacion de cotizaciones/ofertas
- Panel de autorizaciones pendientes
- **Criterios de autorizacion (ofertas):**
  - Descuento del material excede el descuento permitido (`descuento > descuento_permitido_valor`)
  - Cantidad solicitada excede stock disponible (`cantidad > stock - comprometido`)
  - Si ALGUN material cumple alguno de estos criterios → `autorizacion = '1'` (SI), `estadoOferta = 'Pendiente'`

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

- Calendario de actividades comerciales (vista mensual con `angular-calendar`)
- Citas y visitas a clientes
- Integracion con Google Maps (@agm/core)

#### UI/UX (Compromissos)
- Vista principal con filtros en tarjeta estilizada (header degradado purpura corporativo)
- Badges informativos de sucursal y promotor con iconos FontAwesome
- Barra de leyendas con chips de estado: Registrado por supervisor, Registrado por promotor, Re-Agendado, En Proceso, Finalizado
- Calendario con estilos personalizados: resaltado del dia actual, transiciones suaves, panel de eventos expandible
- Botones del header con iconos: Actualizar, Anterior, Hoy, Siguiente, Nuevo, Filtrar
- Animaciones fadeInUp en carga de secciones

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
