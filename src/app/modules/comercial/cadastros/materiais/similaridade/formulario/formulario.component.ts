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
import { ComercialCadastrosMateriaisSimilaridadeService } from '../similaridade.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { ISimilaridade } from '../models/similaridade';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

@Component({
  selector: 'comercial-cadastros-materiais-grupos-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
})
export class ComercialCadastrosMateriaisSimilaridadeFormularioComponent
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

  codClasse: number = null;
  codGrupos: number = null;

  form: FormGroup;
  formChanged = false;
  submittingForm: boolean;

  showMateriais = true;

  linhas: Array<any> = [];
  classes: Array<any> = [];
  grupos: Array<any> = [];

  materiaisLista: Array<any> = [];
  materiaisListaLoaded = false;
  materiaisListaEmpty = false;

  limparMaterialPrincipal: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private formBuilder: FormBuilder,
    private materiaisSimilaridadeService: ComercialCadastrosMateriaisSimilaridadeService,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private titleService: TitleService,
    private confirmModalService: ConfirmModalService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.getFilterValues();
    this.setFormBuilder();
    this.titleService.setTitle('Cadastro de similaridade de materiais');
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        this.appTitle = 'Editar similaridade de materiais';
      } else {
        this.appTitle = 'Nova similaridade de materiais';
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
          descricao: 'MATERIALES SIMILARES - UPSELL',
          routerLink: `/comercial/cadastros/${params.idSubModulo}/materiais/similaridade/lista`,
        },
        {
          descricao: this.appTitle,
        },
      ];
    });
  }

  getFilterValues(): void {
    this.materiaisSimilaridadeService
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

        if (response[2].responseCode === 200) {
          this.grupos = response[2].result;
        } else {
          this.pnotifyService.error();
          this.location.back();
        }
      });
  }

  setFormBuilder(): void {
    const resolver = this.activatedRoute.snapshot.data.detalhes;

    if (resolver.success === true) {
      const detalhes: ISimilaridade = resolver.data;

      this.form = this.formBuilder.group({
        codSimilaridade: [detalhes.codSimilaridade],
        codLinha: [detalhes.codLinha],
        codClasse: [detalhes.codClasse],
        codGrupos: [detalhes.codGrupos],
        codMaterial: [{ value: detalhes.codMaterial, disabled: true }],
        nomeMaterial: [{ value: detalhes.nomeMaterial, disabled: true }],
        codSituacao: [detalhes.codSituacao, [Validators.required]],
        assocMateriais: this.formBuilder.array([]),
      });

      this.setMateriais(detalhes.materiais);
    } else {
      this.pnotifyService.error();
      this.location.back();
    }
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

  onLimparMaterialPrincipal(): void {
    this.limparMaterialPrincipal = true;
    this.onInput();

    this.codClasse = null;
    this.form.controls.codMaterial.setValue(null);
    this.form.controls.nomeMaterial.setValue(null);

    setTimeout(() => {
      this.limparMaterialPrincipal = false;
    }, 100);
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
      if (this.checkFormValidation() && this.form.valid) {
        if (this.form.value.assocMateriais.length > 0) {
          this.loaderNavbar = true;
          this.submittingForm = true;

          this.materiaisSimilaridadeService
            .save(this.form.getRawValue())
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
      } else {
        this.pnotifyService.notice('Selecione um material.');
      }
    }
  }

  checkFormValidation(): boolean {
    let isValid = true;

    if (this.form.getRawValue().codMaterial === null) {
      isValid = false;
    }

    return isValid;
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

  onLoaderNavbar(event: boolean): void {
    this.loaderNavbar = event;
  }

  materialPrincipal(material: any): void {
    this.onInput();

    this.form.controls.codLinha.setValue(material.codLinha);
    this.form.controls.codClasse.setValue(material.codClasse);
    this.form.controls.codMaterial.setValue(material.codigoMaterial);
    this.form.controls.nomeMaterial.setValue(material.descricao);
  }

  materialAssociado(material: any): void {
    this.onAddMaterial(material, true);
  }
}
