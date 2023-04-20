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
  selector: 'abastecimento-monitores-analise-compras-modal-estoque-suspenso',
  templateUrl: './modal-estoque-suspenso.component.html',
  styleUrls: ['./modal-estoque-suspenso.component.scss']
})
export class AbastecimentoMonitoresAnaliseComprasModalEstoqueSuspensoComponent implements OnInit {

  @Input() item;

  form: FormGroup;

  bsConfig: Partial<BsDatepickerConfig>;

  loaderBody: boolean = false;
  loadingDetalhesModal:boolean = false;
  noResultModal:boolean = false;
  estoqueSupensoGeralEmpty:boolean = false;
  estoqueSupensoEntradaMaterialEmpty:boolean = false;

  empresas:any = [];
  depositos:any = [];
  dataEntrada:any = [];
  notaFiscal:any = [];
  usuario:any = [];
  lote:any = [];
  modal:any = [];

  idEmpresa: string = '';
  idDeposito: string = '';

  dadosEstoqueSuspensoGeral:any = [];
  dadosEstoqueSuspensoGeralFull:any = [];
  dadosEstoqueSuspensoGeralTotal:any = [];

  dadosEstoqueSuspensoInventario:any = [];
  dadosEstoqueSuspensoInventarioFull:any = [];
  dadosEstoqueSuspensoInventarioTotal:any = [];

  dadosEstoqueSuspensoEntradaMaterial:any = [];
  dadosEstoqueSuspensoEntradaMaterialFull:any = [];
  dadosEstoqueSuspensoEntradaMaterialTotal:any = [];

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
    private pnotifyService: PNotifyService,
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
      dataEntrada: [null],
      notaFiscal: [null],
      motivo: [null],
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
    let dataPedido = this.setDateValid(this.form.value['dataEntrada']);

     let params = {
      NM_EMPR: this.form.value['empresas'] ? this.form.value['empresas'] : "",
      NM_DEPO: this.form.value['depositos'] ? this.form.value['depositos'] : "",
      NR_NOTA_FISC: this.form.value['notaFiscal'] ? this.form.value['notaFiscal'] : "",
      DS_MOTI: this.form.value['motivo'] ? this.form.value['motivo'] : "",
      DT_ENTR: dataPedido ? dataPedido : "",
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

    this.getEstoqueSuspenso(params);                          
  }

  excelExport(): void {
    let dataPedido = this.setDateValid(this.form.value['dataEntrada']);

     let params = { 
      NM_EMPR: this.form.value['empresas'] ? this.form.value['empresas'] : "",
      NM_DEPO: this.form.value['depositos'] ? this.form.value['depositos'] : "",
      NR_NOTA_FISC: this.form.value['notaFiscal'] ? this.form.value['notaFiscal'] : "",
      DS_MOTI: this.form.value['motivo'] ? this.form.value['motivo'] : "",
      DT_ENTR: dataPedido ? dataPedido : "",
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

    this.getEstoqueSuspensoExcel(params);  
  }

  getEstoqueSuspenso(params: any): void {
    
    this.dadosEstoqueSuspensoGeralFull = [];
    this.dadosEstoqueSuspensoGeral = [];
    this.dadosEstoqueSuspensoGeralTotal = [];

    this.dadosEstoqueSuspensoEntradaMaterial = [];
    this.dadosEstoqueSuspensoEntradaMaterialFull = [];
    this.dadosEstoqueSuspensoEntradaMaterialTotal = [];

    this.dadosEstoqueSuspensoInventario = [];
    this.dadosEstoqueSuspensoInventarioFull = [];
    this.dadosEstoqueSuspensoInventarioTotal = [];

    this.loaderBody = true;
    this.loadingDetalhesModal = false;
    this.noResultModal = false;
    this.estoqueSupensoGeralEmpty = true;
    this.estoqueSupensoEntradaMaterialEmpty = true;

    this.service.getEstoqueSupensoGeral(params)
    .pipe(finalize(() => this.loaderBody = false))
    .subscribe(
      (res: any) => {
        if (Object.keys(res).length > 0) {
          if (res['body']['responseCode'] === 200) {
            this.dadosEstoqueSuspensoInventarioFull = res['body']['result'];
            this.dadosEstoqueSuspensoInventarioTotal = this.dadosEstoqueSuspensoInventarioFull.shift();
            this.dadosEstoqueSuspensoInventario = this.dadosEstoqueSuspensoInventarioFull;
            this.estoqueSupensoGeralEmpty = false;
            this.loadingDetalhesModal = true;
          } else if(res['body']['responseCode'] === 404) {
            this.loadingDetalhesModal = true;
            this.estoqueSupensoGeralEmpty = true;
            this.pnotifyService.notice(res['body']['message']);
          }
        }
      },
      error => {
        this.pnotifyService.error('Erro ao carregar Estoque Suspenso');
        this.loadingDetalhesModal = true;
        this.estoqueSupensoGeralEmpty = true;
      }
    );

    this.service.getEstoqueSupensoEntrada(params)
    .pipe(finalize(() => this.loaderBody = false))
    .subscribe(
      (res: any) => {
        if (Object.keys(res).length > 0) {
          if (res['body']['responseCode'] === 200) {
            this.dadosEstoqueSuspensoEntradaMaterialFull = res['body']['result'];
            this.dadosEstoqueSuspensoEntradaMaterialTotal = this.dadosEstoqueSuspensoEntradaMaterialFull.shift();
            this.dadosEstoqueSuspensoEntradaMaterial = this.dadosEstoqueSuspensoEntradaMaterialFull;
            this.estoqueSupensoEntradaMaterialEmpty = false;
            this.loadingDetalhesModal = true;
          } else if(res['body']['responseCode'] === 404) {
            this.loadingDetalhesModal = true;
            this.estoqueSupensoEntradaMaterialEmpty = true;
            this.pnotifyService.notice(res['body']['message']);
          }
        }
      },
      error => {
        this.pnotifyService.error('Erro ao carregar Estoque Suspenso');
        this.loadingDetalhesModal = true;
        this.estoqueSupensoEntradaMaterialEmpty = true;
      }
    );
  }

  getEstoqueSuspensoExcel(params: any): void {
    
    this.service.getEstoqueSupensoGeral(params)
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
        this.pnotifyService.error('Erro ao gerar Excel - Estoque Suspenso');
      }
    );

    this.service.getEstoqueSupensoEntrada(params)
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
        this.pnotifyService.error('Erro ao gerar Excel - Estoque Suspenso');
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
