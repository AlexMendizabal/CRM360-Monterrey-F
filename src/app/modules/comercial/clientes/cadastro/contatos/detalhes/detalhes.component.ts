import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { take, switchMap, finalize } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

// ng-brazil
import { MASKS } from 'ng-brazil';

// Services
import { ComercialClientesService } from 'src/app/modules/comercial/services/clientes.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';

@Component({
  selector: 'comercial-clientes-cadastro-contatos-detalhes',
  templateUrl: './detalhes.component.html',
  styleUrls: ['./detalhes.component.scss'],
})
export class ComercialClientesCadastroContatosDetalhesComponent
  implements OnInit {
  public MASKS = MASKS;

  loaderFullScreen = true;

  codCliente: number;

  contatos: Array<any> = [];
  contatosLoaded = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private clientesService: ComercialClientesService,
    private confirmModalService: ConfirmModalService,
    private pnotifyService: PNotifyService,
    private location: Location
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit() {
    this.activatedRoute.parent.parent.params.subscribe((params) => {
      this.codCliente = params.id;
      this.getContatos();
    });
  }

  getContatos() {
    this.clientesService
      .getContatos(this.codCliente)
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
          this.contatosLoaded = true;
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.success === true) {
            this.contatos = response.data;
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
          this.location.back();
        }
      });
  }

  tipoContato(contato: any) {
    let tipoContato = contato.nomeCompleto;

    if (contato.descFuncao != null) {
      if (contato.descSetor != null) {
        tipoContato = `${tipoContato} - ${contato.descFuncao} / ${contato.descSetor}`;
      } else {
        tipoContato = `${tipoContato} - ${contato.descFuncao}`;
      }
    }

    return `(${contato.contatos[0].tipo}) ${tipoContato}`.toUpperCase();
  }

  onDelete(contato: any) {
    let confirm$ = this.confirmModalService.showConfirm(
      'delete',
      'Confirmar exclusão',
      'Deseja realmente prosseguir com a exclusão do contato?',
      'Cancelar',
      'Confirmar'
    );

    confirm$
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) => (result ? this.deleteContato(contato) : EMPTY))
      )
      .subscribe({
        next: (response: any) => {
          if (response.responseCode === 200) {
            this.pnotifyService.success();
            this.getContatos();
          } else if (response.responseCode === 206) {
            this.handleOnDeleteError(response.message);
          } else {
            this.handleOnDeleteError();
          }
        },
        error: (error) => {
          this.handleOnDeleteError('Erro ao excluir contato. Tente novamente!');
        }
      });
  }

  handleOnDeleteError(msg: string = null) {
    this.pnotifyService.error(msg);
    this.loaderFullScreen = false;
    this.contatosLoaded = true;
  }

  deleteContato(contato: any) {
    this.loaderFullScreen = true;
    this.contatosLoaded = false;

    return this.clientesService.deleteContato(
      this.codCliente,
      contato.id,
      contato.idSeqTid
    );
  }
}
