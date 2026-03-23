# Modulo: Tecnologia da Informacao (TI)

**Archivo:** `src/app/modules/tecnologia-informacao/tecnologia-informacao.module.ts`
**Ruta:** `/tecnologia-informacao`
**Guard:** `TecnologiaInformacaoGuard`

## Responsabilidad

Gestion de TI interna: inventario de equipos y control de lineas telefonicas.

## Sub-modulos

### Estoque (Inventario TI)

#### Painel de Aprovacao (Panel de Aprobacion)
- Aprobacion de solicitudes de equipos
- Flujo de autorizacion

#### Movimentacoes (Movimientos)
- Registro de movimientos de inventario
- Asignacion de equipos a usuarios
- Historico de movimientos

### Controle de Linhas (Control de Lineas)
- Gestion de lineas telefonicas y de datos
- Lista de lineas activas
- Formulario de alta/baja
- Documentos adjuntos

## APIs

```
GET/POST  /api/tecnologia-informacao/estoque/*
GET/POST  /api/tecnologia-informacao/controle-linhas/*
```
