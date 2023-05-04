import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AbastecimentoHomeComponent } from './home.component';


const routes: Routes = [{ path: '', component: AbastecimentoHomeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AbastecimentoHomeRoutingModule { }
