import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { EMPTY, Subscription } from 'rxjs';
import { finalize, switchMap, take } from 'rxjs/operators';

import { PageChangedEvent } from 'ngx-bootstrap';

import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';

import { AbastecimentoCadastrosParametrosGeraisEstoqueService } from './../parametros-gerais-estoque.service';

@Component({
  selector: 'vinculo-depositos',
  templateUrl: './vinculo-depositos.component.html',
  styleUrls: ['./vinculo-depositos.component.scss']
})
export class  AbastecimentoCadastrosParametrosGeraisEstoqueVinculoDepositosComponent implements OnInit {
  loaderFullScreen: boolean = true;
  loaderNavbar: boolean = false;
  loading: boolean = false;
  noResult: boolean = false;

  compressedTable: boolean = false;
  selectedRow: boolean = false;

  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  idUsuario: any = this.currentUser['info']['id'];

  form: FormGroup;
  formModal: FormGroup;

  breadCrumbTree: any = [];
  depositos: any = [];
  linhas: any = [];
  subLinhas: any = [];
  classes: any = [];
  data: any = [];
  tipoMateriais: any = [];
  
  /* Modal */
  loadingModal: boolean = false;
  noResultModal: boolean = false;
  dataModal: any = [];
  empresasModal: any = [];
  depositosModal: any = [];
  idLinhaModal: string;
  linhaModal: string;
  idSubLinhaModal: string;
  subLinhaModal: string;
  idClasseModal: string;
  classeModal: string;
  idTipoMaterialModal: string;
  tipoMaterialModal: string;
  depositosAssociadosModal: number;
  /* Modal */

  tipoSituacao: any = [
    {id: 1, name: "Não vínculado"},
    {id: 2, name: "Vínculado"},
    {id: 3, name: "Todos"}
  ];

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true
  };

  subtitles: Array<Subtitles> = [
    {
      text: 'Vínculado',
      color: 'green'
    },
    {
      text: 'Não vínculado',
      color: 'red'
    }
  ];


  $activatedRouteSubscription: Subscription;

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
    private confirmModalService: ConfirmModalService,
    private atividadesService: AtividadesService,
    private routerService: RouterService,
    private titleService: TitleService,
    private service: AbastecimentoCadastrosParametrosGeraisEstoqueService
  ) {
    this.form = this.formBuilder.group({
      ID_DEPO: [null],
      ID_APOI_TIPO_MATE: [null],
      ID_LINH: [null],
      ID_SUB_LINH: [null],
      ID_CLAS: [null],
      ID_SITU_MATE: [null]
    });

    this.formModal = this.formBuilder.group({
      ID_EMPR: [null],
      ID_DEPO: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.loaderFullScreen = false;
    }, 1000);
    this.titleService.setTitle('Parâmetros gerais de estoque');  
    this.registrarAcesso();
    this.setBreadCrumb();
    this.getLinhas();
    this.getTiposMateriais();
    this.getDepositos();
    this.setDisabledItemsForm();
    this.checkRouterParams();
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
          descricao: 'Parâmetros gerais de estoque',
          routerLink: `/abastecimento/cadastros/${params['idSubModulo']}/parametros-gerais-estoque/lista`
        },
        {
          descricao: 'Víncular depósitos'
        }
      ];
    });
  }

  setDisabledItemsForm(): void {
    this.form.get('ID_SITU_MATE').setValue(3);
    this.form.get('ID_SUB_LINH').disable();
    this.form.get('ID_CLAS').disable();
  }

  getDepositos(): void {
    this.loaderNavbar = true;
    this.depositos = [];

    let params = {
      idsEmpresa: "",
      idSituacao: 1
    }

    this.service
      .getDepositos(params)
      .pipe(finalize(() => (this.loaderNavbar = false)))
      .subscribe(
        res => {
          if (Object.keys(res).length > 0) {
            if (res['body']['responseCode'] === 200) {
              this.form.get('ID_DEPO').enable();
              this.depositos = res['body']['result'];
            } else if (res['body']['responseCode'] === 404) {
              this.form.get('ID_DEPO').reset();
              this.form.get('ID_DEPO').disable();
            }
          }
        },
        error => {
          this.pnotifyService.error('Erro ao carregar Depositos');
        }
      );
  }

  getTiposMateriais(): void {
    let params = {
      idSituacao: 1
    };
    this.loaderNavbar = true;
    this.tipoMateriais = [];

    this.service
      .getTiposMateriais(params)
      .pipe(finalize(() => {this.loaderNavbar = false;}))
      .subscribe(
        res => {
          if (Object.keys(res).length > 0) {
            this.tipoMateriais = res['body']['result'];
          }
        },
        error => {
          this.pnotifyService.error('Erro ao carregar tipos materiais');
        }
      );
  }

  getLinhas(): void {
    const params = {
      idSituacao: 1
    };
    this.loaderNavbar = true;
    this.linhas = [];

    this.service
      .getLinhas(params)
      .pipe(finalize(() => (this.loaderNavbar = false)))
      .subscribe(
        (res: any) => {
          if (Object.keys(res).length > 0) {
            if (res.status === 200) {
              this.linhas = res['body']['result'];
            }
          }
        },
        error => {
          this.pnotifyService.error('Erro ao carregar Linhas');
        }
      );
  }

  getSubLinhas(): void {
    this.loaderNavbar = true;
    this.subLinhas = [];

    if (
      this.form.value['ID_LINH'] != null &&
      this.form.value['ID_LINH'].length > 0
    ) {
      let descricaoLinhas = this.form.get('ID_LINH').value;
      let idSituacao = 1;
      let params = {
        descricaoLinhas: descricaoLinhas,
        idSituacao: idSituacao
      };

      this.service
        .getSubLinhas(params)
        .pipe(finalize(() => (this.loaderNavbar = false)))
        .subscribe(
          res => {
            if (Object.keys(res).length > 0) {
              if (res.status === 200) {
                if (res['body']['responseCode'] === 200) {
                  this.subLinhas = res['body']['result'];
                  this.form.get('ID_SUB_LINH').reset();
                  this.form.get('ID_SUB_LINH').enable();
                } else if (res['body']['responseCode'] === 404) {
                  this.form.get('ID_SUB_LINH').reset();
                  this.form.get('ID_SUB_LINH').disable();
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
      this.loaderNavbar = false;
      this.form.get('ID_SUB_LINH').reset();
      this.form.get('ID_SUB_LINH').disable();
    }
  }

  getClasses(): void {
    this.classes = [];
    this.loaderNavbar = true;

    if (
      this.form.value['ID_LINH'] != null &&
      this.form.value['ID_LINH'].length > 0
    ) {
      let descricaoLinhas = this.form.get('ID_LINH').value;
      let idSubLinha = this.form.get('ID_SUB_LINH').value;
      let idSituacao = 1;
      let params = {
        descricaoLinhas,
        idSubLinha : idSubLinha ?? "",
        idSituacao
      }

      this.service
        .getClasses(params)
        .pipe(finalize(() => (this.loaderNavbar = false)))
        .subscribe(
          res => {
            if (Object.keys(res).length > 0) {
              if (res.status === 200) {
                if (res['body']['responseCode'] === 200) {
                  this.classes = res['body']['result'];
                  this.form.get('ID_CLAS').reset();
                  this.form.get('ID_CLAS').enable();
                } else if (res['body']['responseCode'] === 404) {
                  this.form.get('ID_CLAS').reset();
                  this.form.get('ID_CLAS').disable();
                }
              }
            }
          },
          error => {
            this.pnotifyService.error('Erro ao carregar Classes');
          }
        );
    } else {
      this.loaderNavbar = false;
      this.form.get('ID_CLAS').reset();
      this.form.get('ID_CLAS').disable();
    }
  }

  getEmpresasModal(): void {
    let params = {
      idSituacao: 1
    };
    this.loaderNavbar = true;
    this.empresasModal = [];

    this.service
      .getEmpresas(params)
      .pipe(finalize(() => {this.loaderNavbar = false;}))
      .subscribe(
        res => {
          if (Object.keys(res).length > 0) {
            this.empresasModal = res['body']['result'];
          }
        },
        error => {
          this.pnotifyService.error('Erro ao carregar Empresas');
        }
      );
  }

  getDepositosModal(): void  {
    this.loaderNavbar = true;
    this.depositosModal = [];

    let idsEmpresa = this.formModal.get('ID_EMPR').value;
    let idSituacao = 1;
    let params = {
      idsEmpresa: idsEmpresa ?? "",
      idSituacao
    }

    this.service
      .getDepositos(params)
      .pipe(finalize(() => (this.loaderNavbar = false)))
      .subscribe(
        res => {
          if (Object.keys(res).length > 0) {
            if (res['body']['responseCode'] === 200) {
              this.formModal.get('ID_DEPO').reset();
              this.formModal.get('ID_DEPO').enable();
              this.depositosModal = res['body']['result'];
            } else if (res['body']['responseCode'] === 404) {
              this.formModal.get('ID_DEPO').reset();
              this.formModal.get('ID_DEPO').disable();
            }
          }
        },
        error => {
          this.pnotifyService.error('Erro ao carregar Depositos');
        }
      );
  }

  checkRouterParams(): void {
    this.$activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (queryParams: any) => {
        if (Object.keys(queryParams).length > 0) {
          let _response = this.routerService.getBase64UrlParams(queryParams);
          this.search(_response);
          this.setFormValues(_response);
        }
      }
    );
    this.$activatedRouteSubscription.unsubscribe();
  }

  setFormValues(queryParams?: any): void {
    const linhas = queryParams['ID_LINH'] ?? ''
    /* classes */
    if (Object.keys(linhas).length > 0) {
      const paramsClasse = {
        descricaoLinhas: queryParams['ID_LINH'],
        idSubLinha: queryParams['ID_SUB_LINH'] ?? "",
        idSituacao: 1,
      };

      this.loaderNavbar = true;

      this.service
        .getClasses(paramsClasse)
        .pipe(finalize(() => (this.loaderNavbar = false)))
        .subscribe(
          res => {
            if (Object.keys(res).length > 0) {
              if (res.status === 200) {
                if (res['body']['responseCode'] === 200) {
                  this.classes = res['body']['result'];
                  this.form.get('ID_CLAS').enable();
                }
              }
            }
          },
          error => {
            this.pnotifyService.error('Erro ao carregar Classes');
          }
        );
    } else {
      this.form.get('ID_CLAS').disable();
    }

    /* sublinhas */
    if (Object.keys(linhas).length > 0) {
      const paramsSubLinha = {
        descricaoLinhas: queryParams['ID_LINH'],
        idSituacao: 1,
      };

      this.loaderNavbar = true;

      this.service
        .getSubLinhas(paramsSubLinha)
        .pipe(finalize(() => (this.loaderNavbar = false)))
        .subscribe(
          res => {
            if (Object.keys(res).length > 0) {
              if (res.status == 200) {
                if (res['body']['responseCode'] === 200) {
                  this.subLinhas = res['body']['result'];
                  this.form.get('ID_SUB_LINH').enable();
                }
              }
            }
          },
          error => {
            this.pnotifyService.error('Erro ao carregar subLinha');
          }
        );
    } else {
      this.form.get('ID_SUB_LINH').disable();
    }
    
    this.form.patchValue(queryParams);
  }

  onFilter(): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams())
    });
    this.search(this.getParams());
  }

  getParams(): any {
    let _params = {};
    let _obj = this.form.value;

    for (let prop in _obj) {
      if (_obj[prop]) {
        _params[prop] = _obj[prop];
      }
    }

    return _params;
  }

  search(params: any): void {
    this.loaderNavbar = true;
    this.loading = false;
    this.data = [];
    this.begin = 0;

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
              this.data = res['body']['result'];
            } else if (res['body']['responseCode'] === 404) {
              this.noResult = true;
              this.loading = false;
              this.pnotifyService.notice('Não há data');
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

  /* Modal */
  sendDataModal(item) {
    this.linhaModal = item.NM_LINH;
    this.idSubLinhaModal = item.ID_SUB_LINH ?? '';
    this.subLinhaModal = item.NM_SUB_LINH ?? '';
    this.idClasseModal = item.ID_CLAS;
    this.classeModal = item.NM_CLAS;
    this.idTipoMaterialModal = item.ID_APOI_TIPO_MATE;
    this.tipoMaterialModal = item.NM_APOI_TIPO_MATE;
    this.depositosAssociadosModal = item.TT_DEPO_ASSO;

    this.getEmpresasModal();
    this.getDepositosModal();
    this.loadDepositosAssociados()
  }

  onSaveDataModal(): void {
    let depositos = this.formModal.get("ID_DEPO").value;
   
    let record = {
      ID_CLAS: this.idClasseModal,
      ID_APOI_TIPO_MATE: this.idTipoMaterialModal,
      ID_DEPO: depositos.toString(),
      IN_STAT: 1,
      ID_USUA: parseInt(this.idUsuario)
    };

    this.postMaterialDeposito(record);
  }

  postMaterialDeposito(record: any): void {
    this.loaderNavbar = true;
    
    this.service
      .postMaterialDeposito(record)
      .pipe(
        finalize(() => {
          (this.loaderNavbar = false), this.resetValuesForm(), this.loadDepositosAssociados();
        })
      )
      .subscribe(
        (res: any) => {
          if (Object.keys(res).length > 0) {
            if (res['responseCode'] === 201) {
              this.pnotifyService.success(res['message']);
            } else {
              this.pnotifyService.error(res['message']);
            }
          }
        },
        error => {
          this.pnotifyService.error(error['error']);
        }
      );
  }

  loadDepositosAssociados(): void {
    this.getDepositosAssociados({
      ID_CLAS: this.idClasseModal,
      ID_APOI_TIPO_MATE: this.idTipoMaterialModal
    });
  }

  getDepositosAssociados(params: any): void {
    this.loaderNavbar = true;
    this.loadingModal = false;
    this.noResultModal = false;

    this.service
      .getMaterialDepositosDetalhes(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (res: any) => {
          if (res.status === 200) {
            if (res['body']['responseCode'] === 200) {
              this.loadingModal = true;
              this.dataModal = res['body']['result'];
            } else if (res['body']['responseCode'] === 404) {
              this.noResultModal = true;
              this.pnotifyService.notice(res['body']['message']);
            }
          }
        },
        error => {
          this.pnotifyService.error(
            'Erro ao carregar depósitos associados'
          );
        }
      );
  }

  onEdit(item): void {
    const stat = item.IN_STAT == 1 ? 0 : 1;

    let record = {
      ID_ASSO_DEPO_MATE: item.ID,
      ID_CLAS: item.ID_CLAS,
      ID_APOI_TIPO_MATE: item.ID_APOI_TIPO_MATE,
      ID_DEPO: item.ID_DEPO,
      IN_STAT: stat,
      ID_USUA: parseInt(this.idUsuario)
    };

    // item.ID_USUA = parseInt(this.idUsuario);
    // item.ID_USUA = parseInt(this.idUsuario);

    this.confirmChange(stat)
    .asObservable()
    .pipe(
      take(1),
      switchMap((result) => {
        if (!result) return EMPTY;
        this.loaderNavbar = true;
        item.IN_STAT = stat;
        // console.log(item)
        return this.service.postNivelEstoqueMaterialDepositoAltearar(record);
        }),
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (success: any) => {
          this.pnotifyService.success();
        },
        (error: any) => {
          item.IN_STAT = item.IN_STAT == 1 ? 0 : 1;
          this.pnotifyService.error();
        }
      );
  }

  confirmChange(stat): any {
    if (stat == 1)
      return this.confirmModalService.showConfirm(
        null,
        null,
        'Deseja realmente prosseguir com a ativação do registro?',
        'Cancelar',
        'Confirmar'
      );

    return this.confirmModalService.showConfirm(
      'inactivate',
      'Confirmar inativação',
      'Deseja realmente prosseguir com a inativação do registro?',
      'Cancelar',
      'Confirmar'
    );
  }

  resetValuesForm(): void {
    this.formModal.get('ID_EMPR').reset();
    this.formModal.get('ID_DEPO').reset();
  }

  handleFormSituacao(): void {
    console.log(this.form.value['ID_DEPO']);
    if(this.form.value['ID_DEPO'] !== null) {
      this.form.get('ID_SITU_MATE').reset();
      this.tipoSituacao = [
        {id: 1, name: "Não vínculado"},
        {id: 2, name: "Vínculado"},
      ];
      this.form.get('ID_SITU_MATE').setValue(2);
    } else {
      this.form.get('ID_SITU_MATE').reset();
      this.tipoSituacao = [
        {id: 1, name: "Não vínculado"},
        {id: 2, name: "Vínculado"},
        {id: 3, name: "Todos"}
      ];
      this.form.get('ID_SITU_MATE').setValue(3);
    }
    //this.formModal.get('ID_SITU_MATE').disable();
  }

  /* Modal */
  onFieldError(field: string): string {
    if (this.onFieldInvalid(field)) {
      return 'is-invalid';
    }
    return '';
  }

  onFieldErrorModal(field: string): string {
    if (this.onFieldInvalidModal(field)) {
      return 'is-invalid';
    }
    return '';
  }

  onFieldInvalid(field: any): any {
    field = this.form.get(field);
    return field.status == 'INVALID' && field.touched;
  }

  onFieldInvalidModal(field: any): any {
    field = this.formModal.get(field);
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

  onFieldRequiredModal(field: string): any {
    let required = false;
    let formControl = new FormControl();

    if (this.formModal.controls[field].validator) {
      let validationResult = this.formModal.controls[field].validator(formControl);
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
