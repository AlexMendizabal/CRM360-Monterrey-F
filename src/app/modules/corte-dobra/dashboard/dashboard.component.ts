import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CorteDobraDashboardService } from './dashboard.service';
import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { AuthService } from 'src/app/shared/services/core/auth.service';
import { Observable } from 'rxjs';
import { number } from '@amcharts/amcharts4/core';

@Component({
  selector: 'corte-dobra-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class CorteDobraDashboardComponent implements OnInit {
  private userProfile = this.authService.getCurrentUser();

  loaderNavbar: boolean = false;
  loaderFullScreen: boolean = false;
  showDashboard: boolean = false;
  showFilter: boolean = false;
  showPermissionDenied: boolean = false;

  //abreAnalitico:boolean= false;

  breadCrumbTree: any = [
    {
      descricao: 'Home',
      routerLink: '/corte-dobra/home'
    },
    {
      descricao: 'Dashboard'
    }
  ];

  unidade: any;
  periodo: any;

  showAnalytic: boolean = false;
  analyticData: any;

  constructor(
    private authService: AuthService,
    private corteDobraDashboardService: CorteDobraDashboardService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private atividadesService: AtividadesService
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(data => {
      (this.unidade = data['unidade']), (this.periodo = data['periodo']);
    });

    if (this.unidade == undefined || this.periodo == undefined) {
      this.onFilter();
    }

    if (this.unidade == 3) {
      this.unidade = 'Rio das Pedras';
    } else if (this.unidade == 46) {
      this.unidade = 'Cajamar';
    } else if (this.unidade == 72) {
      this.unidade = 'Praia Grande';
    } else {
      this.unidade = 'Todas as Unidades';
    }

    if (this.periodo == 1) {
      this.periodo = 'Últimos 7 dias';
    } else if (this.periodo == 2) {
      this.periodo = 'Mês Corrente';
    } else if (this.periodo == 3) {
      this.periodo = 'Mês Passado';
    }

    this.atividadesService.registrarAcesso().subscribe();
  }

  onReload() {
    location.reload();
  }

  onFilter() {
    this.router.navigate(['corte-dobra/dashboard/filtro']);
  }

  // onAbreAnalitico(){
  //   this.abreAnalitico = !this.abreAnalitico;
  // }

  onAnalyticsData(event: any) {
    this.showAnalytic = true;
    this.analyticData = event;
  }

  onCloseAnalytic(event: boolean) {
    this.showAnalytic = !event;
  }
}
