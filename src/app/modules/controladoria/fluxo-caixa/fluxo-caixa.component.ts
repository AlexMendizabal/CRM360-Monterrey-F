import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';

@Component({
  selector: 'fluxo-caixa',
  templateUrl: './fluxo-caixa.component.html',
  styleUrls: ['./fluxo-caixa.component.scss']
})
export class ControladoriaFluxoCaixaComponent implements OnInit {

  constructor(
    private route: Router,
    private atividadesService: AtividadesService
  ) { }

  ngOnInit() {
    this.route.navigate(['/controladoria/fluxo-caixa']);
    this.atividadesService
      .registrarAcesso()
      .subscribe();
  }

}
