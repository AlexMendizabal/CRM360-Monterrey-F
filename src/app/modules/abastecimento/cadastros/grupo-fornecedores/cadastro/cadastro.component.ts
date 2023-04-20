import { Component, OnInit } from '@angular/core';

import { FormGroup, FormBuilder, Validators,  FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';

import { AbastecimentoCadastrosGrupoFornecedoresService } from './../grupo-fornecedores.service';
import { take, switchMap, finalize } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

@Component({
  selector: 'cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss']
})
export class AbastecimentoCadastrosGrupoFornecedoresCadastroComponent implements OnInit {
  loaderFullScreen: boolean  = true;
  loaderNavbar: boolean = false;
  enableCadastroFornecedor:boolean = false;
  loadingDadosFornecedores:boolean = false;
  noResult:boolean = false;
  noResultDados:boolean = false;
  editBool:boolean = false;

  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  idUsuario: any = this.currentUser['info']['id'];

  form: FormGroup;

  breadCrumbTree: any = [];
  integradores: any = [];
  fornecedores: any = [];
  dadosFornecedores: any = [];
  dados:any = [];

  idAssociacaoGrupoFornecedor: string;
  idGrupoFornecedor: string;
  idGrupoFornecedorIntPed: string;
  descGrupoFornecedor: string;
  descGrupoFornecedorIntPed: string;
  idSituacao: number;

  activatedRouteSubscription: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private routerService: RouterService,
    private titleService: TitleService,
    private confirmModalService: ConfirmModalService,
    private service: AbastecimentoCadastrosGrupoFornecedoresService
  ) { 
    this.form = this.formBuilder.group({
      grupo: [null, Validators.required],
      situacao: [null, Validators.required],
      integrador: [null, Validators.required],
      fornecedor: [null]
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.loaderFullScreen = false;
    }, 9000);
    this.registrarAcesso();
    this.setBreadCrumb();
    this.checkRouterParams();
    this.getIntegradores();
    this.titleService.setTitle('Grupo e Fornecedores');  
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
          descricao: 'Grupo e fornecedores',
          routerLink: `/abastecimento/cadastros/${params['idSubModulo']}/grupo-fornecedores/lista`
        },
        {
          descricao: 'Cadastro'
        },
      ];
    });
  }

  checkRouterParams(): void {
    this.activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (queryParams: any) => {
        if (Object.keys(queryParams).length > 0) {
          let _response = this.routerService.getBase64UrlParams(queryParams);
          this.getFornecedores();
          this.setValuesGrupoFornecedor(_response.item);
        }
      }
      );
      this.activatedRouteSubscription.unsubscribe();
    }
    
    setValuesGrupoFornecedor(item: any): void {
      this.idAssociacaoGrupoFornecedor = item["ID"],
      this.editBool = item["edit"]

      this.getAssociacaoGrupoFornecedoresIntPed({
        ID_ASSO_GRUP_FORN_INTE_PEDI:this.idAssociacaoGrupoFornecedor,
        ID_GRUP_FORN:'',
        ID_APOI_INTE_PEDI:'',
        ID_FORN:'',
        IN_STAT: '',
        NR_PAGE_INIC: '',
        TT_REGI_PAGI: '',
        ORDE_BY: '',
        ORDE_TYPE: ''
        });
  }

  getAssociacaoGrupoFornecedoresIntPed(params: any): void {
    //this.loaderNavbar = true;

    this.service
      .getAssociacaoGrupoFornecedoresIntPed(params)
      .pipe(finalize(() => (this.searchAssociacaoGrupoFornecedores())))
      .subscribe(
        (res: any) => {
          if (res.status === 200) {
            if (res['body']['responseCode'] === 200) {
              this.dados = res['body']['result'];

              this.idGrupoFornecedor = this.dados[0]["ID_GRUP_FORN"],
              this.idGrupoFornecedorIntPed = this.dados[0]['ID_APOI_INTE_PEDI'],
              this.descGrupoFornecedor = this.dados[0]['NM_GRUP_FORN'],
              this.descGrupoFornecedorIntPed = this.dados[0]["NM_APOI_INTE_PEDI"],
              this.idSituacao = this.dados[0]['IN_STAT']

              this.form.get('grupo').setValue(this.descGrupoFornecedor);
              this.form.get('situacao').setValue(this.idSituacao);
              this.form.get('integrador').setValue(this.idGrupoFornecedorIntPed );

              this.noResultDados = false;
            } else if (res['body']['responseCode'] === 404) {
              this.noResultDados = true;
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

  getFornecedores(): void {
    this.loaderFullScreen = true;
    this.loaderNavbar = true;
    let idSituacao = 1;
    this.fornecedores = [];
    
    this.service
    .getFornecedores(idSituacao)
    .pipe(finalize(()=>{ this.loaderNavbar = false;this.enableCadastroFornecedor = true;}))
    .subscribe(
      res => {
        if (Object.keys(res).length > 0) {
            this.fornecedores = res['body']['result'];
            this.fornecedores.map(
                (fornecedor: any) => {
                  fornecedor.full_name = fornecedor.ID_REFE_ERP + ' - ' + fornecedor.NM_FANT
                  return fornecedor;
                }
              )
            this.loaderFullScreen = false
          }
        },
        error => {
          this.enableCadastroFornecedor = false;
          this.pnotifyService.error('Erro ao carregar fornecedor');
        }
      );
  }

  searchAssociacaoGrupoFornecedores(): void {
    this.getAssociacaoGrupoFornecedorFornecedores({
      ID_ASSO_GRUP_FORN_FORN: '',
      ID_INTE_PEDI: '',
      ID_GRUP_FORN: this.idGrupoFornecedor,
      ID_FORN: '',
      IN_STAT: '',
      NR_PAGE_INIC:	'',
      TT_REGI_PAGI:	'',
      ORDE_BY: '',
      ORDE_TYPE: ''
    })
  }

  getAssociacaoGrupoFornecedorFornecedores(params: any): void {
    this.loadingDadosFornecedores = false;

    this.dadosFornecedores = [];
    this.loaderNavbar = true;
    
    this.service
    .getAssociacaoGrupoFornecedorFornecedores(params)
    .pipe(finalize(() => (this.loaderNavbar = false)))
    .subscribe(
      res => {
        if (Object.keys(res).length > 0) {
          if(res['body']['responseCode'] === 200) {
            this.dadosFornecedores = res['body']['result'];
            this.loadingDadosFornecedores = true;
            this.noResult = false;
          } else if(res['body']['responseCode'] === 404) {
            this.noResult = true;
            this.pnotifyService.notice(res['body']['message']);
          }
        }
        },
        error => {
          this.loadingDadosFornecedores = false;
          this.noResult = true;
          this.pnotifyService.error('Erro ao carregar fornecedor');
        }
      );
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

  onSave(): void {
    if(this.editBool) {
      this.updateCadastro();
    } else {
      this.createCadastro();
    }
  }
  
  createCadastro(): void {
    this.saveGrupoFornecedor();
  }
  
  updateCadastro(): void {
    this.saveGrupoFornecedor();
    this.saveAssociacaoGrupoFornecedores();
  }

  saveGrupoFornecedor(): void {
    let grupo = this.form.get("grupo").value;
    let idSituacao = this.form.get("situacao").value;
    let record: any = [];

    if (this.editBool) {
      record = {
        ID_GRUP_FORN: this.idGrupoFornecedor,
        NM_GRUP_FORN: grupo,
        IN_STAT: parseInt(idSituacao),
        ID_USUA: parseInt(this.idUsuario)
      }
    } else {
      record = {
        NM_GRUP_FORN: grupo,
        IN_STAT: parseInt(idSituacao),
        ID_USUA: parseInt(this.idUsuario)
      };
    }

    this.postGrupoFornecedor(record);

  }

  saveGrupoFornecedorIntPed(params: any): void {
    let integrador = this.form.get("integrador").value;
    let idSituacao = this.form.get("situacao").value;
    let record:any = [];

    if(this.editBool) {
      record = {
        ID_ASSO_GRUP_FORN_INTE_PEDI:  this.idAssociacaoGrupoFornecedor,
        ID_APOI_INTE_PEDI: this.idGrupoFornecedorIntPed,
        ID_GRUP_FORN: params['ID_GRUP_FORN'],
        IN_STAT: parseInt(idSituacao),
        ID_USUA: parseInt(this.idUsuario),
      }
    } else {
      record = {
        ID_APOI_INTE_PEDI: integrador,
        ID_GRUP_FORN: params['ID_GRUP_FORN'],
        IN_STAT: parseInt(idSituacao),
        ID_USUA: parseInt(this.idUsuario),
      }
    }

    this.postGrupoFornecedorIntPed(record);
  }

  postGrupoFornecedor(record: any): void {
    this.loaderNavbar = true;
    
    this.service
      .postGrupoFornecedores(record)
      .pipe(
        finalize(() => {
          (this.loaderNavbar = false);
        })
      )
      .subscribe(
        res => {
          if (Object.keys(res).length > 0) {
            if (res['responseCode'] === 201) {
                let params = { ID_GRUP_FORN: res['ID_GRUP_FORN'] };
                this.saveGrupoFornecedorIntPed(params);
              this.pnotifyService.success(res['message']);;
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

  postGrupoFornecedorIntPed(record: any): void {
    this.loaderNavbar = true;
    
    this.service
      .postAssociacaoGrupoFornecedoresIntPed(record)
      .pipe(
        finalize(() => {
          (this.loaderNavbar = false)
        })
      )
      .subscribe(
        res => {
          if (Object.keys(res).length > 0) {
            if (res['responseCode'] === 201) {
              this.pnotifyService.success(res['message']);
              if (!this.editBool) {
                this.resetValuesForm();
              }
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

  saveAssociacaoGrupoFornecedores(): void {
    let idFornecedor = this.form.get("fornecedor").value;

    if (idFornecedor != null || idFornecedor != undefined) {
      this.postAssociacaoGrupoFornecedores({
        ID_GRUP_FORN: this.idGrupoFornecedor,
        ID_FORN: idFornecedor,
        IN_STAT: 1,
        ID_USUA: parseInt(this.idUsuario)
      });
    }
  }

  postAssociacaoGrupoFornecedores(record: any): void {
    this.loaderNavbar = true;
    
    this.service
      .postAssociacaoGrupoFornecedorFornecedores(record)
      .pipe(
        finalize(() => {
          (this.loaderNavbar = false), this.form.get("fornecedor").reset(), this.searchAssociacaoGrupoFornecedores();
        })
      )
      .subscribe(
        res => {
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

  onDelete(item: any): void { 
    this.loaderNavbar = true;

    let record = {
      ID_ASSO_FORN_GRUP_FORN: item.ID_ASSO_GRUP_FORN_FORN,
      ID_USUA: parseInt(this.idUsuario)
    }

    this.confirmDelete()
    .asObservable()
    .pipe(
      take(1),
      switchMap(result =>
        result ? this.deleteMaterialGrupoFornecedor(record) : EMPTY
      )
    )
    .subscribe(
      (success: any) => {
        this.pnotifyService.success();
        this.loaderNavbar = false;
        this.searchAssociacaoGrupoFornecedores()
      },
      (error: any) => {
        this.pnotifyService.error();
        this.loaderNavbar = false;
        this.searchAssociacaoGrupoFornecedores()
      }
    );

    this.deleteMaterialGrupoFornecedor(record);
  }

  deleteMaterialGrupoFornecedor(record: any) : any {
    return this.service.deleteAssociacaoGrupoFornecedorFornecedores(record);
  }

  confirmDelete(): any {
    return this.confirmModalService.showConfirm(
      'delete',
      'Confirmar exclusão',
      'Deseja realmente prosseguir com a exclusão do registro?',
      'Cancelar',
      'Confirmar'
    );
  }

  resetValuesForm(): void {
    this.form.get("grupo").reset();
    this.form.get("situacao").reset();
    this.form.get("integrador").reset();
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
}
