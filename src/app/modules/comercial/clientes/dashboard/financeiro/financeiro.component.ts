import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Services
import { ComercialClientesDashboardService } from './../dashboard.service';

@Component({
  selector: 'comercial-clientes-dashboard-financeiro',
  templateUrl: './financeiro.component.html',
  styleUrls: ['./financeiro.component.scss'],
})
export class ComercialClientesDashboardFinanceiroComponent implements OnInit {
  duplicatasAtraso: number = 0;
  duplicatasAtrasoLoaded: boolean = false;
  duplicatasAtrasoEmpty: boolean = false;

  notasDebito: number = 0;
  notasDebitoLoaded: boolean = false;
  notasDebitoEmpty: boolean = false;

  creditoDisponivel: number = 0;
  creditoDisponivelLoaded: boolean = false;
  creditoDisponivelEmpty: boolean = false;

  duplicatasVencer: number = 0;
  duplicatasVencerLoaded: boolean = false;
  duplicatasVencerEmpty: boolean = false;

  countoDuplicatasAtraso: number;
  countoNotasDebito: number;
  countoCreditoDisponivel: number;
  countoDuplicatasVencer: number;

  constructor(
    private activatedRoute: ActivatedRoute,
    private dashboardService: ComercialClientesDashboardService
  ) {}
  onCountoChange(event: number): void {
    this.countoCreditoDisponivel = event;
  }
  
  ngOnInit() {
    this.activatedRoute.params.subscribe((params) => {
      this.dashboardService
        .getDuplicatasAtraso(params['id'])
        .subscribe((response: any) => {
          if (response['responseCode'] === 200) {
            if (
              response['result']['valor'] &&
              response['result']['valor'] > 0
            ) {
              this.duplicatasAtraso = response['result']['valor'];
            } else {
              this.duplicatasAtrasoEmpty = true;
            }
          } else {
            this.duplicatasAtrasoEmpty = true;
          }
          this.duplicatasAtrasoLoaded = true;
        });

      this.dashboardService
        .getNotasDebito(params['id'])
        .subscribe((response: any) => {
          if (response['responseCode'] === 200) {
            if (
              response['result'] &&
              response['result']> 0
            ) {
              this.notasDebito = response['result'];
            } else {
              this.notasDebitoEmpty = true;
            }
          } else {
            this.notasDebitoEmpty = true;
          }
          this.notasDebitoLoaded = true;
        });

      this.dashboardService
        .getCreditoDisponivel(params['id'])
        .subscribe((response: any) => {
          console.log('Respuesta de getCreditoDisponivel:', response);
          if (response['responseCode'] === 200) {
            if (
              response['result']['valor'] &&
              response['result']['valor'] != 0
            ) {
              this.creditoDisponivel = response['result']['valor'];
              console.log("Quiero esto", response['result']['valor']);

            } else {
              this.creditoDisponivelEmpty = true;
            }
          } else {
            this.creditoDisponivelEmpty = true;
          }
          this.creditoDisponivelLoaded = true;
        });

      this.dashboardService
        .getDuplicatasVencer(params['id'])
        .subscribe((response: any) => {
          if (response['responseCode'] === 200) {
            if (
              response['result']['valor'] &&
              response['result']['valor'] > 0
            ) {
              this.duplicatasVencer = response['result']['valor'];
            } else {
              this.duplicatasVencerEmpty = true;
            }
          } else {
            this.duplicatasVencerEmpty = true;
          }
          this.duplicatasVencerLoaded = true;
        });
    });
  }
}
