import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'relatorio-duplicatas',
  templateUrl: './relatorio-duplicatas.component.html',
  styleUrls: ['./relatorio-duplicatas.component.scss']
})
export class FinanceiroRelatorioDuplicatasComponent implements OnInit {
  breadCrumbTree: any = [
    {
      descricao: 'Home',
      routerLink: '/financeiro/home'
    },
    {
      descricao: 'Relatório de duplicatas'
    }
  ];

  private URL_MTCORP = environment.URL_MTCORP;

  loading: boolean = false;

  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  matricula: any = btoa(this.currentUser['info']['matricula']);
  idUsuario: any = btoa(this.currentUser['info']['id']);

  url: string;

  constructor() {
    this.url = `${this.URL_MTCORP}/MTCorp/app_/app/mtcorp/modulos/financeiro/relatorios/relatorio-duplicatas.php?m=${this.matricula}&u=${this.idUsuario}`;
  }

  ngOnInit() {}
}
