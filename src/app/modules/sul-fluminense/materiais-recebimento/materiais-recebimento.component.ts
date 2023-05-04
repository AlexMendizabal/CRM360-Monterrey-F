import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'materiais-recebimento',
  templateUrl: './materiais-recebimento.component.html',
  styleUrls: ['./materiais-recebimento.component.scss']
})
export class SulFluminenseMateriaisRecebimentoComponent implements OnInit {
  breadCrumbTree: any = [
    {
      descricao: 'Home',
      routerLink: '/sul-fluminense/home'
    },
    {
      descricao: 'Recebimento de Bobinas'
    }
  ];

  private URL_MTCORP = environment.URL_MTCORP;

  loading: boolean = false;

  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  matricula: any = btoa(this.currentUser['info']['matricula']);
  idUsuario: any = btoa(this.currentUser['info']['id']);

  url: string;

  constructor() {
    this.url = `${this.URL_MTCORP}/MTCorp/app/modulos/abastecimento/materiaisRecebimento.php?m=${this.matricula}&u=${this.idUsuario}`;
  }

  ngOnInit() {}
}
