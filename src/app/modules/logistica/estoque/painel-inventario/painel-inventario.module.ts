import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// ngx-bootstrap
import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// ng2-currency-mask
import { CurrencyMaskModule } from 'ng2-currency-mask';

import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { FilterPipeModule } from 'ngx-filter-pipe';

import { LogisticaEstoquePainelInventarioRoutingModule } from './painel-inventario-routing.module';
import { LogisticaEstoquePainelInventarioComponent } from './painel-inventario.component';
import { LogisticaEstoquePainelInventarioCadastroComponent } from './cadastro/cadastro.component';
import { LogisticaEstoquePainelInventarioInventarioComponent } from './inventario/inventario.component';
import { LogisticaEstoquePainelInventarioInventarioListaComponent } from './inventario/lista/lista.component';
import { LogisticaEstoquePainelInventarioInventarioMateriaisNotasFiscaisComponent } from './inventario/materiais-notas-fiscais/materiais-notas-fiscais.component';
import { LogisticaEstoquePainelInventarioInventarioMateriaisOcorrenciasComponent } from './inventario/materiais-ocorrencias/materiais-ocorrencias.component';
import { LogisticaEstoquePainelInventarioInventarioRelatorioComponent } from './inventario/relatorio/relatorio.component';

@NgModule({
  declarations: [
    LogisticaEstoquePainelInventarioComponent,
    LogisticaEstoquePainelInventarioCadastroComponent,
    LogisticaEstoquePainelInventarioInventarioComponent,
    LogisticaEstoquePainelInventarioInventarioListaComponent,
    LogisticaEstoquePainelInventarioInventarioMateriaisNotasFiscaisComponent,
    LogisticaEstoquePainelInventarioInventarioMateriaisOcorrenciasComponent,
    LogisticaEstoquePainelInventarioInventarioRelatorioComponent,
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
    TemplatesModule.forRoot(),
    NgSelectModule,
    CurrencyMaskModule,
    LogisticaEstoquePainelInventarioRoutingModule,
    NotFoundModule,
    SharedModule,
  ],
  providers: [PNotifyService, { provide: LOCALE_ID, useValue: 'pt-PT' }],
})
export class LogisticaEstoquePainelInventarioModule {}
