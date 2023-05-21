import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ComercialClientesService } from 'src/app/modules/comercial/services/clientes.service';
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
import { ComercialCadastrosMateriaisContratoService } from '../contratos.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { ComercialService } from 'src/app/modules/comercial/comercial.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { IContrato, IMateriaisContrato } from '../models/contrato';
import { JsonResponse } from 'src/app/models/json-response';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

@Component({
  selector: 'comercial-cadastros-materiais-contratos-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
})
export class ComercialCadastrosMateriaisContratoFormularioComponent
  implements OnInit, IFormCanDeactivate
{
  public MASKS = MASKS;

  loaderFullScreen = true;
  loaderNavbar: boolean;

  appTitle: string;
  action: string;
  compararData = null;
  breadCrumbTree: Array<Breadcrumb> = [];

  tableConfigAssocMateriais: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 230,
    hover: false,
  };

  form: FormGroup;
  formChanged = false;
  submittingForm = false;
  bsConfig: Partial<BsDatepickerConfig>;
  showMateriais = true;

  clientes = [];
  linhas: Array<any> = [];
  classes: Array<any> = [];

  limparMaterialPrincipal: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private clientesService: ComercialClientesService,
    private formBuilder: FormBuilder,
    private materiaisContratoService: ComercialCadastrosMateriaisContratoService,
    private pnotifyService: PNotifyService,
    private localeService: BsLocaleService,
    private atividadesService: AtividadesService,
    private titleService: TitleService,
    private comercialService: ComercialService,
    private confirmModalService: ConfirmModalService
  ) {
    this.pnotifyService.getPNotify();
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );
  }

  ngOnInit(): void {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.getFilterValues();
    this.getClientes();
    this.setFormBuilder();
    this.titleService.setTitle('Cadastro de contrato de materiais');
  }

  getClientes() {
    this.loaderFullScreen = true;
    this.clientesService
      .getClientes({ situacao: 'Ativo' })
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe(
        (response: any) => {
          if (response.responseCode === 200) {
            this.clientes = response.result.analitico;
            return;
          } else {
            this.clientes = [];
          }
        },
        (error) => {
          this.pnotifyService.error('Erro ao carregar modelos');
          this.clientes = [];
        }
      );
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        this.appTitle = 'Editar contrato';
        this.action = 'update';
      } else {
        this.appTitle = 'Novo contrato';
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
          descricao: 'Contratos',
          routerLink: `/comercial/cadastros/${params.idSubModulo}/materiais/contratos/lista`,
        },
        {
          descricao: this.appTitle,
        },
      ];
    });
  }

  getFilterValues(): void {
    this.materiaisContratoService
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
      const detalhes: IContrato = resolver.data;

      this.form = this.formBuilder.group({
        codContrato: [detalhes.codContrato],
        nomeContrato: [detalhes.nomeContrato, [Validators.required]],
        codCliente: [detalhes.codCliente, [Validators.required]],
        dataInicial: [detalhes.dataInicial, [Validators.required]],
        dataFinal: [detalhes.dataFinal, [Validators.required]],
        motivo: [{ value: detalhes.motivo, disabled: true }],
        quantidade: [detalhes.quantidade, [Validators.required]],
        codSituacao: [detalhes.codSituacao, [Validators.required]],
        codStatus: [
          { value: detalhes.codStatus, disabled: true },
          [Validators.required],
        ],
        assocMateriais: this.formBuilder.array([]),
      });

      this.setMateriais(detalhes.materiais);
    } else {
      this.pnotifyService.error();
      this.location.back();
    }
  }
  comparaData() {
    if (!this.form.get('dataFinal').value) {
      return false;
    } else if (
      this.form.get('dataInicial').value > this.form.get('dataFinal').value
    ) {
      this.compararData = true;
      return this.compararData;
    }
  }

  setMateriais(materiais: IMateriaisContrato[]): void {
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
   */
  onAddMaterial(
    material: IMateriaisContrato,
    manipulateForm: boolean,
    source: string
  ): void {
    if (this.checkMaterialExists(material) === false) {
      this.assocMateriais.push(
        this.formBuilder.group({
          codAssociacao: [material.codAssociacao],
          codMaterial: [material.codMaterial],
          nomeMaterial: [material.nomeMaterial],
          quantidade: [source === 'user' ? 0 : material.quantidade],
          valor: [source === 'user' ? 0 : material.valor],
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

  checkMaterialExists(material: IMateriaisContrato): boolean {
    return this.form.value.assocMateriais.some((el: any) => {
      return el.codMaterial === material.codMaterial;
    });
  }

  onLimparMaterialPrincipal(): void {
    this.limparMaterialPrincipal = true;
    this.onInput();

    this.form.controls.codMaterial.setValue(null);
    this.form.controls.nomeMaterial.setValue(null);

    setTimeout(() => {
      this.limparMaterialPrincipal = false;
    }, 100);
  }

  onDeleteMaterial(index: number): void {
    if (this.submittingForm === false) {
      this.confirmDelete().subscribe((response: boolean) =>
        response ? this.deleteMaterial(index) : null
      );
    }
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
    if (this.form.value.assocMateriais[index].source === 'user') {
      this.assocMateriais.removeAt(index);
    } else if (this.form.value.assocMateriais[index].source === 'application') {
      this.loaderNavbar = true;

      this.activatedRoute.params.subscribe((params: any) => {
        this.materiaisContratoService
          .deleteAssociacao(
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

          this.materiaisContratoService
            .save(this.form.getRawValue(), this.action)
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
    this.onAddMaterial(material, true, 'user');
  }
}
