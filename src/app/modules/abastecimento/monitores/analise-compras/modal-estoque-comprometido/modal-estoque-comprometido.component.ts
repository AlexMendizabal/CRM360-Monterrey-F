import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

import { finalize } from 'rxjs/operators';

import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { ptBrLocale } from 'ngx-bootstrap/locale';
import { PageChangedEvent } from 'ngx-bootstrap';
defineLocale('pt-br', ptBrLocale);

import { DateService } from 'src/app/shared/services/core/date.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

import { AbastecimentoMonitoresAnaliseComprasService } from '../analise-compras.service';

@Component({
  selector: 'abastecimento-monitores-analise-compras-modal-estoque-comprometido',
  templateUrl: './modal-estoque-comprometido.component.html',
  styleUrls: ['./modal-estoque-comprometido.component.scss']
})
export class AbastecimentoMonitoresAnaliseCompraModalEstoqueComprometidoComponent implements OnInit {

  @Input() item;

  form: FormGroup;

  bsConfig: Partial<BsDatepickerConfig>;

  loaderBody: boolean = false;
  loadingDetalhesModal:boolean = false;
  noResultModal:boolean = false;
  estoqueComprometidoPedidoVendasEmpty:boolean = false;
  estoqueComprometidoPlanoCorteEmpty:boolean = false;

  modal:any = [];
  empresas:any = [];
  depositos: any = [];
  numero: any = [];
  itemFiltro: any = [];
  data: any = [];
  cliente: any = [];
  vendedor: any = [];

  idEmpresa: string = '';
  idDeposito: string = '';

  dadosEstoqueComprometidoPedidoVendas: any = [];
  dadosEstoqueComprometidoPedidoVendaslFull: any = [];
  dadosEstoqueComprometidoPedidoVendasTotal: any = [];

  dadosEstoqueComprometidoPlanoCorte: any = [];
  dadosEstoqueComprometidoPlanoCorteFull: any = [];
  dadosEstoqueComprometidoPlanoCorteTotal: any = [];

  /* Ordenação modal */
  reverseA: boolean = false;
  keyA: string = 'NM_EMPR';

  reverseB: boolean = false;
  keyB: string = 'NM_EMPR';

  reverseC: boolean = false;
  keyC: string = 'NM_EMPR';

  /* PaginationModal*/
  itemsPerPage = 15;
  currentPageA: number = 1;
  beginA: number = 0;
  endA: number = 15;

  currentPageB: number = 1;
  beginB: number = 0;
  endB: number = 15;

  currentPageC: number = 1;
  beginC: number = 0;
  endC: number = 15;

  /* dados do usuário */
  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  idUsuario: any = this.currentUser['info']['id'];
  /* dados do usuário */

  constructor(
    private formBuilder: FormBuilder,
    private dateService: DateService,
    private localeService: BsLocaleService,
    private service: AbastecimentoMonitoresAnaliseComprasService,
    private pnotifyService: PNotifyService
  ) { 
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );
    this.form = this.formBuilder.group({
      empresas: [null],
      depositos: [null],
      numero: [null],
      itemFiltro: [null],
      data: [null],
      cliente: [null],
      vendedor: [null]
    });
  }

  ngOnInit(): void {
    this.modal.codMaterial = this.item.ID_REFE_ERP;
    this.modal.descMaterial = this.item.NM_MATE;
    this.idEmpresa = this.item.ID_EMPR ? this.item.ID_EMPR : "";
    this.idDeposito = this.item.ID_DEPO ? this.item.ID_DEPO : "";
    this.onFilter();
  }

  onFilter(): void {
    let dataEmissao = this.setDateValid(this.form.value['data']);

    let params = {  
      NM_EMPR: this.form.value['empresas'] ? this.form.value['empresas'] : "",
      NM_DEPO: this.form.value['depositos'] ? this.form.value['depositos'] : "",
      NM_CLIE: this.form.value['cliente'] ? this.form.value['cliente'] : "",
      NM_VEND: this.form.value['vendedor'] ? this.form.value['vendedor'] : "",
      NR_PEDI: this.form.value['numero'] ? this.form.value['numero'] : "",
      NR_ITEM_PEDI  : this.form.value['itemFiltro'] ? this.form.value['itemFiltro'] : "",
      DT_EMIS: dataEmissao ? dataEmissao : "",
      ID_EMPR:  this.idEmpresa ? this.idEmpresa : "",
      ID_DEPO:  this.idDeposito ? this.idDeposito : "",
      ID_MATE: this.item["ID_MATE"] ? this.item["ID_MATE"] : "",    
      NR_PAGE_INIC: "",
      TT_REGI_PAGI: "",
      ORDE_BY: "",
      ORDE_TYPE: "",
      IN_GERA_RELA_EXCE: "",
      ID_USUA: ""
    };

    this.getEstoqueComprometido(params);                          
  }

  excelExport(): void {
    let dataEmissao = this.setDateValid(this.form.value['data']);

    let params = {
      NM_EMPR: this.form.value['empresas'] ? this.form.value['empresas'] : "",
      NM_DEPO: this.form.value['depositos'] ? this.form.value['depositos'] : "",
      NM_CLIE: this.form.value['cliente'] ? this.form.value['cliente'] : "",
      NM_VEND: this.form.value['vendedor'] ? this.form.value['vendedor'] : "",
      NR_PEDI: this.form.value['numero'] ? this.form.value['numero'] : "",
      NR_ITEM_PEDI  : this.form.value['itemFiltro'] ? this.form.value['itemFiltro'] : "",
      DT_EMIS: dataEmissao ? dataEmissao : "",
      ID_EMPR:  this.idEmpresa ? this.idEmpresa : "",
      ID_DEPO:  this.idDeposito ? this.idDeposito : "",
      ID_MATE: this.item["ID_MATE"] ? this.item["ID_MATE"] : "",    
      NR_PAGE_INIC: "",
      TT_REGI_PAGI: "",
      ORDE_BY: "",
      ORDE_TYPE: "",
      IN_GERA_RELA_EXCE: 1,
      ID_USUA: this.idUsuario
    };

    this.getEstoqueComprometidoExcel(params);  
  }

  getEstoqueComprometido(params: any): void {    
    this.dadosEstoqueComprometidoPedidoVendaslFull = [];
    this.dadosEstoqueComprometidoPedidoVendas = [];
    this.dadosEstoqueComprometidoPedidoVendasTotal = [];
  
    this.dadosEstoqueComprometidoPlanoCorteFull = [];
    this.dadosEstoqueComprometidoPlanoCorte = [];
    this.dadosEstoqueComprometidoPlanoCorteTotal = [];

    this.loaderBody = true;
    this.loadingDetalhesModal = false;
    this.noResultModal = false;
    this.estoqueComprometidoPedidoVendasEmpty = false;
    this.estoqueComprometidoPlanoCorteEmpty = false;

    this.service.getEstoqueComprometidoPedidoVenda(params)
    .pipe(finalize(() => this.loaderBody = false))
    .subscribe(
      (res: any) => {
        if (Object.keys(res).length > 0) {
          if (res['body']['responseCode'] === 200) {
            this.dadosEstoqueComprometidoPedidoVendaslFull = res['body']['result'];
            this.dadosEstoqueComprometidoPedidoVendasTotal = this.dadosEstoqueComprometidoPedidoVendaslFull.shift();
            this.dadosEstoqueComprometidoPedidoVendas = this.dadosEstoqueComprometidoPedidoVendaslFull;
            this.estoqueComprometidoPedidoVendasEmpty = false;
            this.loadingDetalhesModal = true;
          } else if(res['body']['responseCode'] === 404) {
            this.loadingDetalhesModal = true;
            this.estoqueComprometidoPedidoVendasEmpty = true;
            this.pnotifyService.notice(res['body']['message']);
          }
        }
      },
      error => {
        this.pnotifyService.error('Erro ao carregar Estoque Comprometido');
        this.loadingDetalhesModal = true;
        this.estoqueComprometidoPedidoVendasEmpty = true;
      }
    );

    this.service.getEstoqueComprometidoPlanoCorte(params)
    .pipe(finalize(() => this.loaderBody = false))
    .subscribe(
      (res: any) => {
        if (Object.keys(res).length > 0) {
          if (res['body']['responseCode'] === 200) {
            this.dadosEstoqueComprometidoPlanoCorteFull = res['body']['result'];
            this.dadosEstoqueComprometidoPlanoCorteTotal = this.dadosEstoqueComprometidoPlanoCorteFull.shift();
            this.dadosEstoqueComprometidoPlanoCorte = this.dadosEstoqueComprometidoPlanoCorteFull;
            this.estoqueComprometidoPlanoCorteEmpty = false;
            this.loadingDetalhesModal = true;
          } else if(res['body']['responseCode'] === 404) {
            this.loadingDetalhesModal = true;
            this.estoqueComprometidoPlanoCorteEmpty = true;
            this.pnotifyService.notice(res['body']['message']);
          }
        }
      },
      error => {
        this.pnotifyService.error('Erro ao carregar Estoque Comprometido');
        this.loadingDetalhesModal = true;
        this.estoqueComprometidoPlanoCorteEmpty = true;
      }
    );
  }

  getEstoqueComprometidoExcel(params: any): void {
    
    this.service.getEstoqueComprometidoPedidoVenda(params)
    .subscribe(
      (res: any) => {
        if (Object.keys(res).length > 0) {
          if (res['body']['responseCode'] === 200) {
            this.pnotifyService.success(res['body']['result']);
          } else if(res['body']['responseCode'] === 404) {
            this.pnotifyService.notice(res['body']['result']);
          }
        }
      },
      error => {
        this.pnotifyService.error('Erro ao gerar Excel - Estoque Comprometido');
      }
    );

    this.service.getEstoqueComprometidoPlanoCorte(params)
    .subscribe(
      (res: any) => {
        if (Object.keys(res).length > 0) {
          if (res['body']['responseCode'] === 200) {
            this.pnotifyService.success(res['body']['result']);
          } else if(res['body']['responseCode'] === 404) {
            this.pnotifyService.notice(res['body']['result']);
          }
        }
      },
      error => {
        this.pnotifyService.error('Erro ao gerar Excel - Estoque Comprometido');
      }
    );
  }

  setDateValid(date: any): any {
    if (date instanceof Date) {
      date = this.dateService.convertToUrlDate(date);
    }
    return date;
    }
  
    sortA(keyA): void {
      this.keyA = keyA;
      this.reverseA = !this.reverseA;
    }
  
    sortB(keyB): void {
      this.keyB = keyB;
      this.reverseB = !this.reverseB;
    }
  
    sortC(keyC): void {
      this.keyC = keyC;
      this.reverseC = !this.reverseC;
    }
  
    /* Paginação Modal*/
    onPageChangedA(event: PageChangedEvent): void {
      this.beginA = (event.page - 1) * event.itemsPerPage;
      this.endA = event.page * event.itemsPerPage;
    }
  
    onPageChangedB(event: PageChangedEvent): void {
      this.beginB = (event.page - 1) * event.itemsPerPage;
      this.endB = event.page * event.itemsPerPage;
    }
  
    onPageChangedC(event: PageChangedEvent): void {
      this.beginC = (event.page - 1) * event.itemsPerPage;
      this.endC = event.page * event.itemsPerPage;
    }

}
