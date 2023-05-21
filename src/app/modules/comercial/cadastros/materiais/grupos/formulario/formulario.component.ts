import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
  FormArray,
} from '@angular/forms';
import { finalize } from 'rxjs/operators';

// ng-brazil
import { MASKS } from 'ng-brazil';

// Interfaces
import { IFormCanDeactivate } from 'src/app/guards/iform-candeactivate';

// Services
import { ComercialCadastrosMateriaisGrupoService } from '../grupos.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { ComercialService } from 'src/app/modules/comercial/comercial.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { IGrupo } from '../models/grupo';
import { JsonResponse } from 'src/app/models/json-response';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

@Component({
  selector: 'comercial-cadastros-materiais-grupos-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
})
export class ComercialCadastrosMateriaisGrupoFormularioComponent
  implements OnInit, IFormCanDeactivate {
  public MASKS = MASKS;

  loaderFullScreen = true;
  loaderNavbar: boolean;

  appTitle: string;
  breadCrumbTree: Array<Breadcrumb> = [];

  tableConfigAssocMateriais: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 230,
    hover: false,
  };

  tableConfigMateriais: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 243,
  };

  codClasse: number = null;

  form: FormGroup;
  formChanged = false;
  submittingForm: boolean;

  showMateriais = true;

  formMateriais: FormGroup;

  linhas: Array<any> = [];
  classes: Array<any> = [];
  filteredClasses: Array<any> = [];
  materiais: Array<any> = [];
  materiaisLoader: boolean;

  toggleAll = false;
  searching = false;
  firstSearch = false;

  materiaisLista: Array<any> = [];
  materiaisListaLoaded = false;
  materiaisListaEmpty = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private formBuilder: FormBuilder,
    private materiaisGrupoService: ComercialCadastrosMateriaisGrupoService,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private titleService: TitleService,
    private comercialService: ComercialService,
    private confirmModalService: ConfirmModalService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.getFilterValues();
    this.setFormBuilder();
    this.setFormMateriais();
    this.titleService.setTitle('Cadastro de grupo de materiais');
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        this.appTitle = 'Editar grupo de materiais';
      } else {
        this.appTitle = 'Novo grupo de materiais';
      }

      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/comercial/home',
        },
        {
          descricao: 'Cadastros',
          routerLink: `/comercial/cadastros/${params.idSubModulo}`,
        },
        {
          descricao: 'Grupos de materiais',
          routerLink: `/comercial/cadastros/${params.idSubModulo}/materiais/grupos/lista`,
        },
        {
          descricao: this.appTitle,
        },
      ];
    });
  }

  getFilterValues(): void {
    this.materiaisGrupoService
      .getFilterValues()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe((response: any) => {
        if (response[0].responseCode === 200) {
          this.linhas = response[0].result;
        } else {
          this.pnotifyService.error();
          this.location.back();
        }

        if (response[1].responseCode === 200) {
          this.classes = response[1].result;
        } else {
          this.pnotifyService.error();
          this.location.back();
        }
      });
  }

  setFormBuilder(): void {
    const resolver = this.activatedRoute.snapshot.data.detalhes;

    if (resolver.success === true) {
      const detalhes: IGrupo = resolver.data;

      this.form = this.formBuilder.group({
        codGrupo: [detalhes.codGrupo],
        nomeGrupo: [detalhes.nomeGrupo, [Validators.required]],
        precoGrupo: [detalhes.precoGrupo, [Validators.required]],
        codSituacao: [detalhes.codSituacao, [Validators.required]],
        assocMateriais: this.formBuilder.array([]),
      });

      this.setMateriais(detalhes.materiais);
    } else {
      this.pnotifyService.error();
      this.location.back();
    }
  }

  setFormMateriais(): void {
    this.formMateriais = this.formBuilder.group({
      codLinha: [null, [Validators.required]],
      codClasse: [null, [Validators.required]],
      codMaterial: [null, [Validators.required]],
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
    if (this.codClasse === null) {
      this.codClasse = material.codClasse;
    }

    if (this.codClasse === material.codClasse) {
      if (this.checkMaterialExists(material) === false) {
        this.assocMateriais.push(
          this.formBuilder.group({
            codMaterial: [material.codMaterial],
            nomeMaterial: [material.nomeMaterial],
            codClasse: [material.codClasse],
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

        if (manipulateForm) {
          this.form.markAsTouched();
          this.form.markAsDirty();
        }
      }
    } else {
      this.pnotifyService.notice('Associe apenas materiais da mesma classe.');
    }
  }

  checkMaterialExists(material: any): boolean {
    return this.form.value.assocMateriais.some((el: any) => {
      return el.codMaterial === material.codMaterial;
    });
  }

  onLimparAssociacoes(): void {
    const assocMateriais = this.form.get('assocMateriais') as FormArray;
    assocMateriais.clear();
    this.codClasse = null;
  }

  onDeleteMaterial(index: number): void {
    this.confirmDelete().subscribe((response: boolean) =>
      response ? this.deleteMaterial(index) : null
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

  deleteMaterial(index: number) {
    this.assocMateriais.removeAt(index);
    this.form.markAsTouched();
    this.form.markAsDirty();
  }

  onChangeLinha(codLinha: number) {
    this.formMateriais.controls.codClasse.reset();
    this.formMateriais.controls.codClasse.setValue(null);
    this.formMateriais.controls.codClasse.enable();
    this.formMateriais.controls.codClasse.setValidators([Validators.required]);
    this.formMateriais.controls.codClasse.updateValueAndValidity();

    this.formMateriais.controls.codMaterial.reset();
    this.formMateriais.controls.codMaterial.disable();
    this.formMateriais.controls.codMaterial.setValue(null);
    this.formMateriais.controls.codMaterial.updateValueAndValidity();

    this.filteredClasses = this.classes.filter(
      (value: any) => value.idLinha == codLinha
    );
  }

  onChangeClasse(codClasse: number) {
    this.formMateriais.controls.codMaterial.reset();
    this.formMateriais.controls.codMaterial.enable();
    this.formMateriais.controls.codMaterial.setValue(null);
    this.formMateriais.controls.codMaterial.updateValueAndValidity();

    this.getMateriais(codClasse);
  }

  getMateriais(codClasse: number): void {
    if (typeof codClasse !== 'undefined' && codClasse !== null) {
      this.materiaisLoader = true;
      this.materiais = [];

      this.comercialService
        .getMateriais({
          codClasse: codClasse,
          situacao: 'A'
        })
        .pipe(
          finalize(() => {
            this.materiaisLoader = false;
          })
        )
        .subscribe(
          (response: JsonResponse) => {
            if (
              response.hasOwnProperty('success') &&
              response.success === true
            ) {
              this.materiais = response.data;

              this.materiais.unshift({
                codigoMaterial: 0,
                codigoDescricaoMaterial: 'EXIBIR TODOS',
              });

              this.formMateriais.controls.codMaterial.setValue(0);
            } else if (
              response.hasOwnProperty('success') &&
              response.success === false &&
              response.hasOwnProperty('mensagem')
            ) {
              this.pnotifyService.error(response.mensagem);
            } else {
              this.pnotifyService.error();
            }
          },
          (error: any) => {
            if (error['error'].hasOwnProperty('mensagem')) {
              this.pnotifyService.error(error.error.mensagem);
            } else {
              this.pnotifyService.error();
            }
          }
        );
    }
  }

  onFilterMateriais(): void {
    if (this.formMateriais.valid) {
      this.loaderNavbar = true;
      this.searching = true;
      this.materiaisLista = [];
      this.materiaisListaLoaded = false;
      this.materiaisListaEmpty = false;

      let params = {
        codClasse: this.formMateriais.value.codClasse,
      };

      if (this.formMateriais.value.codMaterial !== 0) {
        Object.assign(params, {
          codMaterial: this.formMateriais.value.codMaterial,
        });
      }

      this.comercialService
        .getMateriais(params)
        .pipe(
          finalize(() => {
            this.firstSearch = true;
            this.searching = false;
            this.loaderNavbar = false;
            this.materiaisListaLoaded = true;
          })
        )
        .subscribe(
          (response: JsonResponse) => {
            if (
              response.hasOwnProperty('success') &&
              response.success === true
            ) {
              this.materiaisLista = response.data.map(function (el: any) {
                var o = Object.assign({}, el);
                o.checked = 0;
                return o;
              });

              if (this.materiaisLista.length > 9) {
                this.tableConfigMateriais.fixedHeader = true;
              } else {
                this.tableConfigMateriais.fixedHeader = false;
              }
            } else if (
              response.hasOwnProperty('success') &&
              response.success === false &&
              response.hasOwnProperty('mensagem')
            ) {
              this.pnotifyService.error(response.mensagem);
              this.materiaisListaEmpty = true;
            } else {
              this.pnotifyService.error();
              this.materiaisListaEmpty = true;
            }
          },
          (error: any) => {
            if (error['error'].hasOwnProperty('mensagem')) {
              this.pnotifyService.error(error.error.mensagem);
            } else {
              this.pnotifyService.error();
            }
          }
        );
    }
  }

  onToggleAll() {
    this.toggleAll = !this.toggleAll;

    for (let index = 0; index < this.materiaisLista.length; index++) {
      this.materiaisLista[index].checked = this.toggleAll === true ? 1 : 0;
    }
  }

  onCheckMaterial(index: number, material: any): void {
    this.materiaisLista[index].checked = material.checked == 0 ? 1 : 0;
  }

  onAssociarMateriais(): void {
    this.toggleAll = false;

    for (let index = 0; index < this.materiaisLista.length; index++) {
      if (this.materiaisLista[index].checked === 1) {
        const material = {
          codMaterial: this.materiaisLista[index].codigoMaterial,
          nomeMaterial: this.materiaisLista[index].descricao,
          codClasse: this.materiaisLista[index].codClasse,
        };

        this.onAddMaterial(material, true);
        this.materiaisLista[index].checked = 0;
      }
    }
  }

  onFieldError(field: string): string {
    if (this.onFieldInvalid(field)) {
      return 'is-invalid';
    }

    return '';
  }

  onFieldInvalid(field: any): boolean {
    field = this.form.get(field);

    return field.status == 'INVALID' && field.touched;
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

  onSubmit(): void {
    if (this.form.pristine) {
      this.location.back();
    } else {
      if (this.form.valid) {
        if (this.form.value.assocMateriais.length > 0) {
          this.loaderNavbar = true;
          this.submittingForm = true;

          this.materiaisGrupoService
            .save(this.form.value)
            .pipe(
              finalize(() => {
                this.loaderNavbar = false;
                this.submittingForm = false;
              })
            )
            .subscribe(
              (response: any) => {
                if (
                  response.hasOwnProperty('success') &&
                  response.success === true
                ) {
                  this.form.reset();
                  this.formChanged = false;
                  this.pnotifyService.success(response.mensagem);

                  this.activatedRoute.params.subscribe((params: any) => {
                    let navigateTo: string;

                    if (params.hasOwnProperty('id')) {
                      navigateTo = '../../lista';
                    } else {
                      navigateTo = '../lista';
                    }

                    this.router.navigate([navigateTo], {
                      relativeTo: this.activatedRoute,
                    });
                  });
                } else if (
                  response.hasOwnProperty('success') &&
                  response.success === false
                ) {
                  this.pnotifyService.error(response.mensagem);
                } else {
                  this.pnotifyService.error();
                }
              },
              (error: any) => {
                this.pnotifyService.error();
              }
            );
        } else {
          this.pnotifyService.notice('Associe pelo menos um material.');
        }
      }
    }
  }

  onCancel(): void {
    this.location.back();
  }

  onInput(): void {
    this.formChanged = true;
  }

  formCanDeactivate(): boolean {
    if (this.formChanged) {
      if (confirm('Este cliente no forma parte de tu cartera?')) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  }
}
