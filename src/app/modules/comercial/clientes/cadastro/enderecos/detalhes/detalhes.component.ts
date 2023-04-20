import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take, switchMap, finalize } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

// ng-brazil
import { MASKS } from 'ng-brazil';

// Services
import { ComercialClientesService } from 'src/app/modules/comercial/services/clientes.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { DateService } from 'src/app/shared/services/core/date.service';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';

@Component({
  selector: 'comercial-clientes-cadastro-enderecos-detalhes',
  templateUrl: './detalhes.component.html',
  styleUrls: ['./detalhes.component.scss']
})
export class ComercialClientesCadastroEnderecosDetalhesComponent
  implements OnInit {
  public MASKS = MASKS;

  loaderFullScreen = true;

  codCliente: number;
  tpEndereco: string;

  enderecos: Array<any> = [];
  enderecosInativos: Array<any> = [];
  enderecosAguardandoAprovacao: Array<any> = [];
  enderecosLoaded: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private clientesService: ComercialClientesService,
    private confirmModalService: ConfirmModalService,
    private pnotifyService: PNotifyService,
    private router: Router,
    private dateService: DateService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit() {
    this.activatedRoute.parent.parent.params.subscribe((params: any) => {
      this.codCliente = params.id;
      this.tpEndereco = params.tpEndereco;
      this.getEnderecos();
    });
  }

  getEnderecos() {
    this.enderecos = [];
    this.enderecosAguardandoAprovacao = [];
    this.enderecosInativos = [];
    this.enderecosLoaded = false;

    this.clientesService
      .getEnderecos(this.codCliente)
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
          this.enderecosLoaded = true;
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          console.log(response);
          if (response.success === true) {
            this.enderecos = response.data.enderecos;

            if (response.data.enderecosAguardando) {
              this.enderecosAguardandoAprovacao =
                response.data.enderecosAguardando;
            }

            if (response.data.enderecosInativos) {
              this.enderecosInativos = response.data.enderecosInativos;
            }
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
          this.router.navigate([
            '/comercial/clientes/detalhes',
            this.codCliente
          ]);
        }
      });
  }

  tipoEndereco(endereco: any) {
    let tipoEndereco: string;

    if (endereco['principal'] == 1) {
      tipoEndereco = 'Endereço principal';
    } else if (endereco['cobranca'] == 1) {
      tipoEndereco = 'Endereço de cobrança';
    } else if (endereco['entrega'] == 1) {
      tipoEndereco = 'Endereço de entrega';

      if (endereco['titulo'] != null && endereco['titulo'].length > 0) {
        tipoEndereco = `${tipoEndereco} (${endereco['titulo']})`;
      }
    }

    return tipoEndereco;
  }

  convertMysqlTime(time: string) {
    return this.dateService.convertMysqlTime(time);
  }

  onDelete(endereco: any) {
    if (endereco.principal == 0) {
      let confirm$ = this.confirmModalService.showConfirm(
        'delete',
        'Confirmar exclusão',
        'Deseja realmente prosseguir com a exclusão do endereço?',
        'Cancelar',
        'Confirmar'
      );

      confirm$
        .asObservable()
        .pipe(
          take(1),
          switchMap(result =>
            result ? this.deleteEndereco(endereco.id) : EMPTY
          )
        )
        .subscribe({
          next: (success) => {
            this.pnotifyService.success();
            this.getEnderecos();
          },
          error: (error) => {
            this.pnotifyService.error(
              'Erro ao excluir endereço. Tente novamente!'
            );
          }
        });
    }
  }

  deleteEndereco(id: number) {
    this.loaderFullScreen = true;
    this.enderecosLoaded = false;

    return this.clientesService.deleteEndereco(this.codCliente, id);
  }
}
