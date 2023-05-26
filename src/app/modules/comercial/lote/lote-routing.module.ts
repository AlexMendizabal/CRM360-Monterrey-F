import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
/* import { ComercialAgendaAcessosResolverGuard } from './guards/acessos-resolver.guard';
import { ComercialAgendaDetalhesResolverGuard } from './guards/detalhes-resolver.guard'; */

// Components
/* import { ComercialAgendaCompromissosComponent } from './compromissos/compromissos.component';
import { ComercialAgendaDetalhesComponent } from './detalhes/detalhes.component';
import { ComercialAgendaFormularioComponent } from './formulario/formulario.component'; */
import { ComercialLoteRutaComponent } from './ruta/ruta.component';
import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';

const routes: Routes = [
  { path: 'ruta', component: ComercialLoteRutaComponent},
  {
    path: '**',
    component: NotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComercialRoutingLoteModule {}
