import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// ngx-bootstrap
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// ng-brazil
import { TextMaskModule } from 'angular2-text-mask';
import { NgBrazil } from 'ng-brazil';

// ng2-currency-mask
import { CurrencyMaskModule } from 'ng2-currency-mask';

// ng2-file-upload
import { FileUploadModule } from 'ng2-file-upload';

// Modules
import { PipesModule } from 'src/app/shared/pipes/pipes.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { ComercialCadastrosRoutingModule } from './cadastro-routing.module';

// Components
import { ComercialClientesCadastroComponent } from './cadastro.component';
import { ComercialClientesCadastroDadosFaturamentoDetalhesComponent } from './dados-faturamento/detalhes/detalhes.component';
import { ComercialClientesCadastroDadosFaturamentoFormularioComponent } from './dados-faturamento/formulario/formulario.component';
import { ComercialClientesCadastroEnderecosDetalhesComponent } from './enderecos/detalhes/detalhes.component';
import { ComercialClientesCadastroEnderecosFormularioComponent } from './enderecos/formulario/formulario.component';
import { ComercialClientesCadastroContatosDetalhesComponent } from './contatos/detalhes/detalhes.component';
import { ComercialClientesCadastroContatosFormularioComponent } from './contatos/formulario/formulario.component';
import { ComercialClientesCadastroDadosRelacionamentoDetalhesComponent } from './dados-relacionamento/detalhes/detalhes.component';
import { ComercialClientesCadastroDadosRelacionamentoFormularioComponent } from './dados-relacionamento/formulario/formulario.component';
import { ComercialClientesCadastroPotencialCompraDetalhesComponent } from './potencial-compra/detalhes/detalhes.component';
import { ComercialClientesCadastroPotencialCompraFormularioComponent } from './potencial-compra/formulario/formulario.component';
import { ComercialClientesCadastroAnexosDetalhesComponent } from './anexos/detalhes/detalhes.component';
import { ComercialClientesCadastroAnexosFormularioComponent } from './anexos/formulario/formulario.component';
import { ComercialClientesCadastroFilialDetalhesComponent } from './filial/detalhes/detalhes.component';
import { ComercialClientesCadastroTravasDetalhesComponent } from './travas/detalhes/detalhes.component';
import { ComercialClientesCadastroInfosFinanceirasDetalhesComponent } from './informacoes-financeiras/detalhes/detalhes.component';
import { ComercialClientesCadastroInfosComerciaisDetalhesComponent } from './informacoes-comerciais/detalhes/detalhes.component';

@NgModule({
  declarations: [
    ComercialClientesCadastroComponent,
    ComercialClientesCadastroDadosFaturamentoDetalhesComponent,
    ComercialClientesCadastroDadosFaturamentoFormularioComponent,
    ComercialClientesCadastroEnderecosDetalhesComponent,
    ComercialClientesCadastroEnderecosFormularioComponent,
    ComercialClientesCadastroContatosDetalhesComponent,
    ComercialClientesCadastroContatosFormularioComponent,
    ComercialClientesCadastroDadosRelacionamentoDetalhesComponent,
    ComercialClientesCadastroDadosRelacionamentoFormularioComponent,
    ComercialClientesCadastroPotencialCompraDetalhesComponent,
    ComercialClientesCadastroPotencialCompraFormularioComponent,
    ComercialClientesCadastroAnexosDetalhesComponent,
    ComercialClientesCadastroAnexosFormularioComponent,
    ComercialClientesCadastroFilialDetalhesComponent,
    ComercialClientesCadastroTravasDetalhesComponent,
    ComercialClientesCadastroInfosFinanceirasDetalhesComponent,
    ComercialClientesCadastroInfosComerciaisDetalhesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule.forRoot(),
    AccordionModule.forRoot(),
    TimepickerModule.forRoot(),
    NgSelectModule,
    TextMaskModule,
    NgBrazil,
    CurrencyMaskModule,
    FileUploadModule,
    PipesModule,
    SharedModule,
    TemplatesModule.forRoot(),
    ComercialCadastrosRoutingModule
  ]
})
export class ComercialClientesCadastroModule {}
