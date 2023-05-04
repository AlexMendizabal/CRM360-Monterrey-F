import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//components
import { ComercialAknaContatosListaComponent } from './lista/lista.component';
import { ComercialAknaContatosFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  {
    path: 'lista',
    component: ComercialAknaContatosListaComponent,
  },
  {
    path: 'novo',
    component: ComercialAknaContatosFormularioComponent,
  },
  {
    path: ':id',
    component: ComercialAknaContatosFormularioComponent,
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
export class ComercialAknaContatosRoutingModule {}
