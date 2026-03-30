import { CountoModule } from 'angular2-counto';
import { CurrencyMaskModule } from 'ng2-currency-mask';
//angular
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//Modules
import { NgSelectModule } from '@ng-select/ng-select';
import { NgBrazil } from 'ng-brazil';
import {
  PaginationModule,
  TooltipModule,
  TabsModule,
  TimepickerModule,
  BsDatepickerModule,
  ModalModule,
  AccordionModule,
} from 'ngx-bootstrap';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { ModuleWrapperModule } from 'src/app/core/module-wrapper/module-wrapper.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { TextMaskModule } from 'angular2-text-mask';
import { NgModule } from '@angular/core';
import { LogisticaEntradaMateriaisRoutingModule } from './entrada-materiais-routing.module';
//Components
import { LogisticaEntradaMateriaisNotasFiscaisListaComponent } from './notas-fiscais/lista/lista.component';
import { LogisticaEntradaMateriaisNotasFiscaisCadastroComponent } from './notas-fiscais/cadastro/cadastro.component';
import { LogisticaEntradaMateriaisComponent} from './entrada-materiais.component';
import { LogisticaEntradaMateriaisStatusRecebimentoCadastroComponent } from './status-recebimento/cadastro/cadastro.component';
import { LogisticaEntradaMateriaisStatusRecebimentoListaComponent } from './status-recebimento/lista/lista.component';
import { LogisticaEntradaMateriaisPainelAprovacaoListaComponent } from './painel-aprovacao/lista/lista.component';
import { LogisticaEntradaMateriaisMotivosListaComponent } from './motivos/lista/lista.component';
import { LogisticaEntradaMateriaisMotivosCadastroComponent } from './motivos/cadastro/cadastro.component';
import { LogisticaEntradaMateriaisTiposConformidadeListaComponent } from './tipos-conformidade/lista/lista.component';
import { LogisticaEntradaMateriaisTiposConformidadeCadastroComponent } from './tipos-conformidade/cadastro/cadastro.component';
import { LogisticaEntradaMateriaisFichaConformidadeListaComponent } from './ficha-conformidade/lista/lista.component';
import { LogisticaEntradaMateriaisFichasConformidadeCadastroComponent } from './ficha-conformidade/cadastro/cadastro.component';
import { LogisticaEntradaMateriaisFichasConformidadeDocumentosComponent } from './ficha-conformidade/documentos/documentos.component';
import { LogisticaEntradaMateriaisFichasConformidadeOcorrenciasComponent } from './ficha-conformidade/ocorrencias/ocorrencias.component';
import { LogisticaEntradaMateriaisParecerListaComponent } from './parecer/lista/lista.component';
import { LogisticaEntradaMateriaisParecerCadastroComponent } from './parecer/cadastro/cadastro.component';
import { LogisticaEntradaMateriaisNotasFiscaisDuplicadasComponent } from './notas-fiscais/lista/duplicadas/duplicadas.component';

@NgModule({
  declarations: [
    LogisticaEntradaMateriaisComponent,
    LogisticaEntradaMateriaisNotasFiscaisCadastroComponent,
    LogisticaEntradaMateriaisNotasFiscaisListaComponent,
    LogisticaEntradaMateriaisStatusRecebimentoListaComponent,
    LogisticaEntradaMateriaisStatusRecebimentoCadastroComponent,
    LogisticaEntradaMateriaisPainelAprovacaoListaComponent,
    LogisticaEntradaMateriaisMotivosListaComponent,
    LogisticaEntradaMateriaisMotivosCadastroComponent,
    LogisticaEntradaMateriaisTiposConformidadeListaComponent,
    LogisticaEntradaMateriaisTiposConformidadeCadastroComponent,
    LogisticaEntradaMateriaisFichaConformidadeListaComponent,
    LogisticaEntradaMateriaisFichasConformidadeCadastroComponent,
    LogisticaEntradaMateriaisFichasConformidadeDocumentosComponent,
    LogisticaEntradaMateriaisFichasConformidadeOcorrenciasComponent,
    LogisticaEntradaMateriaisParecerListaComponent,
    LogisticaEntradaMateriaisParecerCadastroComponent,
    LogisticaEntradaMateriaisNotasFiscaisDuplicadasComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CountoModule,
    ReactiveFormsModule,
    NgSelectModule,
    PaginationModule.forRoot(),
    TooltipModule.forRoot(),
    TabsModule.forRoot(),
    AccordionModule.forRoot(),
    TimepickerModule.forRoot(),
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    PipesModule,
    NotFoundModule,
    CurrencyMaskModule,
    ModuleWrapperModule,
    SharedModule,
    TemplatesModule,
    NgBrazil,
    TextMaskModule,
    LogisticaEntradaMateriaisRoutingModule,
  ],
})
export class LogisticaEntradaMateriaisModule {}
