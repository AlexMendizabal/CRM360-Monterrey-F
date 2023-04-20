import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialCadastrosEscritorioFormularioResolverGuard } from './formulario/formulario-resolver.guard';

// Components
import { ComercialCadastrosEscritorioListaComponent } from './lista/lista.component';
import { ComercialCadastrosEscritorioFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  { path: 'lista', component: ComercialCadastrosEscritorioListaComponent },
  {
    path: 'novo',
    component: ComercialCadastrosEscritorioFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosEscritorioFormularioResolverGuard
    },
    canDeactivate: [FormDeactivateGuard]
  },
  {
    path: 'editar/:id',
    component: ComercialCadastrosEscritorioFormularioComponent,
    resolve: {
      detalhes: ComercialCadastrosEscritorioFormularioResolverGuard
    },
    canDeactivate: [FormDeactivateGuard]
  },
  {
    path: '',
    redirectTo: 'lista',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComercialCadastrosEscritorioModuleRoutingModule {}
