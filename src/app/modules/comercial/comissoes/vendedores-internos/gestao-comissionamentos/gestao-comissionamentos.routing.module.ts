import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
// import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialComissoesVendedoresInternosGestaoComissionamentosFormularioResolverGuard } from './formulario/formulario-resolver.guard';

// Components
import { ComercialComissoesVendedoresInternosGestaoComissionamentosListaComponent } from './lista/lista.component';
import { ComercialComissoesVendedoresInternosGestaoComissionamentosFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'lista', component: ComercialComissoesVendedoresInternosGestaoComissionamentosListaComponent },
      {
        path: '',
        redirectTo: 'lista',
        pathMatch: 'full',
      },
      {
        path: 'novo',
        component: ComercialComissoesVendedoresInternosGestaoComissionamentosFormularioComponent,
        resolve: {
          detalhes: ComercialComissoesVendedoresInternosGestaoComissionamentosFormularioResolverGuard,
        },
      },
      {
        path: 'editar/:id',
        component: ComercialComissoesVendedoresInternosGestaoComissionamentosFormularioComponent,
        resolve: {
          detalhes: ComercialComissoesVendedoresInternosGestaoComissionamentosFormularioResolverGuard,
        },
      },
    ]
  },



];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComercialComissoesVendedoresInternosGestaoComissionamentosRoutingModule {}
