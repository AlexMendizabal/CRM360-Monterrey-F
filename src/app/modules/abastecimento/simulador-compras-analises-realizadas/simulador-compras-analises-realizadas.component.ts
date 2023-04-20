import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'simulador-compras-analises-realizadas',
  templateUrl: './simulador-compras-analises-realizadas.component.html',
  styleUrls: ['./simulador-compras-analises-realizadas.component.scss']
})
export class AbastecimentoSimuladorComprasAnalisesRealizadasComponent
  implements OnInit {
  breadCrumbTree: any = [
    {
      descricao: 'Home',
      routerLink: '/abastecimento/home'
    },
    {
      descricao: 'Simuladores de Compras - Consulta de Cenários Armazenados'
    }
  ];

  private URL_MTCORP = environment.URL_MTCORP;

  loading: boolean = false;

  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  matricula: any = btoa(this.currentUser['info']['matricula']);
  idUsuario: any = btoa(this.currentUser['info']['id']);

  url: string;

  constructor() {
    this.url = `${this.URL_MTCORP}/MTCorp/app_/app/mtcorp/modulos/abastecimento/simuladores/listaSimuladorCompras.php?m=${this.matricula}&u=${this.idUsuario}`;
  }

  ngOnInit() {}
}
