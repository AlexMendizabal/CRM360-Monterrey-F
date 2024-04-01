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

// ngx-bootstrap
import { TabDirective } from 'ngx-bootstrap/tabs';

// ng-brazil
import { MASKS } from 'ng-brazil';

// Interfaces
import { IFormCanDeactivate } from 'src/app/guards/iform-candeactivate';

// Services
import { ComercialCadastrosMateriaisCrossSellService } from '../cross-sell.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { ICrossSell } from '../models/cross-sell';
import { JsonResponse } from 'src/app/models/json-response';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

@Component({
  selector: 'comercial-cadastros-materiais-cross-sell-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
})
export class ComercialCadastrosMateriaisCrossSellFormularioComponent
  implements OnInit, IFormCanDeactivate {
  public MASKS = MASKS;

  loaderFullScreen = true;
  loaderNavbar: boolean;

  appTitle: string;
  action: string;
  codGrupos: number = null;

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

  limparMaterialPrincipal: boolean;

  form: FormGroup;
  formChanged = false;
  submittingForm: boolean;

  showMateriais = true;

  linhas: Array<any> = [];
  classes: Array<any> = [];
  grupos: Array<any> = [];

  filteredClasses: Array<any> = [];

  toggleAll = false;
  searching = false;

  materiaisLista: Array<any> = [];
  materiaisListaLoaded = false;
  materiaisListaEmpty = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private formBuilder: FormBuilder,
    private materiaisCrossSellService: ComercialCadastrosMateriaisCrossSellService,
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
    this.titleService.setTitle('Registro de cross-sell de materiales');
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        this.appTitle = 'Editar cross-sell de materiales';
        this.action = 'update';
      } else {
        this.appTitle = 'Nuevo cross-sell de materiales';
        this.action = 'create';
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
          descricao: 'Cross-Sell de materiais',
          routerLink: `/comercial/cadastros/${params.idSubModulo}/materiais/cross-sell/lista`,
        },
        {
          descricao: this.appTitle,
        },
      ];
    });
  }

  getFilterValues(): void {
    this.materiaisCrossSellService
      .getFilterValues()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe((response: any) => {
        if (response[0].responseCode === 200) {
          this.linhas = response[0].result;
          this.linhas.unshift({
            id: 0,
            descricao: 'TODOS',
          });
        } else {
          this.pnotifyService.error();
          this.location.back();
        }

        if (response[1].responseCode === 200) {
          this.classes = response[1].result;
          this.classes.unshift({
            ID: 0,
            NM_SUB_LINH: 'TODOS',
          });
  
        } else {
          this.pnotifyService.error();
          this.location.back();
        }

        if (response[2].responseCode === 200) {
          this.grupos = response[2].result;
          this.grupos.unshift({
            id_linha: 0,
            descricao: 'TODOS',
          });
        } else {
          this.pnotifyService.error();
          this.location.back();
        }
      });
  }

  setFormBuilder(): void {
    const resolver = this.activatedRoute.snapshot.data.detalhes;

    if (resolver.success === true) {
      const detalhes: ICrossSell = resolver.data;

      this.form = this.formBuilder.group({
        codCrossSell: [detalhes.codCrossSell],
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
        this.onAddMaterial(materiais[i], false, 'application');
      }
    }
  }

  get assocMateriais(): FormArray {
    return this.form.get('assocMateriais') as FormArray;
  }

  /**
   * @source = 'application' || 'user'
   * */
  onAddMaterial(material: any, manipulateForm: boolean, source: string): void {
    console.log(material);
    if (this.checkMaterialExists(material) === false) {
      this.assocMateriais.push(
        this.formBuilder.group({
          codAssociacao: [material.codAssociacao],
          codMaterial: [material.codMaterial],
          nomeMaterial: [material.nomeMaterial],
          source: [source],
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
  }

  checkMaterialExists(material: any): boolean {
    return this.form.value.assocMateriais.some((el: any) => {
      return el.codMaterial === material.codMaterial;
    });
  }

  onDeleteMaterial(index: number): void {
    this.confirmDelete().subscribe((response: boolean) =>
      response ? this.deleteMaterial(index) : null
    );
  }

  confirmDelete(): any {
    return this.confirmModalService.showConfirm(
      'delete',
      'Confirmar la eliminación',
      '¿Realmente desea continuar con la eliminación del registro?',
      'Cancelar',
      'Confirmar'
    );
  }

  deleteMaterial(index: number) {
    if (this.form.value.assocMateriais[index].source === 'user') {
      this.assocMateriais.removeAt(index);
    } else if (this.form.value.assocMateriais[index].source === 'application') {
      this.loaderNavbar = true;

      this.activatedRoute.params.subscribe((params: any) => {
        this.materiaisCrossSellService
          .desassociaMaterial(
            params.id,
            this.form.value.assocMateriais[index].codAssociacao
          )
          .pipe(
            finalize(() => {
              this.loaderNavbar = false;
            })
          )
          .subscribe(
            (response: JsonResponse) => {
              if (response.success) {
                this.assocMateriais.removeAt(index);
              } else {
                this.pnotifyService.error();
              }
            },
            (error: any) => {
              if (
                error.error.hasOwnProperty('mensagem') &&
                (error.mensagem !== null || error.mensagem !== '')
              ) {
                this.pnotifyService.error(error.error.mensagem);
              } else {
                this.pnotifyService.error();
              }
            }
          );
      });
    }

    this.form.markAsTouched();
    this.form.markAsDirty();
  }

  onSelectTabMaisVendidos(): void {
    if (this.materiaisListaLoaded && this.materiaisLista.length > 0) return;

    this.onFilterMateriaisMaisVendidos();
  }

  onFilterMateriaisMaisVendidos(): void {
    if (this.form.getRawValue().codMaterial !== null) {
      this.searching = true;
      let params = {
        codMaterial: this.form.getRawValue().codMaterial,
      };

      this.materiaisCrossSellService
        .getMateriais(params)
        .pipe(
          finalize(() => {
            this.searching = false;
            this.loaderNavbar = false;
            this.materiaisListaLoaded = true;
          })
        )
        .subscribe(
          (response: JsonResponse) => {
            //console.log('aqui crossell', response);
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
        };

        this.onAddMaterial(material, true, 'user');
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
    if (this.action === 'update' && this.form.pristine) {
      this.location.back();
    } else {
      if (this.checkFormValidation() && this.form.valid) {
        if (this.form.value.assocMateriais.length > 0) {
          this.loaderNavbar = true;
          this.submittingForm = true;

          this.materiaisCrossSellService
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
          this.pnotifyService.notice('Asociar al menos un material.');
        }
      } else {
        this.pnotifyService.notice('Selecione un material.');
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

  onLimparMaterialPrincipal(): void {
    this.limparMaterialPrincipal = true;
    this.onInput();

    this.form.controls.codMaterial.setValue(null);
    this.form.controls.nomeMaterial.setValue(null);

    this.materiaisLista = [];

    setTimeout(() => {
      this.limparMaterialPrincipal = false;
    }, 100);
  }

  materialPrincipal(material: any): void {
    this.onInput();

    this.form.controls.codLinha.setValue(material.codLinha);
    this.form.controls.codClasse.setValue(material.codClasse);
    this.form.controls.codGrupos.setValue(material.codGrupos);
    this.form.controls.codMaterial.setValue(material.id_material);
    this.form.controls.nomeMaterial.setValue(material.descricao);

    //this.onFilterMateriaisMaisVendidos();
  }

  materialAssociado(material: any): void {
    this.onAddMaterial(material, true, 'user');
  }
}
