import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';
import { LogisticaEstoquePainelInventarioInventarioComponent } from './inventario/inventario.component';
import { LogisticaEstoquePainelInventarioCadastroComponent } from './cadastro/cadastro.component';
import { LogisticaEstoquePainelInventarioInventarioListaComponent } from './inventario/lista/lista.component';
import { LogisticaEstoquePainelInventarioInventarioMateriaisNotasFiscaisComponent } from './inventario/materiais-notas-fiscais/materiais-notas-fiscais.component';
import { LogisticaEstoquePainelInventarioInventarioMateriaisOcorrenciasComponent } from './inventario/materiais-ocorrencias/materiais-ocorrencias.component';
import { LogisticaEstoquePainelInventarioInventarioRelatorioComponent } from './inventario/relatorio/relatorio.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'lista',
    pathMatch: 'full',
  },
  {
    path: 'lista',
    component: LogisticaEstoquePainelInventarioInventarioComponent,
  },
  {
    path: ':id/contagem-materiais',
    component: LogisticaEstoquePainelInventarioInventarioListaComponent,
  },
  {
    path: ':id/notas-fiscais',
    component: LogisticaEstoquePainelInventarioInventarioMateriaisNotasFiscaisComponent,
  },
  {
    path: ':id/ocorrencias',
    component: LogisticaEstoquePainelInventarioInventarioMateriaisOcorrenciasComponent,
  },
  {
    path: ':id/relatorio',
    component: LogisticaEstoquePainelInventarioInventarioRelatorioComponent,
  },
  {
    path: 'cadastro',
    component: LogisticaEstoquePainelInventarioCadastroComponent,
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
export class LogisticaEstoquePainelInventarioRoutingModule {}
