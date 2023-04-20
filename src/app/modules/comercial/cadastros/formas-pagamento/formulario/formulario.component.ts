import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
  FormControl,
  FormArray,
} from '@angular/forms';
import { finalize } from 'rxjs/operators';

// Interfaces
import { IFormCanDeactivate } from 'src/app/guards/iform-candeactivate';

// Services
import { ComercialCadastrosFormasPagamentoService } from '../formas-pagamento.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';

// Interfaces
import { FormasPagamento } from '../models/formas-pagamento';
import { MASKS } from 'ng-brazil';
import { JsonResponse } from 'src/app/models/json-response';

@Component({
  selector: 'comercial-cadastros-formas-pagamento-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
})
export class ComercialCadastrosFormasPagamentoFormularioComponent
  implements OnInit, IFormCanDeactivate, OnChanges {
    public MASKS = MASKS;

  @Input('codTipoPerc') codTipoPerc: number;


  loaderNavbar: boolean;
  loaderFullScreen = true;

  descFormasERP: Array<any> = [];

  appTitle: string;
  breadCrumbTree: Array<any> = [];

  form: FormGroup;
  formChanged = false;
  submittingForm: boolean;

  showSimpleChange:SimpleChanges;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private formBuilder: FormBuilder,
    private formasPagamentoService: ComercialCadastrosFormasPagamentoService,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private titleService: TitleService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.setFormBuilder();
    this.disableValorPerc();
    this.getFormFields();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  teste(){

  }

  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        this.appTitle = 'Editar Forma de Pagamento';
      } else {
        this.appTitle = 'Nova Forma de Pagamento';
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
          descricao: 'Formas de pagamento',
          routerLink: `/comercial/cadastros/${params.idSubModulo}/formas-pagamento/lista`,
        },
        {
          descricao: this.appTitle,
        },
      ];
    });
  }

  setFormBuilder(): void {
    if (this.activatedRoute.snapshot.data.detalhes.success === true) {
      const detalhes: FormasPagamento = this.activatedRoute.snapshot.data
        .detalhes.data;

        if(detalhes.editavel == undefined || detalhes.editavel == null ) {
          detalhes.editavel = 0;
        }

      this.form = this.formBuilder.group({
        codFormaPagamento: [detalhes.codFormaPagamento],
        descricao: [detalhes.descricao, [Validators.required]],
        codFormaPagamentoERP: [detalhes.codFormaPagamentoERP,[Validators.required]],
        percentualAcrescimo: [detalhes.percentualAcrescimo],
        percentuaDesconto: [detalhes.percentualDesconto],
        codTipoPerc: 0,
        codValorPerc: null,
        qtdeParcela: [detalhes.qtdeParcela, [Validators.required]],
        editavel: [detalhes.editavel],
        codTipoDia: [detalhes.codTipoDia, [Validators.required]],
        codSituacao: [detalhes.codSituacao, [Validators.required]],
        qtdeDias: this.formBuilder.array([])

      });

      if (detalhes.qtdeDias && detalhes.qtdeDias.length > 0) {
        this.onAddParcelas(detalhes.qtdeDias);
      }

      if (detalhes.percentualAcrescimo > 0){
        this.form.controls.codTipoPerc.setValue(2);
        this.form.controls.codValorPerc.setValue(detalhes.percentualAcrescimo);
      } else if (detalhes.percentualDesconto > 0){
        this.form.controls.codTipoPerc.setValue(1);
        this.form.controls.codValorPerc.setValue(detalhes.percentualDesconto);
      }


    } else {
      this.pnotifyService.error();
      this.location.back();
    }

    this.loaderFullScreen = false;
  }

  getFormFields(): void {
    this.loaderFullScreen = true;

    this.formasPagamentoService
      .getListaFormasERP()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe((response: JsonResponse) => {
        if (response.success === true) {
          this.descFormasERP = response.data;

          this.descFormasERP.unshift({
            codFormaPagamento: 0,
            descricao: 'NENHUM',
          });
        }
      });
  }

  disableValorPerc() {
    if (this.form.controls.codTipoPerc.value == 0){
      this.form.controls.codValorPerc.disable();
    }
  }

  ngOnChanges(change:SimpleChanges) {
    if (change.codTipoPerc.currentValue > 0) {
      this.onChangePerc();
    }
  }

  onChangePerc(): void {
    if(this.form.controls.codTipoPerc.value > 0){
        this.form.controls.codValorPerc.enable();
        this.form.controls.codValorPerc.setValidators([Validators.required]);
        this.form.controls.codValorPerc.updateValueAndValidity();
    } else if (this.form.controls.codTipoPerc.value == 0){
        this.form.controls.codValorPerc.disable();
        this.form.controls.codValorPerc.setValue(null);
        this.form.controls.codValorPerc.clearValidators();
        this.form.controls.codValorPerc.updateValueAndValidity();

    }
  }

  get qtdeDias() {
    return this.form.get('qtdeDias') as FormArray;
  }


  onAddParcelas(data?: any): void {
    if (!data) {
      this.qtdeDias.clear();
    }

    const qtde: number = this.form.getRawValue().qtdeParcela;

    for (let i = 0; i < qtde; i++) {
      const dias = data ? data[i].dias : null;

      this.qtdeDias.push(
        this.formBuilder.group({
          dias: [dias, [Validators.required]],
        })
      );
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
        this.loaderNavbar = true;
        this.submittingForm = true;


        this.formasPagamentoService
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
                      relativeTo: this.activatedRoute,
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
      if (confirm('Informações não salvas serão perdidas. Deseja continuar?')) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  }
}
