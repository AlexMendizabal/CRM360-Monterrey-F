//angular
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, TemplateRef } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  FormArray,
} from '@angular/forms';

//service
import { TitleService } from 'src/app/shared/services/core/title.service';
import { TecnologiaInformacaoCadastroItemService } from './../../item/services/item.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { TecnologiaInformacaoFuncionariosService } from './../../services/funcionarios.service';
import { TecnologiaInformacaoCadastroOcorrenciaService } from '../services/ocorrencia.service';

import { BsDatepickerConfig, BsModalService, BsModalRef } from 'ngx-bootstrap';
import { finalize, switchMap, take } from 'rxjs/operators';
import { EMPTY, forkJoin, Subscription } from 'rxjs';

//interfaces
import { ITecnologiaInformacaoOcorrencia } from './../models/ocorrencia';
import { ITecnologiaInformacaoContratosDocumentos } from './../models/documentos';

@Component({
  selector: 'tecnologia-informacao-cadastros-ocorrencia-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss'],
})
export class TecnologiaInformacaoCadastrosOcorrenciaCadastroComponent
implements OnInit {
  $activatedRouteSubscription: Subscription;
  noResult: boolean;
  modalRef: BsModalRef;
  form: FormGroup;
  formUsuarios: FormGroup;
  formData: Array<FormData> = [];
  formPesquisaItem: FormGroup;
  breadCrumbTree: Array<any> = [];
  bsConfig: Partial<BsDatepickerConfig>;
  ocorrencias: Array<ITecnologiaInformacaoOcorrencia>;
  documentos: Partial<ITecnologiaInformacaoContratosDocumentos>[] = [];
  usuarios: Array<FormData> = [];
  itens: Array<FormData> = [];
  noUsuarios = true;
  id:number;
  appTitle: string;
  index:number;
  
  loading = false;
  loadingNavBar = false;
  loadingItens: boolean;
  loadingTipoItem: boolean;
  loadingUsuarios: boolean;

  
  /* Pagination */
  itemsPerPage = 10;
  totalItems = 10;
  currentPage = 1;
  begin = 0;
  end = 10;
  /* Pagination */
  
  constructor(
    private router: Router,
    private pnotify: PNotifyService,
    private formBuilder: FormBuilder,
    private titleService: TitleService,
    private modalService: BsModalService,
    private activatedRoute: ActivatedRoute,
    private itensService: TecnologiaInformacaoCadastroItemService,
    private atividadesService: AtividadesService,
    private confirmModalService: ConfirmModalService,
    private funcionarioService: TecnologiaInformacaoFuncionariosService,
    private ocorrenciaService: TecnologiaInformacaoCadastroOcorrenciaService
  ) {}

  ngOnInit(): void {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.setFormBuilder();
    this.onActivatedRoute();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb(): void {
    this.appTitle = 'Cadastro';
    const id = this.activatedRoute.snapshot.params.idSubModulo;
    this.titleService.setTitle(this.appTitle);
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: '/tecnologia-informacao/home',
      },
      {
        descricao: 'Contratos',
        routerLink: `/tecnologia-informacao/contratos/${id}`,
      },
      {
        descricao: 'Ocorrências',
        routerLink: `./../`,
      },
      {
        descricao: this.appTitle,
      },
    ];
  }


  onActivatedRoute() {
    const _params = this.activatedRoute.snapshot.params;
     this.id = _params['id']
    if (_params.hasOwnProperty('id')) {
      this.getOcorrencia({ ID_TEIN_OCOR: _params['id'] });
      this.getResponsaveis({ ID_TEIN_OCOR: _params['id'] , IN_STAT:'1'});
      this.getDocumentos({ ID_TEIN_OCOR: _params['id'] , IN_STAT:'1'});
    } else { 
      this.onAddResponsavel();
    } 
  }

  //formulario
  setFormBuilder(): void {
    this.form = this.formBuilder.group({
      ID_TEIN_OCOR: [null],
      ID_TECN_INFO_ITEM: [null],
      DS_OBSE: [null,[Validators.required, Validators.minLength(10)]],
      IN_STAT:[null],
      NR_MATR_FUNC: [{value:null , disabled:true}, [Validators.required]],
      NM_FUNC: [{value:null , disabled:true}, [Validators.required]],
      CD_ITEM: [{value:null , disabled:true}, [Validators.required]],
      NM_ITEM_TIPO: [{value:null , disabled:true}, [Validators.required]],
      NM_MODE: [{value:null , disabled:true}, [Validators.required]],
      NM_PROD: [{value:null , disabled:true}, [Validators.required]],
      VL_ITEM: [{value:null , disabled:true}, [Validators.required]],
      responsaveis: this.formBuilder.array([]),
    });
    this.formUsuarios = this.formBuilder.group({
      buscarPor: ['nome'],
      pesquisa: [null, Validators.required],
      matricula:[null],
      nome:[null],
    });
    this.formPesquisaItem = this.formBuilder.group({
      buscarPor: ['CD_ITEM'],
      pesquisa: [null, Validators.required],
      ID_TECN_INFO_ITEM: [null],
      CD_ITEM: [null],
      NM_ITEM_TIPO: [null],
      NM_MODE: [null],
      NM_PROD: [null],
      DS_CONT: [null],
      NR_MATR: [null],
      NM_USUA: [null],
    });


  }

  getItens() {
    const _obj = this.formPesquisaItem.value;
    const _params = {};
    if (_obj['pesquisa']) _params[_obj['buscarPor']] = _obj['pesquisa'];
    this.loadingItens = true;
    this.itensService
      .getItem(_params)
      .pipe(
        finalize(() => {
          this.loadingItens = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.itens = response.body['data'];
          } else {
            this.pnotify.notice('Nenhum registro encontrado!');
            this.itens = [];
          }
        },
        (error) => {
          this.pnotify.error();
        }
      );
  }

  getItem(id:number) {
    this.loading = true;
    this.itensService
      .getItem({ID_TECN_INFO_ITEM: id})
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            const item =response.body['data'][0]
            this.setItem(item)
          } else {
            this.pnotify.notice('Nenhum item encontrado!');
            this.itens = [];
          }
        },
        (error) => {
          this.pnotify.error();
        }
      );
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
        this.pnotify.error('Não foi encontrado nenhum responsável');
      }
    );
  }


  getOcorrencia(params?: Partial<ITecnologiaInformacaoOcorrencia>) {
    this.loading = true;
    const _params = params ?? {};
    this.ocorrenciaService
      .getOcorrencia(_params)
      .subscribe(
        (response) => {
          if (response.status !== 200) {
            this.noResult = true;
            this.loading = false;
            this.ocorrencias = [];
            return;
          }
          const _ocorrencias = response.body['data'][0];
          const item = _ocorrencias['ID_TECN_INFO_ITEM']
          this.getItem(item)
          this.form.patchValue(_ocorrencias) 
          this.noResult = false;
        },
        (error) => {
          this.pnotify.error();
          this.noResult = true;
        }
      );
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

  postOcorrencia() {
    let params = JSON.parse(JSON.stringify(this.form.getRawValue())) ;
    delete params['responsaveis'];
    this.loadingNavBar = true;
    this.ocorrenciaService
      .postOcorrencia(params)
      .pipe(
        finalize(() => {
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response: any) => {
          if (response.status === 200) {
            const id = response.body['data'];
            this.pnotify.success();
            this.postResponsaveis(id);
            this.postDocumentos(id);
            this.router.navigate(['../'], {
              relativeTo: this.activatedRoute,
            });
          } else {
            this.pnotify.error();
          }
        },
        (error: any) => {
          this.pnotify.error();
        }
      );
  }
  get formResponsaveis() {
    const responsaveis = this.form.get('responsaveis') as FormArray;
    return responsaveis
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

  onAddResponsavel() {
    this.formResponsaveis.push(
      this.formBuilder.group({
        ID_TEIN_OCOR: [null],
        ID_RESP: [null],
        NR_MATR_RESP: [{value: null , disabled: true}, [Validators.required]],
        NM_RESP: [{value: null , disabled: true}, [Validators.required]],
      })
    );
  }

  async postResponsaveis(id:number){
    let request = [];
    const responsaveis = this.formResponsaveis.getRawValue();
    if (responsaveis.length == 0){
      return
    }
    const promise = () => {
      responsaveis.forEach(responsavel => {
        const params = {...responsavel, 'ID_TEIN_OCOR': id}
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
    //const _usuario = {...usuario,'IN_MATE': false}
    
    const fg = this.form.get('responsaveis') as FormArray;
    fg.controls[this.index].get('NR_MATR_RESP').patchValue(usuario.matricula);
    fg.controls[this.index].get('ID_RESP').patchValue(usuario.id);
    fg.controls[this.index].get('NM_RESP').patchValue(usuario.nome);

  }


  setItem(item) {
    this.form.get('ID_TECN_INFO_ITEM').patchValue(item.ID_TECN_INFO_ITEM);
    this.form.get('CD_ITEM').patchValue(item.CD_ITEM);
    this.form.get('NM_ITEM_TIPO').patchValue(item.NM_ITEM_TIPO);
    this.form.get('NM_MODE').patchValue(item.NM_MODE);
    this.form.get('NM_PROD').patchValue(item.NM_PROD);
    this.form.get('VL_ITEM').patchValue(item.VL_ITEM);
    this.form.get('NM_FUNC').patchValue(item.NM_USUA);
    this.form.get('NR_MATR_FUNC').patchValue(item.NR_MATR);
  }

  onDeleteResponsavel(index: number) {
    if (this.formResponsaveis.length === 1) {
      this.pnotify.notice('Informe ao menos um responsável.');
      return
    }
    const id = this.form.get('ID_TEIN_OCOR')
    let responsaveis = this.formResponsaveis.at(index).value;
    responsaveis = {...responsaveis,'IN_STAT':'0'}
    if(!responsaveis['ID_RESP']){
      this.formResponsaveis.removeAt(index);
      return;
    }
    this.loadingNavBar= true;
    this.ocorrenciaService
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

  async postDocumentos(id: number) {
    let requests = [];

    if (this.formData.length === 0) {
      return requests;
    }

    const promise = () => {
      this.formData.forEach((element) => {
        requests.push(this.ocorrenciaService.postDocumento(element, id));
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

  putDocumento(documento: ITecnologiaInformacaoContratosDocumentos) {
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
        this.getDocumentos({
          ID_TEIN_OCOR: this.form.get('ID_TEIN_OCOR').value,
          IN_STAT: '1',
        });
      });
  }

  getDocumentos(params?) {
    this.ocorrenciaService.getDocumento(params).subscribe(
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
    if(!documento.hasOwnProperty('ID_TEIN_OCOR_DOCU')){
      this.formData = this.formData.filter((element:FormData) => {
        return (element.get('file'))['name'] != documento.NM_DOCU ;
      })
    }
    documento.IN_STAT = '0';
    this.documentos.splice(index, 1)
    if(documento.hasOwnProperty('ID_TEIN_OCOR_DOCU')){
      this.putDocumento(documento);
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
