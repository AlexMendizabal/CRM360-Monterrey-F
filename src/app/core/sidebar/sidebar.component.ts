import { Component, Renderer2, OnInit, OnDestroy } from '@angular/core';
import { finalize } from 'rxjs/operators';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AuthService } from 'src/app/shared/services/core/auth.service';
import { SidebarService } from './sidebar.service';
import { ModulosService } from 'src/app/shared/services/requests/modulos.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { AdminAtividadesService } from 'src/app/modules/admin/atividades/services/atividades.service';

@Component({
  selector: 'core-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  user: any = {};

  routerLinkHome: string;

  atividades = [];
  atividadesLoaded = false;
  atividadesError = false;

  menuLocked = false;
  menuOpen = false;
  isMouseActive = false;
  tooltipDisabled = false;

  clickEventHandler: any;

  constructor(
    private routerService: RouterService,
    private authService: AuthService,
    private sidebarService: SidebarService,
    private modulosService: ModulosService,
    private pnotifyService: PNotifyService,
    private atividadesService: AdminAtividadesService,
    private renderer: Renderer2
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    this.user = user.info;
    this.checkCurrentModule();
  }

  ngOnDestroy() {
    this.destroyClickEventHandler();
  }

  checkCurrentModule() {
    const currentModule = this.modulosService.getCurrentModule();

    if (currentModule == null) {
      this.setAtividades(this.user.moduloPrincipal);
    } else {
      const rotaModule = this.routerService.getCurrentUrl().split('/')[1];

      if (rotaModule === 'home') {
        this.setAtividades(this.user.moduloPrincipal);
      } else if (rotaModule != currentModule.rota) {
        this.getModulo(rotaModule);
      } else {
        this.setAtividades(currentModule);
      }
    }
  }

  getModulo(rotaModulo: string) {
    this.modulosService.getModulo(rotaModulo).subscribe(
      (response: any) => {
        if (response.responseCode === 200) {
          const userModule = {
            id: response.result.id,
            nome: response.result.nome,
            rota: response.result.rota
          };
          this.setAtividades(userModule);
        } else {
          this.handleGetModuloError();
        }
      },
      (error: any) => {
        this.handleGetModuloError();
      }
    );
  }

  handleGetModuloError() {
    this.pnotifyService.notice('Ocorreu um erro ao carregar o módulo.');
  }

  setAtividades(userModule: any) {
    this.getAtividades(userModule.id);
    this.modulosService.setCurrentModule(userModule);
  }

  getAtividades(moduloId: number) {

    this.atividades = [];
    this.atividadesLoaded = false;
    this.atividadesError = false;

    const currentUser = localStorage.getItem('currentUser');

    if(!currentUser){
      this.pnotifyService.error('Você não tem permissão para isso.');
      this.authService.logout();
      return
    }

    const matricula = (JSON.parse(currentUser))?.info?.matricula;

    if(!matricula){
      this.pnotifyService.error('Você não tem permissão para isso.');
      this.authService.logout();
      return
    }

    let params = {
      matricula: matricula,
      moduloId: moduloId,
      exibeSidebar: 1,
      orderBy: 'nome',
      inPagina: 0
    }

    this.atividadesService
      .getAtividades(params)
      .pipe(
        finalize(() => {
          this.atividadesLoaded = true;
        })
      )
      .subscribe(
        response => {

          if(response.status !== 200){
            this.pnotifyService.error('Você não tem permissão para isso.');
            this.authService.logout();
            return
          }
          this.atividadesError = false;
          let data:object[] = response.body["data"];
          let idx1 = data.findIndex((val) => val["id"] === 89)
          data.splice(idx1, 1);
          let idx2 = data.findIndex((val) => val["id"] === 28)
          data.splice(idx2, 1);
          let idx3 = data.findIndex((val) => val["id"] === 30)
          data.splice(idx3, 1);
          let idx4 = data.findIndex((val) => val["id"] === 25)
          data.splice(idx4, 1);

          let idx5 = data.findIndex((val) => val["id"] === 29)
          data[idx5]["nome"] = "BÚSQUEDA DE CLIENTES"

          this.atividades = data;
          this.routerLinkHome = data[0]["moduloRota"];
        },
        (error: any) => {
          this.atividadesError = true;
          this.pnotifyService.error(
            'Ocorreu um erro ao carregar as atividades.'
          );
        }
      )

    /* this.sidebarService
      .getAtividades(idModulo)
      .pipe(
        finalize(() => {
          this.atividadesLoaded = true;
        })
      )
      .subscribe(
        (response: any) => {
          if (response.responseCode === 200) {
            this.atividades = response.result;

            if (
              response.result[0].rotaAtividade !== null &&
              response.result[0].rotaAtividade !== ''
            ) {
              this.routerLinkHome = `/${
                response.result[0].rotaAtividade.split('/')[1]
              }/home`;
            }
          } else {
            this.pnotifyService.error('Você não tem permissão para isso.');
            this.authService.logout();
          }
        },
        (error: any) => {
          this.atividadesError = true;
          this.pnotifyService.error(
            'Ocorreu um erro ao carregar as atividades.'
          );
        }
      ); */
  }

  onReloadAtividades() {
    const currentModule = this.modulosService.getCurrentModule();
    let userModule: any;

    if (currentModule == null) {
      userModule = this.user.moduloPrincipal;
    } else {
      userModule = currentModule;
    }

    this.getAtividades(userModule.id);
    this.modulosService.setCurrentModule(userModule);
  }

  toggleLockMenu() {
    this.menuLocked = !this.menuLocked;

    if (this.menuLocked === true) {
      this.onShowMenu();
    } else {
      this.mouseLeaveMenu();
    }
  }

  toggleMenuClass() {
    let iconClass: string;

    if (this.menuLocked === false) {
      iconClass = 'fas fa-bars';
    } else if (this.menuLocked === true) {
      iconClass = 'fas fa-times';
    }

    return iconClass;
  }

  mouseEnterMenu() {
    this.isMouseActive = true;

    setTimeout(() => {
      if (this.isMouseActive === true) {
        this.onShowMenu();
      }
    }, 1000);
  }

  mouseLeaveMenu() {
    if (this.menuLocked === false) {
      this.onHideMenu();
    }
  }

  onShowMenu() {
    this.handleTooltipMenu();
    setTimeout(() => {
      this.menuOpen = true;
      this.onClickEventHandler();
    }, 50);
  }

  onHideMenu() {
    this.menuLocked = false;
    this.menuOpen = false;
    this.isMouseActive = false;
    this.tooltipDisabled = false;
    this.destroyClickEventHandler();
  }

  handleTooltipMenu() {
    if (this.tooltipDisabled === false) {
      const tooltip = document.body.querySelectorAll('.sidebar-navbar-tooltip');

      if (tooltip.length > 0) {
        tooltip.forEach(element => {
          element.classList.add('d-none');
        });
      }

      this.tooltipDisabled = true;
    }
  }

  onClickEventHandler() {
    this.clickEventHandler = this.renderer.listen(
      'document',
      'click',
      (e: any) => {
        if (
          document.getElementById('navbar') !== null &&
          document.getElementById('module-body') !== null
        ) {
          if (
            document.getElementById('navbar').contains(e.target) ||
            document.getElementById('module-body').contains(e.target)
          ) {
            this.onHideMenu();
          }
        }
      }
    );
  }

  destroyClickEventHandler() {
    if (this.clickEventHandler !== undefined) {
      this.clickEventHandler();
    }
  }
}
