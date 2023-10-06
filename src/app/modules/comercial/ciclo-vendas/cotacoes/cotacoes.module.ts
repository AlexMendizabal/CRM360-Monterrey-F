import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Modules
import { ComercialCicloVendasCotacoesRoutingModule } from './cotacoes-routing.module';
import { ComercialCicloVendasCotacoesListaModule } from './lista/lista.module';
import { ComercialCicloVendasCotacoesFormularioModule } from './formulario/formulario.module';


// Interfaces
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ComercialCicloVendasCotacoesRoutingModule,
    ComercialCicloVendasCotacoesListaModule,
    ComercialCicloVendasCotacoesFormularioModule
  ],
  providers: [FormDeactivateGuard],
})
export class ComercialCicloVendasCotacoesModule {}
