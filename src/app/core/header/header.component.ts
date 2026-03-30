import { Component, OnInit, Input, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';
import { interval, Subject } from 'rxjs';
import { takeUntil, take, retry } from 'rxjs/operators';
import { JsonResponse } from 'src/app/models/json-response';
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
import { HttpClient, HttpParams } from '@angular/common/http';

@Component({
  selector: 'header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [WindowService],
})
export class HeaderComponent implements OnInit {
  @Input('showLoader') showLoader: boolean;
  private readonly API = `https://crm360.monterrey.com.bo/api/sap`;

  showLogoCliente = true;
  srcLogoCliente: string;

  user: any = {};
  userName: string;

  modulos: any = [];
  modulosLoaded = false;
  modulosError = false;
  conexion = false;
  verificacion: any;
  notificaciones: any = [];

  loaderFullScreen = true;

  constructor(
    private router: Router,
    private authService: AuthService,
    private modulosService: ModulosService,
    private _modulosService: AdminModulosService,
    private pnotifyService: PNotifyService,
    private windowService: WindowService,
    private titleService: TitleService,
    private changePasswordModalService: ChangePasswordModalService,
    private notificacionesService: NotificacionesService,
    protected http: HttpClient,
    private cdRef: ChangeDetectorRef
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit() {
    this.getCurrentUser();
    this.getClienteLogo();
    this.getModulos();
    this.getNotificaciones();
    this.verificadorConexion();
    /*    this.verificadorConexion();
       setInterval(() => {
         this.verificadorConexion();
       }, 120000); */
    //this.verificarConexion();

    // setInterval(() => {
    //   this.verificador();
    // }, 42000);

  }
  verificador(): void {
    const verificaciones = this.manejoEvento(() => this.verificadorConexion());
    verificaciones();
  }

  getClienteLogo() {
    this.srcLogoCliente = `/assets/images/logo/clientes/${this.windowService.getHostnameLogo()}_branco.png`;
  }

  getNotificaciones() {
    this.notificacionesService.getNotificaciones();

    this.notificacionesService.getNotificaciones()
      .pipe(
        finalize(() => {
          /*  this.loaderNavbar = false;
           this.submittingForm = false; */
        })
      )
      .subscribe(
        (response: any) => {
          if (response.responseCode === 200) {
            this.notificaciones = response.content;
          } else if (response.response === 204) {
          }
        },
        (error: any) => {
          this.pnotifyService.notice('Ocurrio un error.');
        }
      );
  }
  actualizarNotificacion(id) {
    this.notificacionesService
      .updateNotificacion(id)
      .pipe(
        finalize(() => {
          /*  this.loaderNavbar = false;
           this.submittingForm = false; */
        })
      )
      .subscribe(
        (response: any) => {
          if (response.responseCode === 200) {
            this.getNotificaciones();
          } else if (response.response === 204) {
          }
        },
        (error: any) => {
          this.pnotifyService.notice('Ocurrio un error.');
        }
      );
  }

  leerNotificaciones() {
    this.notificacionesService
      .postLeerNotificaciones(this.notificaciones)
      .pipe(
        finalize(() => {
          /*  this.loaderNavbar = false;
         this.submittingForm = false; */
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

    //this.getNotificaciones();
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
      return;
    }

    const matricula = JSON.parse(currentUser)?.info?.matricula;

    if (!matricula) {
      this.pnotifyService.error('Você não tem permissão para isso.');
      this.authService.logout();
      return;
    }

    this._modulosService
      .getModulos({ matricula: matricula })
      .pipe(
        finalize(() => {
          this.modulosLoaded = true;
        })
      )
      .subscribe(
        (response) => {
          if (response.status !== 200) {
            this.pnotifyService.error('Você não tem permissão para isso.');
            this.authService.logout();
            return;
          }

          this.modulos = response.body['data'];
        },
        (error: any) => {
          this.modulosError = true;
          this.pnotifyService.error(
            'Se ha producido un error al cargar los módulos.'
          );
        }
      );
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
    if (confirm('¿Estás seguro de que quieres salir de CRM360?')) {
      this.authService.logout();
    }
  }

  openModal(template: TemplateRef<any>) {
    this.changePasswordModalService.show(template);
  }

  manejoEvento(fn: () => Promise<void>): () => Promise<void> {
    let executing = false;
    return async () => {
      if (!executing) {
        executing = true;
        await fn();
        setTimeout(() => {
          executing = false;
        }, 300000); // 5 minutos
      }
    }
  }

  async verificadorConexion(): Promise<void> {
    const boton = document.getElementById('verificador') as HTMLElement;
    this.loaderFullScreen = true;
    boton.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Verificando SAP...';
    boton.style.color = 'black';
    boton.style.backgroundColor = '#eadf04'; // Amarillo para indicar que está verificando

    try {
      // Realiza la consulta para verificar la conectividad
      const response: JsonResponse = await this.http.post<JsonResponse>(`${this.API}/verificar_conexion_sap`, null).toPromise();

      if (response.success) {
        // Conectado: Cambia el texto y el color del botón a verde
        boton.innerHTML = '<i class="fas fa-check-circle"></i> SAP: Conectado';
        boton.style.backgroundColor = 'green';
        boton.style.color = 'white';
      } else {
        // Desconectado: Cambia el texto y el color del botón a rojo
        boton.innerHTML = '<i class="fas fa-exclamation-circle"></i> SAP: Desconectado';
        boton.style.backgroundColor = 'red';
        boton.style.color = 'white';
      }
    } catch (error) {
      // En caso de error, mostrar como desconectado
      boton.innerHTML = '<i class="fas fa-exclamation-circle"></i> SAP: Desconectado';
      boton.style.backgroundColor = 'red';
      boton.style.color = 'white';
    } finally {
      this.loaderFullScreen = false; // Asegura que el loader siempre se oculta al final
    }
  }

  // Método que se ejecuta al hacer clic en el botón
  onVerificarConectividad(): void {
    this.manejoEvento(() => this.verificadorConexion())();
  }

}
