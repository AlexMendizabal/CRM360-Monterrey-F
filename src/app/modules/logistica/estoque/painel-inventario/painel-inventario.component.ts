import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';

@Component({
  selector: 'painel-inventario',
  templateUrl: './painel-inventario.component.html',
  styleUrls: ['./painel-inventario.component.scss']
})
export class LogisticaEstoquePainelInventarioComponent implements OnInit {
  constructor(
    private route: Router,
    private atividadesService: AtividadesService
  ) {}

  ngOnInit() {
    this.route.navigate(['/logistica/estoque/painel-inventario/inventario']);
    this.atividadesService.registrarAcesso().subscribe();
  }
}
