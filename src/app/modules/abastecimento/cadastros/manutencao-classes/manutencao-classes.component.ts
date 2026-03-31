import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { EMPTY, Subscription } from 'rxjs';
import { finalize, switchMap, take } from 'rxjs/operators';

import { BsModalRef, BsModalService, PageChangedEvent } from 'ngx-bootstrap';

import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';

import { AbastecimentoCadastrosManutencaoClassesService } from './manutencao-classes.service';

@Component({
  selector: 'manutencao-classes',
  templateUrl: './manutencao-classes.component.html',
  styleUrls: ['./manutencao-classes.component.scss']
})
export class AbastecimentoCadastrosManutencaoClassesComponent implements OnInit {
  loaderFullScreen: boolean = true;
  loaderNavbar: boolean = false;
  loading: boolean = false;
  noResult: boolean = false;
  modalMaterialBool: boolean = false;
  modalLogsBool: boolean = false;

  breadCrumbTree: any;

  form: FormGroup;

  $activatedRouteSubscription: Subscription;

  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  idUser: any = this.currentUser['info']['id'];

  linhas: Array<any>;
  subLinhas: Array<any>;
  classes: Array<any>;
  data: any = [];
  modal: any = [];
  itemClasse: any = [];

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

  modalRef: BsModalRef;

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
    private service: AbastecimentoCadastrosManutencaoClassesService
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
    this.titleService.setTitle('Manutenção de Classes');
    this.setDisabledItemsForm();
    this.getLinhas();
    this.recordAccess();
    this.setBreadCrumb();
    this.checkRouterParams();
  }

  setDisabledItemsForm(): void {
    this.form.get('ID_SUB_LINH').disable();
    this.form.get('ID_CLAS').disable();
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
          descricao: 'Manutenção de Classes'
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

  OnExcel(): void {
    let params = this.getParams();

    params['IN_GERA_RELA_EXCE'] = 1;
    params['ID_USUA'] = this.idUser;

    //this.getSearchExcel(params);
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
            this.pnotifyService.notice(res['body']['message']);
          }
        }
      }
    },
    error => {
      this.noResult = true;
      this.pnotifyService.error("Erro ao carregar Classes de Materiais");
    });
  }

  abledEdit(item): void {
    item.ON_EDIT_CELL = !item.ON_EDIT_CELL;
  }

  onEdit(item): void {
    const stat = item.IN_STAT == 1 ? 0 : 1;

    item.ID_USUA = parseInt(this.idUser);

    item.ID_CLAS = item.ID;


    this.confirmChange(item,stat);
    //   .asObservable()
    //   .pipe(
    //     take(1),
    //     switchMap((result: any) => {
    //       if (!result) return EMPTY;

    //       this.loaderNavbar = true;
    //       item.IN_STAT = stat;
    //       //return this.service.postClasses(item);
    //       return console.log("aqui");
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

  onSave(): void {

  }

  confirmChange(item, stat): any {
    if (stat == 1){
      item.IN_STAT = stat;
      return this.confirmModalService.showConfirm(
        null,
        null,
        'Deseja realmente prosseguir com a ativação da Classe?',
        'Cancelar',
        'Confirmar'
      );

    }
    return this.getMateriaisStatusModal(item);
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  getMateriaisStatusModal(item: any): void {
    this.modalLogsBool = false;
    this.itemClasse = item;
    this.modal.title = "MATERIAIS ATIVOS - STATUS";
    this.modalMaterialBool = true;    
  }

  getLogsModal(item: any): void {
    this.modalMaterialBool = false; 
    this.itemClasse = item;
    this.modal.title = "LOGS";
    this.modalLogsBool = true;
  }

  onClose(): void{
    this.modalMaterialBool = false;
    this.modalLogsBool = false;
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
