import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { TecnologiaInformacaoHomeComponent } from './home.component';

const routes: Routes = [
  { path: '', component: TecnologiaInformacaoHomeComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TecnologiaInformacaoHomeRoutingModule {}
