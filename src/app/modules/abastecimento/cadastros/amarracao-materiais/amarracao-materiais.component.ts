import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PageChangedEvent } from 'ngx-bootstrap';

import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';

import { AbastecimentoCadastrosAmarracaoMateriaisService } from './amarracao-materiais.service';

@Component({
  selector: 'amarracao-materiais',
  templateUrl: './amarracao-materiais.component.html',
  styleUrls: ['./amarracao-materiais.component.scss']
})
export class AbastecimentoCadastrosAmarracaoMateriaisComponent implements OnInit {
  loaderFullScreen: boolean = true;
  loaderNavbar: boolean = false;
  loading: boolean = false;
  noResult: boolean = false;

  breadCrumbTree: any;

  form: FormGroup;

  /* Modal */
  formModal: FormGroup;

  tipoAtendimentoModal: any = [
    {ID:'1', NAME:'PEDIDO PAI/ESTOQUE AVANÇADO'},
    {ID:'2', NAME:'ENTRADA DE NOTA'},
    {ID:'3', NAME:'DUQUE 2'},
    {ID:'4', NAME:'PEDIDO INDUSTRIALIZAÇÃO'},
  ];

  associcaoModal: any = [
    {ID:'1', NAME:'22438 - S ACO 50 - I 10 MM - 3/8" - Sul Fluminense'},
    {ID:'2', NAME:'23313 - CA 50 FERRO CONST 10 MM 3/8" MT - Distribuidora'},
    {ID:'3', NAME:'22442 - S ACO 50 - I 10 MM - 3/8" CORTE ACAB ESP - Sul Fluminense'},
    {ID:'4', NAME:'24662 - ACO CA 50 - I 10 MM - 3/8" BARRA 12 MTS - Sul Fluminense'},
    {ID:'5', NAME:'26915 - S ACO CA 50 - I 10 MM - 3/8" DOBRADO - Sul Fluminense'},
    {ID:'6', NAME:'23326 - CA 50 FERRO P CONST 10 MM 3/8" MT DOBRADA- Distribuidora'},
  ];

  materialFornecedorModal: any = [
    {ID:'1', NAME:'123123 - AM IMSF'},
    {ID:'2', NAME:'123456 - AM VAL'},
    {ID:'4', NAME:'1 - AM PIRA'},
    {ID:'5', NAME:'2 - CSN'},
  ];

  custoEntregaModal: string;
  modal: any = [];
  modalForm: any = [];

  /* CurrentyMask para toneladas */
  current: any = {
    align: 'left',
    prefix: '',
    thousands: '.',
    decimal: ',',
    precision: 2
  };
  /* Modal */

  $activatedRouteSubscription: Subscription;

  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  idUsuario: any = this.currentUser['info']['id'];
 
  linhas: Array<any>;
  subLinhas: Array<any>;
  classes: Array<any>;
  materiais: Array<any>;
  itemAssociacao: any = [];
  itemAssociacaoRow: any = [];
  data: Array<any> = [
    {
      linha:'Civil',
      classe: 'CA-50',
      unidadeMedida: 'TON',
      codMaterial: '22442',
      descMaterial: 'CA-50 8 MM barra reta',
      tipoMaterial: 'Sul Fluminense',
      tipoAtendimento: [
        {
          idTipoAtendimento: '1',
          name: 'Pedido Pai/Estoque avançado', 
          idAssociacao: ['1','2'], 
          associacao: '22438 - S ACO 50 - I 10 MM - 3/8" - Sul Fluminense, 23313 - CA 50 FERRO CONST 10 MM 3/8" MT - Distribuidora', 
          idMateriaisFornecedores: ['1', '2'],
          materiaisFornecedores: '213123 - AM IMSF, 123456 - AM VAL',
          custoEntrada: 3000
        },
        {
          idTipoAtendimento: '3',
          name: 'Duque 2', 
          idAssociacao: ['2'], 
          associacao: '23313 - CA 50 FERRO CONST 10 MM 3/8" MT - Distribuidora', 
          idMateriaisFornecedores: [],
          materiaisFornecedores: '',
          custoEntrada: null
        },
      ]
    },
    {
      linha:'Civil',
      classe: 'CA-50',
      unidadeMedida: 'TON',
      codMaterial: '22442',
      descMaterial: 'CA-50 8 MM barra reta',
      tipoMaterial: 'Distribuidora',
      tipoAtendimento: [
        {
          idTipoAtendimento: '2',
          name: 'Entrada de nota',
          idAssociacao: [], 
          associacao: '',
          idMateriaisFornecedores: ['4', '5'],
          materiaisFornecedores: '1 - AM PIRA, 2 - CSN',
          custoEntrada: 3000
        },
        {
          idTipoAtendimento: '3',
          name: 'Duque 2', 
          idAssociacao: ['3'], 
          associacao: '22442 - S ACO 50 - I 10 MM - 3/8" CORTE ACAB ESP - Sul Fluminense',
          idMateriaisFornecedores: [],
          materiaisFornecedores: '',
          custoEntrada: null
        },
      ]
    },
    {
      linha:'Civil',
      classe: 'CA-50',
      unidadeMedida: 'TON',
      codMaterial: '22442',
      descMaterial: 'CA-50 8 MM barra reta',
      tipoMaterial: 'Distribuidora',
      tipoAtendimento: [
        {
          idTipoAtendimento: '2',
          name: 'Entrada de Nota',
          idAssociacao: [], 
          associacao: '',
          idMateriaisFornecedores: ['1', '2'],
          materiaisFornecedores: '213123 - AM IMSF, 123456 - AM VAL',
          custoEntrada: 3000
        },
      ]
    },
  ];

  tipoAtendimento: Array<any> = [
    {ID:'0', NAME: 'Entrada de Nota'},
    {ID:'1', NAME: 'Pedido industrialização'},
    {ID:'2', NAME: 'Pedido Pai/Estoque avançado'},
    {ID:'3', NAME: 'Duque 2'},
  ];

  campoOrdenacao: Array<any> = [
    {ID:'0', NAME: 'Linha'},
    {ID:'1', NAME: 'Un. Medida'},
    {ID:'2', NAME: 'Cód. Material'},
    {ID:'3', NAME: 'Tipo Material'},
  ];

  tipoOrdenacao: Array<any> = [
    {ID:'0', NAME: 'Crescente'},
    {ID:'1', NAME: 'Decrescente'}
  ];

  situations: Array<any> = [
    {ID:'0', NM_SITU: 'Inativo'},
    {ID:'1', NM_SITU: 'Ativo'}
  ];

  tipoAmarracao: Array<any> = [
    {ID:'0', NM_SITU: 'Consistente'},
    {ID:'1', NM_SITU: 'Inconsistente'}
  ];

  /* Ordenação principal*/
  reverse: boolean = false;
  key: string = 'NM_CLAS';
  /* Ordenação principal*/

  /* Paginação */
  itemsPerPage: number = 15;
  totalItems: number = 15;
  currentPage: number = 1;
  begin: number = 0;
  end: number = 15;
  /* Paginação */

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private routerService: RouterService,
    private titleService: TitleService,
    private service: AbastecimentoCadastrosAmarracaoMateriaisService
  ) {
    this.form = this.formBuilder.group({
      ID_LINH: [null],
      ID_SUB_LINH: [null],
      ID_CLAS: [null],
      ID_MATE: [null],
      TP_ATEN: [null],
      DS_TIPO_AMAR: [null, Validators.required],
      IN_STAT: [null, Validators.required],
      ID_FORN: [null],
      TP_ORDE: [null],
      NM_ORDE: [null],
    });
    this.formModal = this.formBuilder.group({
      TP_ATEN: [null],
      DESC_ASSO: [null],
      MATE_FORN: [null],
      CUST_ENTR: [null],
      ID_MATE: [null],
    });
   }

  ngOnInit(): void {
    setTimeout(() => {
      this.loaderFullScreen = false;
    }, 1000);
    this.titleService.setTitle('Amarração de Materiais');

    this.setDisabledItemsForm();
    this.registrarAcesso();
    this.setBreadCrumb();
    this.checkRouterParams();
    this.getLinhas();
  }

  setDisabledItemsForm(): void {
    this.form.get('ID_SUB_LINH').disable();
    this.form.get('ID_CLAS').disable();
    this.form.get('ID_MATE').disable();
    this.form.get('IN_STAT').setValue('1');
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
          descricao: 'Amarração de Materiais'
        }
      ];
    });
  }

  checkRouterParams(): void {
    this.$activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (queryParams: any) => {
        if (Object.keys(queryParams).length > 0) {
          let _response = this.routerService.getBase64UrlParams(queryParams);
          //this.search(_response);
          this.setFormValues(_response);
        }
      }
    );
    this.$activatedRouteSubscription.unsubscribe();
  }

  setFormValues(queryParams?: any): void {  
    const ID_LINH = queryParams['ID_LINH'] ?? '';
    const ID_CLAS = queryParams['ID_CLASS'] ?? '';
      
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
        let idSituacao = 1;
      let params = {
        idClasses: idClasses ?? "",
        idTipoMaterial: "",
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
      this.form.get('ID_MATE').reset();
      this.form.get('ID_MATE').disable();
    }
  }

  onFilter(): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams())
    });
    this.loading = true;
    //this.search(this.getParams());
  }

  search(params: any): void {    
    this.loaderNavbar = true;
    this.loading = false;
    
    this.data = [];
    setTimeout(() => {
      this.loading = true;
    }, 1000);
    // this.service
    // .getClassesMateriais(params)
    // .pipe(
    //   finalize(() => this.loaderNavbar = false)
    //   )
    //   .subscribe(res => {
    //     if(Object.keys(res).length > 0) {
    //       if(res.status == 200){
    //         if(res['body']['responseCode'] == 200) {
    //           this.loading = true;
    //           this.noResult = false;
    //           this.data = res['body']['result'];
    //         } else if (res['body']['responseCode'] ==  404){
    //         this.noResult = true;
    //         this.pnotifyService.notice("Não há itens a serem exibidos");
    //       }
    //     }
    //   }
    // },
    // error => {
    //   this.noResult = true;
    //   this.pnotifyService.error("Erro ao carregar Classes de Materiais");
    // });
  }

  // getSearchExcel(params: any): void {
  //   this.loaderNavbar = true;
  //   this.dataExcel = '';

  //   this.service
  //     .getClassesMateriais(params)
  //     .pipe(finalize(() => (this.loaderNavbar = false)))
  //     .subscribe(
  //       (res: any) => {
  //         if (Object.keys(res).length > 0) {
  //           if (res['body']['responseCode'] === 200) {
  //             this.dataExcel = res['body']['result'];
  //             this.pnotifyService.success(this.dataExcel);
  //           } else if (
  //             res['body']['responseCode'] === 404
  //           ) {
  //             this.pnotifyService.notice('Nenhuma informação encontrada');
  //           }
  //         }
  //       },
  //       error => {
  //         this.pnotifyService.error('Erro ao carregar dados para excel');
  //       }
  //     );
  // }

  onExcel(): void {
  }
  
  onEdit(item: any, itemRow: any): void {
    this.modal.codMaterial = item.codMaterial;
    this.modal.descMaterial = item.descMaterial;
    this.modal.tipoMaterial = item.tipoMaterial;

    this.modalForm.idTipoAtendimento = itemRow.idTipoAtendimento ?? '';
    this.modalForm.idAssociacao = itemRow.idAssociacao ?? [];
    this.modalForm.idMateriaisFornecedores = itemRow.idMateriaisFornecedores ?? [];
    this.modalForm.custoEntrada = itemRow.custoEntrada ?? '';

    this.formModal.get('TP_ATEN').setValue(this.modalForm.idTipoAtendimento);
    this.formModal.get('DESC_ASSO').setValue(this.modalForm.idAssociacao);
    this.formModal.get('MATE_FORN').setValue(this.modalForm.idMateriaisFornecedores);
    this.formModal.get('CUST_ENTR').setValue(this.modalForm.custoEntrada);
  }

  onAdd(item: any): void {
    this.modal.codMaterial = item.codMaterial;
    this.modal.descMaterial = item.descMaterial;
    this.modal.tipoMaterial = item.tipoMaterial;
  }

  onClose(): void {
    this.formModal.reset();
  }

  onSaveDataModal() : void {
    const tpAtendimento = this.formModal.value['TP_ATEN'];
    const mateForne = this.formModal.value['MATE_FORN'];
    const tpMaterial = this.modal.tipoMaterial;
    
    if(tpAtendimento=='1' && tpMaterial=='Distribuidora') {
      this.pnotifyService.notice('Operação não permitida: não é possivel inserir este vinculo para materiais do tipo distribuidora.');
    } else if(tpAtendimento=='3' && mateForne=='1') {
      this.pnotifyService.notice('Operação não permitida: O material em questão já está vinculado ao material principal.');
    } else {
      this.pnotifyService.success('Associação relizada com sucesso');
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
