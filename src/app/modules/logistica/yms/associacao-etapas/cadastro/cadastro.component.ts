//Services
import { TitleService } from 'src/app/shared/services/core/title.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { ConfirmModalService } from './../../../../../shared/modules/confirm-modal/confirm-modal.service';
import { LogisticaYmsChecklistService } from './../../checklist/services/checklist.service';
import { LogisticaYmsAssociacaoEtapasService } from '../services/associacao-etapas.service';
//Bootstrap
import { utilsBr } from 'js-brasil';
import { BsDatepickerConfig, BsModalRef, BsLocaleService } from 'ngx-bootstrap';
//Angular
import { Component, OnInit} from '@angular/core';
import { CustomTableConfig } from './../../../../../shared/templates/custom-table/models/config';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
//rxjs
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
//interfaces
import { isNull } from 'util';
import { ILogisticaYmsChecklist } from './../../checklist/models/checklist';
import { ILogisticaYmsAssociacaoEtapas } from '../models/associacao-etapas';

@Component({
  selector: 'logistica-associacao-etapas-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss'],
})
export class LogisticaYmsAssociacaoEtapasCadastroComponent
  implements OnInit {
    $activatedRouteSubscription: Subscription;

    form: FormGroup;
    formEtapas: FormGroup;
    
    checklist: Array<ILogisticaYmsChecklist>;
    etapas: Array<any> = [];
    etapasLista: Array<any> = [];
    breadCrumbTree: Array<any> = [];
    etapasAssociadas: Array<any> = [];
    
    noResult: boolean;
    toggleAll = false;
    searching = false;
    noEtapas = true;
    firstSearch = false;
    showEtapas = true;
    disabledForm = false;
    etapasListaEmpty = false;
    
    appTitle: string;
    modalRef: BsModalRef;
    bsConfig: Partial<BsDatepickerConfig>;

    //loading
    loading = false;
    loadingNavBar = false;
    loadingChecklist: boolean;
    loadingTiposChecklist: boolean;
    loadingConsulta = false;
    loadingEtapasLista = false;
    
    tableConfigAssocEtapas: Partial<CustomTableConfig> = {
      fixedHeader: false,
      bodyHeight: 243,
      hover: false,
    };
    
    tableConfigEtapas: Partial<CustomTableConfig> = {
      fixedHeader: false,
      bodyHeight: 243,
    };
    
    /* Pagination */
    itemsPerPage = 10;
    totalItems = 10;
    currentPage = 1;
    begin = 0;
    end = 10;
    /* Pagination */
    
  constructor(
    private pnotify: PNotifyService,
    private formBuilder: FormBuilder,
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
    private localeService: BsLocaleService,
    private atividadesService: AtividadesService,
    private checklistService: LogisticaYmsChecklistService,
    private confirmModalService: ConfirmModalService,
    private associacaoEtapasService: LogisticaYmsAssociacaoEtapasService,
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );
  }
  public MASKS = utilsBr.MASKS;

  ngOnInit(): void {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.setFormBuilder();
    this.onActivatedRoute();
    this.getChecklist();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  onActivatedRoute() {
    const _params = this.activatedRoute.snapshot.params;
    if (_params?.id){
      this.getAssociacao(_params['id']);
      this.form.get('ID_LOGI_YMS_CHEC').setValue(parseInt(_params['id']))
    }
  }

  consultaFilial(event){
    this.getAssociacao(event.ID_LOGI_YMS_CHEC)
    this.loadingConsulta = true;
  }

  getAssociacao(id :number) {
    this.associacaoEtapasService
      .getAssociacaoEtapas({ID_LOGI_YMS_CHEC:id, IN_STAT: 1 })
      .pipe(
        finalize(() => {
          this.loadingNavBar = false;
          this.loadingConsulta = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.etapasAssociadas = response.body['data']
          } else {
            this.etapasAssociadas = [];
            this.noResult = true;
          }

          if (this.etapasAssociadas.length > 9) {
            this.tableConfigAssocEtapas.fixedHeader = true;
          }
        },
        (error) => {
          const message = error.error.message
          message ? this.pnotify.error(message): this.pnotify.error();
          this.noResult = true;
        }
      );
  }

  getChecklist(params?: Partial<ILogisticaYmsChecklist>) {
    const _params = params ?? {}
    _params.IN_STAT = 1;
    _params.IN_PAGI = 0;
    this.loading = true;
    this.checklistService
      .getChecklist(_params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.checklist = response.body['data']
            this.noResult = false;
          } else {
            this.pnotify.error();
            this.noResult = true;
          }
        },
        (error: any) => {
          try {
            this.pnotify.error(error.error.message);
            this.noResult = true;
          } catch (error) {
            this.pnotify.error();
          }
        }
      );
  }s


  setBreadCrumb(): void {
    const id = this.activatedRoute.snapshot.params.idSubModulo;
    this.appTitle = 'Cadastro';
    this.titleService.setTitle(this.appTitle);
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: '/logistica/home',
      },
      {
        descricao: 'Cadastro',
        routerLink: `/logistica/yms/${id}`,
      },
      {
        descricao: 'Etapas por Checklist',
        routerLink: `../`,
      },
      {
        descricao: this.appTitle,
      },
    ];
  }

  //formulario
  setFormBuilder(): void {
    this.form = this.formBuilder.group({
      ID_LOGI_YMS_ETAP: [null],
      ID_LOGI_YMS_CHEC: [null, [Validators.required]],
      NM_AREA: [null],
      IN_STAT: [isNull],
      DS_OBSE: [null],
      assocEtapas: this.formBuilder.array([]),
    });

    this.formEtapas = this.formBuilder.group({
      buscarPor: ['NM_ETAP'],
      pesquisa: [null, Validators.required],
      ID_LOGI_YMS_ETAP:[null],
      NM_ETAP:[null],
    });
  }

  onLimparAssociacoes(): void {
    this.confirmDelete().subscribe((response: boolean) =>
      response ? this.deleteAssociacoes(this.form.get('ID_LOGI_YMS_CHEC').value) : null
    );
  }


  deleteAssociacoes(params): void {
    this.associacaoEtapasService.deleteAssociacoes({ID_LOGI_YMS_CHEC:params})
    .subscribe(
      (response) => {
        if (response.status === 200) {
          this.etapasAssociadas = [];
         this.pnotify.success(response.body['message'])
        } else {
          this.pnotify.error()
        }
      },
      (error) => {
        const message = error.error.message
        message ? this.pnotify.error(message): this.pnotify.error();
        this.noResult = true;
      }
    );
  }

  onDeleteEtapa(etapa): void {
    this.confirmDelete().subscribe((response: boolean) =>
      response ? this.deleteEtapa(etapa) : null
    );
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

  deleteEtapa(etapa) {
    if(!etapa){
      this.pnotify.notice('Nenhum usuário associado!')
      return;
    }
    etapa['IN_STAT'] = 0
    this.loadingNavBar= true;
    this.associacaoEtapasService
      .postAssociacaoEtapas(etapa)
        .pipe(
          finalize(() => {
            this.loadingNavBar= false;
          })
        )
        .subscribe(
          (response) => {
            if (response.status === 200) {
              const etapaId = etapa.ID_ETAP + '@' + etapa.ID_LOGI_YMS_CHEC
              this.etapasAssociadas = this.etapasAssociadas.filter(etapaAssociado =>{
                const etapaCorrenteId = etapaAssociado.ID_ETAP + '@' + etapaAssociado.ID_LOGI_YMS_CHEC
                return etapaId != etapaCorrenteId
              })
              this.pnotify.success();
            } else {
              this.pnotify.error();
            }
          },
          (error: any) => {
            const message = error.error.message
            message ? this.pnotify.error(message): this.pnotify.error();
          }
        );
  }

  getEtapas(params?) {
     if (this.formEtapas.valid) {
      this.loadingNavBar = true;
      this.searching = true;
      this.etapasLista = [];
      this.loadingEtapasLista = false;
      this.etapasListaEmpty = false;

      const _params = params ?? {};
      _params.IN_STAT = '1';
      _params.IN_PAGI = 0;
      const _obj = this.formEtapas.value;
      if (_obj['pesquisa']) _params[_obj['buscarPor']] = _obj['pesquisa'];
      this.associacaoEtapasService
        .getEtapas(_params)
        .pipe(
          finalize(() => {
            this.firstSearch = true;
            this.searching = false;
            this.loadingNavBar = false;
            this.loadingEtapasLista = true;
          })
        )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            console.log(response.body['result'])
            this.etapasLista = response.body['result'].map(function (el: any) {
              let o = Object.assign({}, el)
              o.checked = 0;
              return o;
            });
            if (this.etapasLista.length > 9) {
              this.tableConfigEtapas.fixedHeader = true;
            } else {
              this.tableConfigEtapas.fixedHeader = false;
            }
          } else if (
            response.hasOwnProperty('success') &&
            response.hasOwnProperty('mensagem')
          ) {
            this.pnotify.error();
            this.etapasListaEmpty = true;
          } else {
            this.pnotify.error();
            this.etapasListaEmpty = true;
          }
        },
        (error: any) => {
          const message = error.error.message
          message ? this.pnotify.error(message): this.pnotify.error();
        }
      );
    }
  }
 

  onAssociarEtapas(): void {

    this.toggleAll = false;

    this.etapasLista.forEach(el => {
      if (el.checked === 1) {
        const etapa = {
          ID_ETAP: el.ID_LOGI_YMS_ETAP,
          NM_ETAP_ASSO: el.NM_ETAP,
          ID_LOGI_YMS_CHEC: this.form.get('ID_LOGI_YMS_CHEC').value
        };
        this.onAddEtapa(etapa);
        el.checked = 0
      }
    })
  }

  onAddEtapa(etapa: any) {
    if (this.checkEtapaExists(this.etapasAssociadas, etapa) === true) {
      this.pnotify.notice('Etapa já está associado!');
      return;
    }
    
    if (this.etapasAssociadas.length > 9) {
      this.tableConfigAssocEtapas.fixedHeader = true;
    }

    this.postAssociacaoEtapas({...etapa,IN_STAT: 1})
  }

  checkEtapaExists(lista: Array<any>, etapa: any): boolean {
    return lista.some((etapaAssociado: any) => {
      return ((etapaAssociado.ID_LOGI_YMS_CHEC == etapa.ID_LOGI_YMS_CHEC) &&
      (etapaAssociado.ID_ETAP == etapa.ID_ETAP))
    });
  }

  onToggleAll() {
    this.toggleAll = !this.toggleAll;
    this.etapasLista.forEach(el => {
      el.checked = this.toggleAll === true ? 1 : 0;
    })
  }

  onCheckEtapa(index: number, etapa: any): void {
    this.etapasLista[index].checked = etapa.checked == 0 ? 1 : 0;
  }

  // Validação de formulário
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

  postAssociacaoEtapas(etapa){
    this.associacaoEtapasService.postAssociacaoEtapas(etapa)
    .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if(response.status === 200 ){
            this.etapasAssociadas = [...this.etapasAssociadas,etapa]
          } else{
            this.pnotify.error();
          }
        });
        (error: any) => {
          const message = error.error.message
          message ? this.pnotify.error(message): this.pnotify.error();
        }
  }
}
