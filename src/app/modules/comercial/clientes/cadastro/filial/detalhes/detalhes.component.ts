import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';

// Services
import { ComercialClientesService } from 'src/app/modules/comercial/services/clientes.service';

@Component({
  selector: 'comercial-clientes-cadastro-filial-detalhes',
  templateUrl: './detalhes.component.html',
  styleUrls: ['./detalhes.component.scss']
})
export class ComercialClientesCadastroFilialDetalhesComponent
  implements OnInit {
  loaderFullScreen: boolean = true;

  tipoEmpresa: string = '';
  tipoEmpresaLoaded: boolean = false;

  filiais: any = [];
  filial: any = {};

  constructor(
    private activatedRoute: ActivatedRoute,
    private clientesService: ComercialClientesService
  ) {}

  ngOnInit() {
    this.activatedRoute.parent.parent.params.subscribe(params => {
      this.clientesService
        .getFilial(params['id'])
        .pipe(
          finalize(() => {
            this.loaderFullScreen = false;
            this.tipoEmpresaLoaded = true;
          })
        )
        .subscribe((response: any) => {
          if (response['responseCode'] === 200) {
            if (Object.keys(response['result']['matriz']).length > 0) {
              this.tipoEmpresa = 'filial';
              this.filial = response['result']['matriz'];
            } else if (Object.keys(response['result']['filial']).length > 0) {
              this.tipoEmpresa = 'matriz';
              this.filiais = response['result']['filial'];
            }
          }
        });
    });
  }
}
