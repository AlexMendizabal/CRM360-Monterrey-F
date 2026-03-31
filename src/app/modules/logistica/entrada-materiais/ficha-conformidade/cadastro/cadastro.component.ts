import { RouterService } from './../../../../../shared/services/core/router.service';
import { ILogisticaEntradaMateriaisNotasFiscais } from './../../notas-fiscais/models/notasFiscais';
import { LogisticaEntradaMateriaisNotasFiscaisService } from './../../notas-fiscais/services/notas-fiscais.service';
import { LogisticaEntradaMateriaisService } from './../../services/entrada-materiais.service';
import { LogisticaEntradaMateriaisTiposConformidadeService } from './../../tipos-conformidade/services/tipos-conformidade.service';
import { ILogisticaEntradaMateriaisTiposConformidade } from './../../tipos-conformidade/models/tiposConformidade';
import { BsModalService } from 'ngx-bootstrap/modal';
import { FormArray, MinLengthValidator } from '@angular/forms';
//Services
import { TitleService } from 'src/app/shared/services/core/title.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
//Bootstrap
import { utilsBr } from 'js-brasil';
import { BsDatepickerConfig, BsModalRef, BsLocaleService, PageChangedEvent } from 'ngx-bootstrap';
//Angular
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from '@angular/forms';
//rxjs
import { Subscription, forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LogisticaEntradaMateriaisFichaConformidadeService } from '../services/ficha-conformidade.service';
//interfaces
import { ILogisticaEntradaMateriaisFichaConformidade } from '../models/fichaConformidade';

@Component({
  selector: 'logistica-entrada-materiais-notas-fiscais-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss'],
})
export class LogisticaEntradaMateriaisFichasConformidadeCadastroComponent
  implements OnInit, OnDestroy {
  noResult: boolean;
  $activatedRouteSubscription: Subscription;
  breadCrumbTree: Array<any> = [];
  form: FormGroup;
  appTitle: string;
  modalRef: BsModalRef;
  formData: Array<FormData> = [];
  bsConfig: Partial<BsDatepickerConfig>;
  noMateriais: boolean;
  allMateriais: Array<FormData> = [];
  noNotasFiscais = true;
  noAllMateriais = true;
  validateNF = '';
  index: number;
  numberDescricao= 10;
  //loading
  disabledForm = false;
  loading = false;
  loadingNavBar = false;
  loadingNotasFiscais: boolean;
  loadingAllMateriais: boolean;
  loadingTiposConformidade: boolean;
  formNotasFiscais: FormGroup;
  formAllMateriais: FormGroup;
  fichaId: number =1;
  //Interfaces
  fichasConformidade: Array<ILogisticaEntradaMateriaisFichaConformidade> = [];
  tiposConformidade: Array<ILogisticaEntradaMateriaisTiposConformidade> = [];
  notasFiscais: Array<ILogisticaEntradaMateriaisNotasFiscais> = [];
  totalItens: any = [];
   /* Pagination */
   itemsPerPage = 10;
   totalItems = 10;
   totalItemsMaterial = 10;
   currentPage = 1;
   begin = 0;
   end = 10;
   /* Pagination */

  constructor(
    private formBuilder: FormBuilder,
    private pnotify: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private routerService: RouterService,
    private router: Router,
    private localeService: BsLocaleService,
    private entradaMateriaisService :LogisticaEntradaMateriaisService,
    private fichasConformidadeService: LogisticaEntradaMateriaisFichaConformidadeService,
    private notasFiscaisService: LogisticaEntradaMateriaisNotasFiscaisService,
    private tiposConformidadeService:LogisticaEntradaMateriaisTiposConformidadeService,
    private titleService: TitleService,
    private modalService: BsModalService,
    private atividadesService: AtividadesService,
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
    this.setFormBuilder();
    this.registrarAcesso();
    this.setBreadCrumb();
    this.onActivatedRoute();
    this.getTiposConformidade();
  }

  ngOnDestroy(){
    if(this.modalRef != undefined){
      this.modalRef.hide();
    }
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }
  

  onActivatedRoute() {
    const _params = this.activatedRoute.snapshot.params;
    if (_params.hasOwnProperty('id')){
      this.getFichasConformidade({ ID_LOGI_ENMA_FHNC: _params['id'] });
      this.getFormMaterial({ ID_LOGI_ENMA_FHNC: _params['id'] , IN_STAT:'1' })
      this.form.get('ID_LOGI_ENMA_FHNC').setValue(_params['id'])
      return;
    } 
    
    const queryParams = this.activatedRoute.snapshot.queryParams;
    const _response = queryParams ? this.routerService.getBase64UrlParams(queryParams) : {};
    if(!_response.hasOwnProperty('ID_LOGI_ENMA_NOFI')){
      this.onAddMaterial();
      return;
    }
    this.getNotasFiscaisMateriais(_response)
  }


  getFichasConformidade(params?: Partial<ILogisticaEntradaMateriaisFichaConformidade>) {
    this.loading = true;
    const _params = params ?? {};
    this.fichasConformidadeService
      .getFichasConformidade(_params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            const ficha_ = response.body['data'][0];
            this.fichasConformidade = response.body['data'];
            this.noResult = false;
            this.form.patchValue(ficha_) 
          } else {
            this.noResult = true;
            this.fichasConformidade = [];
          }
        },
        (error: any) => {
          try {
            this.pnotify.error(error.error.message);
          } catch (error) {
            this.pnotify.error();
          }
        });
  }

  getTiposConformidade(params?) {
    const _params = params ?? {};
    _params.IN_STAT = '1';

  this.loadingTiposConformidade = true;
  this.tiposConformidadeService
    .getTiposConformidade(_params)
    .pipe(
      finalize(() => {
        this.loadingTiposConformidade = false;
      })
    )
    .subscribe((response) => {
      if (response.status === 200) {
        this.tiposConformidade = response.body['data'];
      }else {
        this.tiposConformidade = [];
      }
    },
    (error) => {
      this.pnotify.error('Não foi encontrado nenhum status de recebimento');
    }
  );
  }

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
        descricao: 'Entrada de Materiais',
        routerLink: `/logistica/entrada-materiais/${id}`,
      },
      {
        descricao: 'Fichas de Não Conformidade',
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
      ID_LOGI_ENMA_FHNC: [null],
      MATR_USUA_CADA: [null],
      DS_USUA_CADA: [null],
      DT_INCL: [null],
      DS_OBSE: [null, [Validators.required,Validators.minLength(this.numberDescricao),]],
      ID_LOGI_ENMA_FHNC_TIPO: [null, [Validators.required]],
      materiais: this.formBuilder.array([]),
    });
    this.formNotasFiscais = this.formBuilder.group({
      buscarPor: ['NR_NOTA_FISC'],
      pesquisa: [null, Validators.required],
      ID_MATE: [null],
      NR_NOTA_FISC: [null],
      NM_MATE: [null],
      DS_LOTE: [null],
      PAGI: [1],
      TT_MATE_ORIG: [null],
      NM_FORN: [null],
      NM_EMPR: [null],
      DS_UNID_MEDI: [null],
      IN_STAT: ['1'],
      TT_REGI_PAGI: [this.itemsPerPage],
    });
    this.formAllMateriais = this.formBuilder.group({
      buscarPor: ['NM_MATE'],
      pesquisa: [null, Validators.required],
      ID_REFE_ERP:[null],
      NM_MATE:[null],
      NM_CLAS:[null],
      NM_LINH:[null],
      IN_STAT: ['1'],
    });
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

  postFichasConformidade() {
    this.loadingNavBar = true;
    let params = JSON.parse(JSON.stringify(this.form.value)) ;
    delete params['materiais'];
    this.fichasConformidadeService
      .postFichasConformidade(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response: any) => {
          if (response.status === 200) {
            this.pnotify.success('Ficha de não conformidade cadastrada com sucesso!');
            const id = response.body['data'];
            this.form.get('ID_LOGI_ENMA_FHNC').setValue(id);
            this.postMateriais(id);
            this.fichaId = id;
          } else {
            this.pnotify.error();
          }
        },
        (error: any) => {
          try {
            this.pnotify.error(error.error.message);
          } catch (error) {
            this.pnotify.error();
          }
        }
      );
  }

  getAllMateriais(params) {
    const _params = params ?? {};
    _params. IN_STAT =this.formAllMateriais.value['IN_STAT'];
    _params. TT_REGI_PAGI = 15;
    const _obj = this.formAllMateriais.value;
    this.loadingAllMateriais = true;
    if (_obj['pesquisa']) _params[_obj['buscarPor']] = _obj['pesquisa'];
    this.entradaMateriaisService
      .getAllMateriais(_params)
      .pipe(
        finalize(() => {
          this.loadingAllMateriais = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.allMateriais = response.body['result'];
            this.totalItemsMaterial = response.body['result'].length;
            this.noAllMateriais = false;
          } else {
            this.pnotify.notice('Nenhum registro encontrado!');
            this.allMateriais = [];
            this.noAllMateriais = true;
          }
        },
        (error) => {
          this.pnotify.error();
          this.notasFiscais = [];
        }
      );
  }



 
  getNotasMateriais(params?) {
    const _params = params ?? {};
    _params.IN_STAT =this.formNotasFiscais.value['IN_STAT'];
    _params.TT_REGI_PAGI = 10;
    _params.PAGI =this.formNotasFiscais.value['PAGI'];
    const _obj = this.formNotasFiscais.value;
    this.loadingNotasFiscais = true;
    this.noNotasFiscais =this.notasFiscais.length === 0 ? true : false;
    if (_obj['pesquisa']) _params[_obj['buscarPor']] = _obj['pesquisa'];
    this.notasFiscaisService
      .getNotasMateriais(_params)
      .pipe(
        finalize(() => {
          this.loadingNotasFiscais = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.notasFiscais = response['body']['data'];
            this.totalItems = response.body['total'];
            this.noNotasFiscais = false;
          } else {
            this.pnotify.notice('Nenhum registro encontrado!');
            this.notasFiscais = [];
            this.noNotasFiscais = true;
          }
        },
        (error) => {
          this.pnotify.error();
          this.notasFiscais = [];
        }
      );
  }
  
  openModal(template: TemplateRef<any>, index) {
    this.index = index;
    this.noNotasFiscais = true;
    this.modalRef = this.modalService.show(template, {
      animated: false,
      class: 'modal-xl',
    });
  }
  hideModal() {
    this.modalRef.hide();
  }

  get formMateriais() {
    return this.form.get('materiais') as FormArray;
  }
  
  setMaterial(material) {
    const _material = {...material,'IN_MATE': false}
    const fg = this.form.get('materiais') as FormArray;
    fg.controls[this.index].patchValue(_material);
    fg.controls[this.index].get('TT_MATE').patchValue(undefined);
    fg.controls[this.index].get('TT_MATE_ORIG').patchValue(_material.TT_MATE);
    fg.controls[this.index].get('UUID_MATE').patchValue(_material.ID);
    fg.controls[this.index].get('ID_MATE').patchValue(_material.ID_MATE);
  }

  async postMateriais(id:number){
    let request = [];
    const materiais = this.formMateriais.getRawValue();
    if (!materiais){
      return
    }
    const promise = () => {
      materiais.forEach(material => {
        const params = {...material,'ID_LOGI_ENMA_FHNC':id}
        request.push(this.fichasConformidadeService
          .postMateriais(params)
      )});
    }
    await Promise.resolve(promise());
    forkJoin(request)
    .pipe(
      finalize(() => {
        this.loading = false;
        this.loadingNavBar = false;
      })
    )
    .subscribe(
      (responses: Array<any>) => {
        responses.forEach(response => {
          if(response.status === 200 ){
            this.pnotify.success('Material, salvo com sucesso!');
            this.router.navigate(['../'], {
              relativeTo: this.activatedRoute,
            });
          } else{
            this.pnotify.error();
          }
        });
      },
      (error: any) => {
        try {
          this.pnotify.error(error.error.message);
        } catch (error) {
          this.pnotify.error();
        }
      }
    )
  }

  getFormMaterial(params?) {
    this.loading = true;
    this.fichasConformidadeService
      .getFormMaterial(params)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(async (response) => {
        if (response.status !== 200) {
          this.noMateriais= true;
          return;
        }
        const materiais = response['body']['data'];
        const promise = () => materiais.forEach(() => this.onAddMaterial());
        await Promise.resolve(promise());
        this.form.get('materiais').patchValue(materiais)
        this.noMateriais =false;
         
      },
      (error) => {
        this.pnotify.error('Não foi encontrado nenhum material');
        this.noMateriais = true;
      }
    );
  }

  getNotasFiscaisMateriais(params?) {
    this.loading = true;
    this.fichasConformidadeService
      .getNotasFiscaisMateriais(params)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(async (response) => {
        if (response.status !== 200) {
          this.noMateriais= true;
          return;
        }
        let materiais = response['body']['data'];
        const promise = () => materiais.forEach((material, index) => {
          this.onAddMaterial()
          materiais[index]['TT_MATE_ORIG'] = materiais[index]['TT_MATE'];
          materiais[index]['TT_MATE'] = null;
        });
        await Promise.resolve(promise());
        this.form.get('materiais').patchValue(materiais)
        this.noMateriais =false;
         
      },
      (error) => {
        this.pnotify.error('Não foi encontrado nenhum material');
        this.noMateriais = true;
      }
    );
  }

  
  onAddMaterial() {
    this.formMateriais.push(
      this.formBuilder.group({
        ID_LOGI_ENMA_FHNC_MATE: [null],
        ID_LOGI_ENMA_NOFI_MATE: [null],
        UUID_MATE:[null],
        ID_MATE:[null],
        IN_MATE:[true],
        NR_NOTA_FISC: [{value: null, disabled: true}],
        NM_CLAS : [{value: null, disabled: true}],
        DS_UNID_MEDI: ['TON', [Validators.required]],
        TT_MATE_ORIG: [null, [Validators.required, Validators.min(0.01)]],
        TT_MATE: [null, [Validators.required, Validators.min(0.01)]],
        DS_LOTE: [null],
        NM_MATE: [{value: null, disabled: true}, Validators.required]
      })
    );
  }


  onCanAddMaterial(index:number):boolean{
    const fg = this.form.get('materiais') as FormArray;
    if (fg.controls[index].get('NR_NOTA_FISC').value) {
        this.formMateriais.controls[index].get(['DS_LOTE']).disable()
        this.formMateriais.controls[index].get(['DS_UNID_MEDI']).disable()
        this.formMateriais.controls[index].get(['TT_MATE_ORIG']).disable()
      return false;
    }
    return fg.controls[index].get('IN_MATE').value;
  }

  onDeleteMaterial(index: number) {
    if (this.formMateriais.length === 1) {
      this.pnotify.notice('Informe ao menos um material.');
      return
    }
    let materiais = this.formMateriais.at(index).value;
    materiais = {...materiais,'IN_STAT':'0'}
    if(!materiais['ID_LOGI_ENMA_FHNC_MATE']){
      this.formMateriais.removeAt(index);
      return;
    }
    this.loadingNavBar= true;
    this.fichasConformidadeService
      .postMateriais(materiais)
        .pipe(
          finalize(() => {
            this.loadingNavBar= false;
          })
        )
        .subscribe(
          (response) => {
            if (response.status === 200) {
              this.formMateriais.removeAt(index);
              this.pnotify.success();
            } else {
              this.pnotify.error();
            }
          },
          (error) => {
            this.pnotify.error();
          }
        );
}

  onNestedFieldError(formGroup: string, index: number, field: string) {
    if (this.onNestedFieldInvalid(formGroup, index, field)) {
      return 'is-invalid';
    }

    return '';
  }

  onNestedFieldInvalid(formGroup: string, index: number, field: any) {
    let nestedForm: any = this.form.controls[formGroup];
    field = nestedForm.controls[index].get(field);

    return field.status == 'INVALID' && field.touched;
  }

  onNestedFieldRequired(formGroup: string, index: number, field: string) {
    let required = false;
    let formControl = new FormControl();
    let nestedForm: any = this.form.controls[formGroup];

    if (nestedForm.controls[index].get(field).validator) {
      let validationResult = nestedForm.controls[index]
        .get(field)
        .validator(formControl);
      required =
        validationResult !== null && validationResult.required === true;
    }

    if (required) {
      return 'is-required';
    }
  }
  
  onPageChanged(event) {
    this.formNotasFiscais.get('PAGI').setValue(event.page);
    this.getNotasMateriais();
  }
  onPageChangedMaterial(event: PageChangedEvent): void {
    this.begin = (event.page - 1) * event.itemsPerPage;
    this.end = event.page * event.itemsPerPage;
  }

  comparaQuantidade(index):boolean {
    const _qtTotal = this.formMateriais.controls[index].get(['TT_MATE_ORIG']).value
    const _qtNC = this.formMateriais.controls[index].get(['TT_MATE']).value
    if(!_qtTotal || !_qtNC){
      return false;
    }
    if(parseFloat(_qtTotal) < parseFloat(_qtNC)){
      return true;
    }
    return false;
  }
}
