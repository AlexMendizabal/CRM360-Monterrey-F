# Stack Tecnologico - CRM360 Monterrey Frontend

## Framework Principal

| Tecnologia | Version | Estado |
|---|---|---|
| Angular | 10.1.5 | EOL (Dic 2021) |
| TypeScript | 4.0.3 | Compatible |
| Angular CLI | 10.1.6 | EOL |
| Ivy Compiler | Deshabilitado | Usa View Engine legacy |
| RxJS | 6.6.3 | Compatible |
| Zone.js | 0.10.3 | Compatible |

> **Nota:** Angular 10 no recibe actualizaciones de seguridad desde diciembre 2021.

## UI y Estilos

| Paquete | Version | Proposito |
|---|---|---|
| Bootstrap | 4.4.1 | Framework CSS principal |
| ngx-bootstrap | 5.6.2 | Modals, Tooltips, Dropdowns, Datepicker |
| @angular/material | 16.0.0 | Componentes Material Design (incompatible teoricamente) |
| @ng-select/ng-select | 4.0.4 | Select avanzado con busqueda |
| @fortawesome/fontawesome-free | 5.12.1 | Iconos |
| roboto-fontface | 0.10.0 | Fuente Roboto |
| ngx-perfect-scrollbar | 8.0.0 | Scrollbar personalizado (deprecated) |
| jQuery | 3.7.0 | Manipulacion DOM (legacy, evitar) |

## Graficos y Visualizacion

| Paquete | Version | Usado en |
|---|---|---|
| @amcharts/amcharts4 | 4.8.9 | Dashboard de corte-dobra |
| angular-calendar | 0.28.2 | Agenda comercial |
| @agm/core | 1.1.0 | Google Maps (agenda, lotes) |
| ol (OpenLayers) | 6.4.3 | Mapas interactivos |

## Exportacion y Archivos

| Paquete | Version | Proposito |
|---|---|---|
| exceljs | 4.3.0 | Generacion Excel avanzada |
| xlsx | 0.15.6 | Lectura/escritura Excel |
| xlsx-style | 0.8.13 | Estilos en Excel |
| pdfmake | 0.1.65 | Generacion PDF |
| jspdf | 1.5.3 | Generacion PDF alternativa |
| html2canvas | 1.0.0-rc.5 | Captura de pantalla a canvas |
| file-saver | 2.0.5 | Descarga de archivos |
| ng2-file-upload | 1.4.0 | Upload de archivos |

> **Duplicidad:** Hay paquetes duplicados para Excel (exceljs + xlsx + xlsx-style) y PDF (pdfmake + jspdf). Se recomienda consolidar.

## Formularios y Mascaras

| Paquete | Version | Proposito |
|---|---|---|
| angular2-text-mask | 9.0.0 | Mascaras de texto en inputs |
| text-mask-addons | 3.8.0 | Addons para text-mask |
| ng2-currency-mask | 5.3.1 | Mascara de moneda |
| angularx-flatpickr | 6.2.0 | Date picker |
| flatpickr | 4.6.3 | Date picker base |

## Internacionalizacion (i18n)

| Paquete | Version | Proposito |
|---|---|---|
| @ngx-translate/core | 12.0.0 | Framework de traduccion |
| @ngx-translate/http-loader | 4.0.0 | Carga de traducciones via HTTP |
| js-brasil | 2.3.8 | Utilidades brasilenas (CPF, CNPJ, CEP) |
| ng-brazil | 1.4.7 | Validaciones brasilenas |

**Archivos de traduccion:**
- `src/assets/i18n/pt.json` - Portugues (original)
- `src/assets/i18n/es.json` - Espanol (migracion en curso)
- `src/assets/i18n/en.json` - Ingles

## Manejo de Fechas

| Paquete | Version | Notas |
|---|---|---|
| moment | 2.24.0 | Principal (legacy, pesado ~300KB) |
| moment-timezone | 0.5.27 | Zonas horarias |
| date-fns | 2.9.0 | Alternativa moderna (tambien instalado) |

> **Duplicidad:** Se recomienda migrar completamente a `date-fns` y eliminar `moment`.

## Utilidades

| Paquete | Version | Proposito |
|---|---|---|
| ngx-filter-pipe | 2.1.2 | Pipe de filtrado en templates |
| ngx-order-pipe | 2.0.4 | Pipe de ordenamiento en templates |
| angular2-counto | 1.2.5 | Animacion de contadores |
| rrule | 2.6.4 | Reglas de recurrencia (calendario) |
| pnotify | 4.0.0 | Notificaciones toast |
| web-animations-js | 2.3.2 | Polyfill de animaciones |

## Herramientas de Desarrollo

| Paquete | Version | Estado |
|---|---|---|
| @angular-devkit/build-angular | 0.1001.6 | EOL |
| karma | 5.0.0 | Test runner |
| jasmine-core | 3.5.0 | Framework de tests |
| protractor | 7.0.0 | E2E tests (**deprecated**) |
| tslint | 6.1.0 | Linter (**deprecated**) |
| codelyzer | 5.2.1 | Angular lint rules (**deprecated**) |

## Infraestructura Docker

| Tecnologia | Version | Uso |
|---|---|---|
| Node.js | 14-slim | Build de produccion |
| Node.js | 16-slim | Desarrollo con hot-reload |
| Nginx | 1.24-alpine | Servidor web en produccion |
| Docker Compose | v2+ | Orquestacion |

## Integraciones Externas

| Sistema | Proposito | Estado |
|---|---|---|
| SAP | ERP / Login alterno | Activo (192.168.x.x:4100) |
| Akna | Email marketing | Activo |
| Arcelor Mittal | Integracion comercial | Activo |
| Dagda | Integracion de datos | Activo |
| Power BI | Dashboards / Reportes | **INACTIVO** |
| Google Maps / AGM | Mapas en agenda | Activo (API key necesaria) |
| ViaCEP | Codigos postales | Activo (API publica) |
| ReceitaWS | Validacion CNPJ | Activo (API publica) |

## Paquetes que Requieren Migracion

| Paquete Actual | Reemplazo Sugerido | Razon |
|---|---|---|
| @angular/material ^16 | Alinear con version Angular | Incompatibilidad teorica |
| ngx-perfect-scrollbar | CSS nativo o ngx-scrollbar | Deprecated |
| protractor | Cypress o Playwright | Deprecated por Angular |
| tslint + codelyzer | @angular-eslint | Deprecated |
| jQuery | Angular nativo | Anti-patron en Angular |
| moment | date-fns (ya incluido) | Paquete pesado |
| angular2-text-mask | ngx-mask | Sin mantenimiento |
