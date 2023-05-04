import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'abastecimento-painel-estoque',
  templateUrl: './painel-estoque.component.html',
  styleUrls: ['./painel-estoque.component.scss']
})
export class AbastecimentoPainelEstoqueComponent implements OnInit {

  idSubModulo;

  breadCrumbTree: any;

  loading: boolean = false;

  private URL_MTCORP = environment.URL_MTCORP;

  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  matricula: any = btoa(this.currentUser['info']['matricula']);
  idUsuario: any = btoa(this.currentUser['info']['id']);

  url: string;

  constructor(
    private activatedRoute: ActivatedRoute
  ) {
    this.url = `${this.URL_MTCORP}/MTCorp/app_/app/mtcorp/modulos/abastecimento/monitores/painelEstoque.php?m=${this.matricula}&u=${this.idUsuario}`;
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
          routerLink: '/abastecimento/home'
        },
        {
          descricao: 'Monitores',
          routerLink: `/abastecimento/monitores/${this.idSubModulo}`
        },
        {
          descricao: 'Painel de Estoque'
        }
      ];
    })
  }
}
