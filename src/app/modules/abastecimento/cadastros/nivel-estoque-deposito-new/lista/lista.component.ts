import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription} from 'rxjs';

import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
//Converte rota em base64
import { RouterService } from 'src/app/shared/services/core/router.service';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';

import { PageChangedEvent } from 'ngx-bootstrap';
import { finalize } from 'rxjs/operators';

import { AbastecimentoCadastrosNivelEstoqueDepositoNewService } from '../nivel-estoque-deposito-new.service';

@Component({
  selector: 'lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class AbastecimentoCadastrosNivelEstoqueDepositoNewListaComponent
  implements OnInit {
  loaderFullScreen: boolean = true;
  loaderNavbar: boolean;
  loading: boolean = false;
  loadingLogs: boolean = false;
  loadingDetalhes: boolean = false;
  loadingDetalhesLog: boolean = false;
  noResult: boolean = false;
  noResultDetalhes: boolean = false;
  noResultLogs: boolean = false;
  compressedTable: boolean = false;

  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  idUsuario: any = this.currentUser['info']['id'];

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true
  };

  form: FormGroup;

  breadCrumbTree: any = [];

  /* Arrays filtros */
  linhas: any = [];
  classes: any = [];
  subLinhas: any = [];
  tiposMateriais: any = [];
  materiais: any = [];
  /* Arrays filtros */

  dados: any = [];
  dadosExcel: any = [];
  dadosTabs: any = [];
  dadosLogs: any = [];
  depositos: any = [];

  /* Dados do Ng-select */
  situacoes: any = [
    // { id: '1', nome: 'Não associados a deposito', icone: 'fas fa-circle text-danger' },
    { id: '4', nome: 'Com cadastro', icone: 'fas fa-circle text-success' },
    { id: '2', nome: 'Sem cadastro', icone: 'fas fa-circle text-danger' },
    { id: '3', nome: 'Parcial', icone: 'fas fa-circle text-warning' }
  ];
  /* Dados do Ng-select */

  subtitles: Array<Subtitles> = [
    {
      text: 'Com cadastro',
      color: 'green'
    },
    {
      text: 'Sem cadastro',
      color: 'red'
    },
    {
      text: 'Parcial',
      color: 'yellow'
    }
  ];

  activatedRouteSubscription: Subscription;

  /* Ordenação */
  reverse: boolean = false;
  key: string = 'MATERIAL_ID';
  /* Ordenação */

  /* Ordenação modal */
  reverseA: boolean = false;
  keyA: string = 'NM_EMPR';
  
  /* Paginação */
  itemsPerPage: number = 15;
  totalItems: number = 15;
  currentPage: number = 1;
  begin: number = 0;
  end: number = 15;
  /* Paginação */

  currentPageA: number = 1;
  beginA: number = 0;
  endA: number = 15;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private routerService: RouterService,
    private titleService: TitleService,
    private service: AbastecimentoCadastrosNivelEstoqueDepositoNewService
  ) {
    this.form = this.formBuilder.group({
      material: [null],
      tipoMaterial: [null, Validators.required],
      linha: [null, Validators.required],
      subLinha: [null],
      classe: [null, Validators.required],
      situacao: [null]
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.loaderFullScreen = false;
    }, 1000);
    this.registrarAcesso();
    this.setBreadCrumb();
    this.getLinhas();
    this.getTiposMateriais();
    this.checkRouterParams();
    this.titleService.setTitle('Nível de estoque por depósito');
  }

  getLinhas(): void {
    let idSituacao = 1;

    this.loaderNavbar = true;
    this.linhas = [];
    this.service
      .getLinhas(idSituacao)
      .pipe(finalize(() => (this.loaderNavbar = false)))
      .subscribe(
        (res: any) => {
          if (Object.keys(res).length > 0) {
            this.linhas = res['body']['result'];
            this.form.get('classe').disable();
            this.form.get('subLinha').disable();
            this.form.get('material').disable();
          }
        },
        error => {
          this.pnotifyService.error('Erro ao carregar linhas');
        }
      );
  }

  getSubLinhas(): void {
    let idSituacao = 1;

    this.loaderNavbar = true;
    this.subLinhas = [];

    if (this.form.get('linha').status === 'VALID') {
      let descricaoLinhas = this.form.get('linha').value;
      this.service
        .getSubLinhas(descricaoLinhas, idSituacao)
        .pipe(finalize(() => (this.loaderNavbar = false)))
        .subscribe(
          (res: any) => {
            if (Object.keys(res).length > 0) {
              if (res.status === 200) {
                if (res['body']['responseCode'] === 200) {
                  this.subLinhas = res['body']['result'];
                  this.form.get('subLinha').reset();
                  this.form.get('subLinha').enable();
                } else if (res['body']['responseCode'] === 404) {
                  this.form.get('subLinha').reset();
                  this.form.get('subLinha').disable();
                  this.pnotifyService.notice('Não há sublinha cadastrada');
                }
              }
            }
          },
          error => {
            this.pnotifyService.error('Erro ao carregar sublinhas');
          }
        );
    } else {
      this.form.get('subLinha').reset();
      this.form.get('subLinha').disable();
    }
  }

  getClasses(): void {
    let idSituacao = 1;

    this.classes = [];
    this.loaderNavbar = true;

    if (this.form.get('linha').status === 'VALID') {
      let descricaoLinhas = this.form.get('linha').value;
      let idSubLinha = this.form.get('subLinha').value;

      this.service
        .getClasses(descricaoLinhas, idSubLinha, idSituacao)
        .pipe(finalize(() => (this.loaderNavbar = false)))
        .subscribe(
          res => {
            if (Object.keys(res).length > 0) {
              this.classes = res['body']['result'];
              this.form.get('classe').reset();
              this.form.get('classe').enable();
            }
          },
          error => {
            this.pnotifyService.error('Erro ao carregar classes');
          }
        );
    } else {
      this.form.get('classe').reset();
      this.form.get('classe').disable();
    }
  }

  getTiposMateriais(): void {
    let idSituacao = 1;

    this.loaderNavbar = true;
    this.tiposMateriais = [];

    this.service
      .getTiposMateriais(idSituacao)
      .pipe(finalize(() => (this.loaderNavbar = false)))
      .subscribe(
        res => {
          if (res.status === 200) {
            this.tiposMateriais = res['body']['result'];
          }
        },
        error => {
          this.pnotifyService.error('Erro ao carregar tipos materiais');
        }
      );
  }

  getMateriais(): void {
    let idSituacao = 1;

    this.materiais = [];
    this.loaderNavbar = true;

    let idClasses = this.form.get('classe').value;
    let idTipoMaterial = this.form.get('tipoMaterial').value;

    if (
      this.form.value['classe'] != null &&
      this.form.value['classe'].length > 0
    ) {
      this.service
        .getMateriais(idClasses, idTipoMaterial, idSituacao)
        .pipe(finalize(() => (this.loaderNavbar = false)))
        .subscribe(
          (res: any) => {
            if (Object.keys(res).length > 0) {
              if (res['body'].responseCode === 200) {
                this.materiais = res['body']['result'];
                this.form.get('material').reset();
                this.form.get('material').enable();
              } else if (
                res['body']['responseCode'] === 404
              ) {
                this.form.get('material').reset();
                this.form.get('material').disable();
                this.pnotifyService.notice(
                  'Não há materiais cadastrados para essa classe'
                );
              }
            }
            this.loaderNavbar = false;
          },
          error => {
            this.pnotifyService.error('Erro ao carregar materias');
          }
        );
    }
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
          descricao: 'Nível de estoque por depósito'
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
    let tipoMaterial = queryParams['ID_APOI_TIPO_MATE'] ? queryParams['ID_APOI_TIPO_MATE'] : "";
    let material = queryParams['ID_MATE'] ? queryParams['ID_MATE'] : "";
    let linha = queryParams['ID_LINH']? queryParams['ID_LINH'] : "";
    let subLinha = queryParams['ID_SUB_LINH'] ? queryParams['ID_SUB_LINH'] : "";
    let classe = queryParams['ID_CLAS'] ? queryParams['ID_CLAS'] : "";
    let situacao = queryParams['SITU_CADA_NIVE_ESTO'] ? queryParams['SITU_CADA_NIVE_ESTO'] : 5;

    if (Object.keys(linha).length > 0) {
      this.loaderNavbar = true;

      /* classes */
      this.service
        .getClasses(linha, subLinha, idSituacao)
        .pipe(finalize(() => (this.loaderNavbar = false)))
        .subscribe(
          res => {
            if (Object.keys(res).length > 0) {
              if (res.status === 200) {
                if (res['body']['responseCode'] === 200) {
                  this.classes = res['body']['result'];
                  this.form.get('classe').enable();
                }
              }
            }
          },
          error => {
            this.pnotifyService.error('Erro ao carregar Classes');
          }
        );
    } else {
      this.form.get('classe').disable();
    }

    /* sublinhas */
    if (Object.keys(linha).length > 0) {
      this.loaderNavbar = true;

      this.service
        .getSubLinhas(linha, idSituacao)
        .pipe(finalize(() => (this.loaderNavbar = false)))
        .subscribe(
          res => {
            if (Object.keys(res).length > 0) {
              if (res.status == 200) {
                if (res['body']['responseCode'] === 200) {
                  this.subLinhas = res['body']['result'];
                  this.form.get('subLinha').enable();
                }
              }
            }
          },
          error => {
            this.pnotifyService.error('Erro ao carregar subLinha');
          }
        );
    } else {
      this.form.get('subLinha').disable();
    }

    /* materiais */
    if (Object.keys(classe).length > 0) {
      this.loaderNavbar = true;

      this.service
        .getMateriais(classe, tipoMaterial, idSituacao)
        .pipe(finalize(() => (this.loaderNavbar = false)))
        .subscribe(
          (res: any) => {
            if (Object.keys(res).length > 0) {
              if (res['body'].responseCode === 200) {
                this.form.get('material').enable();
                this.materiais = res['body']['result'];
              }
            }
          },
          error => {
            this.pnotifyService.error('Erro ao carregar materias');
          }
        );
      }

    this.form.patchValue({
      tipoMaterial: tipoMaterial,
      linha: linha,
      subLinha: subLinha,
      classe: classe,
      material: material,
      situacao: situacao
    });
  }

  excelExport(): void {
    let queryParams = {
      IN_GERA_RELA: 1,
      ID_USUA : this.idUsuario,
      ID_APOI_TIPO_MATE:
        this.form.value['tipoMaterial'] === null ||
        this.form.value['tipoMaterial'] === undefined
          ? ''
          : this.form.value['tipoMaterial'],
      ID_LINH:
        this.form.value['linha'] === null ||
        this.form.value['linha'] === undefined
          ? ''
          : this.form.value['linha'],
      ID_SUB_LINH:
        this.form.value['subLinha'] === null ||
        this.form.value['subLinha'] === undefined
          ? ''
          : this.form.value['subLinha'],
      ID_CLAS:
        this.form.value['classe'] === null ||
        this.form.value['classe'] === undefined
          ? ''
          : this.form.value['classe'],
      ID_MATE:
          this.form.value['material'] === null ||
          this.form.value['material'] === undefined
            ? ''
            : this.form.value['material'],
      SITU_CADA_NIVE_ESTO:
        this.form.value['situacao'] === null ||
        this.form.value['situacao'] === undefined
          ? 5
          : this.form.value['situacao']
    }
    
    this.getSearchExcel(queryParams);
  }

  getSearchExcel(params: any): void {
    this.loaderNavbar = true;
    this.dadosExcel = [];

    this.service
      .getNiveisEstoque(params)
      .pipe(finalize(() => (this.loaderNavbar = false)))
      .subscribe(
        (res: any) => {
          if (Object.keys(res).length > 0) {
            if (res['body']['responseCode'] === 200) {
              this.dadosExcel = res['body']['result'];
              this.pnotifyService.success(this.dadosExcel);
            } else if (
              res['body']['responseCode'] === 404
            ) {
              this.pnotifyService.notice('Nenhuma informação encontrada');
            }
          }
        },
        error => {
          this.pnotifyService.error('Erro ao carregar dados para excel');
        }
      );
  }

  onFilter(): void {
    this.setRouterParams({
      ID_APOI_TIPO_MATE:
        this.form.value['tipoMaterial'] === null ||
        this.form.value['tipoMaterial'] === undefined
          ? ''
          : this.form.value['tipoMaterial'],
      ID_LINH:
        this.form.value['linha'] === null ||
        this.form.value['linha'] === undefined
          ? ''
          : this.form.value['linha'],
      ID_SUB_LINH:
        this.form.value['subLinha'] === null ||
        this.form.value['subLinha'] === undefined
          ? ''
          : this.form.value['subLinha'],
      ID_CLAS:
        this.form.value['classe'] === null ||
        this.form.value['classe'] === undefined
          ? ''
          : this.form.value['classe'],
      ID_MATE:
          this.form.value['material'] === null ||
          this.form.value['material'] === undefined
            ? ''
            : this.form.value['material'],
      SITU_CADA_NIVE_ESTO:
        this.form.value['situacao'] === null ||
        this.form.value['situacao'] === undefined
          ? 5
          : this.form.value['situacao'],
      IN_GERA_RELA:'',
      ID_USUA: ''
     });

    this.onCloseTabs();
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
      .getNiveisEstoque(params)
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

  onAdd(item: any): void {
    this.router.navigate(['../cadastro'], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams({
       item
      })
    });
  }

  openTab(i: any): void {
    i.select = !i.select;

    this.getNiveisEstoqueDetalhes({
      ID_MATE: i['ID_MATE']
    });

    this.compressedTable = true;
  }

  getNiveisEstoqueDetalhes(params) {
    this.loaderNavbar = true;
    this.loadingDetalhes = false;

    this.dadosTabs = [];
    this.service
      .getNiveisEstoqueUnidades(params)
      .pipe(finalize(() => (this.loaderNavbar = false)))
      .subscribe((res: any) => {
        if (Object.keys(res).length > 0) {
          if (res.status === 200) {
           if (res['body']['responseCode'] === 200) {
             this.dadosTabs = res['body']['result'];
             this.loadingDetalhes = true;
             this.noResultDetalhes = false;
           } else if (res['body']['responseCode'] === 404) {
             this.noResultDetalhes = true;
             this.loadingDetalhes = false;
             this.pnotifyService.notice('Não há dados');
           }
          }
        }
      });
  }

  getLogs(params: any): void {
    this.loaderNavbar = true;
    this.loadingLogs = false;
    this.loadingDetalhesLog = false;
    
    this.dadosLogs = [];
    
    this.service
    .getLogs(params)
    .pipe(finalize(() => (this.loaderNavbar = false)))
    .subscribe((res: any) => {
      if (Object.keys(res).length > 0) {
        if (res.status === 200) {
          if (res['body']['responseCode'] === 200) {
            this.dadosLogs = res['body']['result'];
            this.loadingLogs = true;
            this.loadingDetalhesLog = true;
            this.noResultLogs = false;
          } else if (res['body']['responseCode'] === 404) {
            this.loadingDetalhesLog = true;
            this.noResultLogs = true;
            this.loadingLogs = false;
              this.pnotifyService.notice('Não há dados');
            }
          }
        }
      });
  }

  onCloseTabs(): void {
    this.compressedTable = false;
    this.resetSelected();
  }

  openModal(i: any): void {
    this.getLogs({
      ID_ASSO_MATE_DEPO: i['ID']
    });
  }

  resetSelected(): void {
    this.dados.forEach(e => {
      e.select = false;
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

  /* Paginação Modal*/
  onPageChangedA(event: PageChangedEvent): void {
    this.beginA = (event.page - 1) * event.itemsPerPage;
    this.endA = event.page * event.itemsPerPage;
  }

  sortA(keyA: string): void {
    this.keyA = keyA;
    this.reverseA = !this.reverseA;
  }
}
