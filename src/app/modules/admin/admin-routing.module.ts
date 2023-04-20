//angular
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//services
import { NotFoundComponent } from 'src/app/core/not-found/not-found.component';

//components
import { AdminComponent } from './admin.component';
import { AdminHomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: 'home',
        component: AdminHomeComponent,
      },
      {
        path: 'modulos',
        loadChildren: () => import('./modulos/modulos.module').then(m => m.ModulosModule)
      },
      {
        path: 'submodulos',
        loadChildren: () => import('./submodulos/submodulos.module').then(m => m.AdminSubmodulosModule)
      },
      {
        path: 'perfis',
        loadChildren: () => import('./perfis/perfis.module').then(m => m.AdminPerfisModule)
      }, 
      {
        path: 'atividades',
        loadChildren: () => import('./atividades/atividades.module').then(m => m.AdminAtividadesModule)
      },
      {
        path: 'usuarios',
        loadChildren: () => import('./usuarios/usuarios.module').then(m => m.AdminUsuariosModule)
      }, 
      /*
      {
        path: 'usuarios',
        children: [
          {
            path: 'lista',
            component: AdminUsuariosListaComponent,
          },
          {
            path: 'cadastro',
            component: AdminUsuariosCadastroComponent,
          },
          {
            path: '',
            redirectTo: 'lista',
            pathMatch: 'full',
          },
        ],
      },
      {
        path: 'prestador-servico/pessoas',
        children: [
          {
            path: 'lista',
            component: AdminPrestadorServicoPessoasListaComponent,
          },
          {
            path: 'cadastro',
            component: AdminPrestadorServicoPessoasCadastroComponent,
          },
          {
            path: '',
            redirectTo: 'lista',
            pathMatch: 'full',
          },
        ],
      },
      {
        path: 'empresas',
        children: [
          {
            path: 'lista',
            component: AdminEmpresasListaComponent,
          },
          {
            path: 'cadastro',
            component: AdminEmpresasCadastroComponent,
          },
          {
            path: '',
            redirectTo: 'lista',
            pathMatch: 'full',
          },
        ],
      },
      {
        path: 'departamentos',
        children: [
          {
            path: 'lista',
            component: AdminDepartamentosListaComponent,
          },
          {
            path: 'cadastro',
            component: AdminDepartamentosCadastroComponent,
          },
          {
            path: '',
            redirectTo: 'lista',
            pathMatch: 'full',
          },
        ],
      },
      {
        path: 'cargos',
        children: [
          {
            path: 'lista',
            component: AdminCargosListaComponent,
          },
          {
            path: 'cadastro',
            component: AdminCargosCadastroComponent,
          },
          {
            path: '',
            redirectTo: 'lista',
            pathMatch: 'full',
          },
        ],
      }, */
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: '**',
        component: NotFoundComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule { }
