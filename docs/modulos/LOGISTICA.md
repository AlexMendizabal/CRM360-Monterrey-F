# Modulo: Logistica

**Archivo:** `src/app/modules/logistica/logistica.module.ts`
**Ruta:** `/logistica`
**Guard:** `LogisticaGuard`

## Responsabilidad

Gestion logistica: entregas, almacenes y sistema de gestion de patio (YMS).

## Sub-modulos

### YMS (Yard Management System)

#### Setores (Sectores)
- Gestion de areas/sectores del patio logistico
- Configuracion de capacidades

#### Etapas
- Flujo de etapas logisticas
- Gestion de estados de proceso

#### Agendamentos (Programacion)
- Programacion de entregas/recolecciones
- Interfaz drag-and-drop para asignacion

#### Associacao de Setores
- Asociacion entre sectores y operaciones
- Configuracion de reglas logisticas

## APIs

```
GET/POST/PUT  /api/logistica/*
GET/POST      /api/logistica/yms/*
```

## Notas

- El componente de drag-and-drop en Agendamentos puede tener memory leaks si las subscripciones no se limpian (ver BUGS.md BUG-009)
