import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// ngx-bootstrap
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';

// ngx-filter-pipe
import { FilterPipeModule } from 'ngx-filter-pipe';

// Counto
import { CountoModule } from 'angular2-counto';

// Modules
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { ComercialHistoricoFinanceiroRoutingModule } from './historico-financeiro-routing.module';

// Components
import { ComercialClientesHistoricoFinanceiroComponent } from './historico-financeiro.component';
import { ComercialClientesHistoricoFinanceiroResumoComponent } from './resumo/resumo.component';
import { ComercialClientesHistoricoFinanceiroDetalhesComponent } from './detalhes/detalhes.component';
import { ComercialClientesHistoricoFinanceiroMateriaisDuplicataComponent } from './materiais-duplicata/materiais-duplicata.component';
import { ComercialClientesHistoricoFinanceiroAcumulosMensaisComponent } from './acumulos-mensais/acumulos-mensais.component';
import { ComercialClientesHistoricoFinanceiroNotasPromissoriasComponent } from './notas-promissorias/notas-promissorias.component';
import { ComercialClientesHistoricoFinanceiroDebitosComponent } from './debitos/debitos.component';
import { ComercialClientesHistoricoFinanceiroCorteDobraComponent } from './corte-dobra/corte-dobra.component';

@NgModule({
  declarations: [
    ComercialClientesHistoricoFinanceiroComponent,
    ComercialClientesHistoricoFinanceiroResumoComponent,
    ComercialClientesHistoricoFinanceiroDetalhesComponent,
    ComercialClientesHistoricoFinanceiroMateriaisDuplicataComponent,
    ComercialClientesHistoricoFinanceiroAcumulosMensaisComponent,
    ComercialClientesHistoricoFinanceiroNotasPromissoriasComponent,
    ComercialClientesHistoricoFinanceiroDebitosComponent,
    ComercialClientesHistoricoFinanceiroCorteDobraComponent
  ],
  imports: [
    CommonModule,
    TooltipModule,
    PaginationModule,
    TabsModule,
    FilterPipeModule,
    CountoModule,
    SharedModule,
    TemplatesModule.forRoot(),
    ComercialHistoricoFinanceiroRoutingModule
  ]
})
export class ComercialClientesHistoricoFinanceiroModule {}
