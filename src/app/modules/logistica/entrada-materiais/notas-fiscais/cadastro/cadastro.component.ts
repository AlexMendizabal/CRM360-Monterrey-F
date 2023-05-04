import { RouterService } from './../../../../../shared/services/core/router.service';
import { LogisticaEntradaMateriaisStatusRecebimentoService } from './../../status-recebimento/services/status-recebimento.service';
import { DateService } from './../../../../../shared/services/core/date.service';
import { AbstractControl } from '@angular/forms';
//Services
import { TitleService } from 'src/app/shared/services/core/title.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
//Bootstrap
import { utilsBr } from 'js-brasil';
import { BsDatepickerConfig, BsModalRef, BsModalService, BsLocaleService, PageChangedEvent } from 'ngx-bootstrap';
//Angular
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, TemplateRef } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  FormArray,
} from '@angular/forms';
//rxjs
import { Subscription, forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ILogisticaEntradaMateriaisNotasFiscais } from '../models/notasFiscais';

import { LogisticaEntradaMateriaisNotasFiscaisService } from '../services/notas-fiscais.service';
import { LogisticaEntradaMateriaisService } from '../../services/entrada-materiais.service';
//interfaces

@Component({
  selector: 'logistica-entrada-materiais-notas-fiscais-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss'],
})
export class LogisticaEntradaMateriaisNotasFiscaisCadastroComponent
  implements OnInit {
  noResult: boolean;
  noFornecedor= true;
  $activatedRouteSubscription: Subscription;
  breadCrumbTree: Array<any> = [];
  form: FormGroup;
  formPesquisaFornecedor: FormGroup;
  noAllMateriais = true;
  formAllMateriais: FormGroup;
  appTitle: string;
  modalRef: BsModalRef;
  modalRefPopup: BsModalRef;
  bsConfig: Partial<BsDatepickerConfig>;
  index: number;
  noMaterial= true;
  disabledForm = false;
  
  //loading
  loading = false;
  loadingNavBar = false;
  loadingFornecedores:boolean;
  loadingEmpresas:boolean;
  loadingMateriais:boolean;
  loadingAllMateriais: boolean;
  loadingStatusRecebimento = false;
  
  //Interfaces
  allMateriais: Array<FormData> = [];
  materiais = [];
  statusRecebimento = [];
  fornecedores = [];
  empresas = [];

  /* Pagination */
  itemsPerPage = 10;
  totalItemsMaterial= 10;
  totalItems = 10;
  currentPage = 1;
  begin = 0;
  end = 10;
  /* Pagination */
  
  notasFiscais: Array<ILogisticaEntradaMateriaisNotasFiscais> = [];
  constructor(
    private formBuilder: FormBuilder,
    private pnotify: PNotifyService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private modalService: BsModalService,
    private localeService: BsLocaleService,
    private statusRecebimentoService: LogisticaEntradaMateriaisStatusRecebimentoService,
    private dateService: DateService,
    private notasFiscaisService: LogisticaEntradaMateriaisNotasFiscaisService,
    private entradaMateriaisService: LogisticaEntradaMateriaisService,
    private titleService: TitleService,
    private routerService: RouterService,
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
    this.registrarAcesso();
    this.setBreadCrumb();
    this.setFormBuilder();
    this.onActivatedRoute();
    this.getStatusRecebimento();
    this.getEmpresas();
    
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  onActivatedRoute() {
    const _params = this.activatedRoute.snapshot.params;
    if (_params.hasOwnProperty('id')) {
      this.getNotasFiscais({ ID_LOGI_ENMA_NOFI: _params['id'] });
      this.getNotasMateriais({ ID_LOGI_ENMA_NOFI: _params['id'], IN_STAT:'1' });
    } else { 
      this.onAddMaterial();
    } 
  }



  getFornecedores(params?) {
    const _params = params ?? {};
    _params. IN_STAT=this.formPesquisaFornecedor.value['IN_STAT'];
    _params.IN_PAGI = '0';
    const _obj = this.formPesquisaFornecedor.value;
    this.loadingFornecedores = true;
    if (_obj['pesquisa']) _params[_obj['buscarPor']] = _obj['pesquisa'];
    this.entradaMateriaisService
      .getFornecedores(_params)
      .pipe(
        finalize(() => {
          this.loadingFornecedores = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            if(response.body['responseCode']=== 404){
              this.pnotify.notice('Nenhum registro encontrado!');
              this.fornecedores = [];
              this.noFornecedor = true;
              return;
            }
            this.fornecedores = response.body['result'];
            this.totalItems = response.body['result'].length;
            this.noFornecedor = false;

          } else {
            this.pnotify.notice('Nenhum registro encontrado!');
            this.fornecedores = [];
            this.noFornecedor = true;
          }
        },
        (error) => {
          this.pnotify.error();
          this.fornecedores = [];
        }
      );
  }

  getEmpresas(params?) {
    this.loadingEmpresas=true;
    this.entradaMateriaisService
      .getEmpresas(params)
      .pipe(
        finalize(() => {
          this.loadingEmpresas = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.empresas = response.body['result'];
          } else {
            this.pnotify.notice('Nenhum registro encontrado!');
            this.empresas = [];
          }
        },
        (error) => {
          this.pnotify.error();
          this.empresas = [];
        }
      );
  }

  getStatusRecebimento(params?) {
    const _params = params ?? [];
    _params.IN_STAT = '1';
    _params.IN_PAGI = '0';

    if(!this.activatedRoute.snapshot.params.hasOwnProperty('id')){
      _params.IN_FHNC = '0';
    }

  this.loadingStatusRecebimento = true;
  this.statusRecebimentoService
    .getStatusRecebimento(_params)
    .pipe(
      finalize(() => {
        this.loadingStatusRecebimento = false;
      })
    )
    .subscribe((response) => {
      if (response.status === 200) {
        this.statusRecebimento = response.body['data'];
      }else {
        this.statusRecebimento = [];
      }
    },
    (error) => {
      this.pnotify.error('Não foi encontrado nenhum status de recebimento');
    }
  );
  }

  getNotasMateriais(params?) {
    this.loadingNavBar = true;
    this.loadingMateriais = true
    this.notasFiscaisService
      .getNotasMateriais(params)
      .pipe(
        finalize(() => {
          this.loadingNavBar = false;
          this.loadingMateriais = false
        })
      )
      .subscribe(async (response) => {
        if (response.status !== 200) {
          return;
        }
        const materiais = response['body']['data'];
        const promise = () => materiais.forEach(() => this.onAddMaterial());
        await Promise.resolve(promise());
        this.form.get('materiais').patchValue(materiais)
         
      },
      (error) => {
        this.pnotify.error('Não foi encontrado nenhum material');
      }
    );
  }

  getNotasFiscais(params?: Partial<ILogisticaEntradaMateriaisNotasFiscais>) {
    this.loading = true;
    const _params = params ?? {};
    this.notasFiscaisService
      .getNotasFiscais(_params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status !== 200) {
            this.noResult = true;
            this.notasFiscais = [];
            return;
          }
          const nota_ = response.body['data'][0];
          nota_.DT_EMIS_NOTA_FISC = new Date(nota_.DT_EMIS_NOTA_FISC);
          this.form.patchValue(nota_) 
          this.noResult = false;
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
        descricao: 'Notas Fiscais',
        routerLink: `../`,
      },
      {
        descricao: this.appTitle,
      },
    ];
  }

  setFornecedor(fornecedor) {
    this.form.get('NM_FORN').patchValue(fornecedor.NM_RAZA_SOCI);
    this.form.controls['NM_FORN'].markAsDirty({ onlySelf: true })
    this.form.get('UUID_FORN').patchValue(fornecedor.ID);
    this.form.controls['UUID_FORN'].markAsDirty({ onlySelf: true })
  }
  
  setMaterial(material) {
    const _material = {...material,'IN_MATE': false}
    const fg = this.form.get('materiais') as FormArray;
    fg.controls[this.index].patchValue(_material);
    fg.controls[this.index].get('UUID_MATE').patchValue(_material.ID);
  }

  //formulario
  setFormBuilder(): void {
    this.form = this.formBuilder.group({
      ID_LOGI_ENMA_NOFI:[null],
      ID_LOGI_ENTR_MATE_NOFI: [null],
      NR_NOTA_FISC: [null, [Validators.required]],
      NM_FORN: [{value: null, disabled: true},Validators.required],
      UUID_FORN: [null],
      DT_EMIS_NOTA_FISC:  [null, [Validators.required]],
      ID_LOGI_ENMA_NOFI_STAT: [null],
      NM_STAT: [null],
      IN_FHNC: [null],
      DS_LOGI_ENTR_MATE_UNID_MEDI: [null],
      UUID_EMPR: [null],
      NM_EMPR: [{value: null, disabled: true},Validators.required],
      IN_STAT: ['1', [Validators.required]],
      DS_OBSE: [null],
      materiais: this.formBuilder.array([]),
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
    this.formPesquisaFornecedor = this.formBuilder.group({
      buscarPor: ['NM_RAZA_SOCI'],
      pesquisa: [null, Validators.required],
      ID_REFE_ERP: [null],
      NM_RAZA_SOCI: [null],
      NM_FANT: [null],
      NR_CNPJ_CPF: [null],
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

    if (field.errors != null) {
      if (field.errors.hasOwnProperty('required') && field.touched) {
        return 'required';
      }

      if (field.errors.hasOwnProperty('maxlength') && field.touched) {
        return 'maxlength';
      }

      if (field.errors.hasOwnProperty('minlength') && field.touched) {
        return 'minlength';
      }
    }

    return '';
  }
  
  onFieldRequired(
    abstractControl: AbstractControl,
    abstractControlField?: string
  ): string {
    if (abstractControl.validator) {
      const validator = abstractControl.validator({} as AbstractControl);
      if (validator && validator.required) {
        return 'is-required';
      }
    }

    if (abstractControlField) {
      for (const controlName in abstractControl['controls']) {
        if (abstractControl['controls'][controlName]) {
          if (
            this.onFieldRequired(abstractControl['controls'][controlName]) &&
            controlName == abstractControlField
          ) {
            return 'is-required';
          }
        }
      }
    }

    return '';
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
          this.allMateriais = [];
        }
      );
  }

  async postMateriais(id:number){

    let request =[];
    const materiais = this.formMateriais.getRawValue();

    if (!materiais || !this.formMateriais.dirty ){
      this.pnotify.notice('Nenhum material alterado!')
      this.router.navigate(['./../'], {
        relativeTo: this.activatedRoute,
      });
      return
    }

    if (!this.form.get('ID_LOGI_ENMA_NOFI').value){   
      return;
    }

    const promise = () => {
      const controls = Object.keys(this.formMateriais.controls)
      controls.forEach(key => {
        if(!this.formMateriais.controls[key].dirty){
          return;
        }
        let material = this.formMateriais.get(key).value;
        material['SEQU_MATE'] = materiais[key]['SEQU_MATE'];
        material['ID_LOGI_ENMA_NOFI'] = id
        request.push(this.notasFiscaisService.postMateriais(material))
      })
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
  

  postNotasFiscais() {
    this.loadingNavBar = true;
    let params = {}

    if (this.form.get('ID_LOGI_ENMA_NOFI').value){
      
      Object.keys(this.form.controls).forEach(key => {
        if(this.form.controls[key].dirty){
          params[key] = this.form.get(key).value,
          params['ID_LOGI_ENMA_NOFI'] = parseFloat(this.form.get('ID_LOGI_ENMA_NOFI').value);
        } 
        return;
      }) 



      if (!this.form.dirty &&  !this.form.controls['UUID_FORN'].dirty){
        this.loadingNavBar = false;
        this.pnotify.notice('Nenhuma alteração realizada!')
        return;
      }

    } else{
      params = JSON.parse(JSON.stringify(this.form.value)) ;
      params['SG_ORIG'] ='MTCORP'
    }

    delete params['materiais'];


    this.notasFiscaisService
      .postNotasFiscais(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response: any) => {
          if (response.status === 200) {
            this.pnotify.success();
            const id = response.body['data'];
            this.form.get('ID_LOGI_ENMA_NOFI').setValue(id);
            this.postMateriais(id);
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

  openModal(template: TemplateRef<any>, index?:number) {
    this.index = index;
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
  
  onAddMaterial(index?:number) {
    const sequencia = this.formMateriais.length + 1;
    this.formMateriais.push(
      this.formBuilder.group({
        UUID_MATE:[null],
        ID_LOGI_ENMA_NOFI_MATE:[null],
        SEQU_MATE: [{value: sequencia , disabled: true}, [Validators.required, Validators.min(1)]],
        DS_UNID_MEDI: ['TON', [Validators.required]],
        TT_MATE: [null, [Validators.required, Validators.min(0.01)]],
        DS_LOTE: [null],
        NM_MATE: [{value: null , disabled: true}, [Validators.required]],
      })
    );
  }

  onDeleteMaterial(index: number) {
    if (this.formMateriais.length === 0) {
      this.pnotify.notice('Informe ao menos um material.');
      return
    }
    let materiais = this.formMateriais.at(index).value;
    materiais = {...materiais,'IN_STAT':'0',ID_LOGI_ENMA_NOFI:this.form.get('ID_LOGI_ENMA_NOFI').value}
    if(!materiais['ID_LOGI_ENMA_NOFI_MATE']){
      this.formMateriais.removeAt(index);
      return;
    }
    this.loadingNavBar= true;
    this.notasFiscaisService
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


  getParams() {
    let _params = {};
    let _obj = this.form.value;

    for (let prop in _obj) {
      if (_obj[prop]) {
        if (_obj[prop] instanceof Date)
          _params[prop] = this.dateService.convertToUrlDate(_obj[prop]);
        else _params[prop] = _obj[prop];
      }
    }

    return _params;
  }
  
  onPageChanged(event: PageChangedEvent): void {
    this.begin = (event.page - 1) * event.itemsPerPage;
    this.end = event.page * event.itemsPerPage;
  }


  checkStatus(event,template: TemplateRef<any>){
    if(!event){
      return;
    }

    if( event.IN_FHNC == 1 && this.form.get('IN_FHNC').value != 1){
      this.modalRefPopup = this.modalService.show(template, {
        animated: false,
      });
    }
  }

  hidePopup() {
    this.form.get('ID_LOGI_ENMA_NOFI_STAT').reset()
    this.modalRefPopup.hide();
  }

  gerarFicha() {
    this.modalRefPopup.hide();
    const id = this.form.get('ID_LOGI_ENMA_NOFI').value
    const params = this.activatedRoute.snapshot.params;
    const idSubmodulo = params?.idSubModulo;
    const queryParams = btoa(JSON.stringify({ID_LOGI_ENMA_NOFI:id}))
    window.open(`${window.location.origin}/#/logistica/entrada-materiais/${idSubmodulo}/fichas-nao-conformidade/novo?q=${queryParams}`,'blank')

  }


}
