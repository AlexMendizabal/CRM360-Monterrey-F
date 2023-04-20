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
import { Component, OnInit, TemplateRef } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from '@angular/forms';
//rxjs
import { Subscription, forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LogisticaEntradaMateriaisTiposConformidadeService } from '../services/tipos-conformidade.service';
//interfaces
import { ILogisticaEntradaMateriaisTiposConformidade } from '../models/tiposConformidade';

@Component({
  selector: 'logistica-entrada-materiais-notas-fiscais-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss'],
})
export class LogisticaEntradaMateriaisTiposConformidadeCadastroComponent
  implements OnInit {
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
  loadingUsuarios: boolean;
  formUsuarios: FormGroup;
  //loading
  disabledForm = false;
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
  tiposConformidade: Array<ILogisticaEntradaMateriaisTiposConformidade> = [];

  constructor(
    private formBuilder: FormBuilder,
    private pnotify: PNotifyService,
    private router: Router,
    private modalService: BsModalService,
    private activatedRoute: ActivatedRoute,
    private localeService: BsLocaleService,
    private tiposConformidadeService: LogisticaEntradaMateriaisTiposConformidadeService,
    private titleService: TitleService,
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
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  onActivatedRoute() {
    const _params = this.activatedRoute.snapshot.params;
    if (_params.hasOwnProperty('id')) {
      this.getTiposConformidade({ ID_LOGI_ENMA_FHNC_TIPO: _params['id'] });
      this.getResponsaveis({ ID_LOGI_ENMA_FHNC_TIPO: _params['id'] , IN_STAT:'1'});
    } else { 
      this.onAddResponsavel();
    } 
  }


  getTiposConformidade(params?: Partial<ILogisticaEntradaMateriaisTiposConformidade>) {
    this.loading = true;
    const _params = params ?? {};
    this.tiposConformidadeService
      .getTiposConformidade(_params)
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
            this.tiposConformidade = [];
            return;
          }
          const _tipoConformidade = response.body['data'][0];
          this.form.patchValue(_tipoConformidade) 
          this.noResult = false;
        },
        (error) => {
          this.pnotify.error();
          this.noResult = true;
        }
      );
  }

  getResponsaveis(params?) {
    this.loadingNavBar = true;
    this.tiposConformidadeService
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
        descricao: 'Tipos de Não Conformidade',
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
      ID_LOGI_ENMA_FHNC_TIPO: [null],
      NM_TIPO : [null, [Validators.required]],
      IN_STAT: [null], 
      DS_OBSE: [null],
      NR_MATR: [null],
      NM_USUA: [null],
      DT_INCL: [null],
      responsaveis: this.formBuilder.array([]),
    });
    this.formUsuarios = this.formBuilder.group({
      buscarPor: ['nome'],
      pesquisa: [null, Validators.required],
      matricula:[null],
      nome:[null],
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

  getUsuarios(params) {
    const _params = params ?? {};
    _params. situacao = '1';
    _params. qtItensPagina = 100;
    const _obj = this.formUsuarios.value;
    this.loadingUsuarios = true;
    if (_obj['pesquisa']) _params[_obj['buscarPor']] = _obj['pesquisa'];
    this.tiposConformidadeService
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
    const _usuario = {...usuario,'IN_MATE': false}
    const fg = this.form.get('responsaveis') as FormArray;
    fg.controls[this.index].get('NR_MATR_RESP').patchValue(_usuario.matricula);
    fg.controls[this.index].get('ID_RESP').patchValue(_usuario.id);
    fg.controls[this.index].get('NM_RESP').patchValue(_usuario.nome);
  }

  async postResponsaveis(id:number){
    let request = [];
    const responsaveis = this.formResponsaveis.getRawValue();
    if (!responsaveis){
      return
    }
    const promise = () => {
      responsaveis.forEach(responsavel => {
        const params = {...responsavel,'ID_LOGI_ENMA_FHNC_TIPO':id, IN_STAT: '1'}
        request.push(this.tiposConformidadeService
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
    const id = this.form.get('ID_LOGI_ENMA_FHNC_TIPO')
    let responsaveis = this.formResponsaveis.at(index).value;
    responsaveis = {...responsaveis,'IN_STAT':'0'}
    if(!responsaveis['ID_RESP']){
      this.formResponsaveis.removeAt(index);
      return;
    }
    this.loadingNavBar= true;
    this.tiposConformidadeService
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

  postTiposConformidade() {
    const fg = this.form.get('responsaveis') as FormArray;
    if (fg.controls[0].get('ID_RESP').value == null) {
      this.pnotify.notice('Informe ao menos um responsável.');
      return
    }
    this.loadingNavBar = true;
    let params = JSON.parse(JSON.stringify(this.form.value)) ;
    delete params['responsaveis'];
    this.tiposConformidadeService
      .postTiposConformidade(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response: any) => {
          if (response.status === 200) {
            const id = response.body['data'];
            this.form.get('ID_LOGI_ENMA_FHNC_TIPO').setValue(id);
            if(this.form.get('responsaveis').value[0]['ID_RESP']){
              this.postResponsaveis(id);
            }
            this.router.navigate(['../'], {
              relativeTo: this.activatedRoute,
            });
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
        ID_LOGI_ENMA_FHNC_TIPO: [null],
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
  
}
