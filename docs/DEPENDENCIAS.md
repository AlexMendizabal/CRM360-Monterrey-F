# Dependencias y Versiones - CRM360 Monterrey

## Angular Core (v10.1.5)

| Paquete | Version | Estado | Notas |
|---|---|---|---|
| @angular/core | ~10.1.5 | EOL | End of Life desde Dic 2021 |
| @angular/common | ^10.1.5 | EOL | |
| @angular/compiler | ~10.1.5 | EOL | |
| @angular/forms | ~10.1.5 | EOL | |
| @angular/router | ~10.1.5 | EOL | |
| @angular/animations | ~10.1.5 | EOL | |
| @angular/platform-browser | ~10.1.5 | EOL | |
| @angular/platform-browser-dynamic | ~10.1.5 | EOL | |
| @angular/localize | ^10.1.5 | EOL | |
| @angular/cli | ~10.1.6 | EOL | |
| @angular/compiler-cli | ~10.1.5 | EOL | |

## UI / Estilos

| Paquete | Version | Proposito | Notas |
|---|---|---|---|
| @angular/material | ^16.0.0 | Componentes Material Design | **INCOMPATIBLE con Angular 10** |
| bootstrap | ^4.4.1 | Framework CSS | Bootstrap 4 (hay v5 disponible) |
| ngx-bootstrap | ^5.6.2 | Componentes Bootstrap para Angular | Modals, Tooltips, Dropdowns, Datepicker |
| @ng-select/ng-select | ^4.0.4 | Select avanzado con busqueda | |
| @fortawesome/fontawesome-free | ^5.12.1 | Iconos FontAwesome | |
| roboto-fontface | ^0.10.0 | Fuente Roboto | |
| ngx-perfect-scrollbar | ^8.0.0 | Scrollbar personalizado | Deprecated |
| jquery | ^3.7.0 | Manipulacion DOM | Legacy - evitar uso en Angular |

## Graficos y Visualizacion

| Paquete | Version | Proposito |
|---|---|---|
| @amcharts/amcharts4 | ^4.8.9 | Graficos avanzados (dashboard corte-dobra) |
| angular-calendar | ^0.28.2 | Calendario (agenda comercial) |
| @agm/core | ^1.1.0 | Google Maps para Angular |
| ol | ^6.4.3 | OpenLayers - mapas interactivos |

## Exportacion / Archivos

| Paquete | Version | Proposito |
|---|---|---|
| exceljs | ^4.3.0 | Generacion Excel avanzada |
| xlsx | ^0.15.6 | Lectura/escritura Excel |
| xlsx-style | ^0.8.13 | Estilos para Excel |
| pdfmake | ^0.1.65 | Generacion de PDFs |
| jspdf | ^1.5.3 | Generacion de PDFs alternativa |
| html2canvas | ^1.0.0-rc.5 | Captura de pantalla a canvas |
| file-saver | ^2.0.5 | Descarga de archivos |
| ng2-file-upload | ^1.4.0 | Upload de archivos |

## Formularios y Mascaras

| Paquete | Version | Proposito |
|---|---|---|
| angular2-text-mask | ^9.0.0 | Mascaras de texto en inputs |
| text-mask-addons | ^3.8.0 | Addons para text-mask |
| ng2-currency-mask | ^5.3.1 | Mascara de moneda |
| angularx-flatpickr | ^6.2.0 | Date picker |
| flatpickr | ^4.6.3 | Date picker base |

## Internacionalizacion / Localizacion

| Paquete | Version | Proposito |
|---|---|---|
| @ngx-translate/core | ^12.0.0 | Framework de traduccion |
| @ngx-translate/http-loader | ^4.0.0 | Carga de traducciones via HTTP |
| js-brasil | ^2.3.8 | Utilidades brasilenas (CPF, CNPJ, CEP) |
| ng-brazil | ^1.4.7 | Validaciones brasilenas para Angular |
| moment | ^2.24.0 | Manejo de fechas (legacy) |
| moment-timezone | ^0.5.27 | Zonas horarias |
| date-fns | ^2.9.0 | Utilidades de fecha (moderno) |

## Utilidades

| Paquete | Version | Proposito |
|---|---|---|
| rxjs | ^6.6.3 | Programacion reactiva |
| tslib | ^2.0.0 | Helpers TypeScript |
| ngx-filter-pipe | ^2.1.2 | Pipe de filtrado |
| ngx-order-pipe | ^2.0.4 | Pipe de ordenamiento |
| angular2-counto | ^1.2.5 | Animacion de contadores |
| rrule | ^2.6.4 | Reglas de recurrencia (calendario) |
| pnotify | ^4.0.0 | Notificaciones toast |
| web-animations-js | ^2.3.2 | Polyfill de animaciones web |
| zone.js | ~0.10.3 | Zone.js para Angular |

## Herramientas de Desarrollo

| Paquete | Version | Proposito | Notas |
|---|---|---|---|
| typescript | ~4.0.3 | Compilador TypeScript | |
| @angular-devkit/build-angular | ~0.1001.6 | Builder Angular | |
| karma | ~5.0.0 | Test runner | |
| karma-chrome-launcher | ~3.1.0 | Chrome para tests | |
| karma-jasmine | ~4.0.0 | Jasmine adapter | |
| jasmine-core | ~3.5.0 | Framework de tests | |
| protractor | ~7.0.0 | E2E tests | **Deprecated** - migrar a Cypress/Playwright |
| tslint | ~6.1.0 | Linter | **Deprecated** - migrar a ESLint |
| codelyzer | ^5.2.1 | Reglas Angular para TSLint | Deprecated junto con TSLint |

## Paquetes Deprecated / Problematicos

| Paquete | Problema | Reemplazo Sugerido |
|---|---|---|
| @angular/material ^16.0.0 | Incompatible con Angular 10 | @angular/material ~10.2.7 |
| ngx-perfect-scrollbar | Deprecated | ngx-scrollbar o CSS nativo |
| protractor | Deprecated por Angular team | Cypress, Playwright |
| tslint | Deprecated | @angular-eslint/schematics |
| codelyzer | Deprecated | @angular-eslint |
| jquery | Anti-patron en Angular | Usar Angular nativo |
| moment | Paquete grande, mantenimiento | date-fns (ya incluido) o luxon |
| angular2-text-mask | Sin mantenimiento | ngx-mask |

## Duplicidad de Funcionalidad

| Funcionalidad | Paquetes Duplicados | Recomendacion |
|---|---|---|
| Excel | exceljs + xlsx + xlsx-style | Consolidar en exceljs |
| PDF | pdfmake + jspdf | Elegir uno segun necesidad |
| Fechas | moment + moment-timezone + date-fns | Consolidar en date-fns |
| Mapas | @agm/core + ol (OpenLayers) | Evaluar necesidad de ambos |
