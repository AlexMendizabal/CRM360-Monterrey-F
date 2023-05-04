import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { BsModalService, PageChangedEvent } from 'ngx-bootstrap';

import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

import { AbastecimentoCadastrosManutencaoMateriaisService } from './manutencao-materiais.service';

@Component({
  selector: 'manutencao-materiais',
  templateUrl: './manutencao-materiais.component.html',
  styleUrls: ['./manutencao-materiais.component.scss']
})
export class AbastecimentoCadastrosManutencaoMateriaisComponent implements OnInit {
  loaderFullScreen: boolean = true;
  loaderNavbar: boolean = false;
  loading: boolean = false;
  noResult: boolean = false;
  modalMaterialBool: boolean = false;
  modalLogsBool: boolean = false;
  compressedTable: boolean = false;
  noResultDetalhes: boolean = false;

  breadCrumbTree: any;

  form: FormGroup;
  formCheck: FormGroup;

  $activatedRouteSubscription: Subscription;

  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  idUser: any = this.currentUser['info']['id'];

  tiposMateriais: Array<any>;
  linhas: Array<any>;
  subLinhas: Array<any>;
  classes: Array<any>;
  data: any = [
    { ID: 1, DS_TIPO_MATE: "DISTRIBUIDORA", DS_MATE: "CA-50 10,00MM" ,DS_STAT: "Ativa", CODE_MATE: 15125, IN_STAT: 0, NM_CLAS: "CA-50", NM_LINH: "CIVIL", NM_SUB_LINH: null, VOL_VENDA: 300, TT_CART: 120, ESTO_ATUAL: 30, TT_PLAN_CORT:0, DS_PERF_INAT: 'Inativação potencial' , ID_PERF_INAT: 1},
    { ID: 2, DS_TIPO_MATE: "DISTRIBUIDORA", DS_MATE: "CA-50 10,00MM" ,DS_STAT: "Ativa", CODE_MATE: 15125, IN_STAT: 1, NM_CLAS: "CA-50", NM_LINH: "CIVIL", NM_SUB_LINH: null, VOL_VENDA: 300, TT_CART: 120, ESTO_ATUAL: 30, TT_PLAN_CORT:0, DS_PERF_INAT: 'Inativação imediata' , ID_PERF_INAT: 0},
    { ID: 3, DS_TIPO_MATE: "DISTRIBUIDORA", DS_MATE: "CA-50 10,00MM" ,DS_STAT: "Ativa", CODE_MATE: 15125, IN_STAT: 1, NM_CLAS: "CA-50", NM_LINH: "CIVIL", NM_SUB_LINH: null, VOL_VENDA: 300, TT_CART: 120, ESTO_ATUAL: 30, TT_PLAN_CORT:0, DS_PERF_INAT: 'Em atividade', ID_PERF_INAT: 2},
  ];
  dataDetail: any = [
    {NM_EMPR:"MANETONI - TIETE", NM_DEPO:"TIETE", VOLU_VEND: 125.58, VOLU_CART:125.58, PLAN_CORT:526.58},
    {NM_EMPR:"MANETONI - TAIPAS", NM_DEPO:"TAIPAS", VOLU_VEND: 125.58, VOLU_CART:125.58, PLAN_CORT:526.58},
  ];
  modal: any = [];
  itemMaterial: any = [];

  situations: Array<any> = [
    {ID:'0', NM_SITU: 'Inativo'},
    {ID:'1', NM_SITU: 'Ativo'}
  ];

  unactivatedPerfil: Array<any> = [
    {ID:'0', NM_PERFI_INAT: 'Inativação imediata'},
    {ID:'1', NM_PERFI_INAT: 'Inativação potencial'},
    {ID:'2', NM_PERFI_INAT: 'Em atividade'}
  ];

  /* Ordenação principal*/
  reverse: boolean = false;
  key: string = 'NM_CLAS';
  /* Ordenação principal*/

  /* Ordenação modal */
  reverseA: boolean = false;
  keyA: string = 'NM_CLAS';
  /* Ordenação modal */

  /* Paginação */
  itemsPerPage: number = 15;
  totalItems: number = 15;
  currentPage: number = 1;
  begin: number = 0;
  end: number = 15;
  /* Paginação */

  /* Paginação Modal*/
  currentPageA: number = 1;
  beginA: number = 0;
  endA: number = 15;
  /* Paginação Modal*/

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true
  };

  subtitles: Array<Subtitles> = [
    {
      text: 'Em atividade',
      color: 'blue'
    },
    {
      text: 'Inativação potencial',
      color: 'yellow'
    },
    {
      text: 'Inativação imediata',
      color: 'red'
    }

  ];
  
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private confirmModalService: ConfirmModalService,
    private activityService: AtividadesService,
    private routerService: RouterService,
    private titleService: TitleService,
    private modalService: BsModalService,
    private service: AbastecimentoCadastrosManutencaoMateriaisService
  ) { 
    this.form = this.formBuilder.group({
      ID_TIPO_MATE: [null],
      ID_LINH: [null],
      ID_SUB_LINH: [null],
      ID_CLAS: [null],
      IN_STAT: [null, Validators.required],
      ID_PERFI_INAT: [null],
    });
    this.formCheck = this.formBuilder.group({
      ITEM_MASS: [null],
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.loaderFullScreen = false;
    }, 1000);
    this.titleService.setTitle('Manutenção de Materiais');
    this.setDisabledItemsForm();
    this.getTiposMateriais();
    this.getLinhas();
    this.recordAccess();
    this.setBreadCrumb();
    this.checkRouterParams();
  }

  setDisabledItemsForm(): void {
    this.form.get('ID_SUB_LINH').disable();
    this.form.get('ID_CLAS').disable();
    this.form.get('ID_PERFI_INAT').disable();
  }

  setActivedPerfil($event): void {
    if($event.ID == 0) {
      this.form.get('ID_PERFI_INAT').reset();
      this.form.get('ID_PERFI_INAT').disable();
      this.form.get('ID_PERFI_INAT').setValidators(Validators.nullValidator);
    } else {
      this.form.get('ID_PERFI_INAT').setValidators(Validators.required);
      this.form.get('ID_PERFI_INAT').reset();
      this.form.get('ID_PERFI_INAT').enable();
    }
  } 

  recordAccess(): void {
    this.activityService.registrarAcesso().subscribe();
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
          descricao: 'Manutenção de Materiais'
        }
      ];
    });
  }

  checkRouterParams(): void {
    this.$activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (queryParams: any) => {
        if (Object.keys(queryParams).length > 0) {
          const _response = this.routerService.getBase64UrlParams(queryParams);
          this.search(_response);
          this.setFormValues(_response);
        }
      }
    );
    this.$activatedRouteSubscription.unsubscribe();
  }

  setFormValues(queryParams?: any): void {  
    const ID_LINH = queryParams['ID_LINH'] ?? '';
      
    /* classes */
    if (Object.keys(ID_LINH).length > 0) {
      const paramsClasse = {
        ID_LINH: queryParams['ID_LINH'],
        ID_SUB_LINH: queryParams['ID_SUB_LINH'] ?? "",
        IN_STAT: 1,
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
        ID_LINH: queryParams['ID_LINH'],
        IN_START: 1,
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

  getParams(): any {
    let _params = {};
    let _obj = this.form.value;

    for (let prop in _obj) {
      if(_obj[prop]) {
        _params[prop] = _obj[prop];
      }
    }

    return _params;
  }

  getTiposMateriais(): void  {
    const params = {
      IN_STAT: 1
    };
    this.loaderNavbar = true;
    this.tiposMateriais = [];

    this.service
      .getTiposMateriais(params)
      .pipe(finalize(() => (this.loaderNavbar = false)))
      .subscribe(
        (res: any) => {
          if (Object.keys(res).length > 0) {
            if (res.status === 200) {
              this.tiposMateriais = res['body']['result'];
            }
          }
        },
        error => {
          this.pnotifyService.error('Erro ao carregar Linhas');
        }
      );
  }

  getLinhas(): void  {
    const params = {
      IN_STAT: 1
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
      let ID_LINH = this.form.get('ID_LINH').value;
      let IN_STAT = 1;
      let params = {
        ID_LINH: ID_LINH,
        IN_STAT: IN_STAT
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

  getClasses(): void  {
    this.classes = [];
    this.loaderNavbar = true;

    if (
      this.form.value['ID_LINH'] != null &&
      this.form.value['ID_LINH'].length > 0
    ) {
      let ID_LINH = this.form.get('ID_LINH').value;
      let ID_SUB_LINH = this.form.get('ID_SUB_LINH').value;
      let IN_STAT = 1;
      let params = {
        ID_LINH,
        ID_SUB_LINH : ID_SUB_LINH ?? "",
        IN_STAT
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

  onFilter(): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams())
    });
    this.search(this.getParams());
  }

  onSave(): void {
    this.confirmChange();
  }

  onEditMass(): void {

    const itemMassaBool = this.formCheck.get('ITEM_MASS').value;
  
    if(itemMassaBool) {
      this.data.forEach(e => {
        e.IN_STAT = 1;
      });
    } else {
      this.data.forEach(e => {
        e.IN_STAT = 0;
      });
    }
  }

  OnExcel(): void {
    let params = this.getParams();

    params['IN_GERA_RELA_EXCE'] = 1;
    params['ID_USUA'] = this.idUser;

    //this.getSearchExcel(params);
  }

  search(params: any): void {    
    this.loaderNavbar = true;
    this.loading = false;
    
    this.loading = true;
    this.noResult = false;
    this.loaderNavbar = false;

  }

  setIconUnabled(item: any) {
    let icon: string;

    if(item.ID_PERF_INAT == 0) {
      icon = 'fas fa-circle text-danger';
    }

    if(item.ID_PERF_INAT == 1) {
      icon = 'fas fa-circle text-warning';
    }

    if(item.ID_PERF_INAT == 2) {
      icon = 'fas fa-circle text-info';
    }

    return icon;
  }

  onDetail(item: any): void {
    item.select = !item.select;
    this.compressedTable = !this.compressedTable;
  }

  onEdit(item): void {
    const stat = item.IN_STAT == 0 ? 1 : 0;

    // item.ID_USUA = parseInt(this.idUsuario);

    // item.ID_CLAS = item.ID;

    item.IN_STAT = stat;

    this.formCheck.get('ITEM_MASS').setValue(false);
    //   .asObservable()
    //   .pipe(
    //     take(1),
    //     switchMap((result) => {
    //       if (!result) return EMPTY;

    //       this.loaderNavbar = true;
    //       return this.service.postClasses(item);
    //     }),
    //     finalize(() => {
    //       this.loaderNavbar = false;
    //     })
    //   )
    //   .subscribe(
    //     (success: any) => {
    //       this.pnotifyService.success();
    //     },
    //     (error: any) => {
    //       item.IN_STAT = item.IN_STAT == 1 ? 0 : 1;
    //       this.pnotifyService.error();
    //     }
    //   );
  }

  confirmChange(): any {
    // if (stat == 1)
      return this.confirmModalService.showConfirm(
        null,
        null,
        'Deseja realmente prosseguir com a alteração dos registros?',
        'Cancelar',
        'Confirmar'
      );

    // return this.confirmModalService.showConfirm(
    //   'inactivate',
    //   'Confirmar inativação',
    //   'Deseja realmente prosseguir com a inativação do Material?',
    //   'Cancelar',
    //   'Confirmar'
    // );
  }

  onCloseDetail(): void {
    this.data.forEach(e => {
      e.select = false;
    });
    this.compressedTable = false;
  }

  getLogsModal(item: any): void {
    this.itemMaterial = item;
    this.modal.title = "LOGS";
    this.modalLogsBool = true;
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

}
