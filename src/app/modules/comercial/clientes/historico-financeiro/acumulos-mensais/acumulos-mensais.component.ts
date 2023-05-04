import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Services
import { ComercialClientesHistoricoFinanceiroService } from './../historico-financeiro.service';

@Component({
  selector: 'comercial-clientes-historico-financeiro-acumulos-mensais',
  templateUrl: './acumulos-mensais.component.html',
  styleUrls: ['./acumulos-mensais.component.scss']
})
export class ComercialClientesHistoricoFinanceiroAcumulosMensaisComponent
  implements OnInit {
  acumulosMensais: any = {};
  acumulosMensaisLoaded: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private historicoFinanceiroService: ComercialClientesHistoricoFinanceiroService
  ) {}

  ngOnInit() {
    this.activatedRoute.parent.params.subscribe(params => {
      this.getAcumulosMensais(params['id']);
    });
  }

  getAcumulosMensais(id: any) {
    this.historicoFinanceiroService
      .getAcumulosMensais(id)
      .subscribe((response: any) => {
        if (response['responseCode'] === 200) {
          this.acumulosMensais = response['result'];
        }
        this.acumulosMensaisLoaded = true;
      });
  }
}
