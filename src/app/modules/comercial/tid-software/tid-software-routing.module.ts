import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { ComercialTidSoftwareComponent } from './tid-software.component';

const routes: Routes = [{ path: '', component: ComercialTidSoftwareComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComercialTidSoftwareRoutingModule {}
