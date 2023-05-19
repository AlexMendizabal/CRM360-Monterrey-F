import { Component, OnInit, Input, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

// Services
import { AuthService } from 'src/app/shared/services/core/auth.service';
import { ModulosService } from 'src/app/shared/services/requests/modulos.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { WindowService } from 'src/app/shared/services/core/window.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { AdminModulosService } from 'src/app/modules/admin/modulos/services/modulos.service';
import { ChangePasswordModalService } from '../change-password-modal/change-password-modal.service';

@Component({
  selector: 'header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [WindowService]
})
export class HeaderComponent implements OnInit {
  @Input('showLoader') showLoader: boolean;

  showLogoCliente = true;
  srcLogoCliente: string;

  user: any = {};
  userName: string;

  modulos: any = [];
  modulosLoaded = false;
  modulosError = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private modulosService: ModulosService,
    private _modulosService: AdminModulosService,
    private pnotifyService: PNotifyService,
    private windowService: WindowService,
    private titleService: TitleService,
    private changePasswordModalService: ChangePasswordModalService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit() {
    this.getCurrentUser();
    this.getClienteLogo();
    this.getModulos();
  }

  getClienteLogo() {
    this.srcLogoCliente = `/assets/images/logo/clientes/${this.windowService.getHostnameLogo()}_branco.png`;
  }

  onLogoClienteError(event: any) {
    this.showLogoCliente = false;
  }

  checkTipoAcessoUser() {
    return this.user.tipoAcesso == 'Externo' ? false : true;
  }

  getCurrentUser() {
    this.user = this.authService.getCurrentUser().info;

    if (
      this.user.nomeAbreviado.trim() != null ||
      this.user.nomeAbreviado.trim() != ''
    ) {
      this.userName = this.user.nomeAbreviado;
    } else if (
      this.user.nomeCompleto.trim() != null ||
      this.user.nomeCompleto.trim() != ''
    ) {
      this.userName = this.user.nomeCompleto;
    }
  }

  getModulos() {

    this.modulos = [];
    this.modulosLoaded = false;
    this.modulosError = false;

    const currentUser = localStorage.getItem('currentUser');

    if (!currentUser) {
      this.pnotifyService.error('Você não tem permissão para isso.');
      this.authService.logout();
      return
    }

    const matricula = (JSON.parse(currentUser))?.info?.matricula;

    if (!matricula) {
      this.pnotifyService.error('Você não tem permissão para isso.');
      this.authService.logout();
      return
    }

    this._modulosService
      .getModulos({ matricula: matricula })
      .pipe(
        finalize(() => {
          this.modulosLoaded = true;
        })
      )
      .subscribe(
        response => {
          if (response.status !== 200) {
            this.pnotifyService.error('Você não tem permissão para isso.');
            this.authService.logout();
            return
          }

          this.modulos = response.body["data"];
        },
        (error: any) => {
          this.modulosError = true;
          this.pnotifyService.error('Se ha producido un error al cargar los módulos.');
        }
      )
    /* this.modulosService
      .getModulos()
      .pipe(
        finalize(() => {
          this.modulosLoaded = true;
        })
      )
      .subscribe(
        (response: any) => {
          if (response.responseCode === 200) {
            this.modulos = response.result;
          } else {
            this.pnotifyService.error('Você não tem permissão para isso.');
            this.authService.logout();
          }
        },
        (error: any) => {
          this.modulosError = true;
          this.pnotifyService.error('Ocorreu um erro ao carregar os módulos.');
        }
      ); */
  }

  onModulo(modulo: any) {
    this.titleService.resetTitle();
    this.modulosService.setCurrentModule(modulo);
    this.router.navigate([`/${modulo.rota}`]);
  }

  logout() {
    if (confirm('Tem certeza que deseja sair do MTCorp?')) {
      this.authService.logout();
    }
  }

  openModal(template: TemplateRef<any>) {
    this.changePasswordModalService.show(template);
  }
}
