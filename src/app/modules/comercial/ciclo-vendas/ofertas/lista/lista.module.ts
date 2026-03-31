import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { ListaComponent } from './lista.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PdfComponent } from './pdf/pdf.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { VistaComponent } from './vista/vista.component';

@NgModule({
  declarations: [ VistaComponent,PdfComponent],
  imports: [
    CommonModule,
    NgSelectModule,
    NgxDatatableModule,
    FormsModule,
    ReactiveFormsModule,
    TypeaheadModule.forRoot(),
    ModalModule.forRoot(),
    TooltipModule.forRoot()
  ],

  bootstrap: [
    ListaComponent
  ],
  entryComponents: [ VistaComponent, PdfComponent],
})
export class ListaModule { }
