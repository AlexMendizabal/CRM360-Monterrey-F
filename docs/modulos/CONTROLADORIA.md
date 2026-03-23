# Modulo: Controladoria (Control Contable)

**Archivo:** `src/app/modules/controladoria/controladoria.module.ts`
**Ruta:** `/controladoria`
**Guard:** `ControladoriaGuard`

## Responsabilidad

Control contable y financiero. Gestion de flujo de caja y asociaciones contables.

## Sub-modulos

### Fluxo de Caixa (Flujo de Caja)
- Registro de movimientos de caja
- Historico y logs de cambios
- Reportes de flujo

### Associacoes (Asociaciones)
- Asociaciones PL/User
- Gestion de empresas
- Centros de costo

### Reportes Contables
- Reportes de control financiero
- Exportacion a Excel/PDF

## APIs

```
GET/POST  /api/controladoria/fluxo-caixa/*
GET/POST  /api/controladoria/associacoes/*
```
