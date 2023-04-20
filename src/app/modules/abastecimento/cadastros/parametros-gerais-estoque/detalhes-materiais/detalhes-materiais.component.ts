import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

import { EMPTY, Subscription } from 'rxjs';
import { finalize, switchMap, take } from 'rxjs/operators';

import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';

import { PageChangedEvent, BsLocaleService } from 'ngx-bootstrap';

import { AbastecimentoCadastrosParametrosGeraisEstoqueService } from '../parametros-gerais-estoque.service';

@Component({
  selector: 'detalhes-materiais',
  templateUrl: './detalhes-materiais.component.html',
  styleUrls: ['./detalhes-materiais.component.scss']
})
export class AbastecimentoCadastrosParametrosGeraisEstoqueDetalhesMateriaisComponent implements OnInit {
  loaderFullScreen: boolean = true;
  loaderNavbar: boolean = false;
  loading: boolean = false;
  loadingLogs: boolean = false;
  noResult: boolean = false;
  noResultLogs: boolean = false;
  abledEdit: boolean = false;
  loaderModal: boolean = false;
  colsNivelEstoque: boolean = false;

  data: Array<any> = [];
  dataFull: Array<any> = [];
  dataTotal: Array<any> = [];
  dataLogs: Array<any> = [];
  tiposNiveisEstoque: Array<any> = [];
  paramsRecord: any;

  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  idUsuario: any = this.currentUser['info']['id'];

  idSituacao: string;
  idLinha: string;
  linha: string;
  empresa: string;
  idEmpresa: string;
  idDeposito: string;
  deposito: string;
  idSubLinha: string;
  subLinha: string;
  idClasse: string;
  classe: string;
  idTipoMaterial: string;
  tipoMaterial: string;
  depositosAssociados: number;
  idTipoNivelEstoque: string;
  idMaterial: string;
  codigoMaterial: string;
  descricaoMaterial: string;
  idAssociacaoMaterial: string;

  headerModalCodMaterial: string;
  headerModalDescMaterial: string;
  headerModalPeriodo: string = '';
  headerModalMediaVendas: string = '';
  headerModalEstoqueDisponivel: string = '';

  formDateInicial: any;
  formDateFinal: any;
  formVolumeVendas: number;

  formModal: FormGroup;

  enableSave: boolean = false;
  minimoBool: boolean = false;
  medioBool: boolean = false;
  maximoBool: boolean = false;

  enableSaveModal: boolean = false;
  minimoBoolModal: boolean = false;
  medioBoolModal: boolean = false;
  maximoBoolModal: boolean = false;

  /* CurrentyMask para toneladas */
  ton: any = {
    align: 'left',
    prefix: '',
    thousands: '.',
    decimal: ',',
    precision: 3
  };

  /* Dados Modal Edição */
    nameModal: string;
    boolModalLogs: boolean = false;
  /* Dados Modal Edição */

  form: FormGroup;

  breadCrumbTree: any = [];
  dataMediaVendas: any = [];

  situations: any = [
    {ID:'0', NM_SITU: 'Inativo'},
    {ID: '1', NM_SITU: 'Ativo'}
  ];

  $activatedRouteSubscription: Subscription;

  /* Ordenação */
  reverse: boolean = false;
  key: string = 'NM_EMPR';
  /* Ordenação */

  /* Ordenação modal */
  reverseA: boolean = false;
  keyA: string = 'NM_CLAS';
  /* Ordenação modal */

  /* Paginação */
  itemsPerPage: number = 15;
  totalItems: number = 15;
  currentPage: number = 1;
  begin: number = 0;
  end: number = 15;
  /* Paginação */

  /* Paginação Modal*/
  currentPageA: number = 1;
  beginA: number = 0;
  endA: number = 15;
  /* Paginação Modal*/

  /* CurrentMask */
  decimal: any = {
    align: 'left',
    prefix: '',
    thousands: '.',
    decimal: ',',
    precision: 2
  };
  /* CurrentMask */

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private localeService: BsLocaleService,
    private routerService: RouterService,
    private titleService: TitleService,
    private confirmModalService: ConfirmModalService,
    private service: AbastecimentoCadastrosParametrosGeraisEstoqueService
  ) { 
    this.localeService.use('pt-br');
    
    this.form = this.formBuilder.group({
      _ID_APOI_TIPO_NIVE_ESTO: [null],
    });

    this.formModal = this.formBuilder.group({
      PERC_VARI_CONS: [null],
      TIPO_VARI: [null, Validators.required],
      DIAS_ESTO_MINI: [null, Validators.required],
      DIAS_ESTO_MEDI: [null, Validators.required],
      DIAS_ESTO_MAXI: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.loaderFullScreen = false;
    }, 1000);
    this.titleService.setTitle('Parâmetros gerais de estoque');
    this.setBreadCrumb();
    this.checkRouterParams();
    this.getTiposNiveisdeEstoque();
  }

  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/abastecimento/home'
        },
        {
          descricao: 'Cadastros',
          routerLink: `/abastecimento/cadastros/${params['idSubModulo']}`
        },
        {
          routerLink: `/abastecimento/cadastros/${params['idSubModulo']}/parametros-gerais-estoque/lista`,
          descricao: 'Parâmetros Gerais de Estoque'
        },
        {
          descricao: 'Detalhes materiais'
        }
      ];
    });
  }

  checkRouterParams(): void {
    this.$activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (queryParams: any) => {
        if (Object.keys(queryParams).length > 0) {
          const _response = this.routerService.getBase64UrlParams(queryParams);
          this.setValueHeaders(_response.item);
        }
      }
    );
    this.$activatedRouteSubscription.unsubscribe();
  }

  setValueHeaders(data: any): void {
    this.idSituacao = data['IN_STAT'];
    this.idLinha = data['ID_LINH'];
    this.linha = data['NM_LINH'];
    this.empresa = data['NM_EMPR'];
    this.deposito = data['NM_DEPO'];
    this.idDeposito = data['ID_DEPO'];
    this.idSubLinha = data['ID_SUB_LINH'] ?? '';
    this.subLinha = data['NM_SUB_LINH'] ?? '';
    this.idClasse = data['ID_CLAS'];
    this.classe = data['NM_CLAS'];
    this.idTipoMaterial = data['ID_TIPO_MATE'];
    this.tipoMaterial = data['NM_TIPO_MATE'];
    this.idTipoNivelEstoque = data['_ID_APOI_TIPO_NIVE_ESTO'] ?? '';

    if(this.idTipoNivelEstoque !== '') {
      this.form.get('_ID_APOI_TIPO_NIVE_ESTO').setValue(this.idTipoNivelEstoque);
    }

    this.search({
      IN_STAT: this.idSituacao,
      ID_DEPO: this.idDeposito ,
      ID_TIPO_MATE: this.idTipoMaterial ,
      ID_CLAS: this.idClasse,
      ID_APOI_TIPO_NIVE_ESTO: this.idTipoNivelEstoque
    })
  }

  getTiposNiveisdeEstoque(): void {
    this.tiposNiveisEstoque = [];
    this.loaderNavbar = true;

    this.service
      .getTiposNiveisdeEstoque()
      .pipe(finalize(() => this.loaderNavbar = false))
      .subscribe((res:any) => {
      if(Object.keys(res).length > 0) {
        if(res.status === 200) {
          if(res['body']['responseCode'] === 200) {
            this.tiposNiveisEstoque = res['body']['result'];
          } else {
            this.pnotifyService.notice(res['body']['message']);
          }
        }
      }
    },
    error => {
      this.pnotifyService.error('Erro ao obter tipos de niveis de estoque');
    });
  }

  getCalculoPeriodoVendasRealizadas(params: any, item): void {
    this.dataMediaVendas = [];
    this.loaderNavbar = true;

    this.service
      .getCalculoPeriodoVendasRealizadasMaterial(params)
      .pipe(finalize(() => this.loaderNavbar = false))
      .subscribe((res:any) => {
      if(Object.keys(res).length > 0) {
        if(res.status === 200) {
          if(res['body']['responseCode'] === 200) {
            this.dataMediaVendas = res['body']['result'];
            item.BOOL_CALC = true;
            item.DATE_STAR_CALC = this.dataMediaVendas[0].DT_INIC_PERI_VEND;
            item.DATE_END_CALC = this.dataMediaVendas[0].DT_FINA_PERI_VEND;
            item.MEDI_VEND_CALC = this.dataMediaVendas[0].TT_MEDI_VEND_PERI;
            item.VENDA_PERI_CALC = this.dataMediaVendas[0].TT_VEND_PERI;
            this.handleCalcTotal();
          } else {
            this.pnotifyService.notice(res['body']['message']);
          }
        }
      }
    },
    error => {
      this.pnotifyService.error('Erro ao realizar calculo do período de vendas');
    });
  }

  search(params: any): void {    
    this.loaderNavbar = true;
    this.loading = false;
    
    this.data = [];
    this.dataFull = [];
    this.dataTotal = [];
    this.service
    .getNivelEstoqueMaterialDeposito(params)
    .pipe(
      finalize(() => this.loaderNavbar = false)
      )
      .subscribe(res => {
        if(Object.keys(res).length > 0) {
          if(res.status == 200){
            if(res['body']['responseCode'] == 200) {
              this.loading = true;
              this.noResult = false;
              this.dataFull = res['body']['result'];
              this.dataTotal = this.dataFull.shift();
              this.data = this.dataFull;
            } else if (res['body']['responseCode'] ==  404){
            this.noResult = true;
            this.pnotifyService.notice(res['body']['message']);
          } else {
            this.pnotifyService.notice(res['body']['message']);
          }
        }
      }
    },
    error => {
      this.noResult = true;
      this.pnotifyService.error("Erro ao carregar Detalhes de Materiais");
    });
  }

  getLogs(params: any): void {    
    this.loaderNavbar = true;
    this.loadingLogs = false;
    this.loaderModal = false;
    
    this.dataLogs = [];
    this.service
    .getNivelEstoqueMaterialDepositoLogs(params)
    .pipe(
      finalize(() => {this.loaderNavbar = false, this.loaderModal = true})
      )
      .subscribe(res => {
        if(Object.keys(res).length > 0) {
          if(res.status == 200){
            if(res['body']['responseCode'] == 200) {
              this.loadingLogs = true;
              this.noResultLogs = false;
              this.dataLogs = res['body']['result'];
            } else if (res['body']['responseCode'] ==  404){
            this.noResultLogs = true;
            this.pnotifyService.notice(res['body']['message']);
          } else {
            this.noResultLogs = true;
            this.pnotifyService.notice(res['body']['message']);
          }
        }
      }
    },
    error => {
      this.noResultLogs = true;
      this.pnotifyService.error("Erro ao carregar Logs de detalhes de Materiais");
    });
  }

  onFilter(): void {
    this.search({
      IN_STAT: this.idSituacao,
      ID_DEPO: this.idDeposito ,
      ID_TIPO_MATE: this.idTipoMaterial ,
      ID_CLAS: this.idClasse,
      ID_APOI_TIPO_NIVE_ESTO: this.form.value['_ID_APOI_TIPO_NIVE_ESTO'] ?? ''
    })
  }

  openModalLogs(item: any): void {
    this.nameModal = 'Logs';
    this.boolModalLogs = true;

    const params = {
      ID_DEPO: item.ID_DEPO ?? '',
      ID_MATE: item.ID_MATE ?? ''
    }

    this.getLogs(params);
  }

  closeModal(): void {
    this.nameModal = '';
    this.boolModalLogs = false;
  }

  onEdit(item: any): any {
    const periodoVendas = item.FORM_PERI_VEND ?? '';
    const estoqueMinimo = item.FORM_ESTO_MINI ?? '';
    const estoqueMedio = item.FORM_ESTO_MEDI ?? '';
    const estoqueMaximo = item.FORM_ESTO_MAXI ?? '';
    const mediaVendas = item.MEDI_VEND_CALC ?? '';
    const vendasPeriodo = item.VENDA_PERI_CALC ?? '';
    const dateStart = item.DATE_STAR_CALC ?? '';
    const dateEnd = item.DATE_END_CALC ?? '';
    const idDeposito = item.ID_DEPO ?? '';
    this.idMaterial = item.ID_MATE ?? '';
    this.idAssociacaoMaterial = item.ID_ASSO_DEPO_MATE ?? '';

    const arrayTemp = [{
      ID_DEPO: idDeposito,
      ID_MATE: this.idMaterial,
      TT_PERI_VEND_MESE: parseInt(periodoVendas),
      TT_VEND_PERI: vendasPeriodo,
      DT_INIC_PERI_VEND: dateStart,
      DT_FINA_PERI_VEND:  dateEnd ?? '',
      TT_MEDI_VEND_PERI: mediaVendas ?? '',
      TT_ESTO_MINI: estoqueMinimo,
      TT_ESTO_MEDI: estoqueMedio,
      TT_ESTO_MAXI: estoqueMaximo,
      IN_STAT: 1
    }];

    const record = {
      ID_TIPO_GRAV: 2,
      ID_USUA: parseInt(this.idUsuario),
      DATA: arrayTemp
    }

    this.onConfirmChange(this.service.postNivelEstoqueMaterialDeposito(record));
  }

  onConfirmChange(apiRoute: any): any{
    this.confirmChange()
    .asObservable()
    .pipe(
      take(1),
      switchMap((result: any) => {
        if (!result) return EMPTY;
          this.loaderNavbar = true;
          return apiRoute;
      }),
      finalize(() => {
        this.loaderNavbar = false;
      })
    )
    .subscribe(
      (success: any) => {
        setTimeout(() => {
          this.onFilter();
        }, 700);
        this.pnotifyService.success();
      },
      (error: any) => {
        this.pnotifyService.error();
      }
    );
  }

  confirmChange(): any {
    return this.confirmModalService.showConfirm(
     null,
     'Confirmar alteração',
     'Deseja realmente prosseguir com a alteração do(s) registro(s)?',
     'Cancelar',
     'Confirmar'
   );
 }

  ableEditCell(item: any): void {
    item.FORM_PERI_VEND = null;
    item.FORM_ESTO_MINI = null;
    item.FORM_ESTO_MEDI = null;
    item.FORM_ESTO_MAXI = null;
    item.DATE_STAR_CALC = '';
    item.DATE_END_CALC = '';
    item.MEDI_VEND_CALC = 0;
    item.ON_EDIT_CELL = !item.ON_EDIT_CELL
  }

  disableEditCell(item: any): void {
    item.FORM_PERI_VEND = null;
    item.DATE_STAR_CALC = '';
    item.DATE_END_CALC = '';
    item.MEDI_VEND_CALC = 0;
    item.ON_EDIT_CELL = !item.ON_EDIT_CELL;
    this.handleCalcTotal();
  }

  calculateMediaVendas(item: any): void {
    const periodoMeses: string = item.FORM_PERI_VEND ?? '';
    const params: any = {
      ID_DEPO: this.idDeposito,
      ID_MATE: item.ID_MATE,
      TT_MESE_PERI_VEND: periodoMeses
    }
    this.getCalculoPeriodoVendasRealizadas(params, item);
  }

  /* Validação para habilitar botão de salvar */
  validatorsSave(item: any): boolean {
    const minimo = item.FORM_ESTO_MINI ;
    const medio = item.FORM_ESTO_MEDI;
    const maximo = item.FORM_ESTO_MAXI;

    if( minimo > medio || minimo > maximo) {
      this.minimoBool = false;
    } else {
      this.minimoBool = true;
    }

    if( medio > maximo || medio < minimo) {
      this.medioBool = false;
    } else {
      this.medioBool = true;
    }

    if( maximo < minimo || maximo < medio) {
      this.maximoBool = false;
    } else {
      this.maximoBool = true;
    }
  
    if( this.minimoBool && this.medioBool && this.maximoBool ) {
      this.enableSave = true;
    } else {
      this.enableSave = false;
    }
    return this.enableSave;
  }

  /* Realiza calculo dos dados do totalizador*/
  handleCalcTotal(): void {
    let getValueMediaVendas = 0;
    let total = 0;

    this.data.forEach( e => {
      if(e.MEDI_VEND_CALC != undefined) {
        getValueMediaVendas = e.MEDI_VEND_CALC;
      } else {
        getValueMediaVendas = e.TT_MEDI_VEND_PERI;
      }
      total = total + getValueMediaVendas;
    });

    this.dataTotal['TT_MEDI_VEND_PERI'] =  total;
  }

  setDefaultValueFormModalNivelEstoque(item): void {
    this.formModal.reset();
    this.formModal.get('TIPO_VARI').setValue('1');

    this.paramsRecord = {};

    if (item) {
      this.headerModalCodMaterial = item.ID_REFE_ERP;
      this.headerModalDescMaterial = item.NM_MATE;
      this.headerModalPeriodo = item.TT_PERI_VEND_MESE;
      this.headerModalMediaVendas = item.TT_MEDI_VEND_PERI;
      this.headerModalEstoqueDisponivel = item.TT_ESTO_DISP;

      this.paramsRecord = {
        ID_TIPO_GRAV: 3,
        ID_MATE: item.ID_MATE,
        ID_DEPO: item.ID_DEPO
      }
    }
  }

  OnSaveNivelEstoque(): void {
    let record = this.paramsRecord;
    const percetualVariacao = this.formModal.value['PERC_VARI_CONS'];
    const tipoVariacao = this.formModal.value['TIPO_VARI'];
    const diasEstoqueMinimo = this.formModal.value['DIAS_ESTO_MINI'];
    const diasEstoqueMedio = this.formModal.value['DIAS_ESTO_MEDI'];
    const diasEstoqueMaximo = this.formModal.value['DIAS_ESTO_MAXI'];

    record['VL_PERC_VARI_CONS'] = percetualVariacao ? parseFloat(percetualVariacao) : '',
    record['IN_PERC_VARI_CONS'] = tipoVariacao ? parseInt(tipoVariacao) : '',
    record['TT_DIAS_ESTO_MINI'] = diasEstoqueMinimo ? parseInt(diasEstoqueMinimo) : '',
    record['TT_DIAS_ESTO_MEDI'] = diasEstoqueMedio ? parseInt(diasEstoqueMedio) : '',
    record['TT_DIAS_ESTO_MAXI'] = diasEstoqueMaximo ? parseInt(diasEstoqueMaximo) : '',
    record['ID_USUA'] = parseInt(this.idUsuario),

    this.onConfirmChange(this.service.postNivelEstoque(record));
  }

  setColsNivelEstoqueTrue(): void {
    this.colsNivelEstoque = !this.colsNivelEstoque;
    this.data.forEach( e => {
      if(e.ON_EDIT_CELL) {
        e.ON_EDIT_CELL = !e.ON_EDIT_CELL
      }
    });
  }

  /* Ordenação */
  sort(key: string): void {
    this.key = key;
    this.reverse = !this.reverse;
  }
  /* Ordenação */
  
  /* Paginação Tabela Principal*/
  onPageChanged(event: PageChangedEvent): void {
    this.begin = (event.page - 1) * event.itemsPerPage;
    this.end = event.page * event.itemsPerPage;
  }
  /* Paginação */

  /* Paginação Modal*/
  onPageChangedA(event: PageChangedEvent): void {
    this.beginA = (event.page - 1) * event.itemsPerPage;
    this.endA = event.page * event.itemsPerPage;
  }
  /* Paginação Modal*/

  /* Ordenação Modal*/
  sortA(keyA: string): void {
    this.keyA = keyA;
    this.reverseA = !this.reverseA;
  }
  /* Ordenação Modal*/

  onFieldError(field: string): string {
    if (this.onFieldInvalid(field)) {
      return 'is-invalid';
    }
    return '';
  }

  onFieldInvalid(field: any): any {
    field = this.form.get(field);
    return field.status == 'INVALID' && field.touched;
  }

  onFieldRequired(field: string): any {
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

  onFieldErrorModal(field: string): string {
    if (this.onFieldInvalidModal(field)) {
      return 'is-invalid';
    }
    return '';
  }

  onFieldInvalidModal(field: any): any {
    field = this.formModal.get(field);
    return field.status == 'INVALID' && field.touched;
  }

  onFieldRequiredModal(field: string): any {
    let required = false;
    let formControl = new FormControl();

    if (this.formModal.controls[field].validator) {
      let validationResult = this.formModal.controls[field].validator(formControl);
      required =
        validationResult !== null && validationResult.required === true;
    }

    if (required) {
      return 'is-required';
    }
  }

  /* Realiza comparação para verificar se volume minimo < volumeMedio < volume maximo */
  compareValuesEstoque(field: any): any {
    let minimo = this.formModal.get("DIAS_ESTO_MINI").value;
    let medio = this.formModal.get("DIAS_ESTO_MEDI").value;
    let maximo = this.formModal.get("DIAS_ESTO_MAXI").value;

    minimo = parseInt(minimo);
    medio = parseInt(medio);
    maximo = parseInt(maximo);

    if (this.formModal.get("DIAS_ESTO_MAXI").touched) {
      if(field == "DIAS_ESTO_MINI") {
        if( minimo > medio || minimo > maximo) {
          this.minimoBoolModal = false;
          return true;
        } else {
          this.minimoBoolModal = true;
        }
      }
  
      if(field == "DIAS_ESTO_MEDI") {
        if( medio > maximo || medio < minimo) {
          this.medioBoolModal = false;
          return true;
        } else {
          this.medioBoolModal = true;
        }
      }
  
      if(field == "DIAS_ESTO_MAXI") {
        if( maximo < minimo || maximo < medio) {
          this.maximoBoolModal = false;
          return true;
        } else {
          this.maximoBoolModal = true;
        }
      }
    }
  }

  /* Validação para habilitar botão de salvar no modal Nivel Estoque*/
  validatorsSaveModal(): boolean {
    if( this.minimoBoolModal && this.minimoBoolModal && this.minimoBoolModal ) {
      this.enableSaveModal = true;
    } else {
      this.enableSaveModal = false;
    }
    return this.enableSaveModal;
  }
}
