import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'simulador-compras-arames',
  templateUrl: './simulador-compras-arames.component.html',
  styleUrls: ['./simulador-compras-arames.component.scss']
})
export class AbastecimentoSimuladorComprasAramesComponent implements OnInit {
  breadCrumbTree: any = [
    {
      descricao: 'Home',
      routerLink: '/abastecimento/home'
    },
    {
      descricao: 'Simulador de Compras - Arames Ind'
    }
  ];

  private URL_MTCORP = environment.URL_MTCORP;

  loading: boolean = false;

  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  matricula: any = btoa(this.currentUser['info']['matricula']);
  idUsuario: any = btoa(this.currentUser['info']['id']);

  url: string;

  constructor() {
    this.url = `${this.URL_MTCORP}/MTCorp/app_/app/mtcorp/modulos/abastecimento/simuladores/simuladorComprasArames.php?m=${this.matricula}&u=${this.idUsuario}`;
  }

  ngOnInit() {}
}
