import { finalize } from 'rxjs/operators';
import { ComercialIntegracoesServicosIntegracaoMateriaisComponent } from './../../services/associacao-materiais.service';
import { PNotifyService } from './../../../../../../shared/services/core/pnotify.service';
import { RouterService } from './../../../../../../shared/services/core/router.service';

import { DateService } from './../../../../../../shared/services/core/date.service';
import { FormGroup, FormBuilder, FormControl, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { JsonResponse } from 'src/app/models/json-response';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
})
export class ComercialIntegracoesDagdaIntegracaoMateriaisFormularioComponent
  implements OnInit
{
  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  idMtcorp: any = this.currentUser['info']['id'];
  spinnerFullScreen: boolean = true;
  loaderNavbar: boolean = false;
  breadCrumbTree: any = [];
  form: FormGroup;
  data: Date = new Date();
  linhas: Array<any> = [];
  classes: Array<any> = [];
  materiais: [];
  matDagda: Array<any> = [];
  materiaisLista: Array<any> = [];
  teste: {};

  loadingLinhas: boolean;
  loadingClasses: boolean;
  loadingMateriais: boolean;
  loadingDagda = false;
  noResult = false;
  toggleAll = false;
  searchingDagda = false;
  inactiveForDelete = false;
  validForm = false;

  submittingForm: boolean;
  limparMaterialPrincipal: boolean;
  showMateriais = true;

  tableConfigAssocMateriais: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 230,
    hover: false,
  };

  appTitle = 'Cadastro de Associação';

  situacao = [
    {
      cd: '',
      ds: 'Todos',
    },
    {
      cd: 0,
      ds: 'Inativos',
    },
    {
      cd: 1,
      ds: 'Ativos',
    },
  ];

  /* Config Table */
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: false,
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private dateService: DateService,
    private localeService: BsLocaleService,
    private routerService: RouterService,
    private route: Router,
    private pnotify: PNotifyService,
    private location: Location,
    private confirmModalService: ConfirmModalService,
    private associacaoService: ComercialIntegracoesServicosIntegracaoMateriaisComponent
  ) {
    this.form = this.formBuilder.group({
      ID_LINH: [null],
      NM_LINH: [{ value: [null], disabled: true }],
      ID_CLAS: [null],
      NM_CLAS: [{ value: [null], disabled: true }],
      codigoMaterial: [null],
      NM_MATE_TID: [{ value: [null], disabled: true }],
      cdDagda: [null],
      idMatTidDagda: null,
      inCada: null,
      status: 1,
      parametro: 1,
      user: this.idMtcorp,
      codSimilaridade: [null],
      codLinha: [null],
      codClasse: [null],
      codMaterial: [null],
      nomeMaterial: [null],
      codSituacao: [null],
      assocMateriais: this.formBuilder.array([]),
    });
  }

  ngOnInit(): void {
    this.spinnerFullScreen = false;
    this.noResult = true;
    this.onActivatedRoute();
    this.setBreadCrumb();
    this.getFilterValues();
    this.getListaMateriaisDagda();
  }

  onActivatedRoute() {
    const params = this.activatedRoute.snapshot.params;
    if (params.id) {
      //this.form.get('idMatTidDagda').setValue(params.id);

      this.getAssociacao(params.id);
    }
  }

  onCancel() {
    this.route.navigate(
      ['/comercial/integracoes/dagda/${id}/integracao-materiais'],
      {
        relativeTo: this.activatedRoute,
      }
    );
  }

  setBreadCrumb() {
    const id = this.activatedRoute.snapshot.params.idSubModulo;
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: `/comercial/home`,
      },
      {
        descricao: 'Integração Dagda',
        routerLink: `/comercial/integracoes/dagda/${id}`,
      },
      {
        descricao: 'Integração de Materiais',
        routerLink: `/comercial/integracoes/dagda/${id}/integracao-materiais`,
      },
      {
        descricao: this.appTitle,
      },
    ];
  }

  getParams() {
    let _params = {};
    let _obj = this.form.value;

    for (let prop in _obj) {
      if (_obj[prop]) {
        if (_obj[prop] instanceof Date)
          _params[prop] = this.dateService
            .convertToBrazilianDate(_obj[prop])
            .substring(0, 10);
        if (_obj[prop] instanceof Array) _params[prop] = _obj[prop].toString();
        else _params[prop] = _obj[prop];
      }
    }

    return _params;
  }

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

  resetDagda() {
    if (this.form.get('cdDagda').value.length == 0)
      this.getListaMateriaisDagda(this.getParams());
  }

  getMateriaisDagda() {
    this.matDagda = [];
    this.searchingDagda = true;
    let param = this.getParams();
    this.associacaoService.getMateriaisDagda(param).subscribe((response) => {
      if (response.body['success'] == true) {
        //this.matDagda = response.body['data'];
        this.searchingDagda = false;

        this.matDagda = response.body['data'].map(function (el: any) {
          var o = Object.assign({}, el);
          o.checked = 0;
          return o;
        });
      } else {
        this.pnotify.notice('Nenhum material Dagda foi encontrado!');
        this.searchingDagda = false;
      }
    });
  }

  getListaMateriaisDagda(param?) {
    this.loadingDagda = true;
    param = param == null ? '' : param;
    this.associacaoService.getMateriaisDagda(param).subscribe((response) => {
      if (response.body['success'] == true) {
        this.loadingDagda = false;
        this.materiaisLista = response.body['data'];
      } else {
        this.pnotify.notice('Nenhum material Dagda foi encontrado!');
        this.loadingDagda = false;
      }
    });
  }

  getAssociacao(params) {
    let param = { codigoMaterial: params };
    this.associacaoService
      .getAssociacao(param)
      .pipe(
        finalize(() => {
          this.spinnerFullScreen = false;
        })
      )
      .subscribe((response) => {
        this.altera(response.body['data'][0]);
      });
  }

  altera(param) {
    this.form.controls['idMatTidDagda'].setValue(param.ID_MATE_TID_DAGD);
    this.form.controls['ID_LINH'].setValue(param.ID_LINH);
    this.form.controls['codLinha'].setValue(param.NM_LINH);
    this.form.controls['ID_CLAS'].setValue(param.ID_CLAS);
    this.form.controls['NM_CLAS'].setValue(param.NM_CLAS);
    this.form.controls['codMaterial'].setValue(param.ID_MATE_TID);
    this.form.controls['nomeMaterial'].setValue(param.NM_MATE_TID);
    this.form.controls['status'].setValue(param.IN_STAT);
    this.getDetalhes(param.ID_MATE_TID);
  }

  onSubmit() {
    const params = {
      idMatTidDagda: this.form.get('idMatTidDagda').value,
      codigoMaterial: this.form.get('codMaterial').value,
      cdDagda: this.form.get('assocMateriais').value,
      user: this.form.get('user').value,
      stat: this.form.get('status').value,
    };

    this.loaderNavbar = true;
    this.associacaoService
      .onSubmit(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (response['status'] == 200)
            this.pnotify.success(response.body['mensagem']);
          this.location.back();
        },
        error: (error) => this.pnotify.error(),
      });
  }

  onLoaderNavbar(event: boolean): void {
    this.loaderNavbar = event;
  }

  materialPrincipal(material: any): void {
    this.onInput();

    this.form.controls.codLinha.setValue(material.codLinha);
    this.form.controls.codClasse.setValue(material.codClasse);
    this.form.controls.codMaterial.setValue(material.codigoMaterial);
    this.form.controls.nomeMaterial.setValue(material.descricao);

    //Valida informação para ativar o botão de salvar
    if (
      this.form.value.assocMateriais.length > 0 &&
      this.form.get('codMaterial').value !== null
    ) {
      this.validForm = true;
    }
    // fim da validação
  }

  materialAssociado(material: any): void {
    this.onAddMaterial(material, true);
  }

  onInput() {}

  getFilterValues(): void {
    this.associacaoService
      .getFilterValues()
      .pipe(
        finalize(() => {
          this.spinnerFullScreen = false;
        })
      )
      .subscribe((response: any) => {
        if (response[0].responseCode === 200) {
          this.linhas = response[0].result;
        } else {
          this.pnotify.error();
          this.location.back();
        }

        if (response[1].responseCode === 200) {
          this.classes = response[1].result;
        } else {
          this.pnotify.error();
          this.location.back();
        }
      });
  }

  setMateriais(materiais: any): void {
    if (materiais.length > 0) {
      for (let i = 0; i < materiais.length; i++) {
        this.onAddMaterial(materiais[i]);
      }
    }
  }

  get assocMateriais(): FormArray {
    return this.form.get('assocMateriais') as FormArray;
  }

  onAddMaterial(material: any, manipulateForm?: boolean): void {
    if (this.checkMaterialExists(material) === false) {
      this.assocMateriais.push(
        this.formBuilder.group({
          codMaterial: [material.codMaterial],
          nomeMaterial: [material.nomeMaterial],
        })
      );

      if (this.form.value.assocMateriais.length > 9) {
        if (this.tableConfigAssocMateriais.fixedHeader === false) {
          this.showMateriais = false;
          this.tableConfigAssocMateriais.fixedHeader = true;

          setTimeout(() => {
            this.showMateriais = true;
          }, 1);
        }
      }

      //Valida informação para ativar o botão de salvar
      if (
        this.form.value.assocMateriais.length > 0 &&
        this.form.get('codMaterial').value !== null
      ) {
        this.validForm = true;
      }
      // fim da validação

      if (manipulateForm) {
        this.form.markAsTouched();
        this.form.markAsDirty();
      }
    } else {
      //this.pnotify.notice('Associe apenas materiais da mesma classe.');
    }
  }

  checkMaterialExists(material: any): boolean {
    return this.form.value.assocMateriais.some((el: any) => {
      return el.codMaterial === material.codMaterial;
    });
  }

  onToggleAll() {
    this.toggleAll = !this.toggleAll;

    for (let index = 0; index < this.matDagda.length; index++) {
      this.matDagda[index].checked = this.toggleAll === true ? 1 : 0;
    }
  }

  onCheckMaterial(index: number, lista: any): void {
    this.matDagda[index].checked = lista.checked == 0 ? 1 : 0;
  }

  onAssociarMateriais(): void {
    this.toggleAll = false;

    for (let index = 0; index < this.matDagda.length; index++) {
      if (this.matDagda[index].checked === 1) {
        const material = {
          codMaterial: this.matDagda[index].CD_MATE,
          nomeMaterial: this.matDagda[index].NM_MATE,
        };
        this.materialAssociado(material);
        this.matDagda[index].checked = 0;
        this.inactiveForDelete = false;
      }
    }
  }

  onLimparMaterialPrincipal(): void {
    this.limparMaterialPrincipal = true;

    this.form.controls.codMaterial.setValue(null);
    this.form.controls.nomeMaterial.setValue(null);

    setTimeout(() => {
      this.limparMaterialPrincipal = false;
    }, 100);
  }

  getDetalhes(param) {
    param = { codigoMaterial: param };
    let material: any = [];
    this.associacaoService.getDetalhes(param).subscribe((response) => {
      if (response.status == 200) {
        response.body['data'].forEach((e) => {
          material.push({
            codMaterial: e.ID_MATE_DAGD,
            nomeMaterial: e.NM_MATE_DAGD,
          });
        });
        this.setMateriais(material);
      }
    });
  }

  onDeleteMaterial(index: number, param): void {
    this.inactiveForDelete = true;
    this.deleteMaterial(index);
    this.getDetalhesDagd(param);
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

  deleteMaterial(index: number) {
    this.assocMateriais.removeAt(index);
    this.form.markAsTouched();
    this.form.markAsDirty();
  }

  getDetalhesDagd(item) {
    let param = { codigoMaterial: item };
    this.associacaoService.getDetalhes(param).subscribe((response) => {
      if (response.status == 200) {
        this.deleteAssociacao(response.body['data'][0]);
      } else {
        this.pnotify.success('Associação removida com sucesso');
      }
    });
  }

  deleteAssociacao(item): void {
    let param = item;

    const params = {
      idMatTidDagda: param.ID,
      cdMatTid: param.ID_MATE_TID,
      cdMatDagda: param.ID_MATE_DAGD,
      user: this.idMtcorp,
    };

    this.associacaoService.deleteAssociacao(params).subscribe((response) => {
      this.pnotify.success('Associação removida com sucesso');
      this.getDetalhes(param.ID_MATE_TID);

      if (this.form.value.assocMateriais.length > 0) {
        this.inactiveForDelete = false;
      }
    });
  }
}
