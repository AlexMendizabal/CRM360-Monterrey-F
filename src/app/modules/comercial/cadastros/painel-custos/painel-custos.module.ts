import { ComercialCadastroPainelCustosService } from './painel-custos.service';
import { ComercialCadastrosMateriaisTemplatesModule } from './../materiais/templates/templates.module';
import { ComercialIntegracoesDagdaMateriaisTemplatesModule } from './../../integracoes/dagda/templates/templates.module';
import { TemplatesModule } from './../../../../shared/templates/templates.module';
import { SharedModule } from './../../../../shared/modules/shared.module';


import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ComercialCadastroPainelCustosRoutingModule } from './painel-custos-routing.module';
import { ComercialCadastroPainelCustosListaComponent } from './lista/lista.component';
import { ComercialCadastroPainelCustosFormularioComponent } from './formulario/formulario.component';
import { NotFoundModule } from 'src/app/core/not-found/not-found.module';


import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PaginationModule } from 'ngx-bootstrap/pagination';

@NgModule({
  declarations: [
    ComercialCadastroPainelCustosListaComponent,
    ComercialCadastroPainelCustosFormularioComponent,
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
    ComercialCadastroPainelCustosRoutingModule,
  ],
})
export class ComercialCadastroPainelCustosModule {}
