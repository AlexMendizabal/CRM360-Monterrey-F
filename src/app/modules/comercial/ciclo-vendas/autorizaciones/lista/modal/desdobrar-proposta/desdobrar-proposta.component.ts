import { Component, OnInit, Input } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { take, switchMap, finalize } from 'rxjs/operators';

// ngx-bootstrap
import { BsModalRef } from 'ngx-bootstrap/modal';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { ComercialCicloVendasAutorizacionesService } from '../../../autorizaciones.service';
//import { ComercialCicloVendasCotacoesListaService } from '../../lista.service';

// Interfaces
import { ICotacao } from '../../models/cotacao';
import { JsonResponse } from 'src/app/models/json-response';

@Component({
  selector: 'comercial-ciclo-vendas-cotacoes-lista-modal-desdobrar-proposta',
  templateUrl: './desdobrar-proposta.component.html',
  styleUrls: ['./desdobrar-proposta.component.scss'],
})
export class ComercialCicloVendasCotacoesListaModalDesdobrarPropostaComponent
  implements OnInit {
  @Input('cotacao') cotacao: ICotacao;
  @Input('materiais') materiais: any[] = [];

  submittingForm: boolean;

  constructor(
    private bsModalRef: BsModalRef,
    private pnotifyService: PNotifyService,
    private confirmModalService: ConfirmModalService,
    private cotacoesService: ComercialCicloVendasAutorizacionesService,
    //private listaCotacoesService: ComercialCicloVendasCotacoesListaService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {}

  onCheckMaterial(index: number, material: any): void {
    this.materiais[index].checked = material.checked == 0 ? 1 : 0;
  }

  onSubmit(): void {
    const selectedMateriais = this.materiais.filter(
      (material) => material.checked === 1
    );

    this.confirmSubmit()
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) =>
          result ? this.submit(selectedMateriais) : EMPTY
        ),
        finalize(() => {
          this.submittingForm = false;
        })
      )
      .subscribe(
        (response: JsonResponse) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            /* this.listaCotacoesService.updateCotacaoDesdobrada([
              response.data,
              this.cotacao,
              selectedMateriais,
            ]);
 */
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

  confirmSubmit(): any {
    return this.confirmModalService.showConfirm(
      null,
      'Confirmar desdobramento da proposta',
      'Deseja realmente prosseguir com o desdobramento da proposta?',
      'Cancelar',
      'Confirmar'
    );
  }

  submit(selectedMateriais: any): Observable<any> {
    this.submittingForm = true;

    return this.cotacoesService.postDesdobrarProposta({
      selectedMateriais,
      ...this.cotacao,
    });
  }

  onClose(): void {
    this.bsModalRef.hide();
  }
}
