import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Services
import { ComercialClientesDashboardService } from './../../../dashboard.service';

// Interfaces
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

@Component({
  selector: 'comercial-clientes-dashboard-faturamento-linha-analitico',
  templateUrl: './analitico.component.html',
  styleUrls: ['./analitico.component.scss']
})
export class ComercialClientesDashboardFaturamentoLinhaAnaliticoComponent
  implements OnInit {
  tableConfig: Partial<CustomTableConfig> = {
    small: false,
    hover: false
  };

  analitico: any = [];
  analiticoTotal: any = {};
  analiticoLoaded: boolean = false;
  analiticoEmpty: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private dashboardService: ComercialClientesDashboardService
  ) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.dashboardService
        .getFaturamentoAnalitico(params['id'])
        .subscribe((response: any) => {
          if (response['responseCode'] === 200) {
            if (
              response['result']['analitico'] &&
              response['result']['analitico'].length > 0
            ) {
              this.analitico = response['result']['analitico'];
              this.analiticoTotal = response['result']['total'];
            } else {
              this.analiticoEmpty = true;
            }
          } else {
            this.analiticoEmpty = true;
          }
          this.analiticoLoaded = true;
        });
    });
  }
}
