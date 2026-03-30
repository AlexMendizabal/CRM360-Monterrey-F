import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SeleccionarComponent } from './modal/cliente/seleccionar/seleccionar.component';
import { VistaComponent } from './modal/cliente/vista/vista.component';
import { DatomaestroComponent } from './modal/material/datomaestro/datomaestro.component';
import { AlmacenesComponent } from './modal/material/almacenes/almacenes.component';
import { MaterialesComponent } from './modal/material/materiales/materiales.component';
import { CarritoComponent } from './carrito/carrito.component';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { LogisticaComponent } from './logistica/logistica.component';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [
    SeleccionarComponent,
    VistaComponent,
    DatomaestroComponent,
    AlmacenesComponent,
    MaterialesComponent,
    CarritoComponent,
    LogisticaComponent
  ],
  imports: [
    CommonModule,
    NgxDatatableModule,
    FormsModule,
    NgSelectModule,
    ReactiveFormsModule,
    TypeaheadModule.forRoot(),
  ],
  exports: [
    SeleccionarComponent,
    VistaComponent,
    DatomaestroComponent,
    AlmacenesComponent,
    MaterialesComponent,
    CarritoComponent
  ]
})
export class FormularioModule { }
