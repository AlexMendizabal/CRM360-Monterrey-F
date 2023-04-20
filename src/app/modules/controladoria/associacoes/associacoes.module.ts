import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

//templates
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { SharedModule } from 'src/app/shared/modules/shared.module'
import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

//routing
import { ControladoriaAssociacoesRoutingModule } from './associacoes-routing.module';

//components
import { ControladoriaAssociacoesComponent } from './associacoes.component';
import { ControladoriaAssociacoesPluserCentroCustoEmpresasListaComponent } from './pluser/empresas/lista/lista.component';
import { ControladoriaAssociacoesPluserEmpresasCentroCustoComponent } from './pluser/empresas/centro-custo/centro-custo.component';
import { ControladoriaAssociacoesPluserTipoDespesaListaComponent } from './pluser/tipo-despesa/lista/lista.component';
import { ControladoriaAssociacoesPluserTipoDespesaPlanoContaComponent } from './pluser/tipo-despesa/plano-conta/plano-conta.component';

//ngx
import { PaginationModule } from 'ngx-bootstrap';

//masks
import { NgBrazil } from 'ng-brazil';
import { TextMaskModule } from 'angular2-text-mask';

import { NgSelectModule } from '@ng-select/ng-select';

import { PipesModule } from 'src/app/shared/pipes/pipes.module';


@NgModule({
  declarations: [
    ControladoriaAssociacoesComponent,
    ControladoriaAssociacoesPluserCentroCustoEmpresasListaComponent,
    ControladoriaAssociacoesPluserEmpresasCentroCustoComponent,
    ControladoriaAssociacoesPluserTipoDespesaListaComponent,
    ControladoriaAssociacoesPluserTipoDespesaPlanoContaComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule,
    TemplatesModule.forRoot(),
    SharedModule.forRoot(),
    ControladoriaAssociacoesRoutingModule,
    NotFoundModule,
    PaginationModule,
    NgBrazil,
    TextMaskModule,
    PipesModule
  ]
})
export class ControladoriaAssociacoesModule { }
