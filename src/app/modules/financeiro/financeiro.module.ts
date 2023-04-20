import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Modules
import { FinanceiroRoutingModule } from './financeiro-routing.module';
import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { ModuleWrapperModule } from 'src/app/core/module-wrapper/module-wrapper.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';

// Components
import { FinanceiroComponent } from './financeiro.component';
import { FinanceiroHomeComponent } from './home/home.component';
import { FinanceiroRelatorioDuplicatasComponent } from './relatorio-duplicatas/relatorio-duplicatas.component';
import { FinanceiroDuplicataNaoAceitaBolDescComponent } from './duplicata-nao-aceita-bol-desc/duplicata-nao-aceita-bol-desc.component';

@NgModule({
  declarations: [
    FinanceiroComponent,
    FinanceiroHomeComponent,
    FinanceiroRelatorioDuplicatasComponent,
    FinanceiroDuplicataNaoAceitaBolDescComponent,
  ],
  imports: [
    CommonModule,
    FinanceiroRoutingModule,
    NotFoundModule,
    ModuleWrapperModule,
    SharedModule,
  ],
})
export class FinanceiroModule {}
