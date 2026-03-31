import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { HttpResponse } from '@angular/common/http';
import { TecnologiaInformacaoFuncionariosService } from './../../services/funcionarios.service';
//import { PageChangedEvent } from 'ngx-bootstrap/pagination/ngx-bootstrap-pagination';
import { BsModalService } from 'ngx-bootstrap/modal';
import { FormArray } from '@angular/forms';
//Services
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
//Bootstrap
import { utilsBr } from 'js-brasil';
import { BsDatepickerConfig, BsModalRef, BsLocaleService, PageChangedEvent } from 'ngx-bootstrap';
//Angular
import { Component, OnInit, TemplateRef, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from '@angular/forms';
//rxjs
import { Subscription, forkJoin, EMPTY } from 'rxjs';
import { finalize, take, switchMap } from 'rxjs/operators';
import { ITecnologiaInformacaoContratosDocumentos } from '../models/documentos';
import { TecnologiaInformacaoCadastroOcorrenciaService } from '../services/ocorrencia.service';
//interfaces

@Component({
  selector: 'tecnologia-informacao-contratos-ocorrencia-parecer',
  templateUrl: './parecer.component.html',
  styleUrls: ['./parecer.component.scss'],
})
export class TecnologiaInformacaoCadastrosOcorrenciaParecerComponent
  implements OnInit, OnDestroy {

  @Input() set ocorrenciaId(id: number){
    if(!id)
      return
    this.setFormBuilder()
    this.form.get('ID_TEIN_OCOR').setValue(id);
  };

  @Output() fecharModal = new EventEmitter();

  noResult: boolean;
  $activatedRouteSubscription: Subscription;
  breadCrumbTree: Array<any> = [];
  form: FormGroup;
  appTitle: string;
  modalRef: BsModalRef;
  formData: Array<FormData> = [];
  bsConfig: Partial<BsDatepickerConfig>;
  index:number;
  usuarios: Array<FormData> = [];
  noUsuarios = true;
  formUsuarios: FormGroup;
  parecer = [];
  noResponsavel: Array<FormData> = [];
  disabledForm = false;
  //loading
  loadingParecer: boolean;
  loadingUsuarios: boolean;
  loading = false;
  loadingNavBar = false;
  documentos: Partial<ITecnologiaInformacaoContratosDocumentos>[] = [];

  /* Pagination */
  itemsPerPage = 10;
  totalItems = 10;
  currentPage = 1;
  begin = 0;
  end = 10;
  /* Pagination */


  constructor(
    private formBuilder: FormBuilder,
    private pnotify: PNotifyService,
    private modalService: BsModalService,
    private localeService: BsLocaleService,
    private ocorrenciaService: TecnologiaInformacaoCadastroOcorrenciaService,
    private funcionarioService: TecnologiaInformacaoFuncionariosService,
    private confirmModalService: ConfirmModalService,
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
    this.setFormBuilder();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }


  ngOnDestroy(){
    if(this.modalRef != undefined){
      this.modalRef.hide();
    }
  }


  getResponsaveis(params?) {
    this.loadingNavBar = true;
    this.ocorrenciaService
      .getResponsaveis(params)
      .pipe(
        finalize(() => {
          this.loadingNavBar = false;
        })
      )
      .subscribe(async (response) => {
        if (response.status !== 200) {
          return;
        }
        const responsaveis = response['body']['data'];
        const promise = () => responsaveis.forEach(() => this.onAddResponsavel());
        await Promise.resolve(promise());
        this.form.get('responsaveis').patchValue(responsaveis)

      },
      (error) => {
        this.pnotify.error('Não foi encontrado nenhum material');
      }
    );
  }

  // }

  //formulario
  setFormBuilder(): void {
    if(this.form == undefined){
      this.form = this.formBuilder.group({
        TP_RESP: ['EMPRESA', [Validators.required]],
        DS_STAT_CONC: [null],
        DS_OBSE: [null,[Validators.required, Validators.minLength(10)]],
        DT_DEVO_APRE: [null],
        VL_DSCO: [null],
        NM_EMPR_REPA: [null],
        CONT_EMPR_REPA: [null],
        ID_TEIN_OCOR: [null],
        ID_TEIN_OCPR : [null],
        IN_STAT: [null],
        NR_MATR: [null],
        NM_USUA: [null],
        DT_INCL: [null],
        responsaveis: this.formBuilder.array([]),
      });
    }
    if(this.formUsuarios == undefined){
      this.formUsuarios = this.formBuilder.group({
        buscarPor: ['nome'],
        pesquisa: [null, Validators.required],
        matricula:[null],
        nome:[null],
      });
    }
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

  getUsuarios(params) {
    const _params = params ?? {};
    _params. situacao = '1';
    _params. qtItensPagina = 100;
    const _obj = this.formUsuarios.value;
    this.loadingUsuarios = true;
    if (_obj['pesquisa']) _params[_obj['buscarPor']] = _obj['pesquisa'];
    this.funcionarioService
      .getUsuarios(_params)
      .pipe(
        finalize(() => {
          this.loadingUsuarios = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.usuarios = response.body['usuarios'];
            this.totalItems = response.body['usuarios'].length;
            this.noUsuarios = false;
          } else {
            this.pnotify.notice('Nenhum registro encontrado!');
            this.usuarios = [];
            this.noUsuarios = true;
          }
        },
        (error) => {
          this.pnotify.error();
          this.usuarios = [];
        }
      );
  }

  setUsuarios(usuario) {
    const fg = this.form.get('responsaveis') as FormArray;
    fg.controls[this.index].get('NR_MATR_RESP').patchValue(usuario.matricula);
    fg.controls[this.index].get('ID_RESP').patchValue(usuario.id);
    fg.controls[this.index].get('NM_RESP').patchValue(usuario.nome);
  }

  async postResponsaveis(id:number){
    let request = [];
    const responsaveis = this.formResponsaveis.getRawValue();
    if (!responsaveis){
      return
    }
    const promise = () => {
      responsaveis.forEach(responsavel => {
        const params = {...responsavel,'ID_TEIN_OCPR':id}
        request.push(this.ocorrenciaService
          .postResponsaveis(params)
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
        this.pnotify.success('Responsáveis cadastrados com sucesso');
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
  onDeleteResponsavel(index: number) {
    let responsaveis = this.formResponsaveis.at(index).value;
    responsaveis = {...responsaveis,'IN_STAT':'0'}
      this.formResponsaveis.removeAt(index);
      return;
  }


  postParecer() {
    this.loadingNavBar = true;
    let params = JSON.parse(JSON.stringify(this.form.value));
    delete params['responsaveis'];
    this.ocorrenciaService
      .postParecer(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response: any) => {
          if (response.status === 200) {
            const idParecer = response.body['data'];
            this.postResponsaveis(idParecer);
            this.postDocumentosParecer(idParecer);
            this.fecharModal.emit(true)
            this.pnotify.success();
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

  get formResponsaveis() {
    return this.form.get('responsaveis') as FormArray;
  }

  onAddResponsavel() {
    this.formResponsaveis.push(
      this.formBuilder.group({
        ID_TEIN_OCPR: [null],
        ID_TEIN_OCOR: [null],
        ID_RESP: [null],
        NR_MATR_RESP: [{value: null , disabled: true}, [Validators.required]],
        NM_RESP: [{value: null , disabled: true}, [Validators.required]],
      })
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
  onPageChanged(event: PageChangedEvent): void {
    this.begin = (event.page - 1) * event.itemsPerPage;
    this.end = event.page * event.itemsPerPage;
  }



  async postDocumentosParecer(idParecer: number) {
    let requests = [];

    if (this.formData.length === 0) {
      return requests;
    }
    const _params = {ID_TEIN_OCPR: idParecer, ID_TEIN_OCOR: this.form.get('ID_TEIN_OCOR').value}
    const promise = () => {
      this.formData.forEach((element) => {
        requests.push(this.ocorrenciaService.postDocumentoParecer(element, _params));
      });
    }

    Promise.resolve(promise());

    forkJoin(requests)
      .subscribe(
        (responses: Array<HttpResponse<any>>)=>{
          responses.forEach(response => {
            if(response.status === 200){
              this.pnotify.success();
            } else {
              this.pnotify.error();
            }
          })
        }
        ,
      (error) => {
        this.pnotify.error();
      }
      )

    return requests;
  }

  putDocumentoParecer(documento: ITecnologiaInformacaoContratosDocumentos) {
    const [type, title, message, cancelTxt, okTxt] = [
      'inactivate',
      'Confirmar inativação',
      'Deseja realmente prosseguir com a inativação do registro?',
      'Cancelar',
      'Confirmar',
    ];

    this.confirmModalService
      .showConfirm(type, title, message, cancelTxt, okTxt)
      .pipe(
        take(1),
        switchMap((result) => {
          if (!result) return EMPTY;

          this.loadingNavBar = true;

          return this.ocorrenciaService.putDocumento(documento);
        }),
        finalize(() => {
          this.loadingNavBar = false;
        })
      )
      .subscribe((response) => {
        this.pnotify.success('Documento atualizado com sucesso');
        this.getDocumentoParecer({
          ID_TEIN_OCPR: this.form.get('ID_TEIN_OCPR').value,
          IN_STAT: '1',
        });
      });
  }

  getDocumentoParecer(params?) {
    this.ocorrenciaService.getDocumentoParecer(params).subscribe(
      (response) => {
        if (response.status === 200) {
          this.documentos = response.body['data'];
        } else {
          this.documentos = [];
        }
      },
      (error) => {
        this.documentos = [];
      }
    );
  }

  onRemove(documento: ITecnologiaInformacaoContratosDocumentos, index: number) {
    if(!documento.hasOwnProperty('ID_TEIF_DOCU')){
      this.formData = this.formData.filter((element:FormData) => {
        return (element.get('file'))['name'] != documento.NM_DOCU ;
      })
    }
    documento.IN_STAT = '0';
    this.documentos.splice(index, 1)
    if(documento.hasOwnProperty('ID_TEIF_DOCU')){
      this.putDocumentoParecer(documento);
    }
  }

  appendFile(files: FileList) {
    if (files.length === 0) return;
    const fd = new FormData();
    fd.append('file', files[0]);
    this.formData.push(fd);
    this.documentos.push({ NM_DOCU: files[0]['name']});
  }

}
