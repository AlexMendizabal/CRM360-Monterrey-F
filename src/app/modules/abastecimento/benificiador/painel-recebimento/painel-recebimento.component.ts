import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'painel-recebimento',
  templateUrl: './painel-recebimento.component.html',
  styleUrls: ['./painel-recebimento.component.scss']
})
export class AbastecimentoPainelRecebimentoComponent implements OnInit {
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
    this.url = `${this.URL_MTCORP}/MTCorp/app/modulos/abastecimento/bobinasRecebimento.php?m=${this.matricula}&u=${this.idUsuario}`;
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
          descricao: 'Beneficiador',
          routerLink: `/abastecimento/beneficiador/${this.idSubModulo}`
        },
        {
          descricao: 'Painel de recebimento de bobinas'
        }
      ];
    })
  }
}
