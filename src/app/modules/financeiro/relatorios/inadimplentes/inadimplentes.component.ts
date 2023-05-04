import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';

// ngx-bootstrap
import { BsModalRef, BsModalService } from 'ngx-bootstrap';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { FinanceiroRelatoriosInadimplentesService } from './inadimplentes.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { JsonResponse } from 'src/app/models/json-response';

@Component({
  selector: 'financeiro-relatorios-inadimplentes',
  templateUrl: './inadimplentes.component.html',
  styleUrls: ['./inadimplentes.component.scss'],
})
export class FinanceiroRelatoriosInadimplentesComponent implements OnInit {
  loaderNavbar = false;
  loaderFullScreen = true;

  breadCrumbTree: Array<Breadcrumb> = [];

  tableConfig: Partial<CustomTableConfig> = {
    hover: false,
  };

  tableConfigModal: Partial<CustomTableConfig> = {
    hover: false,
    fixedHeader: true,
  };

  modalRef: BsModalRef;

  dadosEmpty: boolean;

  periodo = {
    geradoEm: '',
    de: '',
    ate: '',
  };

  faturamentoTotal = 0;

  detalhes = {
    inadSobFat: 0,
    totalInadimplencia: 0,
    totalSegurado: 0,
    totalNaoSegurado: 0,
    totalPromissorias: 0,
    totalEmAnalise: 0,
  };

  countTo = {
    inadSobFat: 0,
    totalInadimplencia: 0,
    totalSegurado: 0,
    totalNaoSegurado: 0,
    totalPromissorias: 0,
    totalEmAnalise: 0,
  };

  clientes = {
    analitico: [],
    total: {
      valor: 0,
      percentual: 0,
    },
  };

  escritorios = {
    analitico: [],
    total: {
      valor: 0,
      percentual: 0,
    },
  };

  detalhesEscritorio = {
    nomeEscritorio: '',
    analitico: [],
  };

  faixaValores = {
    analitico: [],
    total: {
      valor: 0,
      quantidade: 0,
      percentual: 0,
    },
  };

  linhas = {
    analitico: [],
    total: {
      valor: 0,
      percentual: 0,
    },
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private modalService: BsModalService,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private titleService: TitleService,
    private inadimplentesService: FinanceiroRelatoriosInadimplentesService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.titleService.setTitle('Relatório de inadimplentes');
    this.getInadimplentes();
  }

  registrarAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/financeiro/home',
        },
        {
          descricao: 'Relatórios',
          routerLink: `/financeiro/relatorios/${params.idSubModulo}`,
        },
        {
          descricao: 'Inadimplentes',
        },
      ];
    });
  }

  getInadimplentes(): void {
    this.loaderFullScreen = true;
    this.resetDefaultValues();

    this.inadimplentesService
      .getLista()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe(
        (response: JsonResponse) => {
          if (response.success === true) {
            this.dadosEmpty = false;
            this.periodo = response.data.periodo;
            this.faturamentoTotal = response.data.faturamentoTotal;
            this.detalhes = response.data.detalhes;
            this.clientes = response.data.clientes;
            this.escritorios = response.data.escritorios;
            this.faixaValores = response.data.faixaValores;
            this.linhas = response.data.linhas;
          } else {
            this.pnotifyService.error();
          }
        },
        (error: any) => {
          this.pnotifyService.error();
        }
      );
  }

  onDetalheEscritorio(escritorio: any, template: TemplateRef<any>): void {
    this.loaderNavbar = true;

    this.inadimplentesService
      .getDetalheEscritorio(escritorio.codEscritorio)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (response: JsonResponse) => {
          if (response.success === true) {
            this.detalhesEscritorio.nomeEscritorio = escritorio.nomeEscritorio;
            this.detalhesEscritorio.analitico = response.data;
            this.openModal(template);
          } else {
            this.pnotifyService.error();
          }
        },
        (error: any) => {
          this.pnotifyService.error();
        }
      );
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      animated: false,
      keyboard: false,
      ignoreBackdropClick: true,
      class: 'modal-lg',
    });
  }

  onClose(): void {
    this.modalRef.hide();
    this.detalhesEscritorio.nomeEscritorio = '';
    this.detalhesEscritorio.analitico = [];
  }

  onReload(): void {
    this.getInadimplentes();
  }

  resetDefaultValues(): void {
    this.dadosEmpty = true;

    this.periodo.geradoEm = '';
    this.periodo.de = '';
    this.periodo.ate = '';

    this.faturamentoTotal = 0;

    this.detalhes.inadSobFat = 0;
    this.detalhes.totalInadimplencia = 0;
    this.detalhes.totalSegurado = 0;
    this.detalhes.totalNaoSegurado = 0;
    this.detalhes.totalPromissorias = 0;
    this.detalhes.totalEmAnalise = 0;

    this.countTo.inadSobFat = 0;
    this.countTo.totalInadimplencia = 0;
    this.countTo.totalSegurado = 0;
    this.countTo.totalNaoSegurado = 0;
    this.countTo.totalPromissorias = 0;
    this.countTo.totalEmAnalise = 0;

    this.clientes.analitico = [];
    this.clientes.total.valor = 0;
    this.clientes.total.percentual = 0;

    this.escritorios.analitico = [];
    this.escritorios.total.valor = 0;
    this.escritorios.total.percentual = 0;

    this.faixaValores.analitico = [];
    this.faixaValores.total.valor = 0;
    this.faixaValores.total.quantidade = 0;
    this.faixaValores.total.percentual = 0;

    this.linhas.analitico = [];
    this.linhas.total.valor = 0;
    this.linhas.total.percentual = 0;
  }
}
