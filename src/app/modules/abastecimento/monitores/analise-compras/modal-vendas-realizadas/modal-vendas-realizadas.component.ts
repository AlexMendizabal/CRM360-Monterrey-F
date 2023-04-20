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

@Component({
  selector: 'abastecimento-monitores-analise-compras-modal-vendas-realizadas',
  templateUrl: './modal-vendas-realizadas.component.html',
  styleUrls: ['./modal-vendas-realizadas.component.scss']
})
export class AbastecimentoMonitoresAnaliseComprasModalVendasRealizadasComponent implements OnInit {

  @Input() item: any;
  @Input() idMesAno: any;

  loadingDetalhesModal:boolean = false;
  noResultModal:boolean = false;
  loaderBody = false;

  compararDataFinal: boolean = false;
  compararDataInicial: boolean = false;
  compararDataFinalAtual: boolean = false;

  form: FormGroup;

  bsConfig: Partial<BsDatepickerConfig>;

  empresas:any = [];
  depositos:any = [];
  proposta:any = [];
  dataEntrada:any = [];
  dataEncerramento:any = [];
  cliente:any = [];
  modal:any = [];
  dadosExcel:any = [];

  idEmpresa: string;
  idDeposito: string;

  dadosVendasRealDetalhesModalFull = [];
  dadosVendasRealDetalhesModal = [];
  dadosVendasRealDetalhesModalTotal = [];

  /* Ordenação modal */
  reverseA: boolean = false;
  keyA: string = 'NM_EMPR';

  /* PaginationModal*/
  itemsPerPage = 15;
  currentPageA: number = 1;
  beginA: number = 0;
  endA: number = 15;

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
      dataInicial: [null],
      dataFinal: [null],
      empresas: [null],
      depositos: [null],
      numeroNF: [null],
      dataNF: [null],
      cliente: [null],
      vendedor: [null]
    });
  }

  ngOnInit(): void {
    this.modal.codMaterial = this.item.ID_REFE_ERP;
    this.modal.descMaterial = this.item.NM_MATE;
    this.modal.unidadeMedida = this.item.NM_UNID_MEDI;
    this.resetValuesForm();
    this.setParamsVendasRealizadas();
  }

  resetValuesForm(): void {
    this.form.get('dataInicial').reset();
    this.form.get('dataFinal').reset();
    this.form.get('empresas').reset();
    this.form.get('depositos').reset();
    this.form.get('numeroNF').reset();
    this.form.get('dataNF').reset();
    this.form.get('cliente').reset();
    this.form.get('vendedor').reset();
  }

  setParamsVendasRealizadas(): void {
    let queryParams = this.routerService.getBase64UrlParams(this.activatedRoute.snapshot.queryParams);
    let dataInicial = queryParams["dataInicial"];
    let dataFinal = queryParams["dataFinal"];
    let dataInicialParam = dataInicial;
    let dataFinalParam = dataFinal;
    let params: any = [];
    let tipoVisualizacao = queryParams["tipoVisualizacao"];
    let idMaterial = this.item["ID_MATE"];
    let idMesAno = this.idMesAno

    if(this.idMesAno) {
      dataInicialParam = "";
      dataFinalParam = "";

      let mesAno = this.idMesAno.replace('_', '/01/');
      let date = new Date(mesAno);
      let primeiroDia = new Date(date.getFullYear(), date.getMonth(), 1);
      let ultimoDia = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      let primeiroDiaC = this.setDateValid(primeiroDia);
      let ultimoDiaC = this.setDateValid(ultimoDia);

      primeiroDiaC = new Date(primeiroDiaC.split('-').reverse().join('-'));
      ultimoDiaC = new Date(ultimoDiaC.split('-').reverse().join('-'));

      let dataInicialC = new Date(dataInicial.split('-').reverse().join('-'));
      let dataFinalC = new Date(dataFinal.split('-').reverse().join('-'));

      if(primeiroDiaC > dataInicialC) {
        dataInicial = this.setDateValid(primeiroDia);
      }

      if(ultimoDiaC < dataFinalC) {
        dataFinal = this.setDateValid(ultimoDia);
      }

    }

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
      DT_INIC: dataInicial ? dataInicial : "",
      DT_FINA: dataFinal ? dataFinal : "",
      NM_MES_ANO: "",
      ID_MATE: idMaterial ? idMaterial : "",
      NM_EMPR: "",
      NM_DEPO: "",
      NR_NOTA_FISC: "",
      DT_NOTA_FISC: "", 
      NM_CLIE: "",
      NM_VEND: ""
    };

    this.getVendasRealizadasDetalhes(params);

    this.form.get("dataInicial").setValue(dataInicial);
    this.form.get("dataFinal").setValue(dataFinal);
    
  }

  getVendasRealizadasDetalhes(params: any): void {
    this.dadosVendasRealDetalhesModalFull = [];
    this.dadosVendasRealDetalhesModal = [];
    this.dadosVendasRealDetalhesModalTotal = [];
    this.loaderBody = true;
    this.noResultModal = false;
    this.loadingDetalhesModal = false;

    this.service.getVendasRealizadasDetalhes(params)
    .pipe(finalize(() => (this.loaderBody = false)))
    .subscribe(
      (res: any) => {
        if (Object.keys(res).length > 0) {
          if (res['body']['responseCode'] === 200) {
            this.dadosVendasRealDetalhesModalFull = res['body']['result'];
            this.dadosVendasRealDetalhesModalTotal = this.dadosVendasRealDetalhesModalFull.shift();
            this.dadosVendasRealDetalhesModal = this.dadosVendasRealDetalhesModalFull;
            this.loadingDetalhesModal = true;
            this.noResultModal = false;
          } else if(res['body']['responseCode'] === 404) {
            this.loadingDetalhesModal = false;
            this.noResultModal = true;
            this.pnotifyService.notice('Não há dados');
          }
        }
      },
      error => {
        this.pnotifyService.error('Erro ao Vendas Realizadas Detalhes');
      }
    );
  }

  getVendasRealizadasDetalhesExcel(params: any): void{
    this.dadosExcel = [];

    this.service.getVendasRealizadasDetalhes(params)
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
    let dataInicial = this.setDateValid(this.form.value['dataInicial']);
    let dataFinal = this.setDateValid(this.form.value['dataFinal']);
    let dataNF = this.setDateValid(this.form.value['dataNF']);

    let params = {
      DT_INIC: dataInicial ? dataInicial: "",
      DT_FINA: dataFinal ? dataFinal : "",
      ID_EMPR:  this.idEmpresa ? this.idEmpresa : "",
      ID_DEPO:  this.idDeposito ? this.idDeposito : "",
      NM_MES_ANO: "",
      ID_MATE: this.item["ID_MATE"] ? this.item["ID_MATE"] : "",
      NM_EMPR: this.form.value['empresas'] ? this.form.value['empresas'] : "",
      NM_DEPO: this.form.value['depositos'] ? this.form.value['depositos'] : "",
      NR_NOTA_FISC: this.form.value['numeroNF'] ? this.form.value['numeroNF'] : "",
      DT_NOTA_FISC: dataNF ? dataNF : "", 
      NM_CLIE: this.form.value['cliente'] ? this.form.value['cliente'] : "",
      NM_VEND: this.form.value['vendedor'] ? this.form.value['vendedor'] : "",
      IN_GERA_RELA_EXCE: "",
      ID_USUA: ""
    };

    this.getVendasRealizadasDetalhes(params);
  }

  excelExport(): void { 
    let dataInicial = this.setDateValid(this.form.value['dataInicial']);
    let dataFinal = this.setDateValid(this.form.value['dataFinal']);
    let dataNF = this.setDateValid(this.form.value['dataNF']);

    let params = {
      DT_INIC: dataInicial ? dataInicial: "",
      DT_FINA: dataFinal ? dataFinal : "",
      ID_EMPR:  this.idEmpresa ? this.idEmpresa : "",
      ID_DEPO:  this.idDeposito ? this.idDeposito : "",
      NM_MES_ANO: "",
      ID_MATE: this.item["ID_MATE"] ? this.item["ID_MATE"] : "",
      NM_EMPR: this.form.value['empresas'] ? this.form.value['empresas'] : "",
      NM_DEPO: this.form.value['depositos'] ? this.form.value['depositos'] : "",
      NR_NOTA_FISC: this.form.value['numeroNF'] ? this.form.value['numeroNF'] : "",
      DT_NOTA_FISC: dataNF ? dataNF : "", 
      NM_CLIE: this.form.value['cliente'] ? this.form.value['cliente'] : "",
      NM_VEND: this.form.value['vendedor'] ? this.form.value['vendedor'] : "",
      IN_GERA_RELA_EXCE: 1,
      ID_USUA: this.idUsuario
    };

    this.getVendasRealizadasDetalhesExcel(params);
  }

  setDateValid(date: any): any {
    if (date instanceof Date) {
      date = this.dateService.convertToUrlDate(date);
    }
    return date;
  }

  comparaData(): boolean  {
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

    if (!dataInicial) {
      this.compararDataFinal = false;
      return false;
    } else if (dataInicial > dataFinal) {
      this.compararDataFinal = true;
      return this.compararDataFinal;
    }
  }

  comparaDataFinal(): boolean {
    let now = new Date();
    if (!this.form.get('dataFinal').value) {
      this.compararDataFinalAtual = false;
      return false;
    } else if (this.form.get('dataFinal').value > now) {
      this.compararDataFinalAtual = true;
      return this.compararDataFinalAtual;
    }
  }

  comparaDataInicial(): boolean {
    let now = new Date();
    if (!this.form.get('dataInicial').value) {
      this.compararDataInicial = false;
      return false;
    } else if (this.form.get('dataInicial').value > now) {
      this.compararDataInicial = true;
      return this.compararDataInicial;
    }
  }

  sortA(keyA: any): void {
    this.keyA = keyA;
    this.reverseA = !this.reverseA;
  }

  /* Paginação Modal*/
  onPageChangedA(event: PageChangedEvent): void {
    this.beginA = (event.page - 1) * event.itemsPerPage;
    this.endA = event.page * event.itemsPerPage;
  }

}
