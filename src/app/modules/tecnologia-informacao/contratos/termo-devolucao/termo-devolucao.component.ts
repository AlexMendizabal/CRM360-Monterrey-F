import { ITecnologiaInformacaoOcorrencia } from './../ocorrencia/models/ocorrencia';
import { TecnologiaInformacaoCadastroOcorrenciaService } from './../ocorrencia/services/ocorrencia.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ITecnologiaInformacaoItem } from './../item/models/item';
import { TecnologiaInformacaoCadastroItemService } from './../item/services/item.service';
import { ITecnologiaInformacaoTermoDevolucao } from './models/termo-devolucao';
import { TecnologiaInformacaoFuncionariosService } from './../services/funcionarios.service';
import { DateService } from './../../../../shared/services/core/date.service';
import { PNotifyService } from './../../../../shared/services/core/pnotify.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  FormControl,
} from '@angular/forms';
import { Location } from '@angular/common';
import { PdfService } from './../../../../shared/services/core/pdf.service';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MASKS } from 'ng-brazil';
import { finalize } from 'rxjs/operators';
import { RouterService } from 'src/app/shared/services/core/router.service';

@Component({
  selector: 'termo-devolucao',
  templateUrl: './termo-devolucao.component.html',
  styleUrls: ['./termo-devolucao.component.scss'],
})
export class TecnologiaInformacaoTermoDevolucaoComponent
  implements OnInit {
  constructor(
    private pdfService: PdfService,
    private route: Router,
    private modalService: BsModalService,
    private activatedRoute: ActivatedRoute,
    private funcionarioService: TecnologiaInformacaoFuncionariosService,
    private itensService: TecnologiaInformacaoCadastroItemService,
    private pnotifyService: PNotifyService,
    private ocorrenciaService: TecnologiaInformacaoCadastroOcorrenciaService,
    private routerService: RouterService,
    private formBuilder: FormBuilder,
    private dateService: DateService
  ) {}

  public MASKS = MASKS;

  loaderNavbar: boolean = false;
  tipoVisao: string = 'formulario';
  breadCrumbTree: Array<any> = [];
  appTitle: string;
  form: FormGroup;
  nomeUsuario: string;
  dataFicha: any = [];
  funcionario = [];
  formChanged: boolean = false;
  loaderFullScreen = true;
  loading: boolean;
  index: number;
  modalRef: BsModalRef;
  formPesquisaItem: FormGroup;
  ocorrencias: Array<ITecnologiaInformacaoOcorrencia> = [];
  itens: Array<ITecnologiaInformacaoItem> = [];
  loadingItens = false;

  ngOnInit(): void {
    this.setBreadCrumb();
    this.setFormBuilder();
    this.onActivatedRoute();
  }

  onActivatedRoute(): void {
    const _params = this.activatedRoute.snapshot.params;
    if (!_params.hasOwnProperty('ocorrencia')) return;
    this.getOcorrencia({ ID_TEIN_OCOR: _params['ocorrencia'] });
  }

  onInput() {
    this.formChanged = true;
  }

  formCanDeactivate() {
    if (this.formChanged) {
      if (confirm('Informações não salvas serão perdidas. Deseja continuar?')) {
        return true;
      } else {
        return false;
      }
    }
    return true;
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

  setBreadCrumb() {
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: '/tecnologia-informacao/home',
      },
      {
        descricao: 'Termo de Devolucao',
      },
    ];
  }

  get objetos() {
    return this.form.get('objetos') as FormArray;
  }

  getOcorrencia(params?) {
    this.loading = true;
    this.ocorrenciaService
      .getOcorrencia(params)
      .subscribe(
        (response) => {
          if (response.status === 200) {
            const ocorrencia = response.body['data'][0];
            const observacao = ocorrencia['DS_OBSE']
            this.form.get('DS_OBSE').patchValue(observacao)
            const item = ocorrencia['ID_TECN_INFO_ITEM']
            this.ocorrencias = ocorrencia
            this.getObjetos({ID_TECN_INFO_ITEM: item})
          } else {
            this.ocorrencias = [];
            this.loading = false;
            this.pnotifyService.error();
          }
        },
        (error) => {
          this.pnotifyService.error();
        }
      );
  }

  getObjetos(params) {
    this.loading = true;
    this.itensService
      .getItem(params)
      .subscribe(async (response) => {
        if (response.status !== 200) {
          return;
        }
        const objetos = response['body']['data'];
        const _params = objetos[0]
        this.getFuncionario({ NR_MATR: _params['NR_MATR'] });
        const promise = () => objetos.forEach(() => this.onAddObjeto());
        await Promise.resolve(promise());
        this.form.get('objetos').patchValue(objetos)
         
      },
      (error) => {
        this.pnotifyService.error('Não foi encontrado nenhum material');
      }
    );
  }

  setObjetos(objeto) {
    const fg = this.form.get('objetos') as FormArray;
    fg.controls[this.index].patchValue(objeto);
  }

  onAddObjeto() {
    this.objetos.push(
      this.formBuilder.group({
        NM_ITEM_TIPO:[null, [Validators.required]],
        NM_MODE:[null, [Validators.required]],
        NM_PROD:[null, [Validators.required]],
        VL_ITEM:[null, [Validators.required]],
        CD_ITEM:[null, [Validators.required]],
        quantidadeObj: ['1', [Validators.required]],
      })
    );
  }

  onDeleteObjeto(index: number) {
    if (this.objetos.length > 1) {
      this.objetos.removeAt(index);
    } else {
      this.pnotifyService.notice('Informe ao menos um Objeto.');
    }
  }

  setFormBuilder(): void {
    this.form = this.formBuilder.group({
      NR_MATR: [{ value: [null], disabled: true }, [Validators.required]],
      DS_EMPR_ENDE: [{ value: [null], disabled: true }, [Validators.required]],
      NM_EMPR_BAIR: [{ value: [null], disabled: true }, [Validators.required]],
      NM_EMPR_CIDA: [{ value: [null], disabled: true }, [Validators.required]],
      NM_EMPR_ESTA: [{ value: [null], disabled: true }, [Validators.required]],
      NM_EMPR: [{ value: [null], disabled: true }, [Validators.required]],
      CD_EMPR_EMPR: [{ value: [null], disabled: true }, [Validators.required]],
      NM_FUNC: [{ value: [null], disabled: true }, [Validators.required]],
      CD_USUA_RG: [{ value: [null], disabled: true }, [Validators.required]],
      CD_USUA_CPF: [{ value: null, disabled: true }, [Validators.required]],
      DS_USUA_ENDE: [{ value: [null], disabled: true }, [Validators.required]],
      CD_EMPR_CNPJ: [{ value: null, disabled: true }, [Validators.required]],
      NM_FUNC_BAIR: [{ value: null, disabled: true }, [Validators.required]],
      NM_FUNC_CIDA: [{ value: null, disabled: true }, [Validators.required]],
      NM_FUNC_ESTA: [{ value: null, disabled: true }, [Validators.required]],
      DS_OBSE: [{ value: null, disabled: true }, [Validators.required]],
      objetos: this.formBuilder.array([]),
    });
    this.formPesquisaItem = this.formBuilder.group({
      buscarPor: ['CD_ITEM'],
      pesquisa: [null, Validators.required],
      ID_TECN_INFO_ITEM: [null],
      CD_ITEM: [null],
      NM_ITEM_TIPO: [null],
      NM_MODE: [null],
      NM_PROD: [null],
      ID_TECN_INFO_ITEM_DOCU: [null],
      DS_CONT: [null]
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
            this.pnotifyService.notice('Nenhum registro encontrado!');
            this.itens = [];
          }
        },
        (error) => {
          this.pnotifyService.error();
        }
      );
  }

  onSubmit() {
    let dataHoje = new Date();
    let dataHojeC = this.dateService.getFullDate(dataHoje, null, false);

    if (this.form.valid) {
      this.loaderNavbar = true;
      setTimeout(() => {
        const formData = this.form.getRawValue();

        this.tipoVisao = 'ficha';
        this.dataFicha = {
          NR_MATR: formData['NR_MATR'],
          DS_EMPR_ENDE: formData['DS_EMPR_ENDE'],
          NM_EMPR_BAIR: formData['NM_EMPR_BAIR'],
          NM_EMPR_CIDA: formData['NM_EMPR_CIDA'],
          NM_EMPR_ESTA: formData['NM_EMPR_ESTA'],
          NM_EMPR: formData['NM_EMPR'],
          CD_EMPR_EMPR: formData['CD_EMPR_EMPR'],
          NM_FUNC: formData['NM_FUNC'],
          CD_USUA_RG: formData['CD_USUA_RG'],
          CD_USUA_CPF: formData['CD_USUA_CPF'],
          DS_USUA_ENDE: formData['DS_USUA_ENDE'],
          CD_EMPR_CNPJ: formData['CD_EMPR_CNPJ'],
          NM_FUNC_BAIR: formData['NM_FUNC_BAIR'],
          NM_FUNC_CIDA: formData['NM_FUNC_CIDA'],
          NM_FUNC_ESTA: formData['NM_FUNC_ESTA'],
          DS_OBSE: formData['DS_OBSE'],
          objetos: formData['objetos'],
          dataHoje: [dataHojeC],
        };

        this.formChanged = false;
        this.loaderNavbar = false;
      }, 1000);
    }
  }

  onDownload() {
    this.loaderNavbar = true;
    const _nome = this.form.get('NM_FUNC').value;
    this.pdfService.download('termo-devolucao', `TERMO DE DEVOLUÇÃO - ${_nome}`);

    setTimeout(() => {
      this.loaderNavbar = false;
    }, 500);
  }

  getFuncionario(params?) {
    this.loading = true;
    this.funcionarioService
      .getFuncionario(params)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.funcionario = response.body['data'][0];
          this.form.patchValue(this.funcionario);
        }
      });
  }

  onCancel() {
    this.loaderNavbar = true;
    setTimeout(() => {
      this.tipoVisao = 'formulario';
      this.loaderNavbar = false;
    }, 1000);
  }

  onNestedFieldError(formGroup: string, index: number, field: string) {
    if (this.onNestedFieldInvalid(formGroup, index, field)) {
      return 'is-invalid';
    }

    return '';
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
}
