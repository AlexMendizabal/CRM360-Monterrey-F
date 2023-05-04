import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';


import { LogisticaEstoqueInventarioComponent } from './inventario.component';
import { LogisticaEstoqueInventarioFiltroComponent } from './filtro/filtro.component';
import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';
import { LogisticaEstoqueInventarioListaComponent } from './lista/lista.component';
import { LogisticaEstoqueInventarioListaInventarioComponent } from './lista/inventario/inventario.component';
import { LogisticaEstoqueInventarioListaRelatorioComponent } from './lista/relatorio/relatorio.component';

const routes: Routes = [
  {
    path: '',
    component: LogisticaEstoqueInventarioComponent,
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  },
  {
    path: 'filtro',
    component: LogisticaEstoqueInventarioFiltroComponent
  },
  {
    path: 'inventario',
    component: LogisticaEstoqueInventarioListaInventarioComponent
  },
  {
    path: ':id/relatorio',
    component: LogisticaEstoqueInventarioListaRelatorioComponent
  },
  {
    path: ':id/contagem-materiais',
    component: LogisticaEstoqueInventarioListaComponent
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LogisticaEstoqueInventarioRoutingModule { }