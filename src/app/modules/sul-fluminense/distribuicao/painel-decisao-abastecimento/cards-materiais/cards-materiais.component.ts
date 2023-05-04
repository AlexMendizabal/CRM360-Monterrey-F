import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewChildren } from '@angular/core';

import { finalize } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
//Converte rota em base64
import { RouterService } from 'src/app/shared/services/core/router.service';

import { SulFluminenseFiltroService } from './../filtro.service';
import { PainelDecisaoAbastecimentoService } from './../painel-decisao-abastecimento.service';

@Component({
  selector: 'sul-fluminense-cards-materiais',
  templateUrl: './cards-materiais.component.html',
  styleUrls: ['./cards-materiais.component.scss']
})
export class SulFluminenseCardsMateriaisComponent implements OnInit {
  countMateriais: any;
  materiaisID: Array<any> = [];
  materiaisID_: Array<any> = [];
  materiaisIDFilter: Array<any> = [];
  materiaisDetalhes: Array<any> = [];
  nivelCritico: any = [];
  reqMateriais: any = [];
  reqCodMateriais: any = [];
  
  loading: boolean = false;
  openDetalhes: boolean = false;
  viewLegend: boolean = false;
  itemDetalhes: boolean = false;
  isColapsed: boolean = true;
  emptyMateriais: boolean = false;
  
  filterUnidade: string = '';
  icone: string;
  unidadeAbt: string;
  codMaterial: string;
  pesoEspecifico: number;
  
  index: number;
  pagina: number;

  constructor(
    private getDataService: PainelDecisaoAbastecimentoService,
    private activatedRoute: ActivatedRoute,
    private routerService: RouterService,
    private pnotify: PNotifyService,
    private filtroService: SulFluminenseFiltroService
  ) {}

  ngOnInit(): void {
    this.onActivedRoute();
    this.getFiltroNivelCritico();
  }

  filterPipe(value: any): void {
    this.itemDetalhes = false;

    if (this.filterUnidade != value) {
      this.filterUnidade = value;
    } else if (this.filterUnidade == value) {
      this.filterUnidade = '';
    }
  }

  onActivedRoute(): void {
    this.activatedRoute.queryParams.subscribe(queryParams => {
      if (Object.keys(queryParams).length > 0) {
        let _response = this.routerService.getBase64UrlParams(queryParams);
        this.getCountMateriais(_response);
        this.pagina = _response['pagina'];
      }
    });
  }

  //traz os codigos do materiais
  getCountMateriais(response: any): void {
    this.reqMateriais = [];
    this.reqCodMateriais = [];

    this.getDataService
      .getCountMateriais(response)
      .subscribe(res => {
        if (res.status === 200) {
          this.emptyMateriais = false;
          this.reqMateriais = res['body'];

          this.reqMateriais.forEach(element => {
            this.reqCodMateriais.push(element.CODIGOMATERIAL);
          });

          this.getMateriais(response);
        } else if (res.status === 204) {
          this.materiaisID_ = [];
          this.materiaisID = [];
          this.emptyMateriais = true;
          this.pnotify.notice('Não há itens a serem exibidos');
        } else {
          this.emptyMateriais = true;
          this.pnotify.error('Erro ao carregar Cards Materiais');
        }
      },
      error => {
        this.emptyMateriais = true;
        this.pnotify.error('Erro ao carregar Cards Materiais');
      }
      );
  }

  getMateriais(response: any): void {
    this.materiaisID_ = [];
    this.materiaisID = [];

    this.loading = true;
    //armazena as requisições
    let request = [];
    let itensRequest = 5;
    let totalItens = this.reqCodMateriais.length;
    let i = 0;
    let reqCodMateriais = "";
    let qtdRequest = Math.ceil(totalItens / itensRequest);

    for (let index = 0; index < qtdRequest; index++) {
      reqCodMateriais = this.reqCodMateriais.slice(i, i + 5);
      i += 5;

      request.push(
        this.getDataService.getDemandasMateriais({
          materiais: btoa(reqCodMateriais),
          unidades: response['unidades']
        })
      );
    }

    forkJoin(request)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.viewLegend = true;
          this.materiaisID = this.materiaisID_;
        })
      )
      .subscribe(response => {
        response.forEach(element => {
          if (element['status'] === 200) {
            element['body'].forEach(material => {
              this.materiaisID_.push(material);
            });
          }
        });
      });
  }

  getMateriaisDetalhes(unidade: any, material: any, pesoEspecifico: any): void {
    this.loading = true;
    this.materiaisDetalhes = [];

    this.getDataService.getMateriaisDetalhes(unidade, material, pesoEspecifico).subscribe(
      (response: any) => {
        if (Object.keys(response).length > 0) {
          if (response.status === 200) {
            this.materiaisDetalhes = response['body'];
          }
        } else if (response.status === 204) {
          this.pnotify.notice('Não há itens a serem exibidos');
        } else {
          this.pnotify.error('Erro ao carregar detalhes dos Materiais');
        }
        this.loading = false;
      },
      error => {
        this.pnotify.error('Erro ao carregar detalhes dos Materiais');
      }
    );
  }

  iconClass(unidade: boolean) : string {
    let iconClass: string;

    if (unidade === true && this.itemDetalhes === true) {
      iconClass = 'fas fa-minus';
    } else {
      iconClass = 'fas fa-plus';
    }

    return iconClass;
  }

  alteraIcone(unidade: any, item: any, index: any): void {
    let validaIcone = false;

    this.materiaisID.forEach((element, i) => {
      return element['Unidades'].forEach((unidades, j) => {
        if (
          element.CodigoMaterial === item.initData.CodigoMaterial &&
          j === index
        ) {
          validaIcone = !unidades['Detalhes'];
          return (unidades['Detalhes'] = validaIcone);
        } else {
          return (unidades['Detalhes'] = false);
        }
      });
    });

    item.detalhes = validaIcone;
    this.itemDetalhes = item.detalhes;
    this.index = item.id;
    this.unidadeAbt = unidade.CodigoDeposito;
    this.codMaterial = item.value.CodigoMaterial;
    this.pesoEspecifico = item.value.PesoEspecifico;


    if (item.detalhes) {
      this.getMateriaisDetalhes(this.unidadeAbt, this.codMaterial, this.pesoEspecifico);
    }
  }

  sortItems(item: any, campo: any): void {
    let index = item.initData.CodigoMaterial;

    item.campoVisivel = campo;
    item.sort = !item.sort;

    this.materiaisID.forEach(element => {
      if (element.CodigoMaterial === index) {
        element.sort = !element.sort;

        element.Unidades.sort((a, b) => {
          if (a[campo] < b[campo]) {
            return element.sort ? 1 : -1;
          } else if (a[campo] > b[campo]) {
            return element.sort ? -1 : 1;
          } else {
            return 0;
          }
        });
      }
    });
  }

  filterNivelCritico(nivelCritico: any): void {
    this.materiaisID.forEach((material, i) => {
      let unidadeEncontrada = false;

      material['Unidades'].forEach((unidade, j) => {
        if (unidade.CodigoNivelCritico === nivelCritico) {
          unidadeEncontrada = true;
        }
      });

      if (unidadeEncontrada) {
        this.materiaisIDFilter.push(material);
      }
    });
  }

  getFiltroNivelCritico(): void {
    this.filtroService
      .getFiltroNivelCritico()
      .pipe(finalize(() => (this.viewLegend = true)))
      .subscribe((response: any) => {
        if (Object.keys(response).length > 0) {
          this.nivelCritico = response['body'];
        }
      });
  }
}