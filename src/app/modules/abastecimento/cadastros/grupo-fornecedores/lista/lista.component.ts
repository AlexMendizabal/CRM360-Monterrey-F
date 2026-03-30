import { AbastecimentoCadastrosGrupoFornecedoresService } from './../grupo-fornecedores.service';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';

import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

//Converte rota em base64
import { RouterService } from 'src/app/shared/services/core/router.service';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';

import { PageChangedEvent } from 'ngx-bootstrap';

@Component({
  selector: 'lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class AbastecimentoCadastrosGrupoFornecedoresListaComponent implements OnInit {
  loaderFullScreen: boolean = true;
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
  dadosExcel: any = [];
  dadosDetalhes: any = [];

  fornecedores: any = [];

  grupoFornecedores: any = [];

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

  subtitles: Array<Subtitles> = [
    {
      text: 'Ativo',
      color: 'green'
    },
    {
      text: 'Inativo',
      color: 'red'
    }
  ];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private routerService: RouterService,
    private titleService: TitleService,
    private service: AbastecimentoCadastrosGrupoFornecedoresService
  ) { 
    this.form = this.formBuilder.group({
      integrador: [null],
      grupoFornecedor: [null],
      fornecedor: [null]
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.loaderFullScreen = false;
    }, 1000);
    this.disabledForms();
    this.registrarAcesso();
    this.setBreadCrumb();
    this.checkRouterParams();
    this.getIntegradores();
    this.titleService.setTitle('Grupo e fornecedores');
  }

  disabledForms(): void {
    this.form.get('grupoFornecedor').disable();
    this.form.get('fornecedor').disable();
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
          descricao: 'Grupo e fornecedores'
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
    let idSituacao = 1;
    let integrador = queryParams['ID_APOI_INTE_PEDI'] ? queryParams['ID_APOI_INTE_PEDI'] : "";
    let fornecedor = queryParams['ID_FORN'] ? queryParams['ID_FORN'] : "";
    let grupoFornecedor = queryParams['ID_GRUP_FORN']? queryParams['ID_GRUP_FORN'] : "";

    if (Object.keys(integrador).length > 0) {
      this.loaderNavbar = true;

      /* grupoFornecedor */
      this.service
        .getGrupoFornecedoresFiltro(integrador)
        .pipe(finalize(() => (this.loaderNavbar = false)))
        .subscribe(
          res => {
            if (Object.keys(res).length > 0) {
              if (res.status === 200) {
                if (res['body']['responseCode'] === 200) {
                  this.grupoFornecedores = res['body']['result'];
                  this.form.get('grupoFornecedor').enable();
                }
              }
            }
          },
          error => {
            this.pnotifyService.error('Erro ao carregar grupo fornecedor');
          }
        );
    } else {
      this.form.get('grupoFornecedor').disable();
    }
    
    /* fornecedor */
    if (Object.keys(integrador).length > 0) {
      this.loaderNavbar = true;
      
      this.service
        .getAssociacaoGrupoFornecedorFornecedoresFiltro(grupoFornecedor)
        .pipe(finalize(() => (this.loaderNavbar = false)))
        .subscribe(
          res => {
            if (Object.keys(res).length > 0) {
              if (res.status === 200) {
                if (res['body']['responseCode'] === 200) {
                  this.fornecedores = res['body']['result'];
                  this.form.get('fornecedor').enable();
                }
              }
            }
          },
          error => {
            this.pnotifyService.error('Erro ao carregar fornecedor');
          }
        );
    } else {
      this.form.get('fornecedor').disable();
    }

    this.form.patchValue({
      integrador: integrador,
      fornecedor: fornecedor,
      grupoFornecedor: grupoFornecedor
    });
  }


  onFilter(): void {
    this.setRouterParams({
      ID_ASSO_GRUP_FORN_INTE_PEDI:'',
      ID_GRUP_FORN:
        this.form.value['grupoFornecedor'] === null ||
        this.form.value['grupoFornecedor'] === undefined
        ? ''
        : this.form.value['grupoFornecedor'],
      ID_APOI_INTE_PEDI:
        this.form.value['integrador'] === null ||
        this.form.value['integrador'] === undefined
          ? ''
          : this.form.value['integrador'],
      ID_FORN:
        this.form.value['fornecedor'] === null ||
        this.form.value['fornecedor'] === undefined
          ? ''
          : this.form.value['fornecedor'],
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

  excelExport(): void {
    this.getDadosExcel({
      ID_ASSO_GRUP_FORN_FORN: '',
      ID_INTE_PEDI:  this.form.value['integrador'] === null ||
      this.form.value['integrador'] === undefined
        ? ''
        : this.form.value['integrador'],
      ID_GRUP_FORN:
      this.form.value['grupoFornecedor'] === null ||
      this.form.value['grupoFornecedor'] === undefined
      ? ''
      : this.form.value['grupoFornecedor'],
      ID_FORN:  this.form.value['fornecedor'] === null ||
      this.form.value['fornecedor'] === undefined
        ? ''
        : this.form.value['fornecedor'],
      IN_STAT: '',
      NR_PAGE_INIC:	'',
      TT_REGI_PAGI:	'',
      ORDE_BY: '',
      ORDE_TYPE: '',
      IN_GERA_RELA_EXCE: 1,
      ID_USUA: parseInt(this.idUsuario),
    });

  }

  getFornecedores(): void {
    let params = this.form.get('grupoFornecedor').value;
    this.loaderNavbar = true;
    this.fornecedores = [];

    if (this.form.get('grupoFornecedor').status === 'VALID') {
      this.service
        .getAssociacaoGrupoFornecedorFornecedoresFiltro(params)
        .pipe(finalize(() => (this.loaderNavbar = false)))
        .subscribe(
          res => {
            if (Object.keys(res).length > 0) {
              if(res['body']['responseCode'] === 200) {
                this.fornecedores = res['body']['result'];
                this.form.get('fornecedor').reset();
                this.form.get('fornecedor').enable();
              } else if(res['body']['responseCode'] === 404) {
                this.form.get('fornecedor').reset();
                this.form.get('fornecedor').disable();
                this.pnotifyService.notice(res['body']['message']);
              }
            }
          },
          error => {
            this.form.get('fornecedor').reset();
            this.form.get('fornecedor').disable();
          }
        );
      } else {
        this.form.get('fornecedor').reset();
        this.form.get('fornecedor').disable();
      }
  }

  getGrupoFornecedores(): void {
    let params = this.form.get('integrador').value;
    this.loaderNavbar = true;
    this.fornecedores = [];

    if (this.form.get('integrador').status === 'VALID') {
      this.service
        .getGrupoFornecedoresFiltro(params)
        .pipe(finalize(() => (this.loaderNavbar = false)))
        .subscribe(
          res => {
            if (Object.keys(res).length > 0) {
              if(res['body']['responseCode'] === 200) {
                this.grupoFornecedores = res['body']['result'];
                this.form.get('grupoFornecedor').reset();                
                this.form.get('grupoFornecedor').enable();
              } else if(res['body']['responseCode'] === 404) {
                this.form.get('grupoFornecedor').reset();
                this.form.get('grupoFornecedor').disable();
                this.pnotifyService.notice(res['body']['message']);
              }
            }
          },
          error => {
            this.form.get('grupoFornecedor').reset();
            this.form.get('fornecedor').reset();
            this.form.get('grupoFornecedor').disable();
            this.form.get('fornecedor').disable();
          }
        );
      } else {
        this.form.get('grupoFornecedor').reset();
        this.form.get('fornecedor').reset();
        this.form.get('grupoFornecedor').disable();
        this.form.get('fornecedor').disable();
      }
  }

  getIntegradores(): void {
    let idSituacao = 1;
    this.loaderNavbar = true;
    this.integradores = [];

    this.service
      .getIntegradoresPedidos(idSituacao)
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

  search(params: any): void {
    this.loaderNavbar = true;
    this.loading = false;

    this.service
      .getAssociacaoGrupoFornecedoresIntPed(params)
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

  getDadosExcel(params: any): void {
    this.loaderNavbar = true;

    this.dadosExcel = [];
    
    this.service
    .getAssociacaoGrupoFornecedorFornecedores(params)
    .pipe(finalize(() => (this.loaderNavbar = false)))
    .subscribe(
      res => {
        if (Object.keys(res).length > 0) {
          if (res['body']['responseCode'] == 200) {
            this.dadosExcel = res['body']['result'];
            this.pnotifyService.success(this.dadosExcel);
          } else if (res['body']['responseCode'] == 404) {
            this.pnotifyService.notice(res['body']['message']);
            }
          }
        },
        error => {
          this.loadingDetalhes = false;
          this.pnotifyService.error('Erro ao gerar Excel');
        }
      );
  }

  getGrupoFornecedoresDetalhes(params: any): void {
    this.loadingDetalhes = false;
    this.noResultDetalhes= false;
    this.loaderNavbar = true;

    this.dadosDetalhes = [];
    
    this.service
    .getAssociacaoGrupoFornecedorFornecedores(params)
    .pipe(finalize(() => (this.loaderNavbar = false)))
    .subscribe(
      res => {
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
          this.pnotifyService.error('Erro ao carregar fornecedor');
        }
      );
  }

  openTab(i: any): void {
    i.select = !i.select;

    this.getGrupoFornecedoresDetalhes({
      ID_ASSO_GRUP_FORN_FORN: '',
      ID_INTE_PEDI: '',
      ID_GRUP_FORN: i['ID_GRUP_FORN'],
      ID_FORN: '',
      IN_STAT: '',
      NR_PAGE_INIC:	'',
      TT_REGI_PAGI:	'',
      ORDE_BY: '',
      ORDE_TYPE: '',
      IN_GERA_EXCE: '',
      ID_USUA: ''
    });

    this.compressedTable = true;
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
       item: {ID: item.ID, edit: true}
      })
    });
  }

  onFieldError(field: string): string {
    if (this.onFieldInvalid(field)) {
      return 'is-invalid';
    }
    return '';
  }

  onFieldInvalid(field: any): any {
    field = this.form.get(field);
    return field.status == 'INVALID' && field.touched;
  }

  onFieldRequired(field: string): any {
    let required = false;
    let formControl = new FormControl();

    if (this.form.controls[field].validator) {
      let validationResult = this.form.controls[field].validator(formControl);
      required =
        validationResult !== null && validationResult.required === true;
    }

    if (required) {
      return 'is-required';
    }
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
