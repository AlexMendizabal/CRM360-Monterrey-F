import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take, switchMap, finalize } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

// Services
import { ComercialClientesService } from 'src/app/modules/comercial/services/clientes.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';

@Component({
  selector: 'comercial-clientes-cadastro-anexos-detalhes',
  templateUrl: './detalhes.component.html',
  styleUrls: ['./detalhes.component.scss']
})
export class ComercialClientesCadastroAnexosDetalhesComponent
  implements OnInit {
  loaderFullScreen: boolean = true;

  anexos: any = [];
  anexosLoaded: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private clientesService: ComercialClientesService,
    private confirmModalService: ConfirmModalService,
    private pnotifyService: PNotifyService,
    private router: Router
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit() {
    this.getAnexos();
  }

  getAnexos() {
    this.activatedRoute.parent.parent.params.subscribe(params => {
      this.clientesService
        .getAnexos(params['id'])
        .pipe(
          finalize(() => {
          
            this.loaderFullScreen = false;
          })
        )
        .subscribe((response: any) => {          
          if (response['success'] == true && response['data'].length > 0) {
            
            this.loaderFullScreen = false;
            this.anexos = response['data']; 
            console.log(this.anexos);
            this.anexosLoaded = true;
          
          } else if (response['success'] == true && response['data'].length == 0) {
            this.loaderFullScreen = false;
            this.anexosLoaded = true;
          } else {
            this.pnotifyService.error();
            console.log('erro')
              // this.router.navigate([
              //   '/comercial/clientes/detalhes',
              //   params['id']
              // ]);
          }
        });
    });
  }

  onDelete(anexo: any) {

    let confirm$ = this.confirmModalService.showConfirm(
      'delete',
      'Confirmar exclusão',
      'Deseja realmente prosseguir com a exclusão do anexo?',
      'Cancelar',
      'Confirmar'
    );

    confirm$
      .asObservable()
      .pipe(
        take(1),
        switchMap(result => (result ? this.deleteAnexo(anexo.codAnexo) : EMPTY))
      )
      .subscribe({
        next: (success) => {
          this.pnotifyService.success();
          this.anexos = [];
          this.getAnexos();
        },
        error: (error) => {
          this.pnotifyService.error('Erro ao excluir anexo. Tente novamente!');
        }
      });
  }

  deleteAnexo(id: number) {
    this.loaderFullScreen = true;
    this.anexosLoaded = false;

    return this.clientesService.deleteAnexo(id);
  }
}
