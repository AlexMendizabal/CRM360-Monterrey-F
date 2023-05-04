import { ComercialAknaMensagensService } from './../../mensagens/mensagens.service';
import { IComercialAknaMensagens } from './../../mensagens/models/mensagens';
import { ComercialAknaAcoesService } from './../acoes.service';
import { IAcoes } from './../models/acoes';
import { CustomTableConfig } from './../../../../../shared/templates/custom-table/models/config';
import { DetailPanelService } from './../../../../../shared/templates/detail-panel/detal-panel.service';
//angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';

//servicos
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { RouterService } from 'src/app/shared/services/core/router.service';

// rxjs
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';

//modelos
import { Subtitles } from './../../../../../shared/modules/subtitles/subtitles';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { DateService } from 'src/app/shared/services/core/date.service';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'comercial-akna-acoes-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class ComercialAknaAcoesListaComponent implements OnInit, OnDestroy {
  breadCrumbTree: Array<Breadcrumb>;
  idSubModulo: number;
  totalItens: any = [];
  noResult: boolean;
  noVinculo = true;
  loading = true; //Loading FullPage
  loadingNavBar = false; //Loading do NAVBAR
  loadingMensagens = false;

  acoes: Array<IAcoes>;
  mensagens: IComercialAknaMensagens[] = [];

  $activatedRouteSubscription: Subscription;

  tableConfig: Partial<CustomTableConfig> = { subtitleBorder: true };
  form: FormGroup;

  showDetailPanelSubscription: Subscription;
  showDetailPanel = false;

  acaoSelecionado: IAcoes;

  // Tipos de Situação dos Tipos de Items (Ativo/Inativo)
  tipos = [
    {
      cod: '1',
      nome: 'Ativos',
    },
    {
      cod: '2',
      nome: 'Inativos',
    },
  ];

  subtitles: Array<Subtitles> = [
    {
      id: 1,
      text: 'Ativo',
      color: 'green',
    },
    {
      id: 2,
      text: 'Inativo',
      color: 'red',
    },
  ];

  /* Pagination */
  itemsPerPage = 100;
  totalItems = 10;
  currentPage = 1;
  /* Pagination */

  constructor(
    private router: Router,
    private pnotify: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private acaoService: ComercialAknaAcoesService,
    private formBuilder: FormBuilder,
    private routerService: RouterService,
    private mensagemService: ComercialAknaMensagensService,
    private dateService: DateService,
    private detailPanelService: DetailPanelService
  ) {}

  ngOnInit() {
    this.buildForm();
    this.setBreadCrumb();
    this.onActivatedRoute();
    this.getAcoes();
    this.getMensagens();
    this.onDetailPanelEmitter();
  }

  ngOnDestroy() {
    this.$activatedRouteSubscription.unsubscribe();
  }

  onActivatedRoute() {
    this.$activatedRouteSubscription =
      this.activatedRoute.queryParams.subscribe((response) => {
        const _response = this.routerService.getBase64UrlParams(response);
        this.form.patchValue(_response);
        if (_response.hasOwnProperty('TT_REGI_PAGI'))
          this.itemsPerPage = _response.TT_REGI_PAGI;
      });
  }

  onDetailPanelEmitter(): void {
    this.showDetailPanelSubscription = this.detailPanelService.config.subscribe(
      (event: any) => {
        this.showDetailPanel = event.showing;
      }
    );
  }

  onReset() {
    this.form.reset();
    this.form.patchValue({
      PAGI: 1,
      TT_REGI_PAGI: 100,
      TIME: [new Date().getTime()],
    });
  }

  buildForm() {
    this.form = this.formBuilder.group({
      TITULO: [null],
      PAGI: [1],
      TT_REGI_PAGI: [this.itemsPerPage],
      TIME: [new Date().getTime()],
    });
  }

  setPageRegistros(itemsPerPage) {
    this.itemsPerPage = itemsPerPage;
    this.onFilter();
  }

  setBreadCrumb() {
    const id = this.activatedRoute.snapshot.params.idSubModulo;
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: `/comercial/home`,
      },
      {
        descricao: 'Akna',
        routerLink: `/comercial/akna/${id}`,
      },
      {
        descricao: 'Ações',
      },
    ];
  }

  onFilter() {
    this.detailPanelService.hide();
    this.form.get('TIME').setValue(new Date().getTime());
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
    });
  }

  onDetails(acao: IAcoes): void {
    this.loadingNavBar = true;
    this.detailPanelService.show();
    this.acaoSelecionado = acao;
    this.detailPanelService.loadedFinished(false);

    setTimeout(() => {
      this.loadingNavBar = false;
    }, 500);
  }

  getMensagens(params?) {
    this.loadingMensagens = true;
    this.mensagemService
      .getMensagens(params)
      .pipe(
        finalize(() => {
          this.loadingMensagens = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe({
        next: (response: HttpResponse<IComercialAknaMensagens[]>) => {
          if (response.status === 200) {
            this.mensagens = response.body;
            this.loading = false;
          } else {
            this.noResult = true;
            this.mensagens = [];
            this.router.navigate['../'];
          }
        },
        error: (error) => {
          this.pnotify.error();
          this.noResult = true;
        }
      });
  }

  getAcoes(params?) {
    this.loading = true;
    this.acaoService
      .getAcoes(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.status === 200) {
            this.acoes = response.body['data'];
            this.totalItems = response.body['total'];
            this.noResult = false;
          } else {
            this.noResult = true;
            this.acoes = [];
          }
        },
        error: (error) => {
          this.pnotify.error();
          this.noResult = true;
        }
      });
  }

  openRegister(acao: IAcoes) {
    this.router.navigate(['../cadastro'], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(acao),
    });
  }

  onPageChanged(event) {
    this.form.get('PAGI').setValue(event.page);
    this.onFilter();
  }

  getParams() {
    let _params = {};
    let _obj = this.form.value;

    for (let prop in _obj) {
      if (_obj[prop]) {
        if (_obj[prop] instanceof Date)
          _params[prop] = this.dateService.convertToUrlDate(_obj[prop]);
        else _params[prop] = _obj[prop];
      }
    }

    return _params;
  }

  classStatusBorder(acao: IAcoes): string {
    let borderClass: string;

    if (acao.IN_STAT == '1') {
      borderClass = 'border-success';
    } else if (acao.IN_STAT == '2') {
      borderClass = 'border-danger';
    } else if (acao.IN_STAT == '3') {
      borderClass = 'border-warning';
    } else if (acao.IN_STAT == '4') {
      borderClass = 'border-primary';
    }
    return borderClass;
  }
}
