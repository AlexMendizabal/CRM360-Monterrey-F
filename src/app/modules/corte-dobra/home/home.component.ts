import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'corte-dobra-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class CorteDobraHomeComponent implements OnInit {
  constructor(private atividadesService: AtividadesService) {}

  ngOnInit() {
    this.atividadesService.registrarAcesso().subscribe();
  }
}
