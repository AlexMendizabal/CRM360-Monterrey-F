import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Services
import { ComercialClientesDashboardService } from './../dashboard.service';

@Component({
  selector: 'comercial-clientes-dashboard-registro-ocorrencias',
  templateUrl: './registro-ocorrencias.component.html',
  styleUrls: ['./registro-ocorrencias.component.scss']
})
export class ComercialClientesDashboardRegistroOcorrenciasComponent
  implements OnInit {
  registroOcorrenciasLoaded: boolean = false;

  total: number = 0;
  totalEmpty: boolean = false;

  sinalizacao: number = 0;
  sinalizacaoEmpty: boolean = false;

  reclamacao: number = 0;
  reclamacaoEmpty: boolean = false;

  countoTotal: number;
  countoSinalizacao: number;
  countoReclamacao: number;

  constructor(
    private activatedRoute: ActivatedRoute,
    private dashboardService: ComercialClientesDashboardService
  ) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.dashboardService
        .getRegistroOcorrencias(params['id'])
        .subscribe((response: any) => {
          if (response['responseCode'] === 200) {
            if (
              response['result']['total'] &&
              response['result']['total'] > 0
            ) {
              this.total = response['result']['total'];
            } else {
              this.totalEmpty = true;
            }

            if (
              response['result']['sinalizacao'] &&
              response['result']['sinalizacao'] > 0
            ) {
              this.sinalizacao = response['result']['sinalizacao'];
            } else {
              this.sinalizacaoEmpty = true;
            }

            if (
              response['result']['reclamacao'] &&
              response['result']['reclamacao'] > 0
            ) {
              this.reclamacao = response['result']['reclamacao'];
            } else {
              this.reclamacaoEmpty = true;
            }
          } else {
            this.totalEmpty = true;
            this.sinalizacaoEmpty = true;
            this.reclamacaoEmpty = true;
          }
          this.registroOcorrenciasLoaded = true;
        });
    });
  }
}
