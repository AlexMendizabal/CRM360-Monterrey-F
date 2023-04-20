import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators
} from '@angular/forms';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

// Interfaces
import { IFormCanDeactivate } from 'src/app/guards/iform-candeactivate';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialClientesCadastroDadosRelacionamentoFormularioService } from './formulario.service';
import { ComercialClientesCadastroService } from '../../cadastro.service';
import { ComercialClientesService } from 'src/app/modules/comercial/services/clientes.service';

@Component({
  selector: 'comercial-clientes-cadastro-dados-relacionamento-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss']
})
export class ComercialClientesCadastroDadosRelacionamentoFormularioComponent
  implements OnInit, AfterViewInit, OnDestroy, IFormCanDeactivate {
  private subscriptionCancel: Subscription;
  private subscriptionSubmit: Subscription;

  loaderFullScreen: boolean = true;

  codCliente: number;

  form: FormGroup;
  formChanged: boolean = false;

  tiposAtendimento: any = [];
  periodos: any = [];
  frequenciaContatos: any = [];
  frequenciaVisitas: any = [];
  origensContato: any = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private formService: ComercialClientesCadastroDadosRelacionamentoFormularioService,
    private cadastroService: ComercialClientesCadastroService,
    private location: Location,
    private clientesService: ComercialClientesService,
    private pnotifyService: PNotifyService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit() {
    this.cancelSubscription();
    this.submitSubscription();

    if (this.activatedRoute.snapshot.data['data']['responseCode'] === 200) {
      this.getFormFields();
      this.setFormBuilder(this.activatedRoute.snapshot.data['data']['result']);
      this.activatedRoute.parent.parent.params.subscribe(params => {
        this.codCliente = params['id'];
      });
    } else {
      this.pnotifyService.error();
      this.location.back();
    }
  }

  ngAfterViewInit() {
    this.cadastroService.onNotifyLoaded(true);
  }

  ngOnDestroy() {
    this.subscriptionCancel.unsubscribe();
    this.subscriptionSubmit.unsubscribe();
  }

  getFormFields() {
    this.formService
      .loadDepencies()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
          this.cadastroService.onNotifyLoaded(false);
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response[0]['responseCode'] === 200) {
            this.tiposAtendimento = response[0]['result'];
          } else {
            this.handleFormFieldsError();
          }

          if (response[1]['responseCode'] === 200) {
            this.periodos = response[1]['result'];
          } else {
            this.handleFormFieldsError();
          }

          if (response[2]['responseCode'] === 200) {
            this.frequenciaContatos = response[2]['result'];
          } else {
            this.handleFormFieldsError();
          }

          if (response[3]['responseCode'] === 200) {
            this.frequenciaVisitas = response[3]['result'];
          } else {
            this.handleFormFieldsError();
          }

          if (response[4]['responseCode'] === 200) {
            this.origensContato = response[4]['result'];
          } else {
            this.handleFormFieldsError();
          }
        },
        error: (error: any) => {
          this.handleFormFieldsError();
        }
      });
  }

  handleFormFieldsError() {
    this.pnotifyService.error();
    this.location.back();
  }

  setFormBuilder(data: any) {
    this.form = this.formBuilder.group({
      tipoAtendimento: [data['idTipoAtendimento'], [Validators.required]],
      periodo: [data['idPeriodo'], [Validators.required]],
      diasContato: this.formBuilder.group({
        segunda: [data['diasContato']['segunda'] == 0 ? false : true],
        terca: [data['diasContato']['terca'] == 0 ? false : true],
        quarta: [data['diasContato']['quarta'] == 0 ? false : true],
        quinta: [data['diasContato']['quinta'] == 0 ? false : true],
        sexta: [data['diasContato']['sexta'] == 0 ? false : true],
        sabado: [data['diasContato']['sabado'] == 0 ? false : true]
      }),
      frequenciaContato: [data['idFrequenciaContato'], [Validators.required]],
      frequenciaVisita: [data['idFrequenciaVisita'], [Validators.required]],
      origemContato: [data['idOrigemContato']],
      website: [data['website']],
      obsPropostas: [data['obsPropostas']]
    });
  }

  cancelSubscription() {
    this.subscriptionCancel = this.cadastroService.notifyCancelObservable$.subscribe(
      (response: any) => {
        if (response) {
          this.onCancel();
        }
      }
    );
  }

  submitSubscription() {
    this.subscriptionSubmit = this.cadastroService.notifySubmitObservable$.subscribe(
      (response: any) => {
        if (response) {
          this.onSubmit();
        }
      }
    );
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

  checkValidatorsDiasContato() {
    let validation = false;

    for (let key in this.form.value['diasContato']) {
      if (this.form.value['diasContato'][key] === true) {
        validation = true;
      }
    }

    return validation;
  }

  onCancel() {
    this.location.back();
  }

  onSubmit() {
    if (!this.checkValidatorsDiasContato()) {
      this.pnotifyService.notice('Selecione um dia para contato.');
      return false;
    }

    if (this.form.pristine) {
      this.location.back();
    } else {
      if (this.form.valid) {
        this.cadastroService.onNotifyLoaded(true);

        let formObj = {
          codCliente: this.codCliente,
          tipoAtendimento: this.form.value['tipoAtendimento'],
          periodo: this.form.value['periodo'],
          diasContato: {
            segunda: this.form.value['diasContato']['segunda'] ? 1 : 0,
            terca: this.form.value['diasContato']['terca'] ? 1 : 0,
            quarta: this.form.value['diasContato']['quarta'] ? 1 : 0,
            quinta: this.form.value['diasContato']['quinta'] ? 1 : 0,
            sexta: this.form.value['diasContato']['sexta'] ? 1 : 0,
            sabado: this.form.value['diasContato']['sabado'] ? 1 : 0
          },
          frequenciaContato: this.form.value['frequenciaContato'],
          frequenciaVisita: this.form.value['frequenciaVisita'],
          origemContato: this.form.value['origemContato'],
          website: this.form.value['website'],
          obsPropostas: this.form.value['obsPropostas']
        };

        this.clientesService.updateDadosRelacionamento(formObj).subscribe(
          (response: any) => {
            if (response['responseCode'] === 200) {
              this.onSended();
              this.pnotifyService.success();
              this.cadastroService.onNotifyLoaded(false);
              this.formChanged = false;
              this.location.back();
            } else {
              this.handleSubmitError();
            }
          },
          (error: any) => {
            this.handleSubmitError();
          }
        );
      }
    }
  }

  handleSubmitError() {
    this.pnotifyService.error('Ocorreu um erro ao salvar o cadastro.');
    this.cadastroService.onNotifyLoaded(false);
  }

  onSended() {
    this.cadastroService.onNotifySended(true);
  }
}
