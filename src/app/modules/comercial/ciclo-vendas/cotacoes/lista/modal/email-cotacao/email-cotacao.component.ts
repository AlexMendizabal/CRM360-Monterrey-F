import { Component, OnInit, Input } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { finalize } from 'rxjs/operators';

// ngx-bootstrap
import { BsModalRef } from 'ngx-bootstrap/modal';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialCicloVendasCotacoesService } from '../../../cotacoes.service';


@Component({
  selector: 'comercial-ciclo-vendas-cotacoes-lista-modal-email-cotacao',
  templateUrl: './email-cotacao.component.html',
  styleUrls: ['./email-cotacao.component.scss'],
})
export class ComercialCicloVendasCotacoesListaModalEmailCotacaoComponent
  implements OnInit {
    
  @Input('codCotacao') codCotacao: number;
  @Input('codCliente') codCliente: number;
  @Input('emailsCliente') emailsCliente: any = [];
  @Input('pdf') pdf: any;

  
  form: FormGroup;
  submittingForm: boolean;

  constructor(
    private bsModalRef: BsModalRef,
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private cotacoesService: ComercialCicloVendasCotacoesService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.setFormBuilder();

  }

  setFormBuilder(): void {
    this.form = this.formBuilder.group({
      codCotacao: [this.codCotacao],
      codCliente: [this.codCliente],
      emails: [[], [Validators.required]],
      copiaUsuario: [false],
    });
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
   
    if (this.form.valid) {
      this.submittingForm = true;
      
      let formObj = {
        codCotacao: this.form.value.codCotacao,
        codCliente: this.form.value.codCliente,
        emails: [],
        copiaUsuario: this.form.value.copiaUsuario,
        pdf: this.pdf
      };
      
      for (let i = 0; i < this.emailsCliente.length; i++) {
        for (let x = 0; x < this.form.value.emails.length; x++) {
          if (this.emailsCliente[i].email === this.form.value.emails[x]) {
            formObj.emails.push({
              nome: this.emailsCliente[i].nome,
              email: this.emailsCliente[i].email,
            });
          }
        }
      }
      this.cotacoesService
        .postEmailCotacao(formObj)
        .pipe(
          finalize(() => {
            this.submittingForm = false;
          })
        )
        .subscribe({
          next: (response: any) => {
            if (
              response.hasOwnProperty('success') &&
              response.success === true
            ) {
              this.pnotifyService.success();
              this.onClose();
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
          error: (error: any) => {
            if (error['error'].hasOwnProperty('mensagem')) {
              this.pnotifyService.error(error.error.mensagem);
            } else {
              this.pnotifyService.error();
            }
          }
        });
    }
  }

  onClose(): void {
    this.bsModalRef.hide();
  }
}
