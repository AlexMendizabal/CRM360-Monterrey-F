import { ComercialCicloVendasCotacoesFormularioService } from './../../../../ciclo-vendas/cotacoes/formulario/formulario.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { concat, of, Observable, Subject } from 'rxjs';
import {
  finalize,
  debounceTime,
  distinctUntilChanged,
  tap,
  switchMap,
  catchError,
} from 'rxjs/operators';

// Services

import { JsonResponse } from 'src/app/models/json-response';

@Component({
  selector: 'comercial-gestao-contratos-comerciais-formulario-template-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss'],
})
export class ComercialGestaoContratosComerciaisFormularioTemplateClientesComponent
  implements OnInit {
  @Input('acessoClientes') acessoClientes = false;
  @Input('isDisabled') isDisabled = false;
  @Input('codCliente') codCliente: number = null;
  @Input('visualizar') visualizar: boolean = false;
  @Input('asFormField') asFormField = false;
  @Input('setErrors') setErrors = false;
  @Output('onChange') onChange: EventEmitter<number> = new EventEmitter();
  @Output('onLoad') onLoad: EventEmitter<boolean> = new EventEmitter();

  form: FormGroup;
  carteiraClientes: Array<any> = [];
  clientesLoader: boolean;

  carteiraClientes$: Observable<any>;
  input$: Subject<string> = new Subject<string>();

  constructor(
    private formBuilder: FormBuilder,
    private formularioService: ComercialCicloVendasCotacoesFormularioService
  ) {}

  ngOnInit(): void {
    this.checkCarteiraClientes();
    this.setFormBuilder();
    this.getCarteiraClientes();
  }

  ngOnChanges(event: any): void {
    if (event.codCliente) {
      if (typeof this.form !== 'undefined') {
        this.form.controls.codCliente.setValue(event.codCliente.currentValue);
      }
    }

    if (event.isDisabled) {
      if (typeof this.form !== 'undefined') {
        this.onChangeDisable(event.isDisabled.currentValue);
      }
    }

    if (event.setErrors) {
      if (typeof this.form !== 'undefined') {
        if (event.setErrors.currentValue === true) {
          this.form.controls.codCliente.markAsTouched();
          this.form.controls.codCliente.setErrors({ incorrect: true });
        } else {
          this.form.controls.codCliente.markAsUntouched();
          this.form.controls.codCliente.setErrors(null);
        }
      }
    }
  }

  checkCarteiraClientes(): void {
    const _carteiraClientes = this.formularioService.getCurrentCarteiraClientes();

    if (_carteiraClientes.length > 0) {
      this.carteiraClientes = _carteiraClientes;
    } else {
      this.getCarteiraClientes();

      /* if (this.acessoClientes === false) {
        this.getCarteiraClientes();
      } else {
        this.setAsyncSearch();
      } */
    }
  }

  getCarteiraClientes(): void {
    this.clientesLoader = true;

    this.formularioService
      .getCarteiraClientes()
      .pipe(
        finalize(() => {
          this.clientesLoader = false;
        })
      )
      .subscribe((response: JsonResponse) => {
        if (response.success === true) {
          this.carteiraClientes = response.data;
          this.formularioService.createCarteiraClientes(this.carteiraClientes);
          this.onLoad.emit(true);
        }
      });
  }

  setAsyncSearch(): void {
    this.carteiraClientes$ = concat(
      of([]),
      this.input$.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        tap(() => {
          this.clientesLoader = true;
        }),
        switchMap((termoPesquisa) =>
          this.formularioService.getPesquisaCliente(termoPesquisa).pipe(
            catchError(() => of([])),
            tap(() => {
              this.clientesLoader = false;
            })
          )
        )
      )
    );
  }

  setFormBuilder(): void {
    this.form = this.formBuilder.group({
      codCliente: [{ value: this.codCliente, disabled: this.isDisabled }],
    });

    this.checkValidators();
  }

  checkValidators(): void {
    if (this.asFormField === true) {
      this.form.controls.codCliente.setValidators([Validators.required]);
      this.form.controls.codCliente.updateValueAndValidity();
    }
  }

  onChangeDisable(disabled: boolean): void {
    if (disabled === true) {
      this.form.controls.codCliente.disable();
    } else {
      this.form.controls.codCliente.enable();
    }
  }

  onClear(): void {
    this.form.controls.codCliente.setValue(null);
    this.form.controls.codCliente.markAsUntouched();
    this.onChangeCliente();
  }

  onChangeCliente(): void {
    this.onChange.emit(this.form.value.codCliente);
  }

  onFieldError(field: string) {
    if ((this.asFormField === true && this.onFieldInvalid(field)) != '') {
      return 'is-invalid';
    }

    return '';
  }

  onFieldInvalid(field: any) {
    field = this.form.get(field);

    if (this.asFormField === true && field.errors != null) {
      if (field.errors.hasOwnProperty('incorrect') && field.touched) {
        return 'incorrect';
      }

      if (field.errors.hasOwnProperty('required') && field.touched) {
        return 'required';
      }

      if (field.errors.hasOwnProperty('maxlength') && field.touched) {
        return 'maxlength';
      }
    }

    return '';
  }

  onFieldRequired(field: string) {
    let required = false;
    let formControl = new FormControl();

    if (this.asFormField === true && this.form.controls[field].validator) {
      let validationResult = this.form.controls[field].validator(formControl);
      required =
        validationResult !== null && validationResult.required === true;
    }

    if (required) {
      return 'is-required';
    }
  }
}
