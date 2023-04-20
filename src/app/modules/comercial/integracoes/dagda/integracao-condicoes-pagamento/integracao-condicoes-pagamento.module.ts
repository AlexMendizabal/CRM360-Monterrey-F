import { TemplatesModule } from '../../../../../shared/templates/templates.module';
import { SharedModule } from '../../../../../shared/modules/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ComercialIntegracoesDagdaIntegracaoCondicoesPagamentoRoutingModule } from './integracao-condicoes-pagamento-routing.module';
import { ComercialIntegracoesDagdaIntegracaoCondicoesPagamentoListaComponent } from './lista/lista.component';
import { ComercialIntegracoesDagdaIntegracaoCondicoesPagamentoFormularioComponent } from './formulario/formulario.component';
import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { ComercialCadastrosMateriaisTemplatesModule } from '../../../cadastros/materiais/templates/templates.module';
import { ComercialIntegracoesDagdaMateriaisTemplatesModule } from '../templates/templates.module';

import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PaginationModule } from 'ngx-bootstrap/pagination';

@NgModule({
  declarations: [
    ComercialIntegracoesDagdaIntegracaoCondicoesPagamentoListaComponent,
    ComercialIntegracoesDagdaIntegracaoCondicoesPagamentoFormularioComponent,
  ],
  imports: [
    CommonModule,
    TooltipModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationModule,
    NgSelectModule,
    SharedModule,
    TemplatesModule,
    NotFoundModule,
    ComercialIntegracoesDagdaMateriaisTemplatesModule,
    ComercialCadastrosMateriaisTemplatesModule,
    ComercialIntegracoesDagdaIntegracaoCondicoesPagamentoRoutingModule,
  ],
})
export class ComercialIntegracoesDagdaIntegracaoCondicoesPagamentoModule {}
