import { Component, OnInit, Input } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';

// ngx-bootstrap
import { BsModalRef } from 'ngx-bootstrap/modal';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { ComercialCicloVendasAutorizacionesService} from '../../../autorizaciones.service';
import { AuthService } from 'src/app/shared/services/core/auth.service';
//import { ComercialCicloVendasCotacoesListaService } from '../../lista.service';

// Interfaces
import { ICotacao } from '../../models/cotacao';
import { take, switchMap, finalize } from 'rxjs/operators';
import { EMPTY, Observable } from 'rxjs';

@Component({
  selector: 'comercial-ciclo-vendas-cotacoes-lista-modal-duplicar-proposta',
  templateUrl: './duplicar-proposta.component.html',
  styleUrls: ['./duplicar-proposta.component.scss'],
})
export class ComercialCicloVendasCotacoesListaModalDuplicarPropostaComponent
  implements OnInit {
  @Input('vendedores') vendedores: any[] = [];
  @Input('cotacao') cotacao: ICotacao;

  user = this.authService.getCurrentUser()['info'];

  form: FormGroup;
  submittingForm: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private bsModalRef: BsModalRef,
    private pnotifyService: PNotifyService,
    private confirmModalService: ConfirmModalService,
    private authService: AuthService,
    private cotacoesService: ComercialCicloVendasAutorizacionesService,
    //private listaCotacoesService: ComercialCicloVendasCotacoesListaService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.setFormBuilder();
  }

  setFormBuilder(): void {
    this.form = this.formBuilder.group({
      codCotacao: [this.cotacao.nrPedido],
      codVendedor: [this.user.idVendedor, [Validators.required]],
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
      this.submit()
        .subscribe({
          next: (response: any) => {
            if (
              response.hasOwnProperty('success') &&
              response.success === true
            ) {
              /* this.listaCotacoesService.updateCotacaoDuplicada([
                response.data,
                this.form.value.codVendedor,
                this.cotacao,
              ]); */

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

  // CÓDIGO COMENTADO POR UMA ALTERAÇÃO ONDE NÂO PRECISA PASSAR O COD VENDEDOR
  // onSubmit(): void {
  //   if (this.form.valid) {
  //     this.confirmSubmit()
  //       .asObservable()
  //       .pipe(
  //         take(1),
  //         switchMap((result) => (result ? this.submit() : EMPawTY)),
  //         finalize(() => {
  //           this.submittingForm = false;
  //         })
  //       )
  //       .subscribe(
  //         (response: any) => {
  //           if (
  //             response.hasOwnProperty('success') &&
  //             response.success === true
  //           ) {
  //             this.listaCotacoesService.updateCotacaoDuplicada([
  //               response.data,
  //               this.form.value.codVendedor,
  //               this.cotacao,
  //             ]);

  //             this.pnotifyService.success();
  //             this.onClose();
  //           } else if (
  //             response.hasOwnProperty('success') &&
  //             response.success === false &&
  //             response.hasOwnProperty('mensagem')
  //           ) {
  //             this.pnotifyService.error(response.mensagem);
  //           } else {
  //             this.pnotifyService.error();
  //           }
  //         },
  //         (error: any) => {
  //           if (error['error'].hasOwnProperty('mensagem')) {
  //             this.pnotifyService.error(error.error.mensagem);
  //           } else {
  //             this.pnotifyService.error();
  //           }
  //         }
  //       );
  //   }
  // }

  confirmSubmit(): any {
    return this.confirmModalService.showConfirm(
      null,
      'Confirmar duplicação',
      'Deseja realmente prosseguir com a duplicação da proposta?',
      'Cancelar',
      'Confirmar'
    );
  }

  submit(): Observable<any> {
    this.submittingForm = true;
    return this.cotacoesService.postDuplicarProposta({
      selectedCodVendedor: this.form.value.codVendedor,
      ...this.cotacao,
    });
  }

  onClose(): void {
    this.bsModalRef.hide();
  }
}
