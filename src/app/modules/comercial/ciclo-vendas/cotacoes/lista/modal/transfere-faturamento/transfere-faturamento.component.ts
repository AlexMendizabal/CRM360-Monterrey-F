import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { Observable, EMPTY } from 'rxjs';
import { finalize, take, switchMap } from 'rxjs/operators';

// ngx-bootstrap
import { BsModalRef } from 'ngx-bootstrap/modal';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { ComercialCicloVendasCotacoesService } from '../../../cotacoes.service';
import { ComercialCicloVendasCotacoesListaService } from '../../lista.service';
import { ComercialCicloVendasCotacoesFormularioService } from '../../../formulario/formulario.service';

// Interfaces
import { ICotacao } from '../../models/cotacao';

@Component({
  selector: 'comercial-ciclo-vendas-cotacoes-lista-modal-transfere-faturamento',
  templateUrl: './transfere-faturamento.component.html',
  styleUrls: ['./transfere-faturamento.component.scss'],
})
export class ComercialCicloVendasCotacoesListaModalTransfereFaturamentoComponent
  implements OnInit {
  @Input('cotacao') cotacao: any;

  loaded: false;
  submittingForm: boolean;

  constructor(
    private bsModalRef: BsModalRef,
    private pnotifyService: PNotifyService,
    private confirmModalService: ConfirmModalService,
    private cotacoesService: ComercialCicloVendasCotacoesService,
    private listaCotacoesService: ComercialCicloVendasCotacoesListaService,
    private formCotacoesService: ComercialCicloVendasCotacoesFormularioService
  ) {}

  ngOnInit(): void {
    this.onClose();
    this.onSubmit();
  }

  onSubmit(): void {
    this.confirmSubmit()
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) => (result ? this.submit() : EMPTY)),
        finalize(() => {
          this.submittingForm = false;
          this.onClose();
        })
      )
      .subscribe(
        (response: any) => {
          
          if (response.success === true) {
            this.listaCotacoesService.updateTransfereFaturamento([
              this.cotacao
            ]);

            this.pnotifyService.success("Transferido com sucesso!");
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
      'Confirmar transferência para faturamento',
      'Deseja realmente prosseguir com a transferência para faturamento?',
      'Cancelar',
      'Confirmar'
    );
  }

  submit(): Observable<any> {
    this.submittingForm = true;
    return this.cotacoesService.postTransfereFaturamento({
      ...this.cotacao,
    });
  }

  onClose(): void {
    this.bsModalRef.hide();
  }
}
