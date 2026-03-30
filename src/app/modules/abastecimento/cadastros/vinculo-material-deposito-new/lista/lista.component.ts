import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormControl
} from '@angular/forms';

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
  selector: 'lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class AbastecimentoCadastrosVinculoMaterialDepositoListaComponent
  implements OnInit {
  loaderFullScreen = true;
  loaderNavbar: boolean;
  loading: boolean = false;
  loadingLogs: boolean = false;
  loadingDetalhes: boolean = false;
  loadingDetalhesLog: boolean = false;
  noResult: boolean = false;
  noResultDetalhes: boolean = false;
  noResultLogs: boolean = false;
  compressedTable: boolean = false;
  selectedRow: boolean = false;

  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  idUsuario: any = this.currentUser['info']['id'];

  form: FormGroup;

  breadCrumbTree: any = [];
  depositos: any = [];
  linhas: any = [];
  subLinhas: any = [];
  classes: any = [];
  dados: any = [];
  dadosExcel: any = [];
  dadosLogs: any = [];
  dadosDetalhes: any = [];
  tiposMateriais: any = [];

  tiposCondicao: any = [
    {id: 2, name: "Associado"},
    {id: 3, name: "Não associado"}
  ];

  activatedRouteSubscription: Subscription;

  /* Ordenação */
  reverse: boolean = false;
  key: string = 'TP_MATE';
  /* Ordenação */

  /* Ordenação modal */
  reverseA: boolean = false;
  keyA: string = 'NM_APOI_TIPO_MATE';

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
    private service: AbastecimentoCadastrosVinculoMaterialDepositoNewService
  ) {
    this.form = this.formBuilder.group({
      deposito: [null],
      tipoMaterial: [null],
      linha: [null],
      subLinha: [null],
      classe: [null],
      condicao: [null]
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.loaderFullScreen = false;
    }, 1000);
    this.form.get("condicao").disable();
    this.registrarAcesso();
    this.setBreadCrumb();
    this.getLinhas();
    this.getTiposMateriais();
    this.getDepositos();
    this.checkRouterParams();
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
          descricao: 'Vínculo de material e depósito'
        }
      ];
    });
  }

  getLinhas(): void {
    let idSituacao = 1;

    this.loaderNavbar = true;
    this.linhas = [];
    this.service
      .getLinhas(idSituacao)
      .pipe(finalize(() => (this.loaderNavbar = false)))
      .subscribe(
        res => {
          if (Object.keys(res).length > 0) {
            this.linhas = res['body']['result'];
            this.form.get('classe').disable();
            this.form.get('subLinha').disable();
          }
        },
        error => {
          this.pnotifyService.error('Erro ao carregar linhas');
        }
      );
  }

  getSubLinhas(): void {
    let idSituacao = 1;
    let linha = this.form.get('linha').value;

    this.loaderNavbar = true;
    this.subLinhas = [];
    this.form.get('subLinha').disable();

    if (this.form.get('linha').status === 'VALID' && Object.keys(linha).length > 0) {
      let descricaoLinhas = this.form.get('linha').value;
      this.service
        .getSubLinhas(descricaoLinhas, idSituacao)
        .pipe(finalize(() => (this.loaderNavbar = false)))
        .subscribe(
          res => {
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
            this.pnotifyService.error('Erro ao carregar sublinha');
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
            this.pnotifyService.error('Erro ao carregar classe');
          }
        );
    } else {
      this.form.get('classe').reset();
      this.form.get('classe').disable();
    }
  }

  getDepositos(): void {
    let idSituacao = 1;
    this.loaderNavbar = true;
    this.depositos = [];

    this.service
      .getDepositos(idSituacao, '')
      .pipe(finalize(() => (this.loaderNavbar = false)))
      .subscribe(
        res => {
          if (Object.keys(res).length > 0) {
            if (res['body']['responseCode'] == 200) {
              this.depositos = res['body']['result'];
            } else if (res['body']['responseCode'] == 404) {
            }
          }
        },
        error => {
          this.pnotifyService.error('Erro ao carregar depósito');
        }
      );
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
    let deposito = queryParams['ID_DEPO'] ? queryParams['ID_DEPO'] : null;
    let tipoMaterial = queryParams['ID_APOI_TIPO_MATE'];
    let linha = queryParams['ID_LINH'];
    let subLinha = queryParams['ID_SUB_LINH'] ? queryParams['ID_SUB_LINH'] : null;
    let classe = queryParams['ID_CLAS'] ? queryParams['ID_CLAS'] : null;
    let condicao = queryParams['ID_SITU_MATE'] ? queryParams['ID_SITU_MATE'] : 0;
    
    if(condicao > 0) {
      this.form.get("condicao").enable();
    }

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
            this.pnotifyService.error('Erro ao carregar SubLinha');
          }
        );
    } else {
      this.form.get('subLinha').disable();
    }

    this.form.patchValue({
      deposito: deposito,
      tipoMaterial: tipoMaterial,
      linha: linha,
      subLinha: subLinha,
      classe: classe,
      condicao: condicao
    });
  }

  onFilter(): void {
    this.setRouterParams({
      ID_DEPO:
        this.form.value['deposito'] === null ||
        this.form.value['deposito'] === undefined
          ? ''
          : this.form.value['deposito'],
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
      ID_SITU_MATE:
        this.form.value['condicao'] === null ||
        this.form.value['condicao'] === undefined
          ? 0
          : this.form.value['condicao'],
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
    this.dados = [];

    this.service
      .getMaterialDepositos(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false
        })
      )
      .subscribe(
        res => {
          if (res.status === 200) {
            if (res['body']['responseCode'] === 200) {
              this.loading = true;
              this.noResult = false;
              this.dados = res['body']['result'];
            } else if (res['body']['responseCode'] === 404) {
              this.noResult = true;
              this.loading = false;
              this.pnotifyService.notice('Não há dados');
            }
          }
        },
        error => {
          this.noResult = true;
          this.loading = false;
          this.pnotifyService.error('Erro ao carregar lista de material depósito');
        }
      );
  }

  excelExport(): void {
    let queryParams = {
      IN_GERA_RELA_EXCE: 1,
      ID_USUA : this.idUsuario,
      ID_DEPO:
        this.form.value['deposito'] === null ||
        this.form.value['deposito'] === undefined
          ? ''
          : this.form.value['deposito'],
      ID_APOI_TIPO_MATE:
        this.form.value['tipoMaterial'] === null ||
        this.form.value['tipoMaterial'] === undefined
          ? ''
          : this.form.value['tipoMaterial'].toString(),
      ID_LINH:
        this.form.value['linha'] === null ||
        this.form.value['linha'] === undefined
          ? ''
          : this.form.value['linha'].toString(),
      ID_SUB_LINH:
        this.form.value['subLinha'] === null ||
        this.form.value['subLinha'] === undefined
          ? ''
          : this.form.value['subLinha'].toString(),
      ID_CLAS:
        this.form.value['classe'] === null ||
        this.form.value['classe'] === undefined
          ? ''
          : this.form.value['classe'].toString(),
      ID_SITU_MATE:
        this.form.value['condicao'] === null ||
        this.form.value['condicao'] === undefined
          ? 0
          : this.form.value['condicao'],
    }
    
    this.getSearchExcel(queryParams);
  }

  getSearchExcel(params: any): void {
    this.loaderNavbar = true;
    this.dadosExcel = [];

    this.service
      .getMaterialDepositosDetalhes(params)
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
          this.pnotifyService.error('Erro ao carregar para excel dados');
        }
      );
  }

  getMaterialDepositosDetalhes(params: any): void {
    this.loaderNavbar = true;
    this.loadingDetalhes = false;
    this.dadosDetalhes = [];
    
    this.service
    .getMaterialDepositosDetalhes(params)
    .pipe(
      finalize(() => {
        this.loaderNavbar = false;
      })
      )
      .subscribe(
        res => {
          if (res.status === 200) {
            if(res['body']['responseCode'] === 200) {
              this.dadosDetalhes = res['body']['result'];
              this.noResultDetalhes = false;
              this.loadingDetalhes = true;
            } else if (res['body']['responseCode'] === 404) {
              this.loadingDetalhes = false;
              this.noResultDetalhes = true;
              this.pnotifyService.notice('Não há dados');
            }
          }
        },
        error => {
          this.pnotifyService.error(
            'Erro ao carregar detalhes de material depósito'
            );
            this.loadingDetalhes = false;
        }
      );
  }

  getMaterialDepositosLogs(params: any): void {
    this.loaderNavbar = true;
    this.loadingLogs = false;
    this.dadosLogs = [];
    this.loadingDetalhesLog = false;

    this.service
    .getLogs(params)
    .pipe(finalize(() => (this.loaderNavbar = false)))
    .subscribe(
      res => {
        if (res.status === 200) {
          if(res['body']['responseCode'] === 200) {
            this.dadosLogs = res['body']['result'];
            this.noResultLogs = false;
            this.loadingLogs = true;
            this.loadingDetalhesLog = true;
          } else if (res['body']['responseCode'] === 404) {
            this.pnotifyService.notice('Não há dados');
            this.loadingDetalhesLog = true;
            this.noResultLogs = true;
            this.loadingLogs = false;
          }
        }
      },
      error => {
        this.pnotifyService.error(
          'Erro ao carregar detalhes logs'
          );
          this.noResultLogs = true;
          this.loadingLogs = false;
        }
      );
  }

  openTab(i: any): void {
    i.select = !i.select;

    this.getMaterialDepositosDetalhes({
      ID_CLAS: i['ID_CLAS'],
      ID_APOI_TIPO_MATE: i['ID_APOI_TIPO_MATE']
    });

    this.compressedTable = true;
  }

  openModal(i) {
    this.getMaterialDepositosLogs({
      ID_ASSO_DEPO_MATE: i['ID']
    });
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

  enableCondicao(event: any): void {
    if (event) {
      this.form.get("condicao").enable();
      this.form.get("condicao").setValue(2);
    } else {
      this.form.get("condicao").disable();
      this.form.get("condicao").reset();
    }
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
