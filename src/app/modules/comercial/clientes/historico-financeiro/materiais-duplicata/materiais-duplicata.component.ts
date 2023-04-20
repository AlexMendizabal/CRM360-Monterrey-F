import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Services
import { ComercialClientesHistoricoFinanceiroService } from './../historico-financeiro.service';

@Component({
  selector: 'comercial-clientes-historico-financeiro-materiais-duplicata',
  templateUrl: './materiais-duplicata.component.html',
  styleUrls: ['./materiais-duplicata.component.scss']
})
export class ComercialClientesHistoricoFinanceiroMateriaisDuplicataComponent
  implements OnInit {
  principal: any = {};
  historicoCobrancas: any = {};
  ocorrenciasDuplicatas: any = {};
  ocorrenciasComerciais: any = {};
  duplicataLoaded: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private historicoFinanceiroService: ComercialClientesHistoricoFinanceiroService
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.historicoFinanceiroService
        .getMateriaisDuplicata(params)
        .subscribe((response: any) => {
          if (response['responseCode'] === 200) {
            this.principal = response['result']['principal'];
            this.historicoCobrancas = response['result']['historicoCobrancas'];
            this.ocorrenciasDuplicatas =
              response['result']['ocorrenciasDuplicatas'];
            this.ocorrenciasComerciais =
              response['result']['ocorrenciasComerciais'];
          }
          this.duplicataLoaded = true;
        });
    });
  }
}
