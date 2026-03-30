import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { EMPTY, Subscription } from 'rxjs';
import { finalize, switchMap, take } from 'rxjs/operators';

import { PageChangedEvent } from 'ngx-bootstrap';

import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';

import { AbastecimentoCadastrosParametrosGeraisEstoqueService } from '../parametros-gerais-estoque.service';

@Component({
  selector: 'lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class AbastecimentoCadastrosParametrosGeraisEstoqueListaComponent implements OnInit {
  loaderFullScreen: boolean = true;
  loaderNavbar: boolean = false;
  loading: boolean = false;
  noResult: boolean = false;
  ableEditMassa: boolean = false;
  compressedTable: boolean = false;
  ableButtonEditMassa: boolean = false;
  ableButtonCallModal: boolean = false
  colsNivelEstoque: boolean = false;
  ableHeaderModalNivelEstoque: boolean = false
  minimoBool: boolean = false
  medioBool: boolean = false
  maximoBool: boolean = false
  enableSaveModal: boolean = false

  breadCrumbTree: any;

  form: FormGroup;
  formModal: FormGroup;

  $activatedRouteSubscription: Subscription;

  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  idUsuario: any = this.currentUser['info']['id'];

  empresas: Array<any>;
  depositos: Array<any>;
  tipoMateriais: Array<any>;
  linhas: Array<any>;
  subLinhas: Array<any>;
  classes: Array<any>;
  materiais: Array<any>;
  data: Array<any> = [];
  dataFull: Array<any> = [];
  dataTotal: Array<any> = [];
  dataMediaVendas: Array<any> = [];
  paramsRecord: any;
  dataExcel: string = '';
  estoqueMinimo: string = '';
  estoqueMedio: string = '';
  estoqueMaximo: string = '';
  periodoVendasMassa: string = '';

  headerModalTipoMaterial: string = '';
  headerModalClasse: string = '';
  headerModalDeposito: string = '';
  headerModalPeriodo: string = '';
  headerModalMediaVendas: string = '';
  headerModalEstoqueDisponivel: string = '';

  situations: Array<any> = [
    {ID:'1', NM_SITU: 'Ativo'},
    {ID:'0', NM_SITU: 'Inativo'}
  ];

  /* Ordenação */
  reverse: boolean = false;
  key: string = 'NM_CLAS';
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
    },
    {
      text: 'Simulado',
      color: 'gray'
    }
  ];

  /* CurrentMask */
  decimal: any = {
    align: 'left',
    prefix: '',
    thousands: '.',
    decimal: ',',
    precision: 2
  };
  /* CurrentMask */

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private confirmModalService: ConfirmModalService,
    private routerService: RouterService,
    private titleService: TitleService,
    private service: AbastecimentoCadastrosParametrosGeraisEstoqueService
  ) {
    this.form = this.formBuilder.group({
      ID_EMPR: [null],
      ID_DEPO: [null],
      ID_TIPO_MATE: [null, Validators.required],
      ID_LINH: [null, Validators.required],
      ID_SUB_LINH: [null],
      ID_CLAS: [null],
      ID_MATE: [null],
      TT_MESE_PERI_VEND_SIMU: [null],
      IN_STAT: [null, Validators.required],
    });

    this.formModal = this.formBuilder.group({
      PERC_VARI_CONS: [null],
      TIPO_VARI: [null, Validators.required],
      DIAS_ESTO_MINI: [null, Validators.required],
      DIAS_ESTO_MEDI: [null, Validators.required],
      DIAS_ESTO_MAXI: [null, Validators.required]
    });
   }

  ngOnInit(): void {
    setTimeout(() => {
      this.loaderFullScreen = false;
    }, 1000);

    this.titleService.setTitle('Parâmetros Gerais de Estoque');

    this.form.get('IN_STAT').setValue('1');
   
    this.registrarAcesso();
    this.setBreadCrumb();
    this.checkRouterParams();
    this.setDisabledItemsForm();
    this.getDataFilter();
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
          descricao: 'Parâmetros Gerais de Estoque'
        }
      ];
    });
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
    const ID_EMPR = queryParams['ID_EMPR'] ?? '';
    const ID_LINH = queryParams['ID_LINH'] ?? '';
    const ID_CLAS = queryParams['ID_CLAS'] ?? '';
    this.periodoVendasMassa = queryParams['TT_MESE_PERI_VEND_SIMU'] ?? '';

    this.ableButtonEditMassa = false;

    if(this.periodoVendasMassa != ''){
      this.ableEditMassa = true;
    } else {
      this.ableEditMassa = false;
    }

    /* depositos */
    if (Object.keys(ID_EMPR).length > 0) {
      const paramsDeposito = {
        idsEmpresa:queryParams['ID_EMPR'],
        idSituacao: 1 ,
      };

      this.loaderNavbar = true;

      this.service
        .getDepositos(paramsDeposito)
        .pipe(finalize(() => (this.loaderNavbar = false)))
        .subscribe(
          res => {
            if (Object.keys(res).length > 0) {
              if (res.status === 200) {
                if (res['body']['responseCode'] === 200) {
                  this.depositos = res['body']['result'];
                  this.form.get('ID_DEPO').enable();
                }
              }
            }
          },
          error => {
            this.pnotifyService.error('Erro ao carregar depósitos');
          }
        );
    } else {
      this.form.get('ID_CLAS').disable();
    }

    /* classes */
    if (Object.keys(ID_LINH).length > 0) {
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
    if (Object.keys(ID_LINH).length > 0) {
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

    /* materiais */
    if (Object.keys(ID_CLAS).length > 0) {
      const paramsMaterial = {
        idClasses:queryParams['ID_CLAS'],
        idTipoMaterial:queryParams['ID_TIPO_MATE'],
        idSituacao: 1 ,
      };

      this.loaderNavbar = true;
      this.ableButtonEditMassa = true;

      this.service
        .getMateriais(paramsMaterial)
        .pipe(finalize(() => (this.loaderNavbar = false)))
        .subscribe(
          (res: any) => {
            if (Object.keys(res).length > 0) {
              if (res['body'].responseCode === 200) {
                this.form.get('ID_MATE').enable();
                this.materiais = res['body']['result'];
              }
            }
          },
          error => {
            this.pnotifyService.error('Erro ao carregar materias');
          }
        );
      }

    this.form.patchValue(queryParams);
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

  getDataFilter(): void {
    this.getLinhas();
    this.getEmpresas();
    this.getTiposMateriais();
  }

  setDisabledItemsForm(): void {
    this.form.get('ID_DEPO').disable();
    this.form.get('ID_SUB_LINH').disable();
    this.form.get('ID_CLAS').disable();
    this.form.get('ID_MATE').disable();
  }

  getEmpresas(): void {
    const params = {
      idSituacao: 1
    };

    this.loaderNavbar = true;
    this.empresas = [];

    this.service
      .getEmpresas(params)
      .pipe(finalize(() => {this.loaderNavbar = false;}))
      .subscribe(
        res => {
          if (Object.keys(res).length > 0) {
            this.empresas = res['body']['result'];
          }
        },
        error => {
          this.pnotifyService.error('Erro ao carregar Empresas');
        }
      );
  }

  getDepositos(): void  {
    this.loaderNavbar = true;
    this.depositos = [];

    let idsEmpresa = this.form.get('ID_EMPR').value;
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
              this.form.get('ID_DEPO').reset();
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

  getTiposMateriais(): void  {
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

  getLinhas(): void  {
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

  getSubLinhas(): void  {
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
      this.form.get('ID_MATE').reset();
      this.form.get('ID_MATE').disable();
    }
  }

  getClasses(): void  {
    this.classes = [];
    this.loaderNavbar = true;
    this.ableButtonEditMassa = false;

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
                  this.form.get('ID_MATE').reset();
                  this.form.get('ID_MATE').disable();
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
      this.form.get('ID_MATE').reset();
      this.form.get('ID_MATE').disable();
    }
  }

  getMateriais(): void  {
    this.materiais = [];
    this.loaderNavbar = true;
    
    if (
      this.form.value['ID_CLAS'] != null &&
      this.form.value['ID_CLAS'].length > 0
      ) {
        let idClasses = this.form.get('ID_CLAS').value;
        let idTipoMaterial = this.form.get('ID_TIPO_MATE').value;
        let idSituacao = 1;
        this.ableButtonEditMassa = true;
      let params = {
        idClasses: idClasses ?? "",
        idTipoMaterial: idTipoMaterial ?? "",
        idSituacao
      };

      this.service
        .getMateriais(params)
        .pipe(finalize(() => (this.loaderNavbar = false)))
        .subscribe(
          (res: any) => {
            if (Object.keys(res).length > 0) {
              if (res['body'].responseCode === 200) {
                this.materiais = res['body'].result;
                this.form.get('ID_MATE').reset();
                this.form.get('ID_MATE').enable();
              } else if (
                res['body']['responseCode'] === 204 ||
                res['body']['responseCode'] === 404
              ) {
                this.form.get('ID_MATE').reset();
                this.form.get('ID_MATE').disable();
                this.pnotifyService.notice(
                  'Não há materiais cadastrados para essa classe'
                );
              }
            }
            this.loaderNavbar = false;
          },
          error => {
            this.pnotifyService.error('Erro ao carregar filtro Materias');
          }
        );
    } else {
      this.loaderNavbar = false;
      this.ableButtonEditMassa = false;
      this.form.get('ID_MATE').reset();
      this.form.get('ID_MATE').disable();
    }
  }

  onFilter(): void {
    this.form.value['TT_MESE_PERI_VEND_SIMU'] = '';
    this.form.get('TT_MESE_PERI_VEND_SIMU').reset();

    this.ableEditMassa = false;

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams())
    });

    this.search(this.getParams());
  }

  search(params: any): void{
    const ID_CLAS = params['ID_CLAS'] ? params['ID_CLAS'] : '';
    this.begin = 0;

    if(Object.keys(ID_CLAS).length > 0) {
      this.ableButtonCallModal = true;
    } else {
      this.ableButtonCallModal = false;
    }
    
    this.loaderNavbar = true;
    this.loading = false;
    this.data = [];

    this.service
    .getNivelEstoqueClasseDeposito(params)
    .pipe(
      finalize(() => this.loaderNavbar = false)
      )
      .subscribe(res => {
        if(Object.keys(res).length > 0) {
          if(res.status == 200){
            if(res['body']['responseCode'] == 200) {
              this.loading = true;
              this.noResult = false;
              this.dataFull = res['body']['result'];
              this.dataTotal = this.dataFull.shift();
              this.data = this.dataFull;
            } else if (res['body']['responseCode'] ==  404){
            this.noResult = true;
            this.pnotifyService.notice("Não há itens a serem exibidos");
          }
        }
      }
    },
    error => {
      this.noResult = true;
      this.pnotifyService.error("Erro ao carregar Parâmetros gerais de estoque");
    });
  }

  getSearchExcel(params: any): void {
    this.loaderNavbar = true;
    this.dataExcel = '';

    this.service
      .getNivelEstoqueClasseDeposito(params)
      .pipe(finalize(() => (this.loaderNavbar = false)))
      .subscribe(
        (res: any) => {
          if (Object.keys(res).length > 0) {
            if (res['body']['responseCode'] === 200) {
              this.dataExcel = res['body']['result'];
              this.pnotifyService.success(this.dataExcel);
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

  onEdit(item: any): void {
    const periodoVendas = item.FORM_PERI_VEND;
    const dateStart = item.DATE_STAR_CALC;
    const dateEnd = item.DATE_END_CALC;
    const mediaVendas = item.MEDI_VEND_CALC;
    const vendasPeriodo = item.PERI_VEND_CALC;

    const arrayTemp = [{
      ID_DEPO: item.ID_DEPO,
      ID_CLAS: item.ID_CLAS,
      ID_APOI_TIPO_MATE: item.ID_TIPO_MATE,
      TT_PERI_VEND_MESE: parseInt(periodoVendas),
      DT_INIC_PERI_VEND: dateStart,
      DT_FINA_PERI_VEND:  dateEnd ?? '',
      TT_MEDI_VEND_PERI: mediaVendas ?? '',
      TT_VEND_PERI: vendasPeriodo,
      IN_STAT: 1
    }];

    const record = {
      ID_TIPO_GRAV: 1,
      ID_USUA: parseInt(this.idUsuario),
      DATA: arrayTemp
    }

    this.onConfirmChange(this.service.postNivelEstoqueMaterialDeposito(record));
  }

  onConfirmChange(apiRoute: any): any{
    this.confirmChange()
    .asObservable()
    .pipe(
      take(1),
      switchMap((result: any) => {
        if (!result) return EMPTY;
          this.loaderNavbar = true;
          return apiRoute;
      }),
      finalize(() => {
        this.loaderNavbar = false;
      })
    )
    .subscribe(
      (success: any) => {
        setTimeout(() => {
          this.onFilter();
        }, 700);
        this.pnotifyService.success();
      },
      (error: any) => {
        this.pnotifyService.error();
      }
    );
  }

  onDetails(item: any): void {
    this.router.navigate([`../detalhes-materiais`],{
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams({
        item
      })
    });
  }

  ableEditCell(item: any): void {
    item.FORM_PERI_VEND = null;
    item.DATE_STAR_CALC = '';
    item.DATE_END_CALC = '';
    item.MEDI_VEND_CALC = 0;
    item.PERI_VEND_CALC = 0;
    item.ON_EDIT_CELL = !item.ON_EDIT_CELL;
  }

  disableEditCell(item: any): void {
    item.FORM_PERI_VEND = null;
    item.DATE_STAR_CALC = '';
    item.DATE_END_CALC = '';
    item.MEDI_VEND_CALC = 0;
    item.PERI_VEND_CALC = 0;
    item.ON_EDIT_CELL = !item.ON_EDIT_CELL;
    this.handleCalcTotal();
  }

  calculateMediaVendas(item: any): void {
    const periodoMeses: string = item.FORM_PERI_VEND;
    const params: any = {
      ID_DEPO: item.ID_DEPO,
      ID_CLAS: item.ID_CLAS,
      ID_APOI_TIPO_MATE: item.ID_TIPO_MATE,
      TT_MESE_PERI_VEND: periodoMeses,
    }

    this.getCalculoPeriodoVendasRealizadas(params, item); 
  }

  getCalculoPeriodoVendasRealizadas(params: any, item: any): void {
    this.dataMediaVendas = [];
    this.loaderNavbar = true;

    this.service
      .getCalculoPeriodoVendasRealizadas(params)
      .pipe(finalize(() => this.loaderNavbar = false))
      .subscribe((res: any) => {
      if(Object.keys(res).length > 0) {
        if(res.status === 200) {
          if(res['body']['responseCode'] === 200) {
            this.dataMediaVendas = res['body']['result'];
            item.BOOL_CALC = true;
            item.DATE_STAR_CALC = this.dataMediaVendas[0].DT_INIC_PERI_VEND;
            item.DATE_END_CALC = this.dataMediaVendas[0].DT_FINA_PERI_VEND;
            item.MEDI_VEND_CALC = this.dataMediaVendas[0].TT_MEDI_VEND_PERI;
            item.PERI_VEND_CALC = this.dataMediaVendas[0].TT_VEND_PERI;
            this.handleCalcTotal();
          } else {
            this.pnotifyService.notice(res['body']['message']);
          }
        }
      }
    },
    error => {
      this.pnotifyService.error('Erro ao realizar calculo do período de vendas');
    }
    
    );
  }

  handleCalcTotal(): void {
    let getValueMediaVendas = 0;
    let total = 0;

    this.data.forEach( e => {
      if(e.MEDI_VEND_CALC != undefined) {
        getValueMediaVendas = e.MEDI_VEND_CALC;
      } else {
        getValueMediaVendas = e.TT_MEDI_VEND_PERI;
      }
      total = total + getValueMediaVendas;
    });

    this.dataTotal['TT_MEDI_VEND_PERI'] =  total;
  }

  postNivelEstoqueMaterialDeposito(record: any): any {
    this.loaderNavbar = true;
    
    this.service
      .postNivelEstoqueMaterialDeposito(record)
      .pipe(
        finalize(() => this.loaderNavbar = false)
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

  onCloseTabs(): void {
    this.data.forEach(e => {
      e.SELECTED = false;
    });
    this.compressedTable = false;
  }

  OnExcel(): void {
    let params = this.getParams();

    params['IN_RELA_EXCE'] = 1;
    params['ID_USUA'] = this.idUsuario;

    this.getSearchExcel(params);
  }

  OnEditMassa(): void {
    this.periodoVendasMassa = this.form.value['TT_MESE_PERI_VEND_SIMU'];
    this.ableEditMassa = true;

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams())
    });

    this.search(this.getParams());
  }

  OnSaveMassa(): any {  
    let arrayTemp = [];

    this.data.map( e => {
      let periodoVendas = 0;
      let mesesVendas = 0;
      let mediaVendas = 0;
      let dateStart = '';
      let dateEnd = '';

      if(e.BOOL_CALC) {
        mesesVendas = parseInt(e.FORM_PERI_VEND);
        periodoVendas = e.PERI_VEND_CALC;
        mediaVendas = e.MEDI_VEND_CALC;
        dateStart = e.DATE_STAR_CALC;
        dateEnd = e.DATE_END_CALC;
        
      } else {
        mesesVendas = e.TT_MESE_PERI_VEND_SIMU;
        periodoVendas = e.TT_VEND_PERI_SIMU;
        mediaVendas = e.TT_MEDI_VEND_PERI_SIMU;
        dateStart = e.DT_INIC_PERI_VEND_SIMU;
        dateEnd = e.DT_FINA_PERI_VEND_SIMU;
      }

     let arrayTemp_ = {
        ID_DEPO: e.ID_DEPO,
        ID_CLAS: e.ID_CLAS,
        ID_APOI_TIPO_MATE: e.ID_TIPO_MATE,
        TT_PERI_VEND_MESE: mesesVendas,
        DT_INIC_PERI_VEND: dateStart,
        DT_FINA_PERI_VEND:  dateEnd,
        TT_VEND_PERI: periodoVendas,
        TT_MEDI_VEND_PERI: mediaVendas,
        IN_STAT: 1
      }

      arrayTemp.push(arrayTemp_);
    });

    const record = {
      ID_TIPO_GRAV: 1,
      ID_USUA: parseInt(this.idUsuario),
      DATA: arrayTemp
    }

    this.onConfirmChange(this.service.postNivelEstoqueMaterialDeposito(record));
  }

  setDefaultValueFormModalNivelEstoque(item :any): void {
    this.formModal.reset();
    this.formModal.get('TIPO_VARI').setValue('1');

    this.paramsRecord = {};

    if (item) {
      this.headerModalTipoMaterial = item.NM_TIPO_MATE;
      this.headerModalClasse = item.NM_CLAS;
      this.headerModalDeposito = item.NM_DEPO;
      this.headerModalPeriodo = item.TT_PERI_VEND_MESE;
      this.headerModalMediaVendas = item.TT_MEDI_VEND_PERI;
      this.headerModalEstoqueDisponivel = item.TT_ESTO_DISP;
      
      this.ableHeaderModalNivelEstoque = true;

      this.paramsRecord = {
        ID_TIPO_GRAV: 2,
        ID_CLAS: item.ID_CLAS,
        ID_APOI_TIPO_MATE: item.ID_TIPO_MATE,
        ID_DEPO: item.ID_DEPO
      }
    } else {
      this.ableHeaderModalNivelEstoque = false;
      this.paramsRecord = {
        ID_TIPO_GRAV: 1,
        ID_CLAS: this.form.value['ID_CLAS'],
        ID_APOI_TIPO_MATE: this.form.value['ID_TIPO_MATE'],
      }
    }
  }

  OnSaveNivelEstoque() : void {
    let record = this.paramsRecord;
    const percetualVariacao = this.formModal.value['PERC_VARI_CONS'];
    const tipoVariacao = this.formModal.value['TIPO_VARI'];
    const diasEstoqueMinimo = this.formModal.value['DIAS_ESTO_MINI'];
    const diasEstoqueMedio = this.formModal.value['DIAS_ESTO_MEDI'];
    const diasEstoqueMaximo = this.formModal.value['DIAS_ESTO_MAXI'];

    record['VL_PERC_VARI_CONS'] = percetualVariacao ? parseFloat(percetualVariacao) : '',
    record['IN_PERC_VARI_CONS'] = tipoVariacao ? parseInt(tipoVariacao) : '',
    record['TT_DIAS_ESTO_MINI'] = diasEstoqueMinimo ? parseInt(diasEstoqueMinimo) : '',
    record['TT_DIAS_ESTO_MEDI'] = diasEstoqueMedio ? parseInt(diasEstoqueMedio) : '',
    record['TT_DIAS_ESTO_MAXI'] = diasEstoqueMaximo ? parseInt(diasEstoqueMaximo) : '',
    record['ID_USUA'] = parseInt(this.idUsuario),

    this.onConfirmChange(this.service.postNivelEstoque(record));
  }

  confirmChange(): any {
     return this.confirmModalService.showConfirm(
      null,
      'Confirmar alteração',
      'Deseja realmente prosseguir com a alteração do(s) registro(s)?',
      'Cancelar',
      'Confirmar'
    );
  }

  setColsNivelEstoqueTrue() : void {
    this.colsNivelEstoque = !this.colsNivelEstoque;
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

  onFieldErrorModal(field: string): string {
    if (this.onFieldInvalidModal(field)) {
      return 'is-invalid';
    }
    return '';
  }

  onFieldInvalidModal(field: any): any {
    field = this.formModal.get(field);
    return field.status == 'INVALID' && field.touched;
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

  /* Realiza comparação para verificar se volume minimo < volumeMedio < volume maximo */
  compareValuesEstoque(field: any): any {
    let minimo = this.formModal.get("DIAS_ESTO_MINI").value;
    let medio = this.formModal.get("DIAS_ESTO_MEDI").value;
    let maximo = this.formModal.get("DIAS_ESTO_MAXI").value;

    minimo = parseInt(minimo);
    medio = parseInt(medio);
    maximo = parseInt(maximo);

    if (this.formModal.get("DIAS_ESTO_MAXI").touched) {
      if(field == "DIAS_ESTO_MINI") {
        if( minimo > medio || minimo > maximo) {
          this.minimoBool = false;
          return true;
        } else {
          this.minimoBool = true;
        }
      }
  
      if(field == "DIAS_ESTO_MEDI") {
        if( medio > maximo || medio < minimo) {
          this.medioBool = false;
          return true;
        } else {
          this.medioBool = true;
        }
      }
  
      if(field == "DIAS_ESTO_MAXI") {
        if( maximo < minimo || maximo < medio) {
          this.maximoBool = false;
          return true;
        } else {
          this.maximoBool = true;
        }
      }
    }
  }

  /* Validação para habilitar botão de salvar no modal Nivel Estoque*/
  validatorsSaveModal(): boolean {
    if( this.minimoBool && this.medioBool && this.maximoBool ) {
      this.enableSaveModal = true;
    } else {
      this.enableSaveModal = false;
    }
    return this.enableSaveModal;
  }
}
