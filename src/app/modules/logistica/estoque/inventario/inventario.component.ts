import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';

@Component({
  selector: 'logistica-estoque-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.scss']
})
export class LogisticaEstoqueInventarioComponent implements OnInit {
  constructor(
    private route: Router,
    private atividadesService: AtividadesService
  ) { }

  ngOnInit() {
    this.route.navigate(['/logistica/estoque/inventario/filtro']);
    this.atividadesService
      .registrarAcesso()
      .subscribe();
  }
}
