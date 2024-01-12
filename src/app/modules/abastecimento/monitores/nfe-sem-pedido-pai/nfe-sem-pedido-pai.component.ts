import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from '@angular/forms';
import { Component, OnInit } from '@angular/core';

import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { PageChangedEvent } from 'ngx-bootstrap/pagination/ngx-bootstrap-pagination';
import { ptBrLocale } from 'ngx-bootstrap/locale';
defineLocale('pt-br', ptBrLocale);

import { DateService } from 'src/app/shared/services/core/date.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { XlsxService } from 'src/app/shared/modules/xlsx/xlsx.service';
//Converte rota em base64
import { RouterService } from 'src/app/shared/services/core/router.service';
import { TitleService } from 'src/app/shared/services/core/title.service';

import { AbastecimentoNfeSemPedidoPaiService } from './nfe-sem-pedido-pai.service';

@Component({
  selector: 'nfe-sem-pedido-pai',
  templateUrl: './nfe-sem-pedido-pai.component.html',
  styleUrls: ['./nfe-sem-pedido-pai.component.scss']
})
export class AbastecimentoMonitoresNfeSemPedidoPaiComponent implements OnInit {
  loaderFullScreen: boolean = true;
  loaderNavbar: boolean = false;
  loading: boolean = false;
  showAdvancedFilter: boolean = true;
  compararData: boolean = false;
  carregouNf: boolean = false;
  onEmpy: boolean = false;
  onPaginacao: boolean = false;
  data: Date = new Date();
  linhas: any = [];
  classes: any = [];
  materiais: any = [];
  
  nfRelatorio: any = [];
  tempNfRelatorio: any = [];
  nfRelatorioExcel: any = [];
  breadCrumbTree: any;
  
  $subscription: Subscription;
  
  bsConfig: Partial<BsDatepickerConfig>;

  form: FormGroup;
  
  /* Paginação */
  itemsPerPage: number = 15;
  totalItems: number = 15;
  currentPage: number = 1;
  begin: number = 0;
  end: number = 15;
  /* Paginação */

  /* Ordenação */
  reverse: boolean = false;
  key: string = 'PEDIDO';
  /* Ordenação */

  placeholderClasses = 'Selecione uma classe';
  placeholderMateriais = 'Selecione um material';


  numerico: any = {
    align: "left",
    allowNegative: false,
    decimal: "",
    precision: 0,
    prefix: "",
    suffix: "",
    thousands: ""
  }

  constructor(
    private formBuilder: FormBuilder,
    private pnotify: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private localeService: BsLocaleService,
    private router: Router,
    private titleService: TitleService,
    private routerService: RouterService,
    private dateService: DateService,
    private atividadesService: AtividadesService,
    private service: AbastecimentoNfeSemPedidoPaiService,
    private xlsxService: XlsxService
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );
    this.form = this.formBuilder.group({
      dataInicial: [this.dateService.getFirstDayMonth(), Validators.required],
      dataFinal: [this.data, Validators.required],
      pedido: [null],
      notaFiscal: [null],
      linhas: [null],
      classes: [null],
      materiais: [null],
      usuario: [null],
      time: [new Date().getTime()]
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.loaderFullScreen = false;
    }, 1000);
    this.titleService.setTitle('Nfe sem pedido pai');
    this.registrarAcesso();
    this.onBreadCumbTree();
    this.onActivatedRoute();
    this.getLinhas()
    this.form.get('classes').disable();
    this.form.get('materiais').disable();
  }

  onActivatedRoute(): void {
    this.$subscription = this.activatedRoute.queryParams.subscribe(
      queryParams => {
        if (Object.keys(queryParams).length > 0) {
          let _response = this.routerService.getBase64UrlParams(queryParams);
          this.form.patchValue(_response);
          this.getNfeSemPedidoPai(this.getParams());
        }
      }
    );
    this.$subscription.unsubscribe();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  onBreadCumbTree(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/abastecimento/home'
        },
        {
          descricao: 'Monitores',
          routerLink: `/abastecimento/monitores/${params['idSubModulo']}`
        },
        {
          descricao: 'Nfe sem Pedido Pai'
        }
      ];
    });
  }

  onFilter(): void {
    this.form.get('time').setValue(new Date().getTime());

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams())
    });

    this.getNfeSemPedidoPai(this.getParams());
  }

  /* define os paramentos para busca */
  geetParams(params: any): any {
    let dataInicial = params['dataInicial'];
    let dataFinal = params['dataFinal'];

    this.form.patchValue({
      dataInicial: dataInicial,
      dataFinal: dataFinal
    });

    if (dataInicial instanceof Date) {
      dataInicial = this.dateService.convertToUrlDate(dataInicial);
    }

    if (dataFinal instanceof Date) {
      dataFinal = this.dateService.convertToUrlDate(dataFinal);
    }

    return {
      dataInicial: dataInicial,
      dataFinal: dataFinal
    };
  }

  getParams() {
    let _params = {};
    let _obj = this.form.value;

    for (let prop in _obj) {
      if (_obj[prop]) {
        if (_obj[prop] instanceof Date)
          _params[prop] = this.dateService
            .convertToBrazilianDate(_obj[prop])
            .substring(0, 10);
        else _params[prop] = _obj[prop];
      }
    }

    return _params;
  }

  getNfeSemPedidoPai(params: any): void {
    this.loaderNavbar = true;
    this.carregouNf = false;
    this.nfRelatorio = [];
    this.tempNfRelatorio  = [];
    this.nfRelatorio  = [];

    this.service
      .getNfeSemPedidoPai(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        res => {
          if (res.status === 200) {
            this.carregouNf = true;
            this.onEmpy = false;
            this.nfRelatorio = res['body']['data'];
            this.nfRelatorioExcel = this.nfRelatorio;
            this.tempNfRelatorio = [...this.nfRelatorio];
            if (this.nfRelatorio.length > 15) {
              this.onPaginacao = true;
            }
          } else if (res.status === 204) {
            this.carregouNf = false;
            this.onEmpy = true;
            this.pnotify.notice('Não há item a serem exibidos');
          }
        },
        error => {
          this.pnotify.error(error['error']);
        }
      );
  }

  exportarExcel(): void {
    /* Remove a coluna NF_EMISSAO_CLARION da lista */
    this.nfRelatorioExcel.forEach(
      element => delete element['NF_EMISSAO_CLARION']
    );

    /* Chama o serviço para exportar dados em documento excel */
    this.xlsxService.exportFile(this.nfRelatorioExcel, 'relatório');
  }

  /* Filtro por nome de usuário */
  search(form: FormGroup): void {
    const val = form.value.usuario.toLowerCase();

    if (!val) {
      this.nfRelatorio = this.tempNfRelatorio;
    }

    const temp = this.tempNfRelatorio.filter(row => {
      return Object.keys(row).some(property => {
        return row[property] === null
          ? null
          : row[property]
              .toString()
              .toLowerCase()
              .indexOf(val) !== -1;
      });
    });

    this.nfRelatorio = temp;
  }

  onAdvancedFilter(): void {
    this.showAdvancedFilter = !this.showAdvancedFilter;
  }

  onFieldError(field: string) {
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

  /* Paginação */
  onPageChanged(event: PageChangedEvent): void {
    this.begin = (event.page - 1) * event.itemsPerPage;
    this.end = event.page * event.itemsPerPage;
  }
  /* Paginação */

  /* Ordenação */
  sort(key: string): void {
    this.key = key;
    this.reverse = !this.reverse;
  }
  /* Ordenação */

  comparaData(): boolean {
    let stra = this.form.get('dataInicial').value;
    let strb = this.form.get('dataFinal').value;
    let dataInicial = {};
    let dataFinal = {};

    if (stra instanceof Date) {
      dataInicial = stra;
    } else if(stra !== null) {
      dataInicial = new Date(stra.split('-').reverse().join('-'));
    }

    if (strb instanceof Date) {
      dataFinal = strb;
    } else if(strb !== null) {
      dataFinal = new Date(strb.split('-').reverse().join('-'));;
    }

    if (!dataFinal) {
      return false;
    } else if (dataInicial > dataFinal) {
      this.compararData = true;
      return this.compararData;
    }
  }

  getLinhas(){
    this.service.getLinhas().subscribe((response: any) => {
      if (Object.keys(response.body['result']).length > 0) {
        this.linhas = response.body['result'];
      }
    });
  }

  getClasses() {
    this.placeholderClasses = 'Carregando...';
    this.loaderNavbar = true;
    let id_linha = [];

    if (this.form.get('linhas').status === 'VALID') {
      id_linha['ID_LINH'] = (this.form.get('linhas').value);
      this.service
        .getClasses(id_linha)
        .pipe(
          finalize(() => {
            this.loaderNavbar = false;
            this.placeholderClasses = 'Selecione uma classe';
          })
        )
        .subscribe((response: any) => {
          if (Object.keys(response.body['result']).length > 0) {
            this.classes = response.body['result'];
          }
          this.loaderNavbar = false;
        });
    }
  }

  getMateriais() {
    let params = {};

    this.placeholderMateriais = 'Carregando...';
    this.materiais = [];
    this.loaderNavbar = true;

    if (this.form.get('classes').value) {
      params['ID_CLAS'] = (this.form.get('classes').value);
      params['IN_STAT'] = 1;
    }

    this.service
      .getMateriais(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.placeholderMateriais = 'Selecione um material';
        })
      )
      .subscribe((response: any) => {
        //console.log(response);
        if (Object.keys(response.body['result']).length > 0) {
          this.materiais = response.body['result'];
        }
      });
  }

  validaCampo() {
    if (this.form.value['linhas'] != null)
      this.form.get('classes').enable();
    else {
      this.form.get('classes').disable();
      this.form.get('materiais').disable();
    }

    if (this.form.value['classes'] != null)
      this.form.get('materiais').enable();
    else {
      this.form.get('materiais').disable();
    }
    
  }
}
