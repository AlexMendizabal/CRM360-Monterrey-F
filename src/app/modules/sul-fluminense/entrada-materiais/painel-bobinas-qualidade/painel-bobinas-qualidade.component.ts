import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'painel-bobinas-qualidade',
  templateUrl: './painel-bobinas-qualidade.component.html',
  styleUrls: ['./painel-bobinas-qualidade.component.scss']
})
export class SulFluminensePainelBobinasQualidadeComponent implements OnInit {

  idSubModulo: any;

  breadCrumbTree: any;

  private URL_MTCORP = environment.URL_MTCORP;

  loading: boolean = false;

  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  matricula: any = btoa(this.currentUser['info']['matricula']);
  idUsuario: any = btoa(this.currentUser['info']['id']);

  url: string;

  constructor(
    private activatedRoute: ActivatedRoute
  ) {
    this.url = `${this.URL_MTCORP}/MTCorp/app_/app/mtcorp/modulos/abastecimento/monitores/painelBobinasQualidade.php?m=${this.matricula}&u=${this.idUsuario}`;
  }

  ngOnInit() {
    this.onBreadCumbTree();
  }

  onBreadCumbTree(){
    this.activatedRoute.params.subscribe((params: any) =>{
      this.idSubModulo = params['idSubModulo'];
      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/sul-fluminense/home'
        },
        {
          descricao: 'Entrada de materiais',
          routerLink: `/sul-fluminense/entrada-materiais/${this.idSubModulo}`
        },
        {
          descricao: 'Painel de Bobinas em Qualidade'
        }
      ];
    })
  }
}
