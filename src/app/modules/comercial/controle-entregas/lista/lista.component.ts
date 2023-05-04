import { ComercialService } from 'src/app/modules/comercial/comercial.service';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  TemplateRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';

// ngx-bootstrap
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { ptBrLocale } from 'ngx-bootstrap/locale';

defineLocale('pt-br', ptBrLocale);

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialControleEntregasService } from '../controle-entregas.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { TitleService } from 'src/app/shared/services/core/title.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { AdminPerfisService } from 'src/app/modules/admin/perfis/services/perfis.service';

interface ITipoEmpresa {
  id: number;
  nome: string;
  sigla: string;
}

@Component({
  selector: 'comercial-controle-entregas-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class ComercialControleEntregasListaComponent implements OnInit {
  @ViewChild('scrollToFilter', {}) scrollToFilter: ElementRef;
  modalRef: BsModalRef;

  loaderNavbar = false;
  loaderFullScreen = false;
  loaderImage = true;

  breadCrumbTree: Array<Breadcrumb> = [
    {
      descricao: 'Home',
      routerLink: '/comercial/home',
    },
    {
      descricao: 'Controle de entregas',
    },
  ];

  bsConfig: Partial<BsDatepickerConfig>;

  tableConfig: Partial<CustomTableConfig> = {
    isResponsive: true,
    subtitleBorder: true,
    isFixed: true,
  };

  activatedRouteSubscription: Subscription;
  $serviceSubscription: Subscription;

  imageLoading = false;

  showAdvancedFilter = true;
  form: FormGroup;
  vendedores: any = [];

  pedidos: any = [];
  pedidosLoaded = false;
  pedidosEmpty = true;

  pedido: any = {};
  entrega = [];

  detalhes: any = [];
  empresa: number;

  detalhesRomaneio: any = [];
  detalhesRomaneioEmpty: boolean = false;
  detalhesRomaneioLoading: boolean = false;

  currentPage = 1;
  maxSize: number = 10;
  totalItems: number;
  itemsPerPage: number = 300;
  pedidosPagination: any = [];

  orderBy = 'dataPrev';
  orderType = 'DESC';

  // Subtitles (Ativo/Inativo)
  subtitles: Array<Subtitles> = [
    {
      id: 1,
      text: 'Entregue',
      color: 'green',
    },
    {
      id: 2,
      text: 'Não entregue',
      color: 'red',
    },
  ];

  situacoes: any = [];

  filiais: Array<any> = [];

  columns = {
    nomeEmpresa: {
      name: 'Empresa',
      active: true,
    },
    romaneio: {
      name: 'Romaneio',
      active: true,
    },
    dataPrev: {
      name: 'Data Prevista de Entrega',
      active: true,
    },
    dataEntrega: {
      name: 'Data de Entrega',
      active: false,
    },
    nomeCliente: {
      name: 'Cliente',
      active: true,
    },
    sequencia: {
      name: 'Sequência',
      active: false,
    },
    pedido: {
      name: 'Pedido',
      active: true,
    },
    notaFiscal: {
      name: 'Nota Fiscal',
      active: true,
    },
    dataEmissao: {
      name: 'Data de emissão',
      active: false,
    },
    nomeSituacao: {
      name: 'Situação',
      active: true,
    },
  };

  constructor(
    private localeService: BsLocaleService,
    private router: Router,
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private pnotifyService: PNotifyService,
    private formBuilder: FormBuilder,
    private atividadesService: AtividadesService,
    private controleEntregasService: ComercialControleEntregasService,
    private dateService: DateService,
    private titleService: TitleService,
    private modalService: BsModalService,
    private routerService: RouterService,
    private perfilService: AdminPerfisService
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );
    this.pnotifyService.getPNotify();
  }

  ngOnInit() {
    this.setFormFilter();
    this.registrarAcesso();
    this.getFiliais();
    this.getFiltros();
    this.getSituacoes();
    this.titleService.setTitle('Controle de entregas');
  }

  registrarAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
  }

  getFiltros() {
    this.controleEntregasService
      .getFiltros()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe(
        (response: any) => {
          if (response[0].responseCode === 200) {
            this.vendedores = response[0].result;

            this.vendedores.unshift({
              id: 0,
              nome: 'EXIBIR TODOS',
            });
          }

          this.onActivatedRoute();
        },
        (error: any) => {
          this.pnotifyService.error();
          this.location.back();
        }
      );
  }

  async getFiliais() {
    this.filiais = [
      {
        CD_FILI: 46,
        NM_FILI: 'Corte & Dobra - Cajamar',
      },
      {
        CD_FILI: 72,
        NM_FILI: 'Corte & Dobra - Praia Grande',
      },
      {
        CD_FILI: 3,
        NM_FILI: 'Corte & Dobra - Rio das Pedras',
      },
      {
        CD_FILI: 41,
        NM_FILI: 'Distribuição Duque de Caxias',
      },
      {
        CD_FILI: 6,
        NM_FILI: 'Distribuição Osasco',
      },
      {
        CD_FILI: 18,
        NM_FILI: 'Distribuição Tietê',
      },
      {
        CD_FILI: 79,
        NM_FILI: 'Distribuição Taipas',
      },
      {
        CD_FILI: 77,
        NM_FILI: 'Distribuição Camanducaia',
      },
      {
        CD_FILI: 83,
        NM_FILI: 'Distribuição Guarulhos',
      },
      {
        CD_FILI: 9661,
        NM_FILI: 'Dba Aços Especiais',
      },
      {
        CD_FILI: 9639,
        NM_FILI: 'Dba Jacareí',
      },
      {
        CD_FILI: 9636,
        NM_FILI: 'Dba Praia Grande',
      },
      {
        CD_FILI: 9645,
        NM_FILI: 'Dba Piracicaba',
      },
    ];
  }

  onActivatedRoute() {
    this.activatedRoute.queryParams.subscribe((response) => {
      let _response = this.routerService.getBase64UrlParams(response);

      if (Object.keys(_response).length > 0) {
        this.form.patchValue(_response);
        this.getPedidos(this.getParams());
      } else {
        this.loaderNavbar = false;
      }
    });
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

    const vendedorSelecionado = this.vendedores.filter(
      (vendedor) => vendedor?.id == _params['CD_VEND']
    );

    _params['NM_VEND'] = '';

    if (vendedorSelecionado.length == 1) {
      _params['NM_VEND'] = vendedorSelecionado[0]['nome'];
    }

    return _params;
  }

  setFormFilter() {
    this.form = this.formBuilder.group({
      DT_INIC: [this.dateService.getFirstDayMonth(), [Validators.required]],
      DT_FINA: [this.dateService.getLastDayMonth(), [Validators.required]],
      NM_CLIE: [null],
      NOTA_FISC: [null],
      CD_PEDI: [null],
      SG_PEDI: [null],
      CD_ROMA: [null],
      CD_VEND: [null],
      NM_VEND: [null],
      DS_CLIE: [null],
      CD_FILI: [null],
      ENTR_SG_STAT: [null],
      TT_REGI_PAGI: [300],
      ORDE_BY: ['dataPrev'],
      ORDE_TYPE: ['DESC'],
      PAGI: [1],
      TIME: new Date().getDate(),
    });

    this.getMatriculaVendedorLogado();
  }

  setOrderBy(column: string): void {
    if (this.orderBy === column) {
      if (this.orderType == 'DESC') {
        this.orderType = 'ASC';
      } else if (this.orderType == 'ASC') {
        this.orderType = 'DESC';
      }
    } else {
      this.orderBy = column;
      this.orderType = 'ASC';
    }

    this.form.get('ORDE_BY').setValue(this.orderBy);
    this.form.get('ORDE_TYPE').setValue(this.orderType);

    this.onFilter();
  }

  onFieldError(field: string) {
    if (this.onFieldInvalid(field)) {
      return 'is-invalid';
    }

    return '';
  }

  onFieldInvalid(field: any) {
    field = this.form.get(field);

    return field.status == 'INVALID' && field.touched;
  }

  onFieldRequired(field: string) {
    let required = false;
    let formControl = new FormControl();

    if (this.form.controls[field].validator) {
      let validationResult = this.form.controls[field].validator(formControl);
      required =
        validationResult !== null && validationResult.required === true;
    }

    if (required) {
      return 'is-required';
    }
  }

  getPedidos(params) {
    this.$serviceSubscription?.unsubscribe();

    this.loaderNavbar = true;
    this.pedidosLoaded = false;

    this.controleEntregasService
      .getLista(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.pedidosLoaded = true;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.status !== 200) {
            this.pedidos = [];
            this.pedidosEmpty = true;
            return;
          }

          this.pedidos = response.body['data'];
          this.totalItems = response.body['total'];
          this.pedidosEmpty = false;
        },
        error: (error) => {
          this.pedidos = [];
          this.pedidosEmpty = true;
          const message = error?.error?.message;
          message
            ? this.pnotifyService.error(message)
            : this.pnotifyService.error();
        }
      });
  }

  getDetalhesEntrega(params, template) {
    this.loaderNavbar = true;
    this.imageLoading = true;

    this.controleEntregasService
      .getDetalhesPedido(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (response: any) => {
          if (response.status !== 200) {
            return;
          }

          this.entrega = response.body['data'];

          if (!this.entrega['ENTR_COMP_FOTO']) {
            setTimeout(() => {
              this.imageLoading = false;
            }, 200);
          }

          this.modalRef = this.modalService.show(template, {
            animated: false,
            ignoreBackdropClick: true,
            class: 'modal-xxl',
          });
        },
        (error) => {
          const message = error?.error?.message;
          message
            ? this.pnotifyService.error(message)
            : this.pnotifyService.error();
        }
      );
  }

  getDetalhesRomaneio(params) {
    this.detalhesRomaneioLoading = true;
    this.controleEntregasService
      .getDetalhesRomaneio(params)
      .pipe(
        finalize(() => {
          this.detalhesRomaneioLoading = false;
        })
      )
      .subscribe(
        (response: any) => {
          if (response.status !== 200) {
            this.detalhesRomaneioEmpty = true;
            return;
          }
          this.detalhesRomaneioEmpty = false;
          this.detalhesRomaneio = response.body['data'];
        },
        (error) => {
          this.detalhesRomaneioEmpty = false;
          const message = error?.error?.message;
          message
            ? this.pnotifyService.error(message)
            : this.pnotifyService.error();
        }
      );
  }

  onFilter() {
    this.form.get('TIME').setValue(new Date().getTime());
    this.form.get('PAGI').setValue(1);
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
    });
  }

  viewDetails(item: any, template: TemplateRef<any>) {
    this.pedido = item;

    const params = {
      CD_ROMA: item?.CD_ROMA,
      CD_PEDI: item?.CD_PEDI,
      CD_FILI: item?.CD_FILI,
      ID_LOGI_FUSI_PEDI: item?.ID,
    };

    this.getDetalhesEntrega(params, template);
    this.getDetalhesRomaneio(params);
  }

  classStatusBorder(item): string {
    if (item?.ENTR_SG_STAT == 'ENTREGA_REALIZADA') {
      return 'border-success';
    }

    return 'border-danger';
  }

  getSelectedStyle(item) {
    if (this.pedido?.CD_PEDI == item?.CD_PEDI) {
      return { 'font-weight': 600, color: 'blue' };
    }

    return {};
  }

  onResetForm() {
    this.form.reset();
  }

  /* Paginação */
  onPageChanged(event: PageChangedEvent): void {
    this.form.get('TIME').setValue(new Date().getTime());
    this.form.get('PAGI').setValue(event.page);
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
    });
  }
  /* Paginação */

  getSituacoes() {
    this.controleEntregasService.getSituacoes().subscribe(
      (response) => {
        if (response.status === 200) {
          this.situacoes = response.body['data'];
        } else {
          this.pnotifyService.notice('Nenhuma situação encontrada.');
        }
      },
      (error) => {
        this.pnotifyService.error('Erro ao carregar situações.');
      }
    );
  }

  keepOriginalOrder = (a, b) => a.key;

  getMatriculaVendedorLogado() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.form.get('CD_VEND').setValue(currentUser?.info?.idVendedor);
  }

  onImageLoad() {
    setTimeout(() => {
      this.imageLoading = false;
    }, 200);
  }
}
