import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

// Services
import { ComercialDashboardVendedorService } from '../vendedor.service';

@Component({
  selector: 'comercial-dashboard-vendedor-financeiro',
  templateUrl: './financeiro.component.html',
  styleUrls: ['./financeiro.component.scss']
})
export class ComercialDashboardVendedorFinanceiroComponent implements OnInit {
  @Input('idVendedor') idVendedor: number;
  @Input('idEscritorio') idEscritorio: number;

  @Output() dataEmitter: EventEmitter<any> = new EventEmitter();

  inadimplentes: any = { quantidade: 0, valor: 0 };
  inadimplentesLoaded: boolean;
  inadimplentesEmpty: boolean;

  notasDebito: any = { quantidade: 0, valor: 0 };
  notasDebitoLoaded: boolean;
  notasDebitoEmpty: boolean;

  countoValorInadimplentes: number;
  countoValorNotaDebito: number;

  constructor(private dashboardService: ComercialDashboardVendedorService) {}

  ngOnInit() {
    this.resetData();

    this.dashboardService
      .getFinanceiroInadimplentes(this.idEscritorio, this.idVendedor)
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] === 200) {
            if (
              response['result']['valor'] &&
              response['result']['valor'] > 0
            ) {
              this.inadimplentes = response['result'];
              console.log(this.inadimplentes)
              this.inadimplentesLoaded = true;
            } else {
              this.handleEmpty('inadimplentes');
            }
          } else {
            this.handleEmpty('inadimplentes');
          }
        },
        error: (error: any) => {
          this.handleEmpty('inadimplentes');
        }
      });

    this.dashboardService
      .getFinanceiroNotasDebito(this.idEscritorio, this.idVendedor)
      .subscribe(
        (response: any) => {
          if (response['responseCode'] === 200) {
            if (
              response['result']['valor'] &&
              response['result']['valor'] > 0
            ) {
              this.notasDebito = response['result'];
              this.notasDebitoLoaded = true;
            } else {
              this.handleEmpty('notasDebito');
            }
          } else {
            this.handleEmpty('notasDebito');
          }
        },
        (error: any) => {
          this.handleEmpty('notasDebito');
        }
      );
  }

  resetData() {
    this.inadimplentesEmpty = false;
    this.inadimplentesLoaded = false;
    this.notasDebitoEmpty = false;
    this.notasDebitoLoaded = false;
  }

  handleEmpty(type: string) {
    if (type == 'inadimplentes') {
      this.inadimplentesEmpty = true;
    } else if (type == 'notasDebito') {
      this.notasDebitoEmpty = true;
    }
  }

  onClick(data: any) {
    if (data['valor'] > 0 && data['quantidade'] > 0) {
      this.dataEmitter.emit({
        config: {
          type: 'financeiro',
          title: `Financeiro`
        },
        data: data
      });
    }
  }
}
