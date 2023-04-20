import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'duplicata-nao-aceita-bol-desc',
  templateUrl: './duplicata-nao-aceita-bol-desc.component.html',
  styleUrls: ['./duplicata-nao-aceita-bol-desc.component.scss']
})
export class FinanceiroDuplicataNaoAceitaBolDescComponent implements OnInit {
  breadCrumbTree: any = [
    {
      descricao: 'Home',
      routerLink: '/financeiro/home'
    },
    {
      descricao: 'Relatório duplicatas emitidas - Não aceita boleto descontado'
    }
  ];

  private URL_MTCORP = environment.URL_MTCORP;

  loading: boolean = false;

  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  matricula: any = btoa(this.currentUser['info']['matricula']);
  idUsuario: any = btoa(this.currentUser['info']['id']);

  url: string;

  constructor() {
    this.url = `${this.URL_MTCORP}/MTCorp/app/modulos/financeiro/duplicatasNaoAceitaBoletoDescontado.php?m=${this.matricula}&u=${this.idUsuario}`;
  }

  ngOnInit() {}
}
