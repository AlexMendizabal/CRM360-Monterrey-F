import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';

// Components
import { ComercialGestaoAssociacoesCoordenadoresEscritoriosFormularioComponent } from './formulario/formulario.component';

const routes: Routes = [
  {
    path: '',
    component: ComercialGestaoAssociacoesCoordenadoresEscritoriosFormularioComponent,
    canDeactivate: [FormDeactivateGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComercialGestaoAssociacioesCoordenadoresEscritoriosRoutingModule {}
