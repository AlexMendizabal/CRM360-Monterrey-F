import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Modules
import { ComercialCicloVendasAutorizacionesRoutingModule } from './autorizaciones-routing.module';
import { ComercialCicloVendasCotacoesListaModule } from './lista/lista.module';
import { ComercialCicloVendasCotacoesFormularioModule } from './formulario/formulario.module';
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { VistaComponent } from '../cotacoes/lista/vista/vista.component'; 

@NgModule({
  declarations: [
    VistaComponent, 
  ],
  imports: [
    CommonModule,
    ComercialCicloVendasAutorizacionesRoutingModule,
    ComercialCicloVendasCotacoesListaModule,
    ComercialCicloVendasCotacoesFormularioModule,
  ],
  providers: [FormDeactivateGuard],
})
export class ComercialCicloVendasAutorizacionesModule {}
