import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder, FormControl } from '@angular/forms';

import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { TitleService } from 'src/app/shared/services/core/title.service';

import { Subscription, EMPTY } from 'rxjs';

import { AbastecimentoCadastrosClassesMateriaisService } from './classes-materiais.service';
import { PageChangedEvent } from 'ngx-bootstrap';
import { finalize, take, switchMap } from 'rxjs/operators';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';

@Component({
  selector: 'classes-materiais',
  templateUrl: './classes-materiais.component.html',
  styleUrls: ['./classes-materiais.component.scss']
})
export class AbastecimentoCadastrosClassesMateriaisComponent implements OnInit {
  loaderFullScreen: boolean = true;
  loaderNavbar: boolean = false;
  loading: boolean = false;
  noResult: boolean = false;
  loadingLogs: boolean = false;
  noResultLogs: boolean = false;
  loaderModal: boolean = false;

  breadCrumbTree: any;

  form: FormGroup;

  $activatedRouteSubscription: Subscription;

  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  idUsuario: any = this.currentUser['info']['id'];
 
  linhas: Array<any>;
  subLinhas: Array<any>;
  classes: Array<any>;
  data: Array<any> = [];
  dataLogs: Array<any> = [];
  dataExcel: string = '';

  situations: Array<any> = [
    {ID:'0', NM_SITU: 'Inativo'},
    {ID:'1', NM_SITU: 'Ativo'}
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
    private confirmModalService: ConfirmModalService,
    private atividadesService: AtividadesService,
    private routerService: RouterService,
    private titleService: TitleService,
    private service: AbastecimentoCadastrosClassesMateriaisService
  ) { 
    this.form = this.formBuilder.group({
      ID_LINH: [null],
      ID_SUB_LINH: [null],
      ID_CLAS: [null],
      IN_STAT: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.loaderFullScreen = false;
    }, 1000);
    this.titleService.setTitle('Classes de Materiais');
    this.setDisabledItemsForm();
    this.registrarAcesso();
    this.setBreadCrumb();
    this.checkRouterParams();
    this.getLinhas();
  }

  setDisabledItemsForm(): void {
    this.form.get('ID_SUB_LINH').disable();
    this.form.get('ID_CLAS').disable();
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
          descricao: 'Classes de Materiais'
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
    const ID_LINH = queryParams['ID_LINH'] ?? '';
      
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
    }
  }

  getClasses(): void  {
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

  onFilter(): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams())
    });
    this.search(this.getParams());
  }

  search(params: any): void {    
    this.loaderNavbar = true;
    this.loading = false;
    
    this.data = [];
    this.service
    .getClassesMateriais(params)
    .pipe(
      finalize(() => this.loaderNavbar = false)
      )
      .subscribe(res => {
        if(Object.keys(res).length > 0) {
          if(res.status == 200){
            if(res['body']['responseCode'] == 200) {
              this.loading = true;
              this.noResult = false;
              this.data = res['body']['result'];
            } else if (res['body']['responseCode'] ==  404){
            this.noResult = true;
            this.pnotifyService.notice("Não há itens a serem exibidos");
          }
        }
      }
    },
    error => {
      this.noResult = true;
      this.pnotifyService.error("Erro ao carregar Classes de Materiais");
    });
  }

  onEdit(item): void {
    const stat = item.IN_STAT == 1 ? 0 : 1;

    item.ID_USUA = parseInt(this.idUsuario);

    item.ID_CLAS = item.ID;

    this.confirmChange(stat)
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) => {
          if (!result) return EMPTY;

          this.loaderNavbar = true;
          item.IN_STAT = stat;
          return this.service.postClasses(item);
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

  onLogs(item: any): void {
    console.log(item);

    let params = {
      ID_CLAS: item['ID']
    }

    this.getLogs(params);
  }

  getLogs(params: any): void {    
    this.loaderNavbar = true;
    this.loadingLogs = false;
    this.loaderModal = false;
    
    this.dataLogs = [];
    this.service
    .getClassesMateriaisLogs(params)
    .pipe(
      finalize(() => {this.loaderNavbar = false, this.loaderModal = true})
      )
      .subscribe(res => {
        if(Object.keys(res).length > 0) {
          if(res.status == 200){
            if(res['body']['responseCode'] == 200) {
              this.loadingLogs = true;
              this.noResultLogs = false;
              this.dataLogs = res['body']['result'];
            } else if (res['body']['responseCode'] ==  404){
            this.noResultLogs = true;
            this.pnotifyService.notice("Não há itens a serem exibidos");
          }
        }
      }
    },
    error => {
      this.noResultLogs = true;
      this.pnotifyService.error("Erro ao carregar Classes de Materiais");
    });
  }

  getSearchExcel(params: any): void {
    this.loaderNavbar = true;
    this.dataExcel = '';

    this.service
      .getClassesMateriais(params)
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

  OnExcel(): void {
    let params = this.getParams();

    params['IN_GERA_RELA_EXCE'] = 1;
    params['ID_USUA'] = this.idUsuario;

    this.getSearchExcel(params);
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
  /* Paginação Modal*/

  /* Ordenação Modal*/
  sortA(keyA: string): void {
    this.keyA = keyA;
    this.reverseA = !this.reverseA;
  }
  /* Ordenação Modal*/

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
