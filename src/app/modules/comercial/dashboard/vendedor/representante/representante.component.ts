import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

// Services
import { ComercialDashboardVendedorService } from '../vendedor.service';

@Component({
  selector: 'comercial-dashboard-vendedor-representante',
  templateUrl: './representante.component.html',
  styleUrls: ['./representante.component.scss']
})
export class ComercialDashboardVendedorRepresentanteComponent implements OnInit {
  @Input('idVendedor') idVendedor: number;

  @Output() dataEmitter: EventEmitter<any> = new EventEmitter();

  inadimplentes: any = { quantidade: 0, valor: 0 };
  valorComissaoLoaded: boolean;
  valorComissaoEmpty: boolean;

  dados: Array<any> = [];


  constructor(private dashboardService: ComercialDashboardVendedorService) {}

  ngOnInit() {
    this.valorComissaoLoaded = false;
    this.valorComissaoEmpty = false;

    this.dashboardService
      .getValorRepresentante(this.idVendedor)
      .subscribe(
        (response: any) => {
          if (response.success === true) {
            this.dados = response.data;
            this.valorComissaoLoaded = true;
        }

        (error: any) => {
          this.valorComissaoEmpty = true;
        }
      }
      );
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
