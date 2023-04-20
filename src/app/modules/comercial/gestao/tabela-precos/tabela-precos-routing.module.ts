import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
// import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';
import { ComercialGestaoTabelaPrecosFormularioResolverGuard } from './formulario/formulario-resolver.guard';

// Components
import { ComercialGestaoTabelaPrecosListaComponent } from './lista/lista.component';
import { ComercialGestaoTabelaPrecosFormularioComponent } from './formulario/formulario.component';
import { ComercialGestaoTabelaPrecoVisaoComercialComponent } from './visao-comercial/visao-comercial.component';
import { ComercialGestaoTabelaPrecosImportarCsvComponent } from './importar-csv/importar-csv.component';

const routes: Routes = [
  {
    path: 'lista', component: ComercialGestaoTabelaPrecosListaComponent
  },
  {
    path: 'novo',
    component: ComercialGestaoTabelaPrecosFormularioComponent,
    resolve: {
      detalhes: ComercialGestaoTabelaPrecosFormularioResolverGuard,
    },
  },
  {
    path: 'editar/:id',
    component: ComercialGestaoTabelaPrecosFormularioComponent,
    resolve: {
      detalhes: ComercialGestaoTabelaPrecosFormularioResolverGuard,
    },
  },
  {
    path: 'visao-comercial', component: ComercialGestaoTabelaPrecoVisaoComercialComponent
  },
  {
    path: 'importar-csv/:id',
    component: ComercialGestaoTabelaPrecosImportarCsvComponent,
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
export class ComercialGestaoTabelaPrecosRoutingModule {}
