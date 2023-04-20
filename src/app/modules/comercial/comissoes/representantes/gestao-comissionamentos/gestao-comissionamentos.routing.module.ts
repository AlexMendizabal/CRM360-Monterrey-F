import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
// import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialComissoesGestaoComissionamentosFormularioResolverGuard } from './formulario/formulario-resolver.guard';

// Components
import { ComercialComissoesGestaoComissionamentosListaComponent } from './lista/lista.component';
import { ComercialComissoesGestaoComissionamentosFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'lista', component: ComercialComissoesGestaoComissionamentosListaComponent },
      {
        path: '',
        redirectTo: 'lista',
        pathMatch: 'full',
      },
      {
        path: 'novo',
        component: ComercialComissoesGestaoComissionamentosFormularioComponent,
        resolve: {
          detalhes: ComercialComissoesGestaoComissionamentosFormularioResolverGuard,
        },
      },
      {
        path: 'editar/:id',
        component: ComercialComissoesGestaoComissionamentosFormularioComponent,
        resolve: {
          detalhes: ComercialComissoesGestaoComissionamentosFormularioResolverGuard,
        },
      },
    ]
  },



];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComercialComissoesGestaoComissionamentosRoutingModule {}
