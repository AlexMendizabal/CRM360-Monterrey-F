import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Services
import { ComercialClientesDashboardService } from './../dashboard.service';

@Component({
  selector: 'comercial-clientes-dashboard-comercial',
  templateUrl: './comercial.component.html',
  styleUrls: ['./comercial.component.scss']
})
export class ComercialClientesDashboardComercialComponent implements OnInit {
  codCliente: number;

  ultimaCompra: string;
  ultimaCompraLoaded = false;
  ultimaCompraEmpty = false;

  ultimosPrecosDias: number;
  showUltimosPrecos = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private dashboardService: ComercialClientesDashboardService
  ) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.codCliente = params['id'];

      this.dashboardService
        .getUltimaCompra(params['id'])
        .subscribe((response: any) => {
          if (response['responseCode'] === 200) {
            if (
              response['result']['data'] &&
              response['result']['data'] != ''
            ) {
              this.ultimaCompra = response['result']['data'];
            } else {
              this.ultimaCompraEmpty = true;
            }
          } else {
            this.ultimaCompraEmpty = true;
          }
          this.ultimaCompraLoaded = true;
        });
    });
  }

  onUltimosPrecos() {
    this.showUltimosPrecos = !this.showUltimosPrecos;
  }

  onUltimosPrecosDias(event: any) {
    this.ultimosPrecosDias = event;
  }
}
