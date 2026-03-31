import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgSelectModule } from '@ng-select/ng-select';

import { OrderModule } from 'ngx-order-pipe';

import { TooltipModule, PaginationModule, TabsModule, ModalModule } from 'ngx-bootstrap';

import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

/* Localização Brasil */
import { registerLocaleData } from '@angular/common';
import ptBr from '@angular/common/locales/pt';
registerLocaleData(ptBr)
/* Localização Brasil */

import { AbastecimentoCadastrosGrupoFornecedoresRoutingModule } from './grupo-fornecedores-routing.module';
import { AbastecimentoCadastrosGrupoFornecedoresListaComponent } from './lista/lista.component';
import { AbastecimentoCadastrosGrupoFornecedoresCadastroComponent } from './cadastro/cadastro.component';


@NgModule({
  declarations: [ 
    AbastecimentoCadastrosGrupoFornecedoresListaComponent, 
    AbastecimentoCadastrosGrupoFornecedoresCadastroComponent
  ],
  imports: [
    CommonModule,
    AbastecimentoCadastrosGrupoFornecedoresRoutingModule,
    NotFoundModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    TooltipModule.forRoot(),
    PaginationModule.forRoot(),
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    NgSelectModule,
    TemplatesModule,
    OrderModule,
    PipesModule
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'pt-PT' }]
})
export class AbastecimentoCadastrosGrupoFornecedoresModule { }
