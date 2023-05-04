import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { BsDatepickerConfig, BsLocaleService, PageChangedEvent } from 'ngx-bootstrap';

import { Subscription } from 'rxjs';

import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { DateService } from 'src/app/shared/services/core/date.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

@Component({
  selector: 'visao-material',
  templateUrl: './visao-material.component.html',
  styleUrls: ['./visao-material.component.scss']
})
export class AbastecimentoMonitoresAnaliseComprasMultiVisoesVisaoMaterialComponent implements OnInit {
  @Output() newItemEvent = new EventEmitter<any>();

  noResult: boolean = false;
  ableInformationEstoque: boolean = false;
  compareEndDate: boolean = false;
  compareStartDate: boolean = false;
  compareEndDateCurrent: boolean = false;
  toggle: boolean = false;

  formCheck: FormGroup;
  formModal: FormGroup;

  modal: any = [];

  $activatedRouteSubscription: Subscription;

  bsConfig: Partial<BsDatepickerConfig>;

  colsEst: number;

  arrayTemp: Array<any> = [];

  data: Array<any> = [
    {ID: 1, IN_STAT: 1, ON_SELE: 0, NM_MATE: 'CA-50 - barra 8mm Arcelor Mittal', NM_DEPO: 'Tiete', TT_ESTO_DISP: '550,00', TT_ESTO_ATUAL: '550,00', TT_ESTO_COMP: '550,00', TT_ESTO_SUSP: '550,00', TT_SAID: '1500,00'},
    {ID: 2, IN_STAT: 1, ON_SELE: 0, NM_MATE: 'CA-50 - barra 8mm Arcelor Mittal', NM_DEPO: 'Cajamar', TT_ESTO_DISP: '550,00', TT_ESTO_ATUAL: '550,00', TT_ESTO_COMP: '550,00', TT_ESTO_SUSP: '550,00', TT_SAID: '1500,00'},
    {ID: 3, IN_STAT: 1, ON_SELE: 0, NM_MATE: 'CA-25 - barra 6mm Arcelor Mittal', NM_DEPO: 'Tiete', TT_ESTO_DISP: '550,00', TT_ESTO_ATUAL: '550,00', TT_ESTO_COMP: '550,00',TT_ESTO_SUSP: '550,00', TT_SAID: '1500,00'},
  ];

  tipoMovimentos: Array<any> = [
    {ID: 1, NAME:'Entrada'},
    {ID: 2, NAME:'Saida'}
  ];
  
  /* Ordenação */
  reverse: boolean = false;
  key: string = 'NM_MATE';
  /* Ordenação */

  /* Paginação */
  itemsPerPage: number = 15;
  totalItems: number = 15;
  currentPage: number = 1;
  begin: number = 0;
  end: number = 15;
  /* Paginação */

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true
  };

  subtitles: Array<Subtitles> = [
    {
      text: 'Ativo',
      color: 'green'
    },
    {
      text: 'Inativo',
      color: 'red'
    }
  ];
  
  constructor(
    private activatedRoute: ActivatedRoute,
    private routerService: RouterService,
    private localeService: BsLocaleService,
    private pnotifyService: PNotifyService,
    private dateService: DateService,
    private formBuilder: FormBuilder,
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );
    this.formModal = this.formBuilder.group({
      DT_PEDI_INIC: [null],
      DT_PEDI_FINA: [null],
      TP_MOVI: [null],
      N_DOCU: [null]
    });
   }

  ngOnInit(): void {

  }

  abledInfomationEstoque(): void {
    this.colsEst = 4;
    this.ableInformationEstoque = !this.ableInformationEstoque;
  }

  onCheck(item): void {
    item.ON_SELE = !item.ON_SELE;
    this.toggle = false;
    
    this.arrayTemp = this.data.filter(e => {
      return e.ON_SELE === true;
    });

    this.addNewItem(this.arrayTemp);
  }

  onToggleAll(): void{
    this.toggle = !this.toggle;

    this.data.map(item => item.ON_SELE = this.toggle);

    if(this.toggle) {
      this.arrayTemp = this.data;
    } else {
      this.arrayTemp  = [];
    }

    this.addNewItem(this.arrayTemp);
  }

  addNewItem(value: any): void {
    this.newItemEvent.emit(value);
  }

  excelExport(): void {
    this.pnotifyService.success("Exportado com sucesso");
  }

  setValueRazaoEstoque(item: any): void {
    this.modal.material = item.NM_MATE;
    this.modal.deposito = item.NM_DEPO;
  }

  compareEndDateFunc(): boolean {
    let now = new Date();
    if (!this.formModal.get('DT_PEDI_INIC').value) {
      this.compareEndDateCurrent = false;
      return false;
    } else if (this.formModal.get('DT_PEDI_FINA').value > now) {
      this.compareEndDateCurrent = true;
      return this.compareEndDateCurrent;
    }
  }

  compareStartDateFunc(): any {
    let now = new Date();
    if (!this.formModal.get('DT_PEDI_INIC').value) {
      this.compareStartDate = false;
      return false;
    } else if (this.formModal.get('DT_PEDI_FINA').value > now) {
      this.compareStartDate = true;
      return this.compareStartDate;
    }
  }

  compareDate(): boolean {
    let stra = this.formModal.get('DT_PEDI_INIC').value;
    let strb = this.formModal.get('DT_PEDI_FINA').value;
    let dataInicial = {};
    let dataFinal = {};

    if (stra instanceof Date) {
      dataInicial = stra;
    } else if (stra !== null) {
      dataInicial = new Date(stra.split('-').reverse().join('-'));
    }

    if (strb instanceof Date) {
      dataFinal = strb;
    } else if (strb !== null) {
      dataFinal = new Date(strb.split('-').reverse().join('-'));;
    }

    if (!dataInicial) {
      this.compareEndDate = false;
      return false;
    } else if (dataInicial > dataFinal) {
      this.compareEndDate = true;
      return this.compareEndDate;
    }
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
}
