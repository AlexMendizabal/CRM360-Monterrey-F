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

//components
import { ComercialPainelBobinasFormularioComponent } from './formulario.component';
import { ComercialCicloVendasPainelBobinasFormularioModalDetalhesContatoComponent } from './modal/contato/contato.component';
import { ComercialCicloVendasPainelBobinasFormularioModalDetalhesEnderecoComponent } from './modal/endereco/endereco.component';

//services
import { ComercialCicloVendasPainelBobinasFormularioModalDetalhesContatoService } from './modal/contato/contato.service';
import { ComercialCicloVendasPainelBobinasFormularioModalDetalhesEnderecoService } from './modal/endereco/endereco.service';

@NgModule({
  declarations: [
    ComercialPainelBobinasFormularioComponent,
    ComercialCicloVendasPainelBobinasFormularioModalDetalhesContatoComponent,
    ComercialCicloVendasPainelBobinasFormularioModalDetalhesEnderecoComponent,
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
    NgBrazil,
    CountoModule,
    ReactiveFormsModule,
    SharedModule,
    TemplatesModule,
    ComercialTemplatesModule,
  ],
  exports: [
    ComercialCicloVendasPainelBobinasFormularioModalDetalhesContatoComponent,
    ComercialCicloVendasPainelBobinasFormularioModalDetalhesEnderecoComponent,
  ],
  entryComponents: [
    ComercialCicloVendasPainelBobinasFormularioModalDetalhesContatoComponent,
    ComercialCicloVendasPainelBobinasFormularioModalDetalhesEnderecoComponent,
  ],
  providers: [
    BsModalRef,
    ComercialCicloVendasPainelBobinasFormularioModalDetalhesContatoService,
    ComercialCicloVendasPainelBobinasFormularioModalDetalhesEnderecoService,
  ],
})
export class ComercialCicloVendasPainelBobinasFormularioModule {}
