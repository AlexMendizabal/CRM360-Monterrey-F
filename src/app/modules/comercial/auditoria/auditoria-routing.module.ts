import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { ComercialAuditoriaComponent } from './auditoria.component';
import { ComercialAuditoriaEnderecosEntregaComponent } from './enderecos-entrega/enderecos-entrega.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ComercialAuditoriaComponent
      },
      {
        path: 'endereco-entrega',
        children: [
          {
            path: '',
            component: ComercialAuditoriaEnderecosEntregaComponent
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComercialAuditoriaRoutingModule {}
