import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Services
import { ComercialClientesDashboardService } from './../../dashboard.service';

// Interfaces
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

@Component({
  selector: 'comercial-clientes-dashboard-faturamento-mais-comprados',
  templateUrl: './mais-comprados.component.html',
  styleUrls: ['./mais-comprados.component.scss']
})
export class ComercialClientesDashboardFaturamentoMaisCompradosComponent
  implements OnInit {
  tableConfig: Partial<CustomTableConfig> = {
    small: false,
    hover: false
  };

  maisComprados: any = [];
  maisCompradosTotal: any = {};
  maisCompradosLoaded: boolean = false;
  maisCompradosEmpty: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private dashboardService: ComercialClientesDashboardService
  ) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.dashboardService
        .getFaturamentoMaisComprados(params['id'])
        .subscribe((response: any) => {
          if (response['responseCode'] === 200) {
            if (
              response['result']['analitico'] &&
              response['result']['analitico'].length > 0
            ) {
              this.maisComprados = response['result']['analitico'];
              this.maisCompradosTotal = response['result']['total'];
            } else {
              this.maisCompradosEmpty = true;
            }
          } else {
            this.maisCompradosEmpty = true;
          }
          this.maisCompradosLoaded = true;
        });
    });
  }
}
