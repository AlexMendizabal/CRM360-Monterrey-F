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
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

// Modules
import { ComercialTemplatesModule } from './../../templates/templates.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { ComercialCadastrosMateriaisTemplatesModule } from './../../cadastros/materiais/templates/templates.module';
import { ModalModule } from 'ngx-bootstrap/modal';

// Components
import { ComercialKanbanPedidosListaComponent } from './lista/lista.component';

// Services
import { ComercialKanbanPedidosService } from './pedidos.service';
import { ComercialKanbanPedidosRoutingModule } from './pedidos-routing.module';

@NgModule({
  declarations: [ComercialKanbanPedidosListaComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationModule.forRoot(),
    TooltipModule,
    NgSelectModule,
    CurrencyMaskModule,
    SharedModule,
    TemplatesModule,
    ComercialTemplatesModule,
    ComercialCadastrosMateriaisTemplatesModule,
    ComercialKanbanPedidosRoutingModule,
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
  ],
  providers: [PNotifyService, ComercialKanbanPedidosService],
})
export class ComercialKanbanPedidosModule {}
