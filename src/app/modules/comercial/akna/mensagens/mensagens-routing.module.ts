import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//components
import { ComercialAknaMensagensListaComponent } from './lista/lista.component';
import { ComercialAknaMensagensFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  {
    path: 'lista',
    component: ComercialAknaMensagensListaComponent,
  },
  {
    path: '',
    redirectTo: 'lista',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComercialAknaMensagensRoutingModule {}
