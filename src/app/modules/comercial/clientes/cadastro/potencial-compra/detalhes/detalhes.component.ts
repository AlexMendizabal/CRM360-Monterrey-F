import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialClientesService } from 'src/app/modules/comercial/services/clientes.service';

@Component({
  selector: 'comercial-clientes-cadastro-potencial-compra-detalhes',
  templateUrl: './detalhes.component.html',
  styleUrls: ['./detalhes.component.scss']
})
export class ComercialClientesCadastroPotencialCompraDetalhesComponent
  implements OnInit {
  loaderFullScreen: boolean = true;

  potencialCompra: any = [];
  potencialCompraLoaded: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private pnotifyService: PNotifyService,
    private clientesService: ComercialClientesService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit() {
    this.activatedRoute.parent.parent.params.subscribe(params => {
      this.getPotencialCompra(params['id']);
    });
  }

  getPotencialCompra(id: number) {
    this.clientesService
      .getPotencialCompra(id)
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
          this.potencialCompraLoaded = true;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] === 200) {
            this.potencialCompra = response['result'];
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
          this.router.navigate(['/comercial/clientes/detalhes', id]);
        }
      });
  }

  handleNumber(number: number) {
    let fixedNumber: any;

    if (number == 0 || number == null) {
      fixedNumber = '0.000';
    } else {
      fixedNumber = number.toFixed(3);
    }

    return fixedNumber;
  }
}
