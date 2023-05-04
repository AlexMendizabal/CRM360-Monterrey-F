import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';

// Components
import { ComercialPainelBobinasListaComponent } from './lista/lista.component';
import { ComercialPainelBobinasFormularioComponent } from './formulario/formulario.component';

//modules
import { ComercialCicloVendasPainelBobinasFormularioModule } from './formulario/formulario.module';

const routes: Routes = [
  { path: 'lista', component: ComercialPainelBobinasListaComponent },
  {
    path: 'novo',
    component: ComercialPainelBobinasFormularioComponent,
  },
  {
    path: '',
    redirectTo: 'lista',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    ComercialCicloVendasPainelBobinasFormularioModule,
  ],
  exports: [RouterModule],
})
export class ComercialPainelBobinasModuleRoutingModule {}
