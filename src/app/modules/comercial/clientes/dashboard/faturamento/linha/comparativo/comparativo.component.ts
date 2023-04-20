import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Services
import { ComercialClientesDashboardService } from './../../../dashboard.service';

// Interfaces
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

@Component({
  selector: 'comercial-clientes-dashboard-faturamento-linha-comparativo',
  templateUrl: './comparativo.component.html',
  styleUrls: ['./comparativo.component.scss']
})
export class ComercialClientesDashboardFaturamentoLinhaComparativoComponent
  implements OnInit {
  titulo: string = 'Comparativo por linha';

  tableConfig: Partial<CustomTableConfig> = {
    small: false,
    hover: false
  };

  comparativo: any = [];
  comparativoTotal: any = {};
  comparativoLoaded: boolean = false;
  comparativoEmpty: boolean = false;

  anoPassado: number;
  anoCorrente: number;

  constructor(
    private activatedRoute: ActivatedRoute,
    private dashboardService: ComercialClientesDashboardService
  ) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.dashboardService
        .getFaturamentoComparativo(params['id'])
        .subscribe((response: any) => {
          if (response['responseCode'] === 200) {
            if (
              response['result']['analitico'] &&
              response['result']['analitico'].length > 0
            ) {
              let d = new Date();

              this.anoCorrente = d.getFullYear();
              this.anoPassado = this.anoCorrente - 1;

              this.titulo = `${this.titulo} de ${response['result']['mesInicial']} a ${response['result']['mesFinal']}`;
              this.comparativo = response['result']['analitico'];
              this.comparativoTotal = response['result']['total'];
            } else {
              this.comparativoEmpty = true;
            }
          } else {
            this.comparativoEmpty = true;
          }
          this.comparativoLoaded = true;
        });
    });
  }

  classComparativo(value: number) {
    let textClass = '';

    if (value > 0) {
      textClass = 'text-success';
    } else if (value < 0) {
      textClass = 'text-danger';
    }

    return textClass;
  }
}
