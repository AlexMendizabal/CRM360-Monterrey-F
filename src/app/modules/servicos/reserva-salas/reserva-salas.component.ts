import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'servicos-reserva-salas',
  templateUrl: './reserva-salas.component.html',
  styleUrls: ['./reserva-salas.component.scss']
})
export class ServicosReservaSalasComponent implements OnInit {
  breadCrumbTree: any = [
    {
      descricao: 'Home',
      routerLink: '/servicos/home'
    },
    {
      descricao: 'Reserva de Salas'
    }
  ];

  loading: boolean = false;

  private URL_MTCORP = environment.URL_MTCORP;

  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  matricula: any = btoa(this.currentUser['info']['matricula']);
  idUsuario: any = btoa(this.currentUser['info']['id']);

  url: string;

  constructor() {
    this.url = `${this.URL_MTCORP}/MTCorp/app/servicos/reservaSalas/index.php?m=${this.matricula}&u=${this.idUsuario}`;
  }

  ngOnInit() {}
}
