import { NotFoundComponent } from './../../../../core/not-found/not-found.component';

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


import { ComercialCadastroPainelCustosListaComponent } from './lista/lista.component';
import { ComercialCadastroPainelCustosFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  {
    path: '',
    component: ComercialCadastroPainelCustosListaComponent,
  },
  {
    path: 'novo',
    component: ComercialCadastroPainelCustosFormularioComponent,
  },
  {
    path: 'editar/:id',
    component: ComercialCadastroPainelCustosFormularioComponent,
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComercialCadastroPainelCustosRoutingModule {}
