import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { ComercialIntegracoesClassesMateriaisFormularioResolverGuard } from './classes-materiais/formulario/formulario-resolver.guard';

// Components
import { ComercialIntegracoesArcelorMittalComponent } from './arcelor-mittal.component';
import { ComercialIntegracoesArcelorMittalClassesMateriaisComponent } from './classes-materiais/classes-materiais.component';
import { ComercialIntegracoesArcelorMittalClassesMateriaisFormularioComponent } from './classes-materiais/formulario/formulario.component';
import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: ComercialIntegracoesArcelorMittalComponent,
      },
      {
        path: 'classes-de-materiais',
        children: [
          {
            path: '',
            component: ComercialIntegracoesArcelorMittalClassesMateriaisComponent,
          },
          {
            path: 'editar/:id',
            component: ComercialIntegracoesArcelorMittalClassesMateriaisFormularioComponent,
            resolve: {
              detalhes: ComercialIntegracoesClassesMateriaisFormularioResolverGuard,
            },
          },
        ],
      },
      {
        path: 'vendedores',
        loadChildren: () =>
          import('./vendedores/vendedores.module').then(
            (m) => m.ComercialIntegracoesArcelorMittalVendedoresModule
          ),
      },
    ],
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
export class ComercialIntegracoesArcelorMittalRoutingModule {}
