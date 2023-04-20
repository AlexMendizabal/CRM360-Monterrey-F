import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';

import { ControladoriaListaSaldosBancosComponent } from './listas/saldos-bancos/saldos-bancos.component';
import { ControladoriaCadastroSaldosBancosComponent } from './cadastros/saldos-bancos/saldos-bancos.component';
import { ControladoriaListaTiposSaldosBancosComponent } from './listas/tipos-saldos-bancos/tipos-saldos-bancos.component';
import { ControladoriaCadastroTiposSaldosBancosComponent } from './cadastros/tipos-saldos-bancos/tipos-saldos-bancos.component';

const routes: Routes = [
  
  {
    path: 'tipos-saldos-bancos',
    children: [
      {
        path: '',
        component: ControladoriaListaTiposSaldosBancosComponent,
      },
      {
        path: 'novo',
        component: ControladoriaCadastroTiposSaldosBancosComponent,
      },
      {
        path: ':id',
        component: ControladoriaCadastroTiposSaldosBancosComponent,
      }
    ]
  },
  {
    path: '',
    component: ControladoriaListaSaldosBancosComponent
  },
  {
    path: 'novo',
    component: ControladoriaCadastroSaldosBancosComponent,
  },
  {
    path: ':id',
    component: ControladoriaCadastroSaldosBancosComponent,
  },
  {
    path: '**',
    component: NotFoundComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ControladoriaSaldosBancosRoutingModule { }
