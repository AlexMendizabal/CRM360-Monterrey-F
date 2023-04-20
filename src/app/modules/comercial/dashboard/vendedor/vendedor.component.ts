import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';

// Services
import { AuthService } from 'src/app/shared/services/core/auth.service';
import { ComercialService } from '../../comercial.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { XlsxService } from 'src/app/shared/services/core/xlsx.service';
import { ComercialDashboardVendedorService } from './vendedor.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';

@Component({
  selector: 'comercial-dashboard-vendedor',
  templateUrl: './vendedor.component.html',
  styleUrls: ['./vendedor.component.scss']
})
export class ComercialDashboardVendedorComponent implements OnInit {
  private user = this.authService.getCurrentUser();
  profile: any = {};

  loaderNavbar = false;
  loaderFullScreen = true;

  breadCrumbTree: Array<Breadcrumb> = [
    {
      descricao: 'Home',
      routerLink: '/comercial/home'
    },
    {
      descricao: 'Dashboard vendedor'
    }
  ];

  activatedRouteSubscription: Subscription;

  showDashboard = false;
  showFilter = false;
  showPermissionDenied = false;

  idEscritorio: number;
  idVendedor: number;
  nomeVendedor: string;
  nomeEscritorio: string;

  showAnalytic = false;
  analyticData: any;
  dadosParaExportacao: Array<any> = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private comercialService: ComercialService,
    private atividadesService: AtividadesService,
    private titleService: TitleService,
    private xlsx: XlsxService,
    private dashboardService: ComercialDashboardVendedorService
  ) {}

  ngOnInit() {
    this.registrarAcesso();
    this.getPerfil();
    this.titleService.setTitle('Dashboard vendedor');
  }

  registrarAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
  }

  getPerfil() {
    this.comercialService
      .getPerfil()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.responseCode === 200) {
            this.profile = response.result;
            if (
              this.profile.coordenador === true ||
              this.profile.gestor === true ||
              (this.profile.vendedor === true &&
                this.profile.coordenador === false &&
                this.profile.gestor === false &&
                this.profile.hasVinculoOperadores === true)
            ) {
              this.checkRouterParams();
            } else if (
              this.profile.vendedor === true &&
              this.profile.coordenador === false &&
              this.profile.gestor === false &&
              this.profile.hasVinculoOperadores === false
            ) {
              this.setRouterParams([]);
              this.idVendedor = this.user.info.idVendedor;
              this.idEscritorio = this.user.info.idEscritorio;
              this.showDashboard = true;
            } else {
              this.showPermissionDenied = true;
            }
          } else {
            this.showPermissionDenied = true;
          }
        },
        error: (error: any) => {
          this.showPermissionDenied = true;
        }
      });
  }

  enableFilterButton(): boolean {
    if (
      this.profile.coordenador === true ||
      this.profile.gestor === true ||
      (this.profile.vendedor === true &&
        this.profile.coordenador === false &&
        this.profile.gestor === false &&
        this.profile.hasVinculoOperadores === true)
    ) {
      return true;
    } else {
      return false;
    }
  }

  onReload() {
    location.reload();
  }

  dataFilter(event: any) {
    this.idEscritorio = event.idEscritorio;
    this.idVendedor = event.idVendedor;
    this.nomeEscritorio = event.nomeEscritorio;
    this.nomeVendedor = event.nomeVendedor;
  }

  checkRouterParams() {
    let formValue = {
      idEscritorio: null,
      idVendedor: null,
      nomeEscritorio: null,
      nomeVendedor: null
    };

    this.activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (queryParams: any) => {
        if (Object.keys(queryParams).length > 0) {
          let params: any = atob(queryParams['q']);
          params = JSON.parse(params);

          this.idEscritorio = parseInt(params.idEscritorio);
          this.idVendedor = parseInt(params.idVendedor);
          this.nomeEscritorio = params.nomeEscritorio;
          this.nomeVendedor = params.nomeVendedor;

          this.showFilter = false;
          this.showDashboard = true;

          Object.keys(formValue).forEach(formKey => {
            Object.keys(params).forEach(paramKey => {
              if (
                formKey == paramKey &&
                formValue[formKey] != params[paramKey]
              ) {
                if (!isNaN(Number(params[paramKey]))) {
                  formValue[formKey] = Number(params[paramKey]);
                } else {
                  formValue[formKey] = params[paramKey];
                }
              }
            });
          });
        } else {
          this.showFilter = true;
          this.showDashboard = false;
        }
      }
    );
    this.activatedRouteSubscription.unsubscribe();
  }

  onFilter(showFilter: boolean) {
    if (showFilter) {
      let params = {
        idEscritorio: this.idEscritorio,
        idVendedor: this.idVendedor,
        nomeEscritorio: this.nomeEscritorio,
        nomeVendedor: this.nomeVendedor
      };

      this.setRouterParams(params);
      this.showDashboard = true;
    } else {
      this.showDashboard = false;
      this.showAnalytic = false;
      this.setRouterParams(null);
    }

    this.showFilter = !this.showFilter;
  }

  setRouterParams(params: any) {
    if (params === null) {
      this.router.navigate([], {
        relativeTo: this.activatedRoute
      });
    } else {
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: { q: btoa(JSON.stringify(params)) },
        queryParamsHandling: 'merge'
      });
    }
  }

  onAnalyticsData(event: any) {
    this.showAnalytic = true;
    this.analyticData = event;
  }

  onCloseAnalytic(event: boolean) {
    this.showAnalytic = !event;
  }

  excelExport() {
    this.loaderFullScreen = true;
    this.dashboardService
      .getClientes(this.idEscritorio, this.idVendedor)
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe((response: any) => {
          this.dadosParaExportacao = response.excel[0].data;
          this.xlsx.export({data: this.dadosParaExportacao});
        });
  }
}
