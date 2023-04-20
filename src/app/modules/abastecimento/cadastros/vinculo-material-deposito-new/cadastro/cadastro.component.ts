import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from '@angular/forms';

import { Subscription, EMPTY } from 'rxjs';
import { finalize, take, switchMap } from 'rxjs/operators';

import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';

//Converte rota em base64
import { RouterService } from 'src/app/shared/services/core/router.service';

import { AbastecimentoCadastrosVinculoMaterialDepositoNewService } from '../vinculo-material-deposito-new.service';

@Component({
  selector: 'cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss']
})
export class AbastecimentoCadastrosVinculoMaterialDepositoCadastroComponent implements OnInit {
  loaderFullScreen = true;
  loaderNavbar: boolean;
  noResultDepositos: boolean = false;

  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  idUsuario: any = this.currentUser['info']['id'];

  form: FormGroup;

  breadCrumbTree: any = [];
  depositos: any = [];
  empresas: any = [];
  dadosDepositosAssociados: any = [];
  depositosFilter: any = [];
  idLinha: string;
  linha: string;
  idSubLinha: string;
  subLinha: string;
  idClasse: string;
  classe: string;
  idTipoMaterial: string;
  tipoMaterial: string;
  depositosAssociados: number;

  activatedRouteSubscription: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private routerService: RouterService,
    private titleService: TitleService,
    private confirmModalService: ConfirmModalService,
    private service: AbastecimentoCadastrosVinculoMaterialDepositoNewService
  ) { 
    this.form = this.formBuilder.group({
      empresas: [null],
      depositos: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.loaderFullScreen = false;
    }, 1000);
    this.registrarAcesso();
    this.setBreadCrumb();
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
          descricao: 'Vínculo Material Depósito',
          routerLink: `/abastecimento/cadastros/${params['idSubModulo']}/vinculo-material-deposito/lista`
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
          this.setValuesInfoMateriais(_response.item);
          this.getDepositos();
          this.getEmpresas();
          this.loadDepositosAssociados();
        }
      }
    );
    this.activatedRouteSubscription.unsubscribe();
  }

  onSave(): void {
    let depositos = this.form.get("depositos").value;
   
    let record = {
      ID_CLAS: this.idClasse,
      ID_APOI_TIPO_MATE: this.idTipoMaterial,
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

  updateMaterialDeposito(record:any): void {
    this.loaderNavbar = true;
    
    this.service
      .updateMaterialDeposito(record)
      .pipe(
        finalize(() => {
          (this.loaderNavbar = false), this.resetValuesForm(), this.loadDepositosAssociados();
        })
      )
      .subscribe(
        res => {
          if (Object.keys(res).length > 0) {
            if (res['responseCode'] === 200) {
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

  onUpdate(item: any): void {
    let idSituaçao = item.IN_STAT;

    if(item.IN_STAT === 0 ){
      idSituaçao = 1;
    } else if (item.IN_STAT === 1) {
      idSituaçao = 0;
    }

    let record = {
      ID_ASSO_DEPO_MATE: item.ID,
      ID_CLAS: item.ID_CLAS,
      ID_APOI_TIPO_MATE: item.ID_APOI_TIPO_MATE,
      ID_DEPO: item.ID_DEPO,
      IN_STAT: idSituaçao,
      ID_USUA: parseInt(this.idUsuario)
    };

    this.updateMaterialDeposito(record);
  }

  onDelete(item: any): void { 
    this.loaderNavbar = true;

    let record = {
      ID_ASSO_DEPO_MATE: item.ID,
      ID_USUA: parseInt(this.idUsuario)
    }

    this.confirmDelete()
    .asObservable()
    .pipe(
      take(1),
      switchMap(result =>
        result ? this.deleteMaterialDeposito(record) : EMPTY
      )
    )
    .subscribe(
      (success: any) => {
        this.pnotifyService.success();
        this.loaderNavbar = false;
        this.loadDepositosAssociados();
      },
      (error: any) => {
        this.pnotifyService.error();
        this.loaderNavbar = false;
        this.loadDepositosAssociados();
      }
    );

    this.deleteMaterialDeposito(record);
  }

  deleteMaterialDeposito(record) {
    return this.service.deleteMaterialDeposito(record);
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

  loadDepositosAssociados(): void {
    this.getDepositosAssociados({
      ID_CLAS: this.idClasse,
      ID_APOI_TIPO_MATE: this.idTipoMaterial
    });
  }

  getDepositos(): void {
    let idSituacao = 1;
    this.loaderNavbar = true;
    this.depositos = [];

    let idEmpresa = this.form.value['empresas'] ? this.form.value['empresas'] : '';

    this.service
      .getDepositos(idSituacao, idEmpresa)
      .pipe(finalize(() => {this.loaderNavbar = false;}))
      .subscribe(
        (res: any) => {
          if (Object.keys(res).length > 0) {
            if(res['body']['responseCode'] == 200) {
              this.form.get('depositos').reset();
              this.depositos = res['body']['result'];
            } else if (res['body']['responseCode'] == 404) {
              this.form.get('depositos').reset();
              this.pnotifyService.notice(res.message);
            }
          }
        },
        error => {
          this.form.get('depositos').reset();
          this.pnotifyService.error('Erro ao carregar Depositos');
        }
      );
  }

  getEmpresas(): void {
    let idSituacao = 1;
    this.loaderNavbar = true;
    this.empresas = [];

    this.service
      .getEmpresas(idSituacao)
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

  getDepositosAssociados(params: any): void {
    this.loaderNavbar = true;

    this.service
      .getMaterialDepositosDetalhes(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          // this.filterArrayDepositos();
        })
      )
      .subscribe(
        (res: any) => {
          if (res.status === 200) {
            if (res['body']['responseCode'] === 200) {               
              this.noResultDepositos = false;
              this.dadosDepositosAssociados = res['body']['result'];
            } else if (res['body']['responseCode'] === 404) {
              this.noResultDepositos = true;
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
  
  // filterArrayDepositos() {
  //   this.depositosFilter = [];
  //   let depositosFiltrados: Array<any> = [];
  //   let idDeposito: Array<any> = [];

  //   if(this.dadosDepositosAssociados.length > 0 ){
  //     this.dadosDepositosAssociados.forEach(deposito => {
  //       return idDeposito.push(deposito['ID_DEPO']);
  //     });
      
  //     depositosFiltrados = this.depositos.filter(item =>
  //       idDeposito
  //       .map(val => item.ID.indexOf(val))
  //       .map(val => (val > -1 ? false : true))
  //       .reduce((acc, cum) => acc && cum)
  //       );
        
  //       this.depositosFilter = depositosFiltrados;
  //     } else {
  //       this.depositosFilter = this.depositos;
  //     }
  // }

  setValuesInfoMateriais(params: any): void {
    this.idLinha = params["ID_LINH"];
    this.linha = params["NM_LINH"];
    this.idSubLinha = params["ID_SUB_LINH"];
    this.subLinha = params["NM_SUB_LINH"];
    this.idClasse = params["ID_CLAS"];
    this.classe = params["NM_CLAS"];
    this.idTipoMaterial = params["ID_APOI_TIPO_MATE"];
    this.tipoMaterial = params["NM_APOI_TIPO_MATE"];
    this.depositosAssociados = params["TT_DEPO_ASSO"];
  }

  resetValuesForm(): void {
    this.form.get('depositos').reset();
    this.form.get('empresas').reset();
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