import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';

//Converte rota em base64
import { RouterService } from 'src/app/shared/services/core/router.service';

import { AbastecimentoCadastrosVinculoMaterialDepositoNewService } from '../vinculo-material-deposito-new.service';

import { PageChangedEvent } from 'ngx-bootstrap';


@Component({
  selector: 'lista-nao-vinculados',
  templateUrl: './lista-nao-vinculados.component.html',
  styleUrls: ['./lista-nao-vinculados.component.scss']
})
export class AbastecimentoCadastrosVinculoMaterialDepositoListaNaoVinculadosComponent implements OnInit {
  loaderFullScreen = true;
  loaderNavbar: boolean;
  loading: boolean = false;
  noResult: boolean = false;

  breadCrumbTree: any = [];
  dadosMateDispAssociacao:any = [];

  activatedRouteSubscription: Subscription;

  /* Ordenação */
  reverse: boolean = false;
  key: string = 'NM_APOI_TIPO_MATE';
  /* Ordenação */

  /* Paginação */
  itemsPerPage: number = 15;
  totalItems: number = 15;
  currentPage: number = 1;
  begin: number = 0;
  end: number = 15;
  /* Paginação */

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private routerService: RouterService,
    private titleService: TitleService,
    private service: AbastecimentoCadastrosVinculoMaterialDepositoNewService
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.loaderFullScreen = false;
    }, 1000);
    this.registrarAcesso();
    this.setBreadCrumb();
    this.getMateDispAssociacao();
    this.titleService.setTitle('Vinculo Material Depósito');  
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/abastecimento/home'
        },
        {
          descricao: 'Cadastros',
          routerLink: `/abastecimento/cadastros/${params['idSubModulo']}`
        },
        {
          descricao: 'Vínculo Material Depósito',
          routerLink: `/abastecimento/cadastros/${params['idSubModulo']}/vinculo-material-deposito/lista`
        },
        {
          descricao: 'Não Vinculados'
        },
      ];
    });
  }

  getMateDispAssociacao(): void {
    this.loaderNavbar = true;
    this.loading = false;
    this.dadosMateDispAssociacao = [];

    this.service
      .getMateDispAssociacao()
      .pipe(
        finalize(() => {
          this.loaderNavbar = false
        })
      )
      .subscribe(
        res => {
          if (res.status === 200) {
            if (res['body']['responseCode'] === 200) {
              this.dadosMateDispAssociacao = res['body']['result'];
              this.loading = true;
              this.noResult = false;
            } else if (res['body']['responseCode'] === 404) {
              this.noResult = true;
              this.loading = false;
              this.pnotifyService.notice('Não há dados');
            }
          } 
        },
        error => {
          this.loading = false;
          this.noResult = true;
          this.pnotifyService.error(
            'Erro ao carregar materiais disponiveis para associação'
          );
        }
      );
  }

  onAdd(item: any): void {
    this.router.navigate(['../cadastro'], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams({ item })
    });
  }

  /* Ordenação */
  sort(key: string): void {
    this.key = key;
    this.reverse = !this.reverse;
  }
  /* Ordenação */

  /* Paginação Tabela Principal*/
  onPageChanged(event: PageChangedEvent): void {
    this.begin = (event.page - 1) * event.itemsPerPage;
    this.end = event.page * event.itemsPerPage;
  }
  /* Paginação */

}
