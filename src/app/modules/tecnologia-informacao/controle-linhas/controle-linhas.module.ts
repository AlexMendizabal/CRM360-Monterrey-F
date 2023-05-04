import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// ngx-bootstrap
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// ng-brazil
import { TextMaskModule } from 'angular2-text-mask';
import { NgBrazil } from 'ng-brazil';

// ng2-currency-mask
import { CurrencyMaskModule } from 'ng2-currency-mask';

// PNotify
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

// Modules
import { PipesModule } from './../../../shared/pipes/pipes.module';
import { TecnologiaInformacaoControleLinhaRoutingModule } from './controle-linhas-routing.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';

// Components
import { TecnologiaInformacaoControleLinhaListaComponent } from './lista/lista.component';
import { TecnologiaInformacaoControleLinhaFormularioComponent } from './formulario/formulario.component';
import { TecnologiaInformacaoControleLinhaTermoResponsabilidadeComponent } from './termo-responsabilidade/termo-responsabilidade.component';

@NgModule({
  declarations: [
    TecnologiaInformacaoControleLinhaListaComponent,
    TecnologiaInformacaoControleLinhaFormularioComponent,
    TecnologiaInformacaoControleLinhaTermoResponsabilidadeComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PaginationModule.forRoot(),
    TooltipModule.forRoot(),
    BsDatepickerModule.forRoot(),
    NgSelectModule,
    TextMaskModule,
    NgBrazil,
    CurrencyMaskModule,
    TecnologiaInformacaoControleLinhaRoutingModule,
    SharedModule,
    PipesModule,
    TemplatesModule
  ],
  providers: [PNotifyService]
})
export class TecnologiaInformacaoControleLinhaModule {}
