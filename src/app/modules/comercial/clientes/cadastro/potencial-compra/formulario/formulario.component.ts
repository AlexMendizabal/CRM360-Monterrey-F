import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, FormControl, FormArray } from '@angular/forms';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';

// Interfaces
import { IFormCanDeactivate } from 'src/app/guards/iform-candeactivate';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialClientesCadastroService } from '../../cadastro.service';
import { ComercialClientesService } from 'src/app/modules/comercial/services/clientes.service';

@Component({
  selector: 'comercial-clientes-cadastro-potencial-compra-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss']
})
export class ComercialClientesCadastroPotencialCompraFormularioComponent
  implements OnInit, AfterViewInit, OnDestroy, IFormCanDeactivate {
  private subscriptionCancel: Subscription;
  private subscriptionSubmit: Subscription;

  loaderFullScreen: boolean = true;

  codCliente: number;

  form: FormGroup;
  formChanged: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
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
      this.activatedRoute.parent.parent.params.subscribe(params => {
        this.codCliente = params['id'];

        this.setFormBuilder(
          this.activatedRoute.snapshot.data['data']['result']
        );
      });
    } else {
      this.pnotifyService.error();
      this.location.back();
    }
  }

  ngAfterViewInit() {
    this.cadastroService.onNotifyLoaded(false);
  }

  ngOnDestroy() {
    this.subscriptionCancel.unsubscribe();
    this.subscriptionSubmit.unsubscribe();
  }

  setFormBuilder(data: any) {
    this.form = this.formBuilder.group({
      linhas: this.formBuilder.array([])
    });

    this.pushLinha(data);
    this.loaderFullScreen = false;
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

  get linhas() {
    return this.form.get('linhas') as FormArray;
  }

  pushLinha(linhas: any) {
    for (let i = 0; i < linhas.length; i++) {
      this.linhas.push(
        this.formBuilder.group({
          codCliente: [this.codCliente],
          id: [linhas[i]['id']],
          descricao: [linhas[i]['descricao']],
          de: [linhas[i]['de']],
          ate: [linhas[i]['ate']]
        })
      );
    }
  }

  checkValidators() {
    let validation = false;

    for (let i = 0; i < this.form.value['linhas'].length; i++) {
      if (this.form.value['linhas'][i]['ate'] > 0) {
        validation = true;
      }
    }

    return validation;
  }

  formCanDeactivate() {
    if (this.formChanged) {
      if (confirm('Este cliente no forma parte de tu cartera?')) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  }

  onCancel() {
    this.location.back();
  }

  onSubmit() {
    if (!this.checkValidators()) {
      this.pnotifyService.notice('Informe pelo menos uma linha.');
      return false;
    }

    if (this.form.pristine) {
      this.location.back();
    } else {
      if (this.form.valid) {
        this.cadastroService.onNotifyLoaded(true);

        this.clientesService
          .updatePotencialCompra(this.form.value['linhas'])
          .subscribe({
            next: (response: any) => {
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
            error: (error: any) => {
              this.handleSubmitError();
            }
          });
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
