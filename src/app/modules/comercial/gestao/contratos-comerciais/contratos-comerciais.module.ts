import { ComercialTemplatesModule } from './../../templates/templates.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// ngx-bootstrap
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// ng2-currency-mask
import { CurrencyMaskModule } from 'ng2-currency-mask';

// PNotify
import { PNotifyService } from './../../../../shared/services/core/pnotify.service';

// Modules
import { TemplatesModule } from './../../../../shared/templates/templates.module';
import { SharedModule } from './../../../../shared/modules/shared.module';
import { ComercialCadastrosMateriaisTemplatesModule } from './../../cadastros/materiais/templates/templates.module';
import { ModalModule, BsModalRef } from 'ngx-bootstrap/modal';

// Components
import { ComercialGestaoContratosComerciaisFormularioComponent } from './formulario/formulario.component';
import { ComercialGestaoContratosComerciaisListaComponent } from './lista/lista.component';
import { ComercialGestaoContratosComerciaisFormularioTemplateClientesComponent } from './templates/clientes/clientes.component';
import { ComercialGestaoContratosComerciaisFormularioModalSelecionarComponent } from './formulario/modal/selecionar/selecionar.component';
import { ComercialGestaoContratosComerciaisFormularioModalDetalhesComponent } from './formulario/modal/detalhes/cliente.component';

// Services
import { ComercialGestaoContratosComerciaisService } from '../contratos-comerciais/contratos-comerciais.service';
import { ComercialGestaoContratosComerciaisRoutingModule } from './contratos-comerciais-routing.module';
import { ComercialGestaoContratosComerciaisFormularioModalDetalhesService } from './formulario/modal/detalhes/cliente.service';

@NgModule({
  declarations: [
    ComercialGestaoContratosComerciaisListaComponent,
    ComercialGestaoContratosComerciaisFormularioComponent,
    ComercialGestaoContratosComerciaisFormularioTemplateClientesComponent,
    ComercialGestaoContratosComerciaisFormularioModalSelecionarComponent,
    ComercialGestaoContratosComerciaisFormularioModalDetalhesComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationModule.forRoot(),
    TooltipModule,
    NgSelectModule,
    CurrencyMaskModule,
    ComercialGestaoContratosComerciaisRoutingModule,
    SharedModule,
    TemplatesModule,
    ComercialTemplatesModule,
    ComercialCadastrosMateriaisTemplatesModule,
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
  ],
  entryComponents: [
    ComercialGestaoContratosComerciaisFormularioModalSelecionarComponent,
    ComercialGestaoContratosComerciaisFormularioModalDetalhesComponent,
  ],
  exports: [
    ComercialGestaoContratosComerciaisFormularioModalSelecionarComponent,
    ComercialGestaoContratosComerciaisFormularioModalDetalhesComponent,
  ],

  providers: [
    BsModalRef,
    PNotifyService,
    ComercialGestaoContratosComerciaisService,
    ComercialGestaoContratosComerciaisFormularioModalDetalhesService,
  ],
})
export class ComercialGestaoContratosComerciaisModule {}
