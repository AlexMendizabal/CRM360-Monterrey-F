import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';

@Component({
  selector: 'logistica-estoque',
  templateUrl: './estoque.component.html',
  styleUrls: ['./estoque.component.scss']
})
export class LogisticaEstoqueComponent implements OnInit {
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
