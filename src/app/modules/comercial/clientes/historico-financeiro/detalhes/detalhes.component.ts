import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// ngx-bootstrap
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

// ngx-filter-pipe
import { FilterPipe } from 'ngx-filter-pipe';

// Services
import { ComercialClientesHistoricoFinanceiroService } from './../historico-financeiro.service';

// Interfaces
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

@Component({
  selector: 'comercial-clientes-historico-financeiro-detalhes',
  templateUrl: './detalhes.component.html',
  styleUrls: ['./detalhes.component.scss']
})
export class ComercialClientesHistoricoFinanceiroDetalhesComponent
  implements OnInit {
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true
  };

  codCliente: number;

  pedidos: any = [];
  pedidosPagination: any = [];
  pedidosFiltered: any = [];
  pedidosLoaded: boolean = false;

  maxSize: number = 10;
  itemsPerPage: number = 10;

  constructor(
    private activatedRoute: ActivatedRoute,
    private historicoFinanceiroService: ComercialClientesHistoricoFinanceiroService,
    private filterPipe: FilterPipe
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(queryParams => {
      this.activatedRoute.parent.params.subscribe(params => {
        let grupoEconomico = false;

        if (
          queryParams['grupoEconomico'] &&
          queryParams['grupoEconomico'] == 'true'
        ) {
          grupoEconomico = true;
        }

        this.codCliente = params['id'];
        this.getPedidos(this.codCliente, grupoEconomico);
      });
    });
  }

  getPedidos(id: number, grupoEconomico: boolean) {
    this.historicoFinanceiroService
      .getDetalhesPedidos(id, grupoEconomico)
      .subscribe((response: any) => {
        if (response['responseCode'] === 200) {
          this.pedidos = response['result'];
          this.pedidosFiltered = response['result'];
          this.pedidosPagination = this.pedidosFiltered.slice(
            0,
            this.itemsPerPage
          );
        }
        this.pedidosLoaded = true;
      });
  }

  classStatusBorder(status: string) {
    let borderClass = '';

    if (status == 'EM ABERTO') {
      borderClass = 'border-success';
    } else if (status == 'QUITADA') {
      borderClass = 'border-primary';
    } else if (status == 'VENCIDA') {
      borderClass = 'border-warning';
    } else if (status == 'PROTESTO') {
      borderClass = 'border-danger';
    }

    return borderClass;
  }

  onPageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.pedidosPagination = this.pedidos.slice(startItem, endItem);
  }

  onFilter(value: string) {
    if (value) {
      this.pedidosFiltered = this.filterPipe.transform(this.pedidos, {
        numDuplicata: value
      });
    } else {
      this.pedidosFiltered = this.pedidos;
    }

    this.pedidosPagination = this.pedidosFiltered.slice(0, this.itemsPerPage);
  }
}
