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

//rxjs
import { finalize, take, switchMap } from 'rxjs/operators';
import { Subscription, EMPTY, Observable } from 'rxjs';

// Interfaces
import { IFormCanDeactivate } from 'src/app/guards/iform-candeactivate';
import { JsonResponse } from 'src/app/models/json-response';
import { FichaCadastral } from '../models/ficha-cadastral';
import { IAnexo } from '../models/anexo';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

// Services
import { ComercialCadastrosMateriaisFichaCadastralService } from '../ficha-cadastral.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { ComercialService } from 'src/app/modules/comercial/comercial.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';

@Component({
  selector: 'comercial-cadastros-setor-atividade-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
})
export class ComercialCadastrosMateriaisFichaCadastralFormularioComponent
  implements OnInit, IFormCanDeactivate {
  loaderNavbar: boolean;
  loaderFullScreen = true;

  appTitle: string;
  breadCrumbTree: Array<any> = [];

  tableConfigAnexos: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 230,
    hover: false,
  };

  form: FormGroup;
  formChanged = false;
  submittingForm: boolean;
  formData: Array<FormData> = [];

  codMaterial: number;
  showAnexos: boolean = false;

  linhas: Array<any> = [];
  classes: Array<any> = [];

  limparMaterialPrincipal: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private formBuilder: FormBuilder,
    private fichaCadastralService: ComercialCadastrosMateriaisFichaCadastralService,
    private confirmModalService: ConfirmModalService,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private titleService: TitleService,
    private comercialService: ComercialService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.getFilterValues();
    this.setFormBuilder();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        this.appTitle = 'Editar Ficha Cadastral';
      } else {
        this.appTitle = 'Nova Ficha Cadastral';
      }

      this.titleService.setTitle(this.appTitle);

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
          descricao: 'Ficha Cadastral',
          routerLink: `/comercial/cadastros/${params.idSubModulo}/materiais/ficha-cadastral/lista`,
        },
        {
          descricao: this.appTitle,
        },
      ];
    });
  }

  getFilterValues(): void {
    this.fichaCadastralService
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
    if (this.activatedRoute.snapshot.data.detalhes.success === true) {
      const detalhes: FichaCadastral = this.activatedRoute.snapshot.data
        .detalhes.data;

      this.form = this.formBuilder.group({
        codFichaCadastral: [detalhes.codFichaCadastral],
        codMaterial: [detalhes.codMaterial, [Validators.required]],
        nomeMaterial: [detalhes.nomeMaterial],
        descMaterial: [detalhes.descMaterial, [Validators.required]],
        codSituacao: [detalhes.codSituacao, [Validators.required]],
        anexos: this.formBuilder.array([]),
      });

      if (detalhes.codMaterial != null && detalhes.codFichaCadastral != null) {
        this.getAnexos(detalhes.codMaterial);
      }
    } else {
      this.pnotifyService.error();
      this.location.back();
    }

    this.loaderFullScreen = false;
  }

  getAnexos(codMaterial) {
    this.loaderNavbar = true;
    this.showAnexos = false;
    this.fichaCadastralService
      .getAnexos(codMaterial)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (response: JsonResponse) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            this.setAnexos(response.data);
            this.showAnexos = true;
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

  setAnexos(anexos: any): void {
    if (anexos.length > 0) {
      for (let i = 0; i < anexos.length; i++) {
        this.onAddAnexos(anexos[i], true);
      }
    }
  }

  get anexos(): FormArray {
    return this.form.get('anexos') as FormArray;
  }

  onAddAnexos(anexo: any, manipulateForm?: boolean): void {
    if (this.checkAnexoExists(anexo) === false) {
      this.anexos.push(
        this.formBuilder.group({
          codAnexo: [anexo.codAnexo],
          nomeAnexo: [anexo.nomeAnexo],
          linkAnexo: [anexo.linkAnexo],
        })
      );

      if (manipulateForm) {
        this.form.markAsTouched();
        this.form.markAsDirty();
      }
    }
  }

  appendFile(files: FileList) {
    if (files.length === 0) return;
    const fd = new FormData();
    fd.append('file', files[0]);
    this.formData.push(fd);

    this.anexos.push(
      this.formBuilder.group({
        nomeAnexo: [files[0]['name']],
      })
    );
    if (this.showAnexos === false) {
      this.showAnexos = true;
    }
  }

  /* onLimparAnexos(): void {
    const anexos = this.form.get('anexos') as FormArray;
    anexos.clear();
  } */

  checkAnexoExists(anexo: any): boolean {
    return this.form.value.anexos.some((el: any) => {
      return el.codAnexo === anexo.codAnexo;
    });
  }

  onDeleteAnexo(codAnexo: number, index: number): void {
    this.confirmDelete().subscribe((r: boolean) => {
      if (codAnexo) {
        this.loaderNavbar = true;
        this.fichaCadastralService
          .deleteAnexo(codAnexo)
          .pipe(
            finalize(() => {
              this.loaderNavbar = false;
            })
          )
          .subscribe(
            (response: JsonResponse) => {
              if (
                response.hasOwnProperty('success') &&
                response.success === true
              ) {
                r ? this.deleteDocumento(index) : null;
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
      } else {
        r ? this.deleteDocumento(index) : null;
        this.formData.splice(index, 1);
      }
    });
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

  deleteDocumento(index: number) {
    this.anexos.removeAt(index);
    this.form.markAsTouched();
    this.form.markAsDirty();
  }

  buscaMate(): void {
    let codMaterial = this.form.getRawValue().codMaterial;

    if (typeof codMaterial !== 'undefined' && codMaterial !== null) {
      this.loaderNavbar = true;

      this.comercialService
        .getMateriais({
          codMaterial: codMaterial,
        })
        .pipe(
          finalize(() => {
            this.loaderNavbar = false;
          })
        )
        .subscribe(
          (response: JsonResponse) => {
            if (
              response.hasOwnProperty('success') &&
              response.success === true
            ) {
              this.form.controls.nomeMaterial.setValue(
                response.data[0].descricao
              );
              this.form.controls.nomeMaterial.setValidators([
                Validators.required,
              ]);
              this.form.controls.nomeMaterial.updateValueAndValidity();
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

  onSubmit(): void {
    this.codMaterial = null;

    if (this.form.pristine) {
      this.location.back();
    } else {
      if (this.form.valid) {
        this.loaderNavbar = true;
        this.submittingForm = true;
        this.codMaterial = this.form.value.codMaterial;

        this.fichaCadastralService
          .save(this.form.value)
          .pipe(
            finalize(() => {
              this.loaderNavbar = false;
              this.submittingForm = false;
            })
          )
          .subscribe(
            (response: JsonResponse) => {
              if (
                response.hasOwnProperty('success') &&
                response.success === true
              ) {
                if (
                  this.formData.length > 0 &&
                  response.data.codFichaCadastral
                ) {
                  this.onPostAnexos(response.data.codFichaCadastral);
                }

                this.form.reset();
                this.formChanged = false;
                this.pnotifyService.success(response.mensagem);

                this.activatedRoute.params.subscribe((params: any) => {
                  if (params.hasOwnProperty('id')) {
                    this.location.back();
                  } else {
                    this.router.navigate(['../lista'], {
                      relativeTo: this.activatedRoute,
                    });
                  }
                });
              } else if (
                response.hasOwnProperty('success') &&
                response.success === false &&
                response.hasOwnProperty('mensagem')
              ) {
                this.pnotifyService.notice(response.mensagem);
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
  }

  onPostAnexos(codFichaCadastral: number): void {
    if (this.formData.length === 0) {
      this.pnotifyService.notice('Erro');
      return;
    }

    const id = this.form.value.codMaterial;

    this.formData.forEach((element, index) => {
      this.fichaCadastralService
        .postAnexos(element, id, codFichaCadastral)
        .subscribe();
    });
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
    if (this.form.value.codFichaCadastral == null) {
      this.limparMaterialPrincipal = true;
      this.onInput();

      this.form.controls.codMaterial.setValue(null);
      this.form.controls.nomeMaterial.setValue(null);

      setTimeout(() => {
        this.limparMaterialPrincipal = false;
      }, 100);
    } else
      this.pnotifyService.notice(
        'Não é possivel alterar um material já cadastrado'
      );
  }

  materialPrincipal(material: any): void {
    this.onInput();

    /* this.form.controls.codLinha.setValue(material.codLinha);
    this.form.controls.codClasse.setValue(material.codClasse); */
    this.form.controls.codMaterial.setValue(material.codigoMaterial);
    this.form.controls.nomeMaterial.setValue(material.descricao);
  }
}
