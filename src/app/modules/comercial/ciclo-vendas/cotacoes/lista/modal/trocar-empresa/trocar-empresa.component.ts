import { Component, OnInit, Input } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Observable, EMPTY } from 'rxjs';
import { finalize, take, switchMap } from 'rxjs/operators';

// ngx-bootstrap
import { BsModalRef } from 'ngx-bootstrap/modal';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { ComercialCicloVendasCotacoesService } from '../../../cotacoes.service';
import { ComercialCicloVendasCotacoesListaService } from '../../lista.service';

// Interfaces
import { ICotacao } from '../../models/cotacao';
import { JsonResponse } from 'src/app/models/json-response';

@Component({
  selector: 'comercial-ciclo-vendas-cotacoes-lista-modal-trocar-empresa',
  templateUrl: './trocar-empresa.component.html',
  styleUrls: ['./trocar-empresa.component.scss'],
})
export class ComercialCicloVendasCotacoesListaModalTrocarEmpresaComponent
  implements OnInit {
  @Input('empresas') empresas: any[] = [];
  @Input('depositos') depositos: any[] = [];
  @Input('cotacao') cotacao: ICotacao;

  form: FormGroup;
  submittingForm: boolean;

  filteredDepositos: Array<any> = [];

  constructor(
    private formBuilder: FormBuilder,
    private bsModalRef: BsModalRef,
    private pnotifyService: PNotifyService,
    private confirmModalService: ConfirmModalService,
    private cotacoesService: ComercialCicloVendasCotacoesService,
    private listaCotacoesService: ComercialCicloVendasCotacoesListaService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.setFormBuilder();
  }

  setFormBuilder(): void {
    this.form = this.formBuilder.group({
      codCotacao: [this.cotacao.nrPedido],
      codEmpresa: [this.cotacao.codEmpresa, [Validators.required]],
      codDeposito: [this.cotacao.codDeposito, [Validators.required]],
    });

    this.onChangeEmpresa(this.cotacao.codEmpresa, false);
  }

  onChangeEmpresa(idEmpresa: number, reset = true): void {
    if (reset) this.form.controls.codDeposito.reset();

    this.filteredDepositos = this.depositos.filter(
      (value: any) => value.idEmpresa == idEmpresa
    );

    if (reset) {
      if (this.filteredDepositos.length === 1) {
        this.form.controls.codDeposito.setValue(
          this.filteredDepositos[0]['idDeposito']
        );
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
    if (this.cotacao.codEmpresa === this.form.value.codEmpresa) {
      this.onClose();
      return;
    }

    if (this.form.valid) {
      this.confirmSubmit()
        .asObservable()
        .pipe(
          take(1),
          switchMap((result) => (result ? this.submit() : EMPTY)),
          finalize(() => {
            this.submittingForm = false;
          })
        )
        .subscribe(
          (response: JsonResponse) => {
            if (
              response.hasOwnProperty('success') &&
              response.success === true
            ) {
              const selectedEmpresa = this.empresas.filter((empresa) => {
                if (empresa.idEmpresa === this.form.value.codEmpresa) {
                  return empresa;
                }
              });

              const selectedDeposito = this.depositos.filter((deposito) => {
                if (deposito.idDeposito === this.form.value.codDeposito) {
                  return deposito;
                }
              });
              

              this.listaCotacoesService.updateEmpresaCotacao([
                selectedEmpresa[0].idEmpresa,
                selectedDeposito[0].idDeposito,
                response.data,
              ]);

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

  confirmSubmit(): any {
    return this.confirmModalService.showConfirm(
      null,
      'Confirmar troca da empresa',
      'Deseja realmente prosseguir com a troca de empresa?',
      'Cancelar',
      'Confirmar'
    );
  }

  submit(): Observable<any> {
    this.submittingForm = true;
    return this.cotacoesService.postTrocarEmpresa({
      selectedCodEmpresa: this.form.value.codEmpresa,
      selectedCodDeposito: this.form.value.codDeposito,
      ...this.cotacao,
    });
  }

  onClose(): void {
    this.bsModalRef.hide();
  }
}
