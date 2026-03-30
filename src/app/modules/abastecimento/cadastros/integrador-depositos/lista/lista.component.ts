import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup
} from '@angular/forms';

import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

//Converte rota em base64
import { RouterService } from 'src/app/shared/services/core/router.service';

import { PageChangedEvent } from 'ngx-bootstrap';
import { AbastecimentoCadastrosIntegradorDepositosService } from '../integrador-depositos.service';

@Component({
  selector: 'lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class AbastecimentoCadastrosIntegradorDepositosListaComponent implements OnInit {
  loaderFullScreen = true;
  loaderNavbar: boolean;
  loading: boolean = false;
  loadingDetalhes: boolean = false;
  noResult: boolean = false;
  noResultDetalhes: boolean = false;
  compressedTable: boolean = false;
  selectedRow: boolean = false;

  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  idUsuario: any = this.currentUser['info']['id'];

  form: FormGroup;

  breadCrumbTree: any = [];
  dados: any = [];
  dadosDetalhes: any = [];
  integradores: any = [];

  activatedRouteSubscription: Subscription;

  /* Ordenação */
  reverse: boolean = false;
  key: string = 'TP_MATE';
  /* Ordenação */

  /* Paginação */
  itemsPerPage: number = 15;
  totalItems: number = 15;
  currentPage: number = 1;
  begin: number = 0;
  end: number = 15;
  /* Paginação */

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private routerService: RouterService,
    private titleService: TitleService,
    private service: AbastecimentoCadastrosIntegradorDepositosService
  ) { 
    this.form = this.formBuilder.group({
      integrador: [null]
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.loaderFullScreen = false;
    }, 1000);
    this.registrarAcesso();
    this.setBreadCrumb();
    this.checkRouterParams();
    this.getIntegradores();
    this.titleService.setTitle('Vínculo Integrador X Depósito');
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
          descricao: 'Vínculo Integrador X Depósito'
        }
      ];
    });
  }

  checkRouterParams(): void {
    this.activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (queryParams: any) => {
        if (Object.keys(queryParams).length > 0) {
          let _response = this.routerService.getBase64UrlParams(queryParams);
          this.search(_response);
          this.setFormValues(_response);
        }
      }
    );
    this.activatedRouteSubscription.unsubscribe();
  }

  setFormValues(queryParams: any): void {
    let integrador = queryParams['ID_APOI_INTE_PEDI'] ? queryParams['ID_APOI_INTE_PEDI'] : "";;

    this.form.patchValue({
      integrador: integrador
    });
  }

  getIntegradores(): void {
    let idSituacao = 1;
    this.loaderNavbar = true;
    this.integradores = [];

    this.service
      .getIntegradoresPedidosFiltro(idSituacao)
      .pipe(finalize(() => (this.loaderNavbar = false)))
      .subscribe(
        res => {
          if (Object.keys(res).length > 0) {
            this.integradores = res['body']['result'];
          }
        },
        error => {
          this.pnotifyService.error('Erro ao carregar fornecedor');
        }
      );
  }

  onFilter(): void {
    this.setRouterParams({
      ID_APOI_INTE_PEDI:
        this.form.value['integrador'] === null ||
        this.form.value['integrador'] === undefined
          ? ''
          : this.form.value['integrador'],
      IN_STAT: '',
      NR_PAGE_INIC: '',
      TT_REGI_PAGI: '',
      ORDE_BY: '',
      ORDE_TYPE: ''
      });

    this.onClose();
  }

  setRouterParams(params: any): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(params)
    });
    this.search(params);
  }

  search(params: any): void {
    this.loaderNavbar = true;
    this.loading = false;

    this.service
      .getIntegradoresPedidos(params)
      .pipe(finalize(() => (this.loaderNavbar = false)))
      .subscribe(
        (res: any) => {
          if (res.status === 200) {
            if (res['body']['responseCode'] === 200) {
              this.dados = res['body']['result'];
              this.loading = true;
              this.noResult = false;
            } else if (res['body']['responseCode'] === 404) {
              this.noResult = true;
              this.pnotifyService.notice('Não há dados');
            }
          }
        },
        error => {
          this.pnotifyService.error('Erro ao carregar dados');
          this.noResult = true;
        }
      );
  }

  openTab(i: any): void {
    i.select = !i.select;

    this.getIntegradorDepositos({
        ID_APOI_INTE_PEDI: i['ID']
    });

    this.compressedTable = true;
  }

  getIntegradorDepositos(params: any): void {
    this.loadingDetalhes = false;
    this.noResultDetalhes= false;
    this.loaderNavbar = true;

    this.dadosDetalhes = [];
    
    this.service
    .getIntegradorDepositos(params)
    .pipe(finalize(() => (this.loaderNavbar = false)))
    .subscribe(
      (res: any) => {
        if (Object.keys(res).length > 0) {
          if (res['body']['responseCode'] == 200) {
            this.dadosDetalhes = res['body']['result'];
            this.noResultDetalhes= false;
            this.loadingDetalhes = true;
          } else if (res['body']['responseCode'] == 404) {
            this.loadingDetalhes = false;
            this.noResultDetalhes= true;
            this.pnotifyService.notice(res['body']['message']);
            }
          }
        },
        error => {
          this.loadingDetalhes = false;
          this.pnotifyService.error('Erro ao carregar depósitos vinculados');
        }
      );
  }

  onClose(): void {
    this.dados.forEach(e => {
      e.select = false;
    });
    this.selectedRow = false;
    this.compressedTable = false;
  }

  onAdd(item: any): void {
    this.router.navigate(['../cadastro'], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams({
       item
      })
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
