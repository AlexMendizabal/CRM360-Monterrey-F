import { LogisticaEntradaMateriaisFichaConformidadeService } from './../services/ficha-conformidade.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { HttpResponse } from '@angular/common/http';
import { ILogisticaEntradaMateriaisDocumentos } from './../models/documentos';
import { LogisticaEntradaMateriaisParecerService } from './../../parecer/services/parecer.service';
import { ILogisticaEntradaMateriaisOcorrencias } from './../models/ocorrencias';
import { PageChangedEvent } from 'ngx-bootstrap/pagination/ngx-bootstrap-pagination';
import { BsModalService } from 'ngx-bootstrap/modal';
import { FormArray } from '@angular/forms';
//Services
import { TitleService } from 'src/app/shared/services/core/title.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
//Bootstrap
import { utilsBr } from 'js-brasil';
import { BsDatepickerConfig, BsModalRef, BsLocaleService } from 'ngx-bootstrap';
//Angular
import { ActivatedRoute, Router } from '@angular/router';
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
import { truncateWithEllipsis } from '@amcharts/amcharts4/.internal/core/utils/Utils';
//interfaces

@Component({
  selector: 'logistica-entrada-materiais-ficha-conformidade-ocorrencias',
  templateUrl: './ocorrencias.component.html',
  styleUrls: ['./ocorrencias.component.scss'],
})
export class LogisticaEntradaMateriaisFichasConformidadeOcorrenciasComponent
  implements OnInit, OnDestroy {
    @Input() set fichaId(id: number){
      if(!id)
        return
      this.setFormBuilder()
      this.form.get('ID_LOGI_ENMA_FHNC').setValue(id);
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

  /* Pagination */
  itemsPerPage = 10;
  totalItems = 10;
  currentPage = 1;
  begin = 0;
  end = 10;
  /* Pagination */

  //Interfaces
  documentos: Partial<ILogisticaEntradaMateriaisDocumentos>[] = [];
  ocorrencias: Array<ILogisticaEntradaMateriaisOcorrencias> = [];

  constructor(
    private formBuilder: FormBuilder,
    private pnotify: PNotifyService,
    private modalService: BsModalService,
    private localeService: BsLocaleService,
    private parecerService: LogisticaEntradaMateriaisParecerService,
    private confirmModalService: ConfirmModalService,
    private fichasConformidadeService: LogisticaEntradaMateriaisFichaConformidadeService,
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
    this.getParecer();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }


  ngOnDestroy(){
    if(this.modalRef != undefined){
      this.modalRef.hide();
    }
  }

  // getOcorrencias(params?: Partial<ILogisticaEntradaMateriaisOcorrencias>) {
  //   this.loading = true;
  //   const _params = params ?? {};
  //   this.fichasConformidadeService
  //     .getOcorrencias(_params)
  //     .pipe(
  //       finalize(() => {
  //         this.loading = false;
  //         this.loadingNavBar = false;
  //       })
  //     )
  //     .subscribe(
  //       (response) => {
  //         if (response.status !== 200) {
  //           this.noResult = true;
  //           this.ocorrencias = [];
  //           return;
  //         }
  //         const _ocorrencia = response.body['data'][0];
  //         this.form.patchValue(_ocorrencia) 
  //         this.noResult = false;
  //       },
  //       (error) => {
  //         this.pnotify.error();
  //         this.noResult = true;
  //       }
  //     );
  // }

  getResponsaveis(params?) {
    this.loadingNavBar = true;
    this.fichasConformidadeService
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

  getParecer() {
    this.loadingParecer = true;
    this.parecerService
      .getParecer({ IN_STAT: '1', IN_PAGI: '0' })
      .pipe(
        finalize(() => {
          this.loadingParecer = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.parecer = response.body['data'];
        }else{
          this.pnotify.notice('Nenhum registro encontrado!')
        }
      });
  }

  //formulario
  setFormBuilder(): void {
    if(this.form == undefined){
      this.form = this.formBuilder.group({
        ID_LOGI_ENMA_FHNC: [null],
        ID_LOGI_ENMA_FHNC_OCPR : [null, [Validators.required]],
        ID_LOGI_ENMA_FHNC_OCOR: [null],
        IN_STAT: ['1', [Validators.required]], 
        IN_CONC: [false],
        DS_OBSE: [null, [Validators.required]],
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

  // onCanResponsavel():boolean{
  //   const id = this.form.get('ID_LOGI_ENMA_FHNC_OCPR').value;
  //   const parecer = this.parecer.filter((el) => el.ID_LOGI_ENMA_FHNC_OCPR == id); 
  //   if(id == null){
  //     return false;
  //   }
  //   if(parecer.length > 1){
  //     return false;
  //   }
  //   if(parecer[0]['IN_CONC'] == 1){
  //     return true;
  //   }
  //   return false
  // }

  getUsuarios(params) {
    const _params = params ?? {};
    _params. situacao = '1';
    _params. qtItensPagina = 100;
    const _obj = this.formUsuarios.value;
    this.loadingUsuarios = true;
    if (_obj['pesquisa']) _params[_obj['buscarPor']] = _obj['pesquisa'];
    this.fichasConformidadeService
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
    fg.controls[this.index].get('ID_LOGI_ENMA_FHNC_OCOR').patchValue(usuario.matricula);
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
        const params = {...responsavel,'ID_LOGI_ENMA_FHNC_OCOR':id}
        request.push(this.fichasConformidadeService
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
    if (this.formResponsaveis.length === 1) {
      this.pnotify.notice('Informe ao menos um responsável.');
      return
    }
    const id = this.form.get('ID_LOGI_ENMA_FHNC')
    let responsaveis = this.formResponsaveis.at(index).value;
    responsaveis = {...responsaveis,'IN_STAT':'0'}
    if(!responsaveis['ID_RESP']){
      this.formResponsaveis.removeAt(index);
      return;
    }
    this.loadingNavBar= true;
    this.fichasConformidadeService
      .postResponsaveis(responsaveis)
        .pipe(
          finalize(() => {
            this.loadingNavBar= false;
          })
        )
        .subscribe(
          (response) => {
            if (response.status === 200) {
              this.formResponsaveis.removeAt(index);
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

  // disabedSave():boolean {
  //   if(this.onCanResponsavel()){
  //     return false
  //   }
  //   const responsaveis = this.form.get('responsaveis').value;
  //   if(responsaveis.length == 0){
  //     return true
  //   }
  //   if(!responsaveis[0]['ID_RESP']){
  //     return true
  //   }
  //   return false
  // }

  postOcorrencias() {
    this.loadingNavBar = true;
    let params = JSON.parse(JSON.stringify(this.form.value));
    delete params['responsaveis'];
    this.fichasConformidadeService
      .postOcorrencias(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response: any) => {
          if (response.status === 200) {
            const idOcorrencia = response.body['data'];
            this.form.get('ID_LOGI_ENMA_FHNC_OCOR').setValue(idOcorrencia);
            this.postResponsaveis(idOcorrencia);
            this.postDocumentosOcorrencia(idOcorrencia);
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
        ID_LOGI_ENMA_FHNC_OCOR: [null],
        ID_LOGI_ENMA_FHNC: [null],
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



  async postDocumentosOcorrencia(fichaId: number) {
    let requests = [];

    if (this.formData.length === 0) {
      return requests;
    }

    const promise = () => {
      this.formData.forEach((element) => {
        requests.push(this.fichasConformidadeService.postDocumentoOcorrencia(element, fichaId));
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

  putDocumentoOcorrencia(documento: ILogisticaEntradaMateriaisDocumentos) {
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

          return this.fichasConformidadeService.putDocumento(documento);
        }),
        finalize(() => {
          this.loadingNavBar = false;
        })
      )
      .subscribe((response) => {
        this.pnotify.success('Documento atualizado com sucesso');
        this.getDocumentosOcorrencia({
          ID_LOGI_ENMA_FHNC_OCOR: this.form.get('ID_LOGI_ENMA_FHNC_OCOR').value,
          IN_STAT: '1',
        });
      });
  }

  getDocumentosOcorrencia(params?) {
    this.fichasConformidadeService.getDocumentoOcorrencia(params).subscribe(
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

  onRemove(documento: ILogisticaEntradaMateriaisDocumentos, index: number) {
    if(!documento.hasOwnProperty('ID_LOGI_ENMA_FHNC_DOCU')){
      this.formData = this.formData.filter((element:FormData) => {
        return (element.get('file'))['name'] != documento.NM_DOCU ;
      })
    }
    documento.IN_STAT = '0';
    this.documentos.splice(index, 1)
    if(documento.hasOwnProperty('ID_LOGI_ENMA_FHNC_DOCU')){
      this.putDocumentoOcorrencia(documento);
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
