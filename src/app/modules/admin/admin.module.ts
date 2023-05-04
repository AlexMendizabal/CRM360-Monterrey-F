//angular
import { NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import ptBr from '@angular/common/locales/pt';

//ng-select
import { NgSelectModule } from '@ng-select/ng-select';

//common
import { ModuleWrapperModule } from 'src/app/core/module-wrapper/module-wrapper.module';
import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { PipesModule } from 'src/app/shared/pipes/pipes.module';

//ngx-bootstrap
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { ModalModule } from 'ngx-bootstrap/modal';
import {
  TooltipModule,
  TimepickerModule,
  BsDatepickerModule,
  defineLocale,
  ptBrLocale,
} from 'ngx-bootstrap';

registerLocaleData(ptBr);
defineLocale('pt-br', ptBrLocale);

//components
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { AdminHomeComponent } from './home/home.component';

@NgModule({
  declarations: [
    AdminComponent,
    AdminHomeComponent,
    /* AdminUsuariosListaComponent,
    AdminUsuariosCadastroComponent,
    AdminPerfisListaComponent,
    AdminPerfisCadastroComponent,
    AdminModulosListaComponent,
    AdminModulosCadastroComponent,
    AdminSubModulosListaComponent,
    AdminSubModulosCadastroComponent,
    AdminAtividadesCadastroComponent,
    AdminAtividadesListaComponent,
    AdminPrestadorServicoCompnent,
    AdminPrestadorServicoPessoasCadastroComponent,
    AdminPrestadorServicoPessoasListaComponent,
    AdminEmpresasListaComponent,
    AdminEmpresasCadastroComponent,
    AdminDepartamentosListaComponent,
    AdminDepartamentosCadastroComponent,
    AdminCargosCadastroComponent,
    AdminCargosListaComponent,
    AdminPerfisCadastroAtividadesComponent */
  ],
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    NgSelectModule,
    ReactiveFormsModule,
    PaginationModule.forRoot(),
    TabsModule.forRoot(),
    PaginationModule.forRoot(),
    TooltipModule.forRoot(),
    TimepickerModule.forRoot(),
    BsDatepickerModule.forRoot(),
    ModalModule.forRoot(),
    AdminRoutingModule,
    ModuleWrapperModule,
    NotFoundModule,
    SharedModule,
    TemplatesModule,
    PipesModule,
  ],
})
export class AdminModule { }
