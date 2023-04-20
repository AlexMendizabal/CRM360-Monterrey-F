import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Services
import { ComercialClientesHistoricoFinanceiroService } from './../historico-financeiro.service';

@Component({
  selector: 'comercial-clientes-historico-financeiro-corte-dobra',
  templateUrl: './corte-dobra.component.html',
  styleUrls: ['./corte-dobra.component.scss']
})
export class ComercialClientesHistoricoFinanceiroCorteDobraComponent
  implements OnInit {
  corteDobra: any = [];
  corteDobraLoaded: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private historicoFinanceiroService: ComercialClientesHistoricoFinanceiroService
  ) {}

  ngOnInit() {
    this.activatedRoute.parent.params.subscribe(params => {
      this.getCorteDobra(params['id']);
    });
  }

  getCorteDobra(id: any) {
    this.historicoFinanceiroService
      .getCorteDobra(id)
      .subscribe((response: any) => {
        if (response['responseCode'] === 200) {
          this.corteDobra = response['result'];
        }
        this.corteDobraLoaded = true;
      });
  }
}
