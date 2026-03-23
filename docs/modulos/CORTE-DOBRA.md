# Modulo: Corte-Dobra (Corte y Doblado)

**Archivo:** `src/app/modules/corte-dobra/corte-dobra.module.ts`
**Ruta:** `/corte-dobra`
**Guard:** `CorteDobraGuard`

## Responsabilidad

Gestion de operaciones industriales de corte y doblado de materiales.

## Sub-modulos

### Dashboard
- Panel analitico con graficos avanzados
- Usa **AMCharts 4** para visualizaciones interactivas
- Metricas de produccion y eficiencia

### Analitico
- Analisis de transporte
- Analisis de operaciones
- Indicadores de rendimiento

### Gestion Operativa
- Control de ordenes de corte/doblado
- Seguimiento de produccion

## APIs

```
GET/POST  /api/corte-dobra/*
```

## Dependencias Especificas

- `@amcharts/amcharts4` - Graficos del dashboard
