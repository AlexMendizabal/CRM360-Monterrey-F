import { Component, OnInit, Input, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import 'bootstrap';
// Services
import { AuthService } from 'src/app/shared/services/core/auth.service';
import { ModulosService } from 'src/app/shared/services/requests/modulos.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { WindowService } from 'src/app/shared/services/core/window.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { AdminModulosService } from 'src/app/modules/admin/modulos/services/modulos.service';
import { ChangePasswordModalService } from '../change-password-modal/change-password-modal.service';
import { NotificacionesService } from './notificaciones/notificaciones.service';


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
  notificaciones: any = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private modulosService: ModulosService,
    private _modulosService: AdminModulosService,
    private pnotifyService: PNotifyService,
    private windowService: WindowService,
    private titleService: TitleService,
    private changePasswordModalService: ChangePasswordModalService,
    private notificacionesService: NotificacionesService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit() {
    this.getCurrentUser();
    this.getClienteLogo();
    this.getModulos();
    this.getNotificaciones();
    /*   this.conexionSap(); */
  }

  getClienteLogo() {
    this.srcLogoCliente = `/assets/images/logo/clientes/${this.windowService.getHostnameLogo()}_branco.png`;
  }

  getNotificaciones() {
    this.notificacionesService.getNotificaciones();

    this.notificacionesService

      .getNotificaciones()
      .pipe(
        finalize(() => {

        })
      )
      .subscribe(
        (response: any) => {

          if (response.responseCode === 200) {
            this.notificaciones = response.content;
          }
        },
        (error: any) => {
          this.pnotifyService.notice('Ocurrio un error.');
        }
      );


  }

  onLogoClienteError(event: any) {
    this.showLogoCliente = false;
  }

  checkTipoAcessoUser() {
    return this.user.tipoAcesso == 'Externo' ? false : true;
  }

  actualizarNotificacion(id) {
    this.notificacionesService.updateNotificacion(id)
      .pipe(
        finalize(() => {

        })
      )
      .subscribe(
        (response: any) => {

          if (response.responseCode === 200) {
            this.getNotificaciones();

          }
        },
        (error: any) => {
          this.pnotifyService.notice('Ocurrio un error.');
        }
      );
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

  conexionSap() {
    this.authService.verificarConexion()
      .subscribe(
        (respuesta: any) => {
          if (respuesta.CodigoRespuesta === 0) {
            //console.log("viendo si hay conexion");
            if (respuesta.Mensaje) {
              respuesta['tokenSAP'] = respuesta.Mensaje;
              this.pnotifyService.success(
                'Conexion con middleware exitosa'
              );
              //console.log("respuesta exitosa con middleware");
            }
          } else {
            this.pnotifyService.error(
              'Se ha producido un error al generar su acceso.'
            );
          }
        }
      );
  }

  /*   conexionSap() {
      var tiempo = 30;
      this.authService.verificarConexion()
        .subscribe(
          (respuesta: any) => {
            try {
              if (respuesta.CodigoRespuesta === 0) {
                if (respuesta.Mensaje) {
                  this.pnotifyService.success('Conexion con middleware exitosa');
                  //console.log("respuesta exitosa con middleware");
                }
              } else {
                this.pnotifyService.error('Se ha producido un error al generar su acceso.');
              }
            } catch (error) {
              console.error('Error en el bloque try:', error);
              this.handleErrorResponse(error);
            }
          },
          (error: any) => {
            console.error('Error en la suscripción:', error);
            this.handleErrorResponse(error);
          }
        );
    }
    
    private handleErrorResponse(error: any) {
      console.error('Error en la llamada al servicio:', error);
    
      // Por ejemplo, mostrar un mensaje de error al usuario.
      //this.pnotifyService.error('Error en la conexion a SAP. Por favor, inténtelo de nuevo.');
    } */


}
