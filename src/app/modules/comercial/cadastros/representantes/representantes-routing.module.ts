import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
// import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialCadastrosRepresentantesFormularioResolverGuard } from './formulario/formulario-resolver.guard';

// Components
import { ComercialCadastrosRepresentantesListaComponent } from './lista/lista.component';
import { ComercialCadastrosRepresentantesFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: 'lista', component: ComercialCadastrosRepresentantesListaComponent },
      {
        path: '',
        redirectTo: 'lista',
        pathMatch: 'full',
      },
      {
        path: 'novo',
        component: ComercialCadastrosRepresentantesFormularioComponent,
        resolve: {
          detalhes: ComercialCadastrosRepresentantesFormularioResolverGuard,
        },
      },
      {
        path: 'editar/:id',
        component: ComercialCadastrosRepresentantesFormularioComponent,
        resolve: {
          detalhes: ComercialCadastrosRepresentantesFormularioResolverGuard,
        },
      },
    ]
  },



];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComercialCadastrosRepresentantesRoutingModule {}
