import { ConfirmModalService } from './../../../../shared/modules/confirm-modal/confirm-modal.service';
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
  FormGroup,
  FormBuilder,
  FormArray,
  FormControl,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

// ngx-bootstrap
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { ptBrLocale } from 'ngx-bootstrap/locale';

defineLocale('pt-br', ptBrLocale);

// Services
import { ComercialAuditoriaService } from '../auditoria.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { ComercialVendedoresService } from '../../services/vendedores.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { JsonResponse } from 'src/app/models/json-response';
import { nullSafeIsEquivalent } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'enderecos-entrega',
  templateUrl: './enderecos-entrega.component.html',
  styleUrls: ['./enderecos-entrega.component.scss'],
})
export class ComercialAuditoriaEnderecosEntregaComponent implements OnInit {
  @ViewChild('scrollToFilter', {}) scrollToFilter: ElementRef;

  loaderNavbar = false;
  loaderFullScreen = false;

  breadCrumbTree: Array<Breadcrumb> = [];

  subtitles: Array<Subtitles> = [
    {
      id: 1,
      text: 'Aprovado',
      color: 'green',
    },
    {
      id: 2,
      text: 'Reprovado',
      color: 'red',
    },
    {
      id: 3,
      text: 'Aguardando Aprovação',
      color: 'blue',
    },
  ];

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  tableConfigAnexos: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 230,
    hover: false,
  };

  activatedRouteSubscription: Subscription;

  showDetailPanelSubscription: Subscription;
  showDetailPanel = false;

  form: FormGroup;
  formLatLong: FormGroup;
  formExcecao: FormGroup;

  orderBy = 'id';
  orderType = 'ASC';

  enderecos: Array<any> = [];

  maxSize = 10;
  itemsPerPage = 300;
  currentPage = 1;
  totalItems = 0;

  dados: Array<any> = [];
  dadosPagination: Array<any> = [];
  dadosLoaded = false;
  dadosEmpty = false;

  vendedores: any = [];
  empresas: any = [];
  situacoes: any = [
    {
      id: 0,
      situacao: 'EXIBIR TODOS',
    },
    {
      id: 1,
      situacao: 'APROVADOS',
    },
    {
      id: 4,
      situacao: 'REPROVADOS',
    },
    {
      id: 3,
      situacao: 'AGUARDANDO APROVAÇÃO',
    },
  ];
  situacoesFiltered: any = this.situacoes;
  situacaoLoaded: boolean = false;

  excecoes: any = [];
  validaExcecao: boolean = false;

  enderecoSelecionado: any;
  msgModal: string;
  valorModal: number;

  detalhesModalRef: BsModalRef;
  submitModalRef: BsModalRef;
  bsConfig: Partial<BsDatepickerConfig>;

  anexos: Array<any> = [];
  anexosMarketing: Array<any> = [];
  showAnexos: boolean = false;
  showAnexosAprovacao: boolean = false;
  showAnexosMarketing: boolean = false;
  ultimaCompra: any;
  acao: string;

  formData: Array<FormData> = [];

  clienteTerceiro = [];
  constructor(
    private localeService: BsLocaleService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private auditoriaService: ComercialAuditoriaService,
    private atividadesService: AtividadesService,
    private titleService: TitleService,
    private modalService: BsModalService,
    private dateService: DateService,
    private vendedoresService: ComercialVendedoresService,
    private confirmModalService: ConfirmModalService,
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

  ngOnInit(): void {
    this.registrarAcesso();
    this.getFiltros();
    this.setBreadCrumb();
    this.setFormFilter();
    this.titleService.setTitle('Endereço de Entrega');
    this.setEnderecoSelecionado();
    this.setFormLatLong();
    this.setFormExcessao();
    this.getExcecao();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  getFiltros() {
    this.vendedoresService
      .getVendedores()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.responseCode === 200) {
            this.vendedores = response.result;

            this.vendedores.unshift({
              id: 0,
              nome: 'EXIBIR TODOS',
            });
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
          this.location.back();
        }
      });
  }

  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/comercial/home',
        },
        {
          descricao: 'Auditoria',
          routerLink: `/comercial/auditoria/${params['idSubModulo']}`,
        },
        {
          descricao: 'Endereços de Entregas',
        },
      ];
    });
  }

  getExcecao() {
    this.auditoriaService
      .getExcecao()
      .subscribe({
        next: (response: any) => {
          if (response.success === true) {
            this.excecoes = response.data;

            // this.excecoes.unshift({
            //   id: 0,
            //   excecao: 'SELECIONE UMA EXCEÇÃO...',
            // });

          } else {
            this.pnotifyService.error();
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
        }
      });
  }

  setFormFilter() {
    const formValue: any = this.checkRouterParams();

    this.form = this.formBuilder.group({
      tipoData: [formValue.tipoData, [Validators.required]],
      dataInicial: [formValue.dataInicial, [Validators.required]],
      dataFinal: [formValue.dataFinal, [Validators.required]],
      idCliente: [formValue.idCliente],
      dsCliente: [formValue.dsCliente],
      vendedor: [formValue.vendedor],
      situacao: [formValue.situacao],
      registros: [formValue.registros],
    });

  }

  setFormLatLong(): void {
    this.formLatLong = this.formBuilder.group({
      latitude: ['', Validators.required],
      longitude: ['', Validators.required],
    });
  }

  checkRouterParams(): Object {
    let formValue = {
      tipoData: 1,
      dataInicial: this.dateService.getFirstDayMonth(),
      dataFinal: this.dateService.getLastDayMonth(),
      idCliente: null,
      dsCliente: null,
      vendedor: 0,
      situacao: 3,
      registros: 300,
    };

    this.activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (queryParams) => {
        if (Object.keys(queryParams).length > 0) {
          let params = atob(queryParams['q']);
          params = JSON.parse(params);
          this.search(params);

          Object.keys(formValue).forEach((formKey) => {
            Object.keys(params).forEach((paramKey) => {
              if (
                formKey == paramKey &&
                formValue[formKey] != params[paramKey]
              ) {
                if (formKey === 'dataInicial' || formKey === 'dataFinal') {
                  formValue[formKey] = this.dateService.convertStringToDate(
                    params[paramKey],
                    'pt-br'
                  );
                } else {
                  if (!isNaN(Number(params[paramKey]))) {
                    formValue[formKey] = Number(params[paramKey]);
                  } else {
                    formValue[formKey] = params[paramKey];
                  }
                }
              }
            });
          });
        }
      }
    );
    this.activatedRouteSubscription.unsubscribe();

    return formValue;
  }

  checkOrder(): void {
    if (this.form.value.orderBy !== this.orderBy) {
      this.orderBy = this.form.value.orderBy;
    }

    if (this.form.value.orderType !== this.orderType) {
      this.orderType = this.form.value.orderType;
    }
  }

  onFieldError(field: string): string {
    if (this.onFieldInvalid(field)) {
      return 'is-invalid';
    }

    return '';
  }

  onFieldInvalid(field: any) {
    field = this.form.get(field);

    if (field.errors != null) {
      if (field.errors.hasOwnProperty('required') && field.touched) {
        return 'required';
      }
    }

    return '';
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

  onFieldErrorLatLong(field: string): string {
    if (this.onFieldInvalidLatLong(field)) {
      return 'is-invalid';
    }

    return '';
  }

  onFieldInvalidLatLong(field: any) {
    field = this.formLatLong.get(field);

    if (field.errors != null) {
      if (field.errors.hasOwnProperty('required') && field.touched) {
        return 'required';
      }
    }

    return '';
  }

  onFieldRequiredLatLong(field: string) {
    let required = false;
    let formControl = new FormControl();

    if (this.formLatLong.controls[field].validator) {
      let validationResult = this.formLatLong.controls[field].validator(
        formControl
      );
      required =
        validationResult !== null && validationResult.required === true;
    }

    if (required) {
      return 'is-required';
    }
  }

  checkValidatorsData() {
    let validation = true;
    let dataInicial: Date = this.form.value.dataInicial;
    let dataFinal: Date = this.form.value.dataFinal;

    if (dataInicial > dataFinal) {
      validation = false;
    }

    return validation;
  }

  onFilter(): void {
    let confirm: boolean = false;

    if (!this.checkValidatorsData()) {
      this.pnotifyService.notice(
        'Data Inicial não pode ser maior que Data Final'
      );
    } else {
      confirm = true;
    }

    if (this.form.valid && confirm == true) {
      this.itemsPerPage = this.form.value.registros;
      this.currentPage = 1;
      this.setRouterParams(this.verificaParams());
    }
  }

  setRouterParams(params: any): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { q: btoa(JSON.stringify(params)) },
    });
    this.search(params);
  }

  verificaParams() {
    let params: any = {};

    if (this.form.value.tipoData) {
      params.tipoData = this.form.value.tipoData;
    }

    if (this.form.value.dataInicial) {
      params.dataInicial = this.dateService.convertToUrlDate(
        new Date(this.form.value.dataInicial)
      );
    }

    if (this.form.value.dataFinal) {
      params.dataFinal = this.dateService.convertToUrlDate(
        new Date(this.form.value.dataFinal)
      );
    }

    if (this.form.value.idCliente) {
      params.idCliente = this.form.value.idCliente;
    }

    if (this.form.value.dsCliente) {
      params.dsCliente = this.form.value.dsCliente;
    }

    if (this.form.value.situacao) {
      params.situacao = this.form.value.situacao;
    }

    if (this.form.value.vendedor) {
      params.vendedor = parseInt(this.form.value.vendedor);
    }

    if (this.form.value.registros) {
      params.registros = this.form.value.registros;
    }

    params.orderBy = this.orderBy;
    params.orderType = this.orderType;

    return params;
  }

  onCheckExcecao(): void {
    this.validaExcecao = !this.validaExcecao;
  }

  search(params: any): void {
    this.loaderNavbar = true;
    this.dados = [];
    this.dadosPagination = [];
    this.dadosLoaded = false;
    this.dadosEmpty = false;

    this.auditoriaService
      .getListaEnderecosEntrega(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.dadosLoaded = true;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            this.dados = response.data;
            this.dadosPagination = this.dados.slice(0, this.itemsPerPage);
            this.totalItems = this.dados.length;
            this.dadosLoaded = true;
          } else if (
            response.hasOwnProperty('success') &&
            response.success === false
          ) {
            this.dadosEmpty = true;
          } else {
            this.pnotifyService.error();
            this.dadosEmpty = true;
          }
        },
        error: (error: any) => {
          this.dadosEmpty = true;

          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      });
  }

  classStatusBorder(enderecoEntrega: any): string {
    let borderClass: string;

    if (enderecoEntrega.situacao === 1) {
      borderClass = 'border-success';
    } else if (enderecoEntrega.situacao === 4) {
      borderClass = 'border-danger';
    } else if (enderecoEntrega.situacao === 3) {
      borderClass = 'border-primary';
    }

    return borderClass;
  }

  onPageChanged(event: PageChangedEvent): void {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.dadosPagination = this.dados.slice(startItem, endItem);

    this.scrollToFilter.nativeElement.scrollIntoView({
      behavior: 'instant',
    });
  }

  setEnderecoSelecionado(): void {
    this.enderecoSelecionado = {
      idCliente: -1,
      codEndereco: null,
      razaoSocial: null,
      codSituacao: null,
      situacao: null,
      codUsuario: null,
      nomeUsuario: null,
      dataCadastro: null,
    };
  }

  onDetails(detalhes: TemplateRef<any>, enderecoEntrega: any): void {
    this.loaderNavbar = true;
    this.setEnderecoSelecionado();
    this.enderecoSelecionado = enderecoEntrega;
    this.anexos = [];
    this.anexosMarketing = [];
    
    this.auditoriaService.getCliente(this.enderecoSelecionado.COD_CLIE_TERC)
    .pipe(
      finalize(() => {
      this.loaderFullScreen = false;
    }))
    .subscribe({
      next: (response: JsonResponse) => {
        this.clienteTerceiro[0] = response;
      }
    });

    this.auditoriaService
      .getAnexosAprovacao(this.enderecoSelecionado.codEndereco)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.showAnexosMarketing = true;
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            this.anexosMarketing = response.data;
          }
        },
        error: (error: any) => {}
      });

    this.auditoriaService
      .getAnexos(this.enderecoSelecionado.codEndereco)
      .pipe(
        finalize(() => {
          if (this.enderecoSelecionado.idCliente > 0) {
            this.getUltimaCompra(this.enderecoSelecionado.idCliente, detalhes);

            /* this.loaderNavbar = false; */
          } else {
            this.pnotifyService.error('Erro ao abrir Endereço');
            this.loaderNavbar = false;
          }
          /* this.loaderNavbar = false; */
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            this.anexos = response.data;
            this.showAnexos = true;
          }
        },
        error: (error: any) => {
          if (error['error'].hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      });
  }

  getUltimaCompra(codCliente: number, detalhes: TemplateRef<any>) {
    this.auditoriaService
      .getUltimaCompra(codCliente)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.openModal(detalhes);
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            this.enderecoSelecionado.ultimaCompra =
              response.data[0].ULTIMA_COMPRA;
            this.enderecoSelecionado.ultimaCompraGrupo =
              response.data[0].ultimaCompraGrupo;
          }
        },
        error: (error: any) => {
          if (error['error'].hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      });
  }

  convertMysqlTime(time: string) {
    return this.dateService.convertMysqlTime(time);
  }

  openModal(detalhes: TemplateRef<any>) {
    this.detalhesModalRef = this.modalService.show(
      detalhes,
      Object.assign(
        {
          ignoreBackdropClick: true,
        },
        { class: 'modal-xl' }
      )
    );
  }

  onModalClose(modal) {
    if (modal == 'detalhes') {
      this.detalhesModalRef.hide();
    } else if (modal == 'confirm') {
      this.submitModalRef.hide();
    }
    this.formExcecao.value.excecao = null;
    this.validaExcecao = false;
  }

  /* onReject(confirm: TemplateRef<any>) {
    this.msgReject = '';
    this.submitModalRef = this.modalService.show(
      confirm,
      Object.assign(
        {
          ignoreBackdropClick: true,
        },
        { class: 'modal-lg' }
      )
    );
  } */

  onAction(confirm: TemplateRef<any>, acao: string) {
    this.msgModal = '';
    this.setFormExcessao();
    this.form.value.anexosAprovacao = [];
    this.acao = acao;
    if ((this.formLatLong.value.latitude != '' && this.formLatLong.value.longitude != '') ||
    (this.enderecoSelecionado.latitude != null &&  this.enderecoSelecionado.longitude != null)) {
      this.submitModalRef = this.modalService.show(
        confirm,
        Object.assign(
          {
            ignoreBackdropClick: true,
          },
          { class: 'modal-lg' }
        )
      );
    } else {
      this.pnotifyService.notice("Verifique os campos de latitude e longitude.")
    }

  }

  setFormExcessao(): void {
    this.formExcecao = this.formBuilder.group({
      excecao: null,
      anexosAprovacao: this.formBuilder.array([]),
    });
  }

  onSubmitModal() {
    if (this.validaExcecao &&
      ( this.formExcecao.value.excecao == 0 || this.formExcecao.value.excecao == null)) {
      this.pnotifyService.notice("Selecione uma exceção.")
      return;
    }

    if (this.msgModal != '' || this.acao == 'Aprovação') {
      let params = {
        idEndereco: this.enderecoSelecionado['id'],
        idCliente: this.enderecoSelecionado['idCliente'],
        cliente: this.enderecoSelecionado['nome'],
        emailVendedor: this.enderecoSelecionado['emailVendedor'],
        excecao: this.validaExcecao
        ? this.formExcecao.value.excecao
        : this.formExcecao.value.excecao = 0,
        justificativa: this.msgModal,
        anexos: this.formExcecao.value.anexosAprovacao,
        latitude:
        this.enderecoSelecionado.latitude != null
            ? this.enderecoSelecionado.latitude
            : this.formLatLong.value.latitude,
        longitude:
        this.enderecoSelecionado.longitude != null
            ? this.enderecoSelecionado.longitude
            : this.formLatLong.value.longitude,
        situacao: this.acao == 'Aprovação' ? 1 : 4,
      };

      this.onPostAnexosAprovacao(params.idEndereco);

      this.onModalClose('confirm');
      this.onModalClose('detalhes');
      this.aprovaReprovaEndereco(params);
    }

  }

  /* onAccept() {
    let paramsAccept = {
      idEndereco: this.enderecoSelecionado['id'],
      idCliente: this.enderecoSelecionado['idCliente'],
      cliente: this.enderecoSelecionado['nome'],
      emailVendedor: this.enderecoSelecionado['emailVendedor'],
      justificativa: '',
      situacao: 1,
    };

    this.onModalClose('detalhes');
    this.aprovaReprovaEndereco(paramsAccept);
  } */

  /* onSubmitReject() {
    if (this.msgReject != '') {
      let paramsReject = {
        idEndereco: this.enderecoSelecionado['id'],
        idCliente: this.enderecoSelecionado['idCliente'],
        cliente: this.enderecoSelecionado['nome'],
        emailVendedor: this.enderecoSelecionado['emailVendedor'],
        justificativa: this.msgReject,
        situacao: 4,
      };

      this.onModalClose('confirm');
      this.onModalClose('detalhes');
      this.aprovaReprovaEndereco(paramsReject);
    }
  } */

  aprovaReprovaEndereco(params: any) {
    this.loaderFullScreen = true;

    this.auditoriaService
      .aprovaReprovaEndereco(params)
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;

          this.setRouterParams(this.verificaParams());
        })
      )
      .subscribe({
        next: ( response: any) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            this.pnotifyService.success();
          } else {
            this.pnotifyService.error();
            this.dadosEmpty = true;
          }
        },
        error: (error: any) => {
          this.dadosEmpty = true;

          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      });
  }

  enviarEndereco(endereco: any) {
    let link: string = `https://www.google.com.br/maps/place/${endereco.endereco}-${endereco.bairro},${endereco.cidade}-${endereco.uf}`;
    const linkCorreto = link.replace(/ /g, '+');

    return linkCorreto;
  }

  getAnexosAprovacao(codEndereco: number) {
    this.loaderNavbar = true;
    this.showAnexosAprovacao = false;
    this.anexosMarketing = [];

    this.auditoriaService
      .getAnexosAprovacao(codEndereco)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.showAnexosAprovacao = true;
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            this.setAnexosAprovacao(response.data);
            this.anexosMarketing = response.data;
            this.showAnexosAprovacao = true;
          }
        },
        error: (error: any) => {
        }
      });
  }

  setAnexosAprovacao(anexos: any): void {
    if (anexos.length > 0) {
      for (let i = 0; i < anexos.length; i++) {
        this.onAddAnexosAprovacao(anexos[i], true);
      }
    }
  }

  get anexosAprovacao(): FormArray {
    return this.formExcecao.get('anexosAprovacao') as FormArray;
  }

  onAddAnexosAprovacao(anexo: any, manipulateForm?: boolean): void {
    if (this.checkAnexoExists(anexo) === false) {
      this.anexosAprovacao.push(
        this.formBuilder.group({
          codAnexo: [anexo.codAnexo],
          nomeAnexo: [anexo.nomeAnexo],
          linkAnexo: [anexo.linkAnexo],
          urlAnexo: [anexo.urlAnexo],
        })
      );

      if (manipulateForm) {
        this.form.markAsTouched();
        this.form.markAsDirty();
      }
    }
  }

  checkAnexoExists(anexo: any): boolean {
    return this.form.value.anexos.some((el: any) => {
      return el.codAnexo === anexo.codAnexo || el.nomeAnexo == anexo.nomeAnexo;
    });
  }

  appendFileAprovacao(files: FileList): any {
    if (files.length === 0) return;
    const fd = new FormData();
    fd.append('file', files[0]);
    this.formData.push(fd);

    this.anexosAprovacao.push(
      this.formBuilder.group({
        nomeAnexo: [files[0]['name']],
      })
    );
    if (this.showAnexos === false) {
      this.showAnexos = true;
    }
  }

  onPostAnexosAprovacao(codEndereco: number): void {
    if (this.formData.length === 0) {
      /* this.pnotifyService.notice('Erro'); */
      return;
    }

    /* const id = this.form.value.codMaterial; */

    this.formData.forEach((element, index) => {
      this.auditoriaService
        .postAnexosAprovacao(element, codEndereco)
        .subscribe();
    });
  }

  onDeleteAnexoAprovacao(codAnexo: number, index: number): void {
    console.log(index)
    this.confirmDelete().subscribe((r: boolean) => {
      if (codAnexo) {
        console.log("codAnexo");
        this.loaderNavbar = true;
        this.auditoriaService
          .deleteAnexoAprovacao(codAnexo)
          .pipe(
            finalize(() => {
              this.loaderNavbar = false;
            })
          )
          .subscribe({
            next: (response: JsonResponse) => {
              if (
                response.hasOwnProperty('success') &&
                response.success === true
              ) {
                r ? this.deleteDocumento(index) : null;
              } else if (
                response.hasOwnProperty('success') &&
                response.success === false &&
                response.hasOwnProperty('mensagem')
              ) {
                this.pnotifyService.error(response.mensagem);
              } else {
                this.pnotifyService.error();
              }
            },
            error: (error: any) => {
              if (error['error'].hasOwnProperty('mensagem')) {
                this.pnotifyService.error(error.error.mensagem);
              } else {
                this.pnotifyService.error();
              }
            }
          });
      } else {
        console.log("i")
        r ? this.deleteDocumento(index) : null;
        this.formData.splice(index, 1);
      }
    });
  }

  deleteDocumento(index: number): void {
    this.anexosAprovacao.removeAt(index);
    this.form.markAsTouched();
    this.form.markAsDirty();
  }

  confirmDelete(): any {
    return this.confirmModalService.showConfirm(
      'delete',
      'Confirmar exclusão',
      'Deseja realmente prosseguir com a exclusão do registro?',
      'Cancelar',
      'Confirmar'
    );
  }

}
