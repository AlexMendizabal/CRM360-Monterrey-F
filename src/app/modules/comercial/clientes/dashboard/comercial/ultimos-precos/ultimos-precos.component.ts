import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { finalize } from 'rxjs/operators';

// Services
import { ComercialClientesDashboardService } from '../../dashboard.service';

@Component({
  selector: 'comercial-clientes-dashboard-comercial-ultimos-precos',
  templateUrl: './ultimos-precos.component.html',
  styleUrls: ['./ultimos-precos.component.scss']
})
export class ComercialClientesDashboardComercialUltimosPrecosComponent
  implements OnInit {
  @Input('codCliente') codCliente: number;
  @Output('qtdeDias') qtdeDias = new EventEmitter();

  ultimosPrecos: any = [];
  ultimosPrecosDias = 0;
  ultimosPrecosLoaded = false;
  ultimosPrecosEmpty = false;

  constructor(private dashboardService: ComercialClientesDashboardService) {}

  ngOnInit() {
    this.dashboardService
      .getUltimosPrecos(this.codCliente)
      .pipe(
        finalize(() => {
          this.ultimosPrecosLoaded = true;
        })
      )
      .subscribe((response: any) => {
        if (response['responseCode'] === 200) {
          if (response['result'].length > 0) {
            this.ultimosPrecos = response['result'];
            this.ultimosPrecosDias = response['result'][0]['diasAtras'];
            this.qtdeDias.emit(this.ultimosPrecosDias);
          } else {
            this.ultimosPrecosEmpty = true;
          }
        } else {
          this.ultimosPrecosEmpty = true;
        }
      });
  }
}
