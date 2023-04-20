import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { ComercialReenvioXmlListaComponent } from './lista/lista.component';

const routes: Routes = [
  { path: '', component: ComercialReenvioXmlListaComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComercialReenvioXmlRoutingModule {}
