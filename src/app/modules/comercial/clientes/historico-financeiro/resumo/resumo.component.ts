import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// ngx-bootstrap
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

// ngx-filter-pipe
import { FilterPipe } from 'ngx-filter-pipe';

// Services
import { ComercialClientesHistoricoFinanceiroService } from './../historico-financeiro.service';

// Interfaces
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

@Component({
  selector: 'comercial-clientes-historico-financeiro-resumo',
  templateUrl: './resumo.component.html',
  styleUrls: ['./resumo.component.scss']
})
export class ComercialClientesHistoricoFinanceiroResumoComponent
  implements OnInit {
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true
  };

  sinteticoPendenciasLoaded: boolean = false;

  codCliente: number;

  modalRef: BsModalRef;

  sintetico: any = {
    atrasoPagamento: 0,
    tempoEntrega: 0,
    totalAtraso: 0,
    pagtoAntecipado: 0,
    creditoSeguradora: 0
  };

  countoAtrasoPagamento: number;
  countoTempoEntrega: number;
  countoTotalAtraso: number;
  countoPagtoAntecipado: number;
  countoCreditoSeguradora: number;
  countoTitulos: number;
  countoNotasDebito: number;
  countoNotasPromissorias: number;
  countoChequesDevolvidos: number;
  countoCorteDobra: number;
  countoReservaBobinas: number;
  countoLimiteCredito: number;
  countoSaldo: number;

  grupoEconomico: any = [];
  grupoEconomicoLoaded: boolean = false;

  showPendenciasDetalhes: boolean = false;

  pendencias: any = {
    titulos: 0,
    notasDebito: 0,
    notasPromissorias: 0,
    chequesDevolvidos: 0,
    corteDobra: 0,
    reservaBobinas: 0,
    limiteCredito: 0,
    saldo: 0
  };

  pedidos: any = [];
  pedidosPagination: any = [];
  pedidosFiltered: any = [];
  pedidosLoaded: boolean = false;

  maxSize: number = 8;
  itemsPerPage: number = 10;

  visaoGrupoEconomico: boolean = false;
  queryParams: any = { grupoEconomico: this.visaoGrupoEconomico };

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private historicoFinanceiroService: ComercialClientesHistoricoFinanceiroService,
    private modalService: BsModalService,
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
          this.visaoGrupoEconomico = true;
          this.queryParams = {
            grupoEconomico: this.visaoGrupoEconomico
          };
        }

        this.codCliente = params['id'];
        this.getResumoSintetico(this.codCliente, grupoEconomico);
        this.getGrupoEconomico(this.codCliente);
        this.getPedidos(this.codCliente, grupoEconomico);
      });
    });
  }

  onChangeGrupoEconomico() {
    this.onLoadingGrupoEconomico();
    this.queryParams = { grupoEconomico: this.visaoGrupoEconomico };

    this.router.navigate(
      [`/comercial/clientes/historico-financeiro/${this.codCliente}/resumo`],
      {
        queryParams: this.queryParams
      }
    );
  }

  onLoadingGrupoEconomico() {
    this.visaoGrupoEconomico = !this.visaoGrupoEconomico;
    this.sinteticoPendenciasLoaded = false;
    this.pedidosLoaded = false;
  }

  getResumoSintetico(id: number, grupoEconomico: boolean) {
    this.historicoFinanceiroService
      .getResumoSintetico(id, grupoEconomico)
      .subscribe((response: any) => {
        if (response['responseCode'] === 200) {
          this.sintetico = response['result']['sintetico'];
          this.pendencias = response['result']['pendencias'];
        }
        this.sinteticoPendenciasLoaded = true;
      });
  }

  getGrupoEconomico(id: number) {
    this.historicoFinanceiroService
      .getGrupoEconomico(id)
      .subscribe((response: any) => {
        if (response['responseCode'] === 200) {
          this.grupoEconomico = response['result'];
        }
        this.grupoEconomicoLoaded = true;
      });
  }

  getPedidos(id: number, grupoEconomico: boolean) {
    this.historicoFinanceiroService
      .getResumoPedidos(id, grupoEconomico)
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

  onGrupoEconomico(modalRef: TemplateRef<any>) {
    this.modalRef = this.modalService.show(modalRef);
  }

  onCloseModalGrupoEconomico() {
    this.modalRef.hide();
  }

  handleCounter(valor: number) {
    return valor.toFixed(0);
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
    this.pedidosPagination = this.pedidosFiltered.slice(startItem, endItem);
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
