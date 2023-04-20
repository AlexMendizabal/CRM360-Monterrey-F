import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';

@Component({
  selector: 'saldos-bancos',
  templateUrl: './saldos-bancos.component.html',
  styleUrls: ['./saldos-bancos.component.scss']
})
export class ControladoriaSaldosBancosComponent implements OnInit {

  constructor(
    private route: Router,
    private atividadesService: AtividadesService
  ) { }

  ngOnInit() {
    this.route.navigate(['/controladoria/saldos-bancos']);
    this.atividadesService
      .registrarAcesso()
      .subscribe();
  }

}
