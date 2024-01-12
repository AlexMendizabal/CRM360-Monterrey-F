import { ComercialCadastrosMateriaisGrupoMateriaisAssociadosService } from './../../materiais/grupos-materiais-associados/grupos-materiais-associados.service';
import { CustomTableConfig } from './../../../../../shared/templates/custom-table/models/config';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmModalService } from './../../../../../shared/modules/confirm-modal/confirm-modal.service';
import { Location } from '@angular/common';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
  FormArray,
  FormControl,
} from '@angular/forms';
import { finalize } from 'rxjs/operators';

// Interfaces
import { IFormCanDeactivate } from 'src/app/guards/iform-candeactivate';

// Services

import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';

// Interfaces

import { JsonResponse } from 'src/app/models/json-response';
import { ComercialCadastrosTipoComissionamentoService } from '../tipo-comissionamento.service';

@Component({
  selector: 'comercial-cadastros-tipo-comissionamento-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss']
})
export class ComercialCadastrosTipoComissionamentoFormularioComponent
  implements OnInit, IFormCanDeactivate {
  loaderNavbar: boolean;
  loaderFullScreen = true;

  appTitle: string;
  breadCrumbTree: Array<any> = [];
  dadosPercentual: Array<any> = [];
  show: boolean = false;

  form: FormGroup;
  formPercentual: FormGroup;
  formLinhas: FormGroup;
  formChanged = false;
  submittingForm: boolean;
  codTiposComissionamento: number;
  formPercentualIndex: number = null;
  dadosPerc: boolean = false;
  index: number;

  linhasMaterial: Array<any> = [];
  classesMaterial: Array<any> = [];
  // filteredClasses: Array<any> = [];
  filteredClasses = {};
  formMateriais: FormGroup;

  firstAccess: boolean = false;
  codLinha: number = 0;
  situacao: string;

  tableConfigPercentual: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 230,
    hover: false,
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private formBuilder: FormBuilder,
    private tipoComissionamentoService: ComercialCadastrosTipoComissionamentoService,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private titleService: TitleService,
    private confirmModalService: ConfirmModalService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.getFilterValues();
    this.registrarAcesso();
    this.setBreadCrumb();
    this.setFormBuilder();
    // this.getFormFields();

  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        this.appTitle = 'Editar Tipo de comissionamento';
      } else {
        this.appTitle = 'Novo Tipo de comissionamento';
      }

      this.titleService.setTitle(this.appTitle);

      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/comercial/home'
        },
        {
          descricao: 'Cadastros',
          routerLink: `/comercial/cadastros/${params.idSubModulo}`
        },
        {
          descricao: 'Lista',
          routerLink: `/comercial/cadastros/${params.idSubModulo}/tipos-comissionamento/lista`
        },
        {
          descricao: this.appTitle
        }
      ];
    });
  }

  setFormBuilder(): void {
    if (this.activatedRoute.snapshot.data.detalhes.success === true) {
      const detalhes = this.activatedRoute.snapshot.data.detalhes.data;

      if (detalhes[0].codSituacao != null) {
        this.situacao = detalhes[0].codSituacao.toString();
      }


      this.form = this.formBuilder.group({
        codTipoComissionamento: [detalhes[0].codTipoComissionamento],
        dsTipoComissionamento: [detalhes[0].dsTipoComissionamento, [Validators.required]],
        codSituacao: [this.situacao ? detalhes[0].codSituacao : 1, [Validators.required]],
        linhas: this.formBuilder.array([]),
      });

      this.onAddLinha(null, detalhes);

    } else {
      this.pnotifyService.error();
      this.location.back();
    }

  }


  get linhas(): FormArray {
    return this.form.get('linhas') as FormArray;
  }

  onAddLinha(index?: number, data?: any ) {
    let indexLinhas = 1;


    if (data) {indexLinhas = data.length;};

    for (let i = 0; i < indexLinhas; i++) {
      this.linhas.push(
        this.formBuilder.group({
          codLinha: [ data ? data[i].codLinha : '', [Validators.required]],
          codClasse: [data ? data[i].codClasse : '', [Validators.required]],
          classes: [[]],
          percentual: this.formBuilder.array([]),
      }));


      if (data) {
        for (let indice = 0; indice < data[i].percentual.length; indice++) {
          this.onAddPercentual(index, data[i].percentual[indice], i);
        }
      }
    }
  }

  onAssociarPercentual(data): void {
    const percentualAdd = data.percentual;
    this.percentualAssociado(percentualAdd);
  }

  percentualAssociado(data): void {
    this.onAddPercentual(null, data);
  }

  getPercentual(index: number) {
    return this.linhas.at(index).get("percentual") as FormArray;
  }

  onAddPercentual(index?: number, data?: any, indexLinhas?: number): void {
    let indexData = 0;

    !data ? indexData = index : indexData = indexLinhas;
      this.getPercentual(indexData).push(
        this.formBuilder.group({
          codFaixa: data ? data.codFaixa : null,
          percDescontoDe: [data ? data.percDescontoDe : null, [Validators.required]],
          percDescontoAte: [data ? data.percDescontoAte : null, [Validators.required]],
          percPago: [data ? data.percPago : null, [Validators.required]],
      }));
    }


  onDeleteValor(index?: number, item?: any, indexPercentual?: number, action?) {
    this.loaderNavbar = true;

    let dados = [];
    let valida = [];

    if (action == 'one') {
      dados.push(item);
      valida.push(item);
    } else {
      dados = item;
      valida = item;
    }

    //console.log()

    //console.log(dados);

    this.confirmDelete().subscribe((response: boolean) => {
      if (response) {
        if (dados[0].codFaixa != null) {
          this.tipoComissionamentoService
            .deleteFaixa(dados)
            .pipe(
              finalize(() => {
                this.loaderNavbar = false;
              })
            )
            .subscribe({
              next: (response: JsonResponse) => {
                if (response.success) {
                  // this.form.get('linhas')['controls'][index].get('percentual').clear();
                  // this.form.get('linhas')['controls'][index].splice(0, 1);
                  // this.form.get('linhas')['controls'].splice(index, 1);
                  if (action == 'all') {
                    this.form.get('linhas')['controls'][index].get('percentual').clear();
                    this.form.get('linhas')['controls'].splice(index, 1);
                  } else {
                    this.form.get('linhas')['controls'][index].get('percentual')['controls'].splice(indexPercentual, 1);
                  }
                  
                  if (this.form.get('linhas')['controls'].length < 1) {
                    this.onAddLinha(index,);
                  }

                } else {
                  this.pnotifyService.error();
                }
              },
              error: (error: any) => {
                if (
                  error.error.hasOwnProperty('mensagem') &&
                  (error.mensagem !== null || error.mensagem !== '')
                ) {
                  this.pnotifyService.error(error.error.mensagem);
                } else {
                  this.pnotifyService.error();
                }
              }
            });
          } else {
            // this.form.get('linhas')['controls'][index].get('percentual').clear();
            // this.form.get('linhas')['controls'].splice(index, 1);
            if (action == 'all') {
              this.form.get('linhas')['controls'][index].get('percentual').clear();
              this.form.get('linhas')['controls'].splice(index, 1);
            } else {
              this.form.get('linhas')['controls'][index].get('percentual')['controls'].splice(indexPercentual, 1);
            }
            
          }
          this.loaderNavbar = false;
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

  setFormMateriais(): void {
    this.formMateriais = this.formBuilder.group({
      codLinha: [null, [Validators.required]],
      codClasse: [null, [Validators.required]],
      codMaterial: [null, [Validators.required]],
      checked: [false]
    });
  }

  getFilterValues(): void {
    this.tipoComissionamentoService
      .getFilterValues()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe((response: any) => {
        if (response[0].success === true) {
          this.linhasMaterial = response[0].data;
        } else {
          this.pnotifyService.error();
          this.location.back();
        }

        if (response[1].success === true) {
          this.classesMaterial = response[1].data;
          const linhas = this.form.controls['linhas'].value;

          linhas.forEach((linha, index) => {
            this.onChangeLinha(linha.codLinha, index);
          });


          // this.onChangeLinha();

        } else {
          this.pnotifyService.error();
          this.location.back();
        }
      });
  }

  onChangeLinha(codLinha: number, index: number) {
    const classes = this.classesMaterial.filter(classe => {
      return classe.idLinha == codLinha;
    })
    this.filteredClasses[index] = classes;

    this.filteredClasses[index].unshift({
      idClasse: 0,
      nomeClasse: 'TODOS',
    });
  }


  onSubmit(): void {
    if (this.form.pristine) {
      this.location.back();
    } else {

      if (this.form.valid) {
        this.loaderNavbar = true;
        this.submittingForm = true;

        this.tipoComissionamentoService
          .save(this.form.value)
          .pipe(
            finalize(() => {
              this.loaderNavbar = false;
              this.submittingForm = false;
            })
          )
          .subscribe({
            next: (response: any) => {
              if (
                response.hasOwnProperty('mensagem') &&
                response.hasOwnProperty('success') &&
                response.success === true
              ) {
                this.form.reset();
                this.formChanged = false;
                this.pnotifyService.success(response.mensagem);

                this.activatedRoute.params.subscribe((params: any) => {
                  if (params.hasOwnProperty('id')) {
                    this.location.back();
                  } else {
                    this.router.navigate(['../lista'], {
                      relativeTo: this.activatedRoute
                    });
                  }
                });
              } else if (
                response.hasOwnProperty('mensagem') &&
                response.hasOwnProperty('success') &&
                response.success === false
              ) {
                this.pnotifyService.notice(response.mensagem);
              } else {
                this.pnotifyService.error();
              }
            },
            error: (error: any) => {
              this.pnotifyService.error();
            }
          });
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

  onMoreNestedFieldError(formGroup: string, index: number, formArray: string, indexNested: number, field: string) {
    if (this.onMoreNestedFieldInvalid(formGroup, index, formArray, indexNested, field)) {
      return 'is-invalid';
    }

    return '';
  }

  onMoreNestedFieldInvalid(formGroup: string, index: number, formArray: string, indexNested: number, field: any) {
    let linhaNestedForm: any = this.form.controls[formGroup];
    let percentualNestedForm: any = linhaNestedForm.controls[index].controls[formArray];
    field = percentualNestedForm.controls[indexNested].get(field);

    return field.status == 'INVALID' && field.touched;
  }

  onMoreNestedFieldRequired(formGroup: string, index: number, formArray: string, indexNested: number, field: string) {
    let required = false;
    let formControl = new FormControl();
    let linhaNestedForm: any = this.form.controls[formGroup];
    let percentualNestedForm: any = linhaNestedForm.controls[index].controls[formArray];

    if (percentualNestedForm.controls[indexNested].get(field).validator) {
      let validationResult = percentualNestedForm.controls[indexNested]
        .get(field)
        .validator(formControl);
      required =
        validationResult !== null && validationResult.required === true;
    }

    if (required) {
      return 'is-required';
    }
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
}
