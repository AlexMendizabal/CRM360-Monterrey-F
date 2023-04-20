import { ComercialCicloVendasPedidosProducaoTelasFormularioModalDetalhesComponent } from './modal/detalhes/cliente.component';
import { ComercialCicloVendasPedidosProducaoTelasFormularioModalSelecionarComponent } from './modal/selecionar/selecionar.component';
import { ComercialCicloVendasPedidosProducaoTelasFormularioModalSelecionarService } from './modal/selecionar/selecionar.service';
import { ComercialCicloVendasPedidosProducaoTelasFormularioModalDetalhesService } from './modal/detalhes/cliente.service';
import { ComercialCicloVendasCotacoesFormularioModule } from './../../cotacoes/formulario/formulario.module';
import { ComercialCicloVendasPedidosProducaoTelasFormularioModalFinalizacaoService } from './modal/finalizacao/finalizacao.service';
import { ComercialCicloVendasPedidosProducaoTelasFormularioModalHistoricoExclusaoService } from './modal/historico-exclusao/historico-exclusao.service';
import { ComercialCicloVendasPedidosProducaoTelasFormularioModalMaterialCalculoService } from './modal/material/calculo/calculo.service';
import { ComercialCicloVendasPedidosProducaoTelasFormularioModalFinalizacaoPerdidaComponent } from './modal/finalizacao/perdida/perdida.component';
import { ComercialCicloVendasPedidosProducaoTelasFormularioModalFinalizacaoPadraoComponent } from './modal/finalizacao/padrao/padrao.component';
import { ComercialCicloVendasPedidosProducaoTelasFormularioModalHistoricoExclusaoComponent } from './modal/historico-exclusao/historico-exclusao.component';
import { ComercialCicloVendasPedidosProducaoTelasFormularioModalMaterialCalculoComponent } from './modal/material/calculo/calculo.component';
import { ComercialCicloVendasPedidosProducaoTelasFormularioCarrinhoComponent } from './carrinho/carrinho.component';
import { ComercialCicloVendasPedidosProducaoTelasFormularioMateriaisListaComponent } from './materiais/lista/lista.component';
import { ComercialCicloVendasPedidosProducaoTelasFormularioComponent } from './formulario.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// ngx-bootstrap
import { PopoverModule } from 'ngx-bootstrap/popover';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule, BsModalRef } from 'ngx-bootstrap/modal';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// ng2-currency-mask
import { CurrencyMaskModule } from 'ng2-currency-mask';

// ng-brazil
import { TextMaskModule } from 'angular2-text-mask';
import { NgBrazil } from 'ng-brazil';

// angular2-counto
import { CountoModule } from 'angular2-counto';

// Modules
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { ComercialTemplatesModule } from '../../../templates/templates.module';

// Components

// Services

@NgModule({
  declarations: [
    ComercialCicloVendasPedidosProducaoTelasFormularioMateriaisListaComponent,
    ComercialCicloVendasPedidosProducaoTelasFormularioComponent,
    ComercialCicloVendasPedidosProducaoTelasFormularioCarrinhoComponent,
    ComercialCicloVendasPedidosProducaoTelasFormularioModalHistoricoExclusaoComponent,
    ComercialCicloVendasPedidosProducaoTelasFormularioModalFinalizacaoPadraoComponent,
    ComercialCicloVendasPedidosProducaoTelasFormularioModalFinalizacaoPerdidaComponent,
    ComercialCicloVendasPedidosProducaoTelasFormularioModalMaterialCalculoComponent,
    ComercialCicloVendasPedidosProducaoTelasFormularioModalSelecionarComponent,
    ComercialCicloVendasPedidosProducaoTelasFormularioModalDetalhesComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PopoverModule.forRoot(),
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    CarouselModule.forRoot(),
    TooltipModule.forRoot(),
    TabsModule.forRoot(),
    BsDatepickerModule.forRoot(),
    NgSelectModule,
    CurrencyMaskModule,
    TextMaskModule,
    //NgBrazil,
    CountoModule,
    ReactiveFormsModule,
    SharedModule,
    TemplatesModule,
    ComercialTemplatesModule,
    ComercialCicloVendasCotacoesFormularioModule,
  ],
  providers: [
    BsModalRef,
    ComercialCicloVendasPedidosProducaoTelasFormularioModalMaterialCalculoService,
    ComercialCicloVendasPedidosProducaoTelasFormularioModalHistoricoExclusaoService,
    ComercialCicloVendasPedidosProducaoTelasFormularioModalFinalizacaoService,
    ComercialCicloVendasPedidosProducaoTelasFormularioModalDetalhesService,
    ComercialCicloVendasPedidosProducaoTelasFormularioModalSelecionarService,
  ],
  entryComponents: [
    ComercialCicloVendasPedidosProducaoTelasFormularioModalMaterialCalculoComponent,
    ComercialCicloVendasPedidosProducaoTelasFormularioModalSelecionarComponent,
    ComercialCicloVendasPedidosProducaoTelasFormularioModalDetalhesComponent,
  ],
})
export class ComercialCicloVendasPedidosProducaoTelasFormularioModule {}
