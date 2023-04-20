import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';

import { ControladoriaListaFluxoCaixaComponent } from './listas/fluxo-caixa/fluxo-caixa.component';
import { ControladoriaCadastrosFluxoCaixaComponent } from './cadastros/fluxo-caixa/fluxo-caixa.component';
import { ControladoriaTiposFluxoCaixaComponent } from './listas/tipos-fluxo-caixa/tipos-fluxo-caixa.component';
import { ControladoriaCadastroTiposFluxoCaixaComponent } from './cadastros/tipos-fluxo-caixa/tipos-fluxo-caixa.component';
import { ControladoriaListaEmpresasComponent } from './listas/empresas/empresas.component';
import { ControladoriaCadastroEmpresasComponent } from './cadastros/empresas/empresas.component';
import { ControladoriaListaBancosComponent } from './listas/bancos/bancos.component';
import { ControladoriaCadastroBancosComponent } from './cadastros/bancos/bancos.component';

const routes: Routes = [
  {
    path: 'tipos-fluxo-caixa',
    children: [
      {
        path: '',
        component: ControladoriaTiposFluxoCaixaComponent,
      },
      {
        path: 'novo',
        component: ControladoriaCadastroTiposFluxoCaixaComponent,
      },
      {
        path: ':id',
        component: ControladoriaCadastroTiposFluxoCaixaComponent,
      }      
    ]
  },
  {
  path: 'empresas',
    children: [
      {
        path: '',
        component: ControladoriaListaEmpresasComponent,
      },
      {
        path: 'novo',
        component: ControladoriaCadastroEmpresasComponent,
      },
      {
        path: ':id',
        component: ControladoriaCadastroEmpresasComponent,
      }
    ]
  },
  {
  path: 'bancos',
    children: [
      {
        path: '',
        component: ControladoriaListaBancosComponent,
      },
      {
        path: 'novo',
        component: ControladoriaCadastroBancosComponent,
      },
      {
        path: ':id',
        component: ControladoriaCadastroBancosComponent,
      }
    ]
  },
  {
    path: '',
    component: ControladoriaListaFluxoCaixaComponent
  },
  {
    path: 'novo',
    component: ControladoriaCadastrosFluxoCaixaComponent,
  },
  {
    path: ':id',
    component: ControladoriaCadastrosFluxoCaixaComponent,
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
export class ControladoriaFluxoCaixaRoutingModule { }
