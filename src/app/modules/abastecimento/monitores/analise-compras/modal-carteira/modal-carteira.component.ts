import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';

import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';

import { defineLocale } from 'ngx-bootstrap/chronos';
import { ptBrLocale } from 'ngx-bootstrap/locale';
import { PageChangedEvent } from 'ngx-bootstrap';
defineLocale('pt-br', ptBrLocale);

//Converte rota em base64
import { RouterService } from 'src/app/shared/services/core/router.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

import { AbastecimentoMonitoresAnaliseComprasService } from './../analise-compras.service';
import { finalize } from 'rxjs/operators';
import { Label } from '@amcharts/amcharts4/core';

@Component({
  selector: 'abastecimento-monitores-analise-compras-modal-carteira',
  templateUrl: './modal-carteira.component.html',
  styleUrls: ['./modal-carteira.component.scss']
})
export class AbastecimentoMonitoresAnaliseComprasModalCarteiraComponent implements OnInit {

  @Input() item: any;
  @Input() idMesAno: any;

  loadingDetalhesModal:boolean = false;
  noResultModal:boolean = false;
  loaderBody:boolean = false;
  enableTabAbastFornecedor: boolean = false;
  enableTabAbastInterno: boolean = false;

  form: FormGroup;

  bsConfig: Partial<BsDatepickerConfig>;

  empresas:any = [];
  depositos:any = [];
  pedidoPai:any = [];
  dataPedido:any = [];
  pedidoRemessa:any = [];
  previsaoEntrega:any = [];
  fornecedor:any = [];
  modal:any = [];
  dadosExcel:any = [];

  dadosCarteiraDetalhe: any = [];
  dadosCarteiraDetalhesAbastGeralTT: any = [];
  dadosCarteiraDetalhesAbastGeralFull: any = [];
  dadosCarteiraDetalhesAbastGeral: any = [];
  dadosCarteiraDetalhesAbastInterno: any = [];
  dadosCarteiraDetalhesAbastTotal: any = [];
  dadosCarteiraDetalhesAbastFornecedor: any = [];

  idEmpresa: string;
  idDeposito: string;

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
    private localeService: BsLocaleService,
    private routerService: RouterService,
    private activatedRoute: ActivatedRoute,
    private dateService: DateService,
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
      pedidoPai: [null],
      dataPedido: [null],
      pedidoRemessa: [null],
      previsaoEntrega: [null],
      fornecedor: [null]
    });
  }

  ngOnInit(): void {
    this.modal.codMaterial = this.item.ID_REFE_ERP;
    this.modal.descMaterial = this.item.NM_MATE;
    this.modal.unidadeMedida = this.item.NM_UNID_MEDI;
    this.resetValuesForm();
    this.setParamsCarteira();
  }

  resetValuesForm(): void {
    this.form.get('empresas').reset();
    this.form.get('depositos').reset();
    this.form.get('pedidoPai').reset();
    this.form.get('dataPedido').reset();
    this.form.get('pedidoRemessa').reset();
    this.form.get('previsaoEntrega').reset();
    this.form.get('fornecedor').reset();
  }

  setParamsCarteira(): void {
    let queryParams = this.routerService.getBase64UrlParams(this.activatedRoute.snapshot.queryParams);

    let params: any = [];
    let tipoVisualizacao = queryParams["tipoVisualizacao"];
    let idMaterial = this.item["ID_MATE"];
    let idMesAno = this.idMesAno;

    if(tipoVisualizacao == 'S') {
     this.idEmpresa = queryParams["empresas"];
     this.idDeposito = queryParams["depositos"];
    } else if(tipoVisualizacao == 'A') {
      this.idEmpresa = "";
      this.idDeposito = this.item["ID_DEPO"];
    }

    params = {
      ID_EMPR:  this.idEmpresa ? this.idEmpresa : "",
      ID_DEPO:  this.idDeposito ? this.idDeposito : "",
      NM_MES_ANO: this.idMesAno ? this.idMesAno : "",
      ID_MATE: idMaterial ? idMaterial : "",
      NM_EMPR: "",
      NM_DEPO: "",
      NR_PEDI_ORIG: "",
      DT_PEDI_ORIG: "",
      NR_PEDI_REME: "",
      DT_PREV_ENTR: "",
      NM_FORN: ""
    };

    this.getCarteiraDetalhes(params);
  }

  getCarteiraDetalhes(params: any): void {
    this.dadosCarteiraDetalhesAbastFornecedor = [];
    this.dadosCarteiraDetalhesAbastInterno = [];
    this.dadosCarteiraDetalhesAbastGeral = [];
    this.dadosCarteiraDetalhesAbastGeralFull = [];
    this.dadosCarteiraDetalhesAbastGeralTT = [];
    this.loaderBody = true;
    this.noResultModal = false;
    this.loadingDetalhesModal = false;
    this.loadingDetalhesModal = false;
    this.enableTabAbastInterno = false;
    this.enableTabAbastFornecedor = false;

    this.service.getCarteiraDetalhes(params)
    .pipe(finalize(() => (this.loaderBody = false)))
    .subscribe(
      (res: any) => {
        if (Object.keys(res).length > 0) {
          if (res['body']['responseCode'] === 200) {
            this.loadingDetalhesModal = true;
            this.noResultModal = false;
            this.dadosCarteiraDetalhesAbastFornecedor = res['body']['result']['ABAS_FORN'];
            this.dadosCarteiraDetalhesAbastInterno = res['body']['result']['ABAS_INTE'];
            this.dadosCarteiraDetalhesAbastTotal = res['body']['result']['TOTA_DETA_CART_ABER'];

            this.dadosCarteiraDetalhesAbastGeralFull = res['body']['result']['INFO_GERA'];
            this.dadosCarteiraDetalhesAbastGeralTT = this.dadosCarteiraDetalhesAbastGeralFull.shift();
            this.dadosCarteiraDetalhesAbastGeral = this.dadosCarteiraDetalhesAbastGeralFull;
            
            if (this.dadosCarteiraDetalhesAbastInterno != (null || undefined)) {
              this.enableTabAbastInterno = true;
            }
            
            if (this.dadosCarteiraDetalhesAbastFornecedor != (null || undefined)) {
              this.enableTabAbastFornecedor = true;
            }

            if (!this.enableTabAbastInterno && this.enableTabAbastFornecedor) {
              this.form.get('pedidoRemessa').reset();
              this.form.get('pedidoRemessa').disable();
            }
            
          } else if(res['body']['responseCode'] === 404) {
            this.loadingDetalhesModal = false;
            this.noResultModal = true;
            this.pnotifyService.notice('Não há dados');
          }
        }
      },
      error => {
        this.pnotifyService.error('Erro ao detalhes de Carteira');
      }
    );
  }

  getCarteiraDetalhesExcel(params: any): void{
    this.dadosExcel = [];

    this.service.getCarteiraDetalhes(params)
    .subscribe(
      (res: any) => {
        if (Object.keys(res).length > 0) {
          if (res['body']['responseCode'] === 200){
            this.dadosExcel = res['body']['result'];
            this.pnotifyService.success(this.dadosExcel);
          } else if(res['body']['responseCode'] === 404) {
            this.pnotifyService.notice('Não há dados');
          }
        }
      },
      error => {
        this.pnotifyService.error('Erro ao detalhes de Carteira');
      }
    );
  }

  onFilter(): void {
    let dataPedido = this.setDateValid(this.form.value['dataPedido']);
    let previsaoEntrega = this.setDateValid(this.form.value['previsaoEntrega']);

    let params = {
      ID_EMPR:  this.idEmpresa ? this.idEmpresa : "",
      ID_DEPO:  this.idDeposito ? this.idDeposito : "",
      NM_MES_ANO: this.idMesAno ? this.idMesAno : "",
      ID_MATE: this.item["ID_MATE"] ? this.item["ID_MATE"] : "",    
      NM_EMPR: this.form.value['empresas'] ? this.form.value['empresas'] : "",
      NM_DEPO: this.form.value['depositos'] ? this.form.value['depositos'] : "",
      NR_PEDI_ORIG: this.form.value['pedidoPai'] ? this.form.value['pedidoPai'] : "",
      DT_PEDI_ORIG: dataPedido ? dataPedido : "",
      NR_PEDI_REME: this.form.value['pedidoRemessa'] ? this.form.value['pedidoRemessa'] : "",
      DT_PREV_ENTR: previsaoEntrega ? previsaoEntrega : "",
      NM_FORN: this.form.value['fornecedor'] ? this.form.value['fornecedor'] : "",
      IN_GERA_RELA_EXCE: "",
      ID_USUA: ""
    };

    this.getCarteiraDetalhes(params);                          
  }

  excelExport(): void {
    let dataPedido = this.setDateValid(this.form.value['dataPedido']);
    let previsaoEntrega = this.setDateValid(this.form.value['previsaoEntrega']);

    let params = {
      ID_EMPR:  this.idEmpresa ? this.idEmpresa : "",
      ID_DEPO:  this.idDeposito ? this.idDeposito : "",
      NM_MES_ANO: this.idMesAno ? this.idMesAno : "",
      ID_MATE: this.item["ID_MATE"] ? this.item["ID_MATE"] : "",    
      NM_EMPR: this.form.value['empresas'] ? this.form.value['empresas'] : "",
      NM_DEPO: this.form.value['depositos'] ? this.form.value['depositos'] : "",
      NR_PEDI_ORIG: this.form.value['pedidoPai'] ? this.form.value['pedidoPai'] : "",
      DT_PEDI_ORIG: dataPedido ? dataPedido : "",
      NR_PEDI_REME: this.form.value['pedidoRemessa'] ? this.form.value['pedidoRemessa'] : "",
      DT_PREV_ENTR: previsaoEntrega ? previsaoEntrega : "",
      NM_FORN: this.form.value['fornecedor'] ? this.form.value['fornecedor'] : "",
      IN_GERA_RELA_EXCE: 1,
      ID_USUA: this.idUsuario
    };

    this.getCarteiraDetalhesExcel(params);  
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
