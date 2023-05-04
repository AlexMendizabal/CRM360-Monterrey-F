import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';

import { ServicosContatosListaComponent } from './lista/lista.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'lista',
        pathMatch: 'full'
      },
      { path: 'lista', component: ServicosContatosListaComponent },
      {
        path: 'contatos',
        loadChildren: () =>
          import('./contatos.module').then(m => m.ServicosContatosModule)
      },
      {
        path: '**',
        component: NotFoundComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServicosContatosRoutingModule {}
