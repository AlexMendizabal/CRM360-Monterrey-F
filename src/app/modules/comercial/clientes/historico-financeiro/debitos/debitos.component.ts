import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Services
import { ComercialClientesHistoricoFinanceiroService } from './../historico-financeiro.service';

@Component({
  selector: 'comercial-clientes-historico-financeiro-debitos',
  templateUrl: './debitos.component.html',
  styleUrls: ['./debitos.component.scss']
})
export class ComercialClientesHistoricoFinanceiroDebitosComponent
  implements OnInit {
  debitos: any = [];
  debitosLoaded: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private historicoFinanceiroService: ComercialClientesHistoricoFinanceiroService
  ) {}

  ngOnInit() {
    this.activatedRoute.parent.params.subscribe(params => {
      this.getDebitos(params['id']);
    });
  }

  getDebitos(id: any) {
    this.historicoFinanceiroService
      .getDebitos(id)
      .subscribe((response: any) => {
        if (response['responseCode'] === 200) {
          this.debitos = response['result'];
        }
        this.debitosLoaded = true;
      });
  }

  classStatusBorder(status: string) {
    let borderClass = '';

    if (status == 'COM NOTA') {
      borderClass = 'border-success';
    } else if (status == 'SEM NOTA') {
      borderClass = 'border-primary';
    }

    return borderClass;
  }
}
