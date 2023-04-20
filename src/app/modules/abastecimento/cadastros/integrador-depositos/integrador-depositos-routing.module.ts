import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AbastecimentoCadastrosIntegradorDepositosCadastroComponent } from './cadastro/cadastro.component';
import { AbastecimentoCadastrosIntegradorDepositosListaComponent } from './lista/lista.component';


const routes: Routes = [
  {
    path: '',
    children: [
      {
        path:'lista',
        component: AbastecimentoCadastrosIntegradorDepositosListaComponent
      },
  
      {
        path: 'cadastro',
        component: AbastecimentoCadastrosIntegradorDepositosCadastroComponent
      },
      {
        path: '',
        redirectTo: 'lista',
        pathMatch: 'full'
      }
    ]
  }
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AbastecimentoCadastrosIntegradorDepositosRoutingModule { }
