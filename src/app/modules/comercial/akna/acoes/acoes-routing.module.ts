import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//components
import { ComercialAknaAcoesListaComponent } from './lista/lista.component';
import { ComercialAknaAcoesFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  {
    path: '',
    component: ComercialAknaAcoesListaComponent,
  },
  {
    path: 'novo',
    component: ComercialAknaAcoesFormularioComponent,
  },
  {
    path: ':id',
    component: ComercialAknaAcoesFormularioComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComercialAknaAcoesRoutingModule {}
