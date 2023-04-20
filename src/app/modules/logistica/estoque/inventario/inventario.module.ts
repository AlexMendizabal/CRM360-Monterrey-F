import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// ngx-bootstrap
import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { TabsModule } from 'ngx-bootstrap/tabs';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// ng2-currency-mask
import { CurrencyMaskModule } from 'ng2-currency-mask';

import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

import { LogisticaEstoqueInventarioComponent } from './inventario.component';
import { LogisticaEstoqueInventarioFiltroComponent } from './filtro/filtro.component';
import { LogisticaEstoqueInventarioRoutingModule } from './inventario-routing.module';
import { LogisticaEstoqueInventarioListaComponent } from './lista/lista.component';
import { LogisticaEstoqueInventarioListaInventarioComponent } from './lista/inventario/inventario.component';
import { LogisticaEstoqueInventarioListaRelatorioComponent } from './lista/relatorio/relatorio.component';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { FilterPipeModule } from 'ngx-filter-pipe';

@NgModule({
  declarations: [
    LogisticaEstoqueInventarioComponent,
    LogisticaEstoqueInventarioFiltroComponent,
    LogisticaEstoqueInventarioListaComponent,
    LogisticaEstoqueInventarioListaInventarioComponent,
    LogisticaEstoqueInventarioListaRelatorioComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FilterPipeModule,
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    TimepickerModule.forRoot(),
    BsDatepickerModule.forRoot(),
    PaginationModule.forRoot(),
    NgSelectModule,
    CurrencyMaskModule,
    LogisticaEstoqueInventarioRoutingModule,
    NotFoundModule,
    SharedModule
  ],
  providers: [PNotifyService, { provide: LOCALE_ID, useValue: 'pt-PT' }]
})
export class LogisticaEstoqueInventarioModule {}
