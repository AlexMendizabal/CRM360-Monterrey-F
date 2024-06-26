import { Component, OnInit, isDevMode } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize, catchError } from 'rxjs/operators';

// Services
import { AuthService } from '../../shared/services/core/auth.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { WindowService } from 'src/app/shared/services/core/window.service';
import { ModulosService } from 'src/app/shared/services/requests/modulos.service';
import { TranslationService } from 'src/app/shared/services/core/translation.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { AdminModulosService } from '../admin/modulos/services/modulos.service';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [WindowService]
})
export class LoginComponent implements OnInit {
  srcLogoCliente: string;
  srcLogoInicio: string;
  form: FormGroup;
  waitingLoginResponse: boolean = false;
  redirectTo: boolean = false;

  passwordType = 'password';

  login = {
    form: {
      user: 'Xuxa'
    }
  };

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private pnotifyService: PNotifyService,
    private windowService: WindowService,
    private modulosService: ModulosService,
    private _modulosService: AdminModulosService,
    private translationService: TranslationService,
    private routerService: RouterService
  ) {
    this.pnotifyService.getPNotify();
    this.translationService.browserTitle('login.browserTitle');
  }

  ngOnInit() {
    this.redirectTo = false;
    this.authService.resetCurrentUser();
    this.modulosService.resetCurrentModule();
    this.getClienteLogo();
    this.setFormBuilder();
  }

  getLogoInicio() {
    this.srcLogoInicio = `src/assets/images/logo/Logo_RIA_Green.png`;
  }

  getClienteLogo() {
    this.srcLogoCliente = `/assets/images/logo/crm-360.png`;
    // this.srcLogoCliente = '/assets/images/logo/logo-roxo.png';
  }

  onLogoClienteError(event: any) {
    this.srcLogoCliente = '/assets/images/logo/crm-360.png';
  }

  setFormBuilder() {
    this.form = this.formBuilder.group({
      usuario: [null, Validators.required],
      senha: [null, Validators.required]
    });
  }

  onChangePasswordType() {
    if (this.passwordType === 'password') {
      this.passwordType = 'text';
    } else if (this.passwordType === 'text') {
      this.passwordType = 'password';
    }
  }

  passwordIconClass() {
    let iconClass: string;

    if (this.passwordType === 'password') {
      iconClass = 'fas fa-eye';
    } else if (this.passwordType === 'text') {
      iconClass = 'fas fa-eye-slash';
    }

    return iconClass;
  }

  onSubmit() {
    if (this.form.valid) {
      this.waitingLoginResponse = true;

      const loginObj = {
        nr_matr_usua: this.form.value.usuario,
        ds_senh_usua: this.form.value.senha
      };

      this.authService
        .login(loginObj)
        .pipe(
          finalize(() => {
            this.waitingLoginResponse = false;
          })
        )
        .subscribe(
          (response: any) => {
            if (response.responseCode === 200) {
              this.setUserLogin(response);

              if (response.token) {/* 
                var params = {
                  Usuario: 'crm360',
                  Password: 'M1ddlewareCRM360$/',
                }
                this.authService.loginSAP(params).subscribe(
                  (respuesta: any) => {
                    if (respuesta.CodigoRespuesta === 0) {
                      if (respuesta.Mensaje) {
                        response['tokenSAP'] = response.Mensaje;
                        this.setUserLogin(response);
                      }
                    } else {
                      this.pnotifyService.error(
                        'Se ha producido un error al generar su acceso.'
                      );
                    }
                  }
                );
              } else {
                this.pnotifyService.error(
                  'Se ha producido un error al generar su acceso.'
                );
              } */
              }
            } else {
              this.pnotifyService.error('Nombre de usuario o contraseña incorrectos.');
            }
          },
          (error: any) => {
            this.pnotifyService.error();
          }
        );
    }
  }

  setUserLogin(response: any) {
    let matriculaTid: number;
    let idVendedor: number;
    let idEscritorio: number;
    let idModuloPrincipal: number;
    let nomeModuloPrincipal: string;
    let rotaModuloPrincipal: string;
    let none_cargo: string;
    console.log('aqui usuario para eso ',response);
    if (response.result.versao_mtcorp != 2) {
      this.pnotifyService.notice('No tiene acceso a MTCorp.');
    } else {
      if (response.result.id_modulo_home != null) {
        if (isDevMode()) {
          matriculaTid =  response.result.matricula;
          none_cargo = response.result.nome_cargo;
          idVendedor = response.result.id_vendedor; 
          idEscritorio = response.result.id_escritorio != null
              ? response.result.id_escritorio
              : 0;
          idModuloPrincipal =
            response.result.id_modulo_home != null
              ? response.result.id_modulo_home
              : 1;
          nomeModuloPrincipal =
            response.result.modu_nome != null
              ? response.result.modu_nome
              : 'Comercial';
          rotaModuloPrincipal =
            response.result.modu_rota != null
              ? response.result.modu_rota
              : 'comercial';
        } else {
          matriculaTid = response.result.matricula_tid;
          idVendedor = response.result.id_vendedor;
          idEscritorio = response.result.id_escritorio
            ? response.result.id_escritorio
            : null;
          idModuloPrincipal = response.result.id_modulo_home;
          nomeModuloPrincipal = response.result.modu_nome;
          rotaModuloPrincipal = response.result.modu_rota;
        }

        const user = {
          info: {
            id: response.result.id_usuario,
            matricula: response.result.matricula,
            idVendedor: response.result.id_vendedor,
            idEscritorio: idEscritorio,
            nomeCompleto: response.result.func_nome,
            nomeAbreviado: response.result.nome_abreviado,
            tipoAcesso: response.result.tipo_acesso,
            none_cargo:response.result.nome_cargo,
            moduloPrincipal: {
              id: idModuloPrincipal,
              nome: nomeModuloPrincipal,
              rota: rotaModuloPrincipal
            }
          },
          token: response.token
        };

        this.redirectTo = true;
        this.authService.setCurrentUser(user);
        this.checkCurrentModule(user.info.moduloPrincipal);
      } else {
        this.pnotifyService.notice('No tiene ningún módulo configurado.');
      }
    }
  }

  checkCurrentModule(moduloPrincipal: any) {

    const routerParams = this.activatedRoute.snapshot.queryParams;
    const urlAfterLogin = routerParams?.urlAfterLogin

    const modulo = urlAfterLogin ? urlAfterLogin?.split('/')[1] : undefined;
    if (!modulo) {
      this.modulosService.setCurrentModule(moduloPrincipal);
      this.router.navigate([moduloPrincipal.rota]);
      return
    }

    this._modulosService
      .getModulos({ rota: moduloPrincipal.rota })
      .subscribe(
        response => {

          if (response.status !== 200) {
            this.modulosService.setCurrentModule(moduloPrincipal);
            this.router.navigate([moduloPrincipal.rota]);
            return;
          }

          let data = response.body["data"][0];
          this.modulosService.setCurrentModule(data);
          this.router.navigate([urlAfterLogin]);

        },
        (error: any) => {
          this.modulosService.setCurrentModule(moduloPrincipal);
          this.router.navigate([moduloPrincipal.rota]);
        }
      )

  }
}
