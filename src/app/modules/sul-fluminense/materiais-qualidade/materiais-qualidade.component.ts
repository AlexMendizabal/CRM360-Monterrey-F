import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'materiais-qualidade',
  templateUrl: './materiais-qualidade.component.html',
  styleUrls: ['./materiais-qualidade.component.scss']
})
export class SulFluminenseMateriaisQualidadeComponent implements OnInit {
  breadCrumbTree: any = [
    {
      descricao: 'Home',
      routerLink: '/sul-fluminense/home'
    },
    {
      descricao: 'Recebimento de Bobinas em Qualidade'
    }
  ];

  private URL_MTCORP = environment.URL_MTCORP;

  loading: boolean = false;

  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  matricula: any = btoa(this.currentUser['info']['matricula']);
  idUsuario: any = btoa(this.currentUser['info']['id']);

  url: string;

  constructor() {
    this.url = `${this.URL_MTCORP}/MTCorp/app/modulos/abastecimento/materiaisQualidade.php?m=${this.matricula}&u=${this.idUsuario}`;
  }

  ngOnInit() {}
}
