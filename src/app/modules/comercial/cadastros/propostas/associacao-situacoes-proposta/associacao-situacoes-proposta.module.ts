import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// ngx-bootstrap
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// ng2-currency-mask
import { CurrencyMaskModule } from 'ng2-currency-mask';

// PNotify
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

// Modules
import { ComercialCadastrosPropostasAssociacaoSituacoesPropostaRoutingModule } from './associacao-situacoes-proposta-routing.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

// Components
import { ComercialCadastrosPropostasAssociacaoSituacoesPropostaListaComponent } from './lista/lista.component';
import { ComercialCadastrosPropostasAssociacaoSituacoesPropostaFormularioComponent } from './formulario/formulario.component';

// Services
import { ComercialCadastrosPropostasAssociacaoSituacoesPropostaService } from './associacao-situacoes-proposta.service';

@NgModule({
  declarations: [
    ComercialCadastrosPropostasAssociacaoSituacoesPropostaListaComponent,
    ComercialCadastrosPropostasAssociacaoSituacoesPropostaFormularioComponent,
  ],
  imports: [
    BsDropdownModule.forRoot(),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationModule,
    TooltipModule,
    NgSelectModule,
    CurrencyMaskModule,
    ComercialCadastrosPropostasAssociacaoSituacoesPropostaRoutingModule,
    SharedModule,
    TemplatesModule,
  ],
  providers: [
    PNotifyService,
    ComercialCadastrosPropostasAssociacaoSituacoesPropostaService,
  ],
})
export class ComercialCadastrosPropostasAssociacaoSituacoesPropostaModule {}
