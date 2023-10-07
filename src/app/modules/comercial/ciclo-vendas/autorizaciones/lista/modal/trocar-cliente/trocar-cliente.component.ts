import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { Observable, EMPTY } from 'rxjs';
import { finalize, take, switchMap } from 'rxjs/operators';

// ngx-bootstrap
import { BsModalRef } from 'ngx-bootstrap/modal';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { ComercialCicloVendasAutorizacionesService } from '../../../autorizaciones.service';
//import { ComercialCicloVendasCotacoesListaService } from '../../lista.service';
import { ComercialCicloVendasCotacoesFormularioService } from '../../../formulario/formulario.service';

// Interfaces
import { ICotacao } from '../../models/cotacao';

@Component({
  selector: 'comercial-ciclo-vendas-cotacoes-lista-modal-trocar-cliente',
  templateUrl: './trocar-cliente.component.html',
  styleUrls: ['./trocar-cliente.component.scss'],
})
export class ComercialCicloVendasCotacoesListaModalTrocarClienteComponent
  implements OnInit {
  @Input('cotacao') cotacao: ICotacao;

  selectedCodCliente: number;

  submittingForm: boolean;

  constructor(
    private bsModalRef: BsModalRef,
    private pnotifyService: PNotifyService,
    private confirmModalService: ConfirmModalService,
    private cotacoesService: ComercialCicloVendasAutorizacionesService,
    //private listaCotacoesService: ComercialCicloVendasCotacoesListaService,
    private formCotacoesService: ComercialCicloVendasCotacoesFormularioService
  ) {}

  ngOnInit(): void {
    this.onChangeCliente(this.cotacao.codCliente);
  }

  onChangeCliente(codCliente: number): void {
    this.selectedCodCliente = codCliente;
  }

  onSubmit(): void {
    if (this.selectedCodCliente === this.cotacao.codCliente) {
      this.onClose();
      return;
    }

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
        (response: any) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            const selectedCliente = this.formCotacoesService
              .getCurrentCarteiraClientes()
              .filter((cliente) => {
                if (cliente.codCliente === this.selectedCodCliente) {
                  return cliente;
                }
              });

            /* this.listaCotacoesService.updateClienteCotacao([
              selectedCliente[0],
              this.cotacao,
            ]); */

            this.pnotifyService.success();
            this.onClose();
          } else if (
            response.hasOwnProperty('success') &&
            response.success === false &&
            response.hasOwnProperty('mensagem') &&
            response.mensagem !== null
          ) {
            this.pnotifyService.error(response.mensagem);
          } else {
            this.pnotifyService.error();
          }
        },
        (error: any) => {
          if (
            error['error'].hasOwnProperty('mensagem') &&
            error['error'].mensagem !== null
          ) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      );
  }

  confirmSubmit(): any {
    return this.confirmModalService.showConfirm(
      null,
      'Confirmar troca de cliente',
      'Deseja realmente prosseguir com a troca de cliente?',
      'Cancelar',
      'Confirmar'
    );
  }

  submit(): Observable<any> {
    this.submittingForm = true;
    return this.cotacoesService.postTrocarCliente({
      selectedCodCliente: this.selectedCodCliente,
      ...this.cotacao,
    });
  }

  onClose(): void {
    this.bsModalRef.hide();
  }
}
