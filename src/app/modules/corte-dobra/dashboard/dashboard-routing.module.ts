 import { RouterModule, Routes } from '@angular/router';
 import { NgModule } from '@angular/core';



 import { CorteDobraDashboardComponent } from './dashboard.component';
 import { CorteDobraDashboardFiltroComponent } from './filtro/filtro.component';
 import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';

 const routes: Routes = [
   {
     path: '',
     component: CorteDobraDashboardComponent,
   },
   {
     path: '',
     redirectTo: '',
     pathMatch: 'full'
   },
   {
     // path: 'filtro',
     // component: CorteDobraDashboardFiltroComponent
     path: 'dashboard',
     component: CorteDobraDashboardComponent
   },
   {
     path: '**',
     component: NotFoundComponent
   }
 ];

 @NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule]
 })
 export class CorteDobraDasboardRoutingModule { }