import { ComercialIntegracoesDagdaIntegracaoPedidosListaComponent } from './lista/lista.component';
import { TemplatesModule } from '../../../../../shared/templates/templates.module';
import { SharedModule } from '../../../../../shared/modules/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { registerLocaleData } from '@angular/common';
import localeBr from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';
registerLocaleData(localeBr, 'pt')



import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ComercialIntegracoesDagdaIntegracaoPedidosRoutingModule } from './integracao-pedidos-routing.module';

import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
//import { ComercialCadastrosPedidosTemplatesModule } from '../../../cadastros/pedidos/templates/templates.module';

import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PaginationModule } from 'ngx-bootstrap/pagination';

@NgModule({
  declarations: [
    ComercialIntegracoesDagdaIntegracaoPedidosListaComponent,

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
    //ComercialIntegracoesDagdaPedidosTemplatesModule,
   // ComercialCadastrosPedidosTemplatesModule,
    ComercialIntegracoesDagdaIntegracaoPedidosRoutingModule,
  ],

  providers : [
   { provide: LOCALE_ID, useValue: 'pt-BR'}
  ]
})
export class ComercialIntegracoesDagdaIntegracaoPedidosModule {}
