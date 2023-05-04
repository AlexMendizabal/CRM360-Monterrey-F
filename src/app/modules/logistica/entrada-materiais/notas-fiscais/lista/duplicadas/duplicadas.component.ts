import { DateService } from 'src/app/shared/services/core/date.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { DetailPanelService } from './../../../../../../shared/templates/detail-panel/detal-panel.service';
import { PNotifyService } from './../../../../../../shared/services/core/pnotify.service';
import { LogisticaEntradaMateriaisNotasFiscaisService } from './../../services/notas-fiscais.service';
import { take, switchMap, finalize } from 'rxjs/operators';
import { ILogisticaEntradaMateriaisNotasFiscais } from './../../models/notasFiscais';
import { ConfirmModalService } from './../../../../../../shared/modules/confirm-modal/confirm-modal.service';
import { CustomTableConfig } from './../../../../../../shared/templates/custom-table/models/config';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { EMPTY, Subscription } from 'rxjs';
@Component({
  selector: 'logistica-entrada-materiais-notas-fiscais-duplicadas',
  templateUrl: './duplicadas.component.html',
  styleUrls: ['./duplicadas.component.scss']
})
export class LogisticaEntradaMateriaisNotasFiscaisDuplicadasComponent implements OnInit {

  loadingDuplicadas:boolean = false;
  noDuplicadas= true;
  duplicadas=[];
  modalRef: BsModalRef;
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };
  formLotesDuplicados: FormGroup;
  showDetailPanelSubscription: Subscription;
  showDetailPanel = false;
  ORDE_BY = 'DS_LOTE';
  ORDE_TYPE = 'desc';
  duplicadaSelecionada: ILogisticaEntradaMateriaisNotasFiscais;

    // Subtitles (Ativo/Inativo)
    subtitles: Array<Subtitles> = [
      {
        id: 1,
        text: 'Não Justificados',
        color: 'blue',
      },
      {
        id: 2,
        text: 'Justificados',
        color: 'green',
      },
    ];
  
  /* Pagination */
  itemsPerPage = 100;
  totalItemsDuplicadas = 10;
  currentPage = 1;
  /* Pagination */

  constructor(
    private confirmModalService: ConfirmModalService,
    private detailPanelService: DetailPanelService,
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private routerService: RouterService,
    private activatedRoute: ActivatedRoute,
    private notasFiscaisService: LogisticaEntradaMateriaisNotasFiscaisService,
    private pnotify: PNotifyService,
    private dateService: DateService,
    private route: Router
  ){}

  ngOnInit(): void {
    this.buildForm();
    this.onDetailPanelEmitter();
    this.getLotesDuplicados();
  }

  buildForm() {
    this.formLotesDuplicados = this.formBuilder.group({
      buscarPor: ['DS_LOTE'],
      pesquisa: [null],
      ID_MATE:[null],
      NR_NOTA_FISC:[null],
      DS_LOTE:[null],
      NM_MATE:[null],
      NM_FORN:[null],
      NR_MATR:[null],
      NM_USUA:[null],
      IN_DS_OBSE:[''],
      DS_OBSE: [null, Validators.required],
      PAGI: [1],
      TT_REGI_PAGI: [this.itemsPerPage],
      TIME: [new Date().getTime()],
      ORDE_BY :[this.ORDE_BY],
      ORDE_TYPE:[this.ORDE_TYPE]
    });
    
  }

  onPageChangedDuplicadas(event) {
    this.formLotesDuplicados.get('PAGI').setValue(event.page);
    this.formLotesDuplicados.get('TIME').setValue(new Date().getTime());
    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
    });
  }

  
  onDetails(duplicada: ILogisticaEntradaMateriaisNotasFiscais): void {
    this.detailPanelService.show();
    this.duplicadaSelecionada = duplicada;
    this.detailPanelService.loadedFinished(false);

    setTimeout(() => {
      this.loadingDuplicadas = false;
    }, 500);
  }


  onDetailPanelEmitter(): void {
    this.showDetailPanelSubscription = this.detailPanelService.config.subscribe(
      (event: any) => {
        this.showDetailPanel = event.showing;
      }
    );
  }

  getLotesDuplicados(params?) {
    const _params = params ?? {};
    _params.IN_DS_OBSE =this.formLotesDuplicados.value['IN_DS_OBSE'];
    _params.PAGI =this.formLotesDuplicados.value['PAGI'];
    _params.ORDE_BY =this.formLotesDuplicados.value['ORDE_BY']
    _params.ORDE_TYPE =this.formLotesDuplicados.value['ORDE_TYPE']
    const _obj = this.formLotesDuplicados.value;
    this.loadingDuplicadas = true;
    this.noDuplicadas =this.duplicadas.length === 0 ? true : false;
    if (_obj['pesquisa']) _params[_obj['buscarPor']] = _obj['pesquisa'];
    this.notasFiscaisService
      .getLotesDuplicados(_params)
      .pipe(
        finalize(() => {
          this.loadingDuplicadas = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.duplicadas = response.body['data'];
          this.totalItemsDuplicadas = response.body['total'];
          this.noDuplicadas =false;
        }else {
          this.pnotify.notice('Não foi encontrado nenhum registro!')
          this.duplicadas = [];
          this.noDuplicadas =true;
        }
      },
      (error) => {
        this.noDuplicadas =true;
        this.pnotify.error('Não foi encontrado nenhum lote duplicado');
      }
    );
  }


  changeType() {
    const stat = 1;
    const descricao = this.formLotesDuplicados.get('DS_OBSE').value
    this.confirmChange(stat)
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) => {
          if (!result) return EMPTY;
          this.loadingDuplicadas = true;
          this.duplicadaSelecionada.IN_STAT = 1;
          this.duplicadaSelecionada.DS_OBSE = descricao;
          return this.notasFiscaisService.postNotasDuplicadas(this.duplicadaSelecionada);
        }),
        finalize(() => {
          this.loadingDuplicadas = false;
        })
      )
      .subscribe(
        (success: any) => {
          this.pnotify.success();
          this.hideModal()
          this.getLotesDuplicados()
        },
        (error: any) => {
          this.pnotify.error();
        }
      );
  }

  confirmChange(stat): any {
    if (stat == 1)
      return this.confirmModalService.showConfirm(
        null,
        null,
        'Deseja realmente marcar o registro como resolvido?',
        'Cancelar',
        'Confirmar'
      );
    return 
  }

  openModal(template: TemplateRef<any>, duplicada) {
    this.duplicadaSelecionada = duplicada;
    this.modalRef = this.modalService.show(template, {
      animated: false,
      class: 'modal-lg',
    });
  }

  hideModal() {
    this.modalRef.hide();
  }


   // Validação de formulário
   onFieldError(field: string) {
    if (this.onFieldInvalid(field)) {
      return 'is-invalid';
    }
    return '';
  }

  onFieldInvalid(field: any) {
    field = this.formLotesDuplicados.get(field);
    return field.status == 'INVALID' && field.touched;
  }

  onFieldRequired(field: string) {
    let required = false;
    let formControl = new FormControl();

    if (this.formLotesDuplicados.controls[field].validator) {
      let validationResult = this.formLotesDuplicados.controls[field].validator(formControl);
      required =
        validationResult !== null && validationResult.required === true;
    }

    if (required) {
      return 'is-required';
    }
  }

  getParams() {
    let _params = {};
    let _obj = this.formLotesDuplicados.value;

    for (let prop in _obj) {
      if (_obj[prop]) {
        if (_obj[prop] instanceof Date)
          _params[prop] = this.dateService.convertToUrlDate(_obj[prop]);
        else _params[prop] = _obj[prop];
      }
    }

    return _params;
  }

  setOrderBy(column: string): void {
    if (this.ORDE_BY === column) {
      if (this.ORDE_TYPE == 'desc') {
        this.ORDE_TYPE = 'asc';
      } else if (this.ORDE_TYPE == 'asc') {
        this.ORDE_TYPE = 'desc';
      }
    } else {
      this.ORDE_BY = column;
      this.ORDE_TYPE = 'asc';
    }
    this.formLotesDuplicados.get('ORDE_TYPE').setValue(this.ORDE_TYPE);
    this.formLotesDuplicados.get('ORDE_BY').setValue(this.ORDE_BY);
    this.getLotesDuplicados();
  }

}
