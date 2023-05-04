import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription, Observable, EMPTY } from 'rxjs';

import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
//Converte rota em base64
import { RouterService } from 'src/app/shared/services/core/router.service';


import { AbastecimentoCadastrosNivelEstoqueDepositoNewService } from '../nivel-estoque-deposito-new.service';
import { finalize, switchMap, take } from 'rxjs/operators';

@Component({
  selector: 'cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss']
})
export class AbastecimentoCadastrosNivelEstoqueDepositoNewCadastroComponent implements OnInit {
  loaderFullScreen:boolean = true;
  noResult:boolean = false;
  loaderNavbar: boolean;
  enableSave: boolean = false;
  minimoBool: boolean = false;
  segurancaBool: boolean = false;
  maximoBool: boolean = false;
  
  depositos: any = [];
  dadosNiveisEstoquesCadastrados: any = [];

  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  idUsuario: any = this.currentUser['info']['id'];

  form: FormGroup;

  breadCrumbTree: any = [];

  /* CurrentyMask para toneladas */
  ton: any = {
    align: 'left',
    prefix: '',
    thousands: '.',
    decimal: ',',
    precision: 3
  };

  idLinha: string;
  idErpMaterial: string;
  idMaterial: number;
  descMaterial: string;
  linha: string;
  idSubLinha: string;
  subLinha: string;
  idClasse: string;
  classe: string;
  idTipoMaterial: string;
  tipoMaterial: string;

  activatedRouteSubscription: Subscription;


  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private routerService: RouterService,
    private titleService: TitleService,
    private confirmModalService: ConfirmModalService,
    private service: AbastecimentoCadastrosNivelEstoqueDepositoNewService
  ) {
   this.form = this.formBuilder.group({
      deposito: [null, Validators.required],
      volumeMinimo: [null, Validators.required],
      volumeSeguranca: [null, Validators.required],
      volumeMaximo: [null, Validators.required]
    })
   }

  ngOnInit(): void {
    setTimeout(() => {
      this.loaderFullScreen = false;
    }, 1000);
    this.registrarAcesso();
    this.setBreadCrumb();
    this.checkRouterParams();
    this.getDepositosAssociados();
    this.titleService.setTitle('Nível de estoque por depósito');
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
          descricao: 'Nível de estoque por Depósito',
          routerLink: `/abastecimento/cadastros/${params['idSubModulo']}/nivel-material-estoque/lista`
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

          this.setValuesInfoNivelEstoque(_response.item);
          this.loadNiveisEstoqueCadastrados();

        }
      }
    );
    this.activatedRouteSubscription.unsubscribe();
  }

  setValuesInfoNivelEstoque(params: any): void {
    this.idLinha = params["ID_LINH"];
    this.linha = params["NM_LINH"];
    this.idSubLinha = params["ID_SUB_LINH"];
    this.subLinha = params["NM_SUB_LINH"];
    this.idClasse = params["ID_CLAS"];
    this.classe = params["NM_CLAS"];
    this.idTipoMaterial = params["ID_APOI_TIPO_MATE"];
    this.tipoMaterial = params["NM_APOI_TIPO_MATE"];
    this.idErpMaterial = params["ID_REFE_ERP"];
    this.idMaterial = params["ID_MATE"];
    this.descMaterial = params["NM_MATE"];
  }

  loadNiveisEstoqueCadastrados(): void {
    this.getNiveisEstoqueCadastrados({
      ID_MATE:this.idMaterial
    });
  }

  getNiveisEstoqueCadastrados(params: any): void {
    this.loaderNavbar = true;

    this.service
      .getNiveisEstoqueUnidades(params)
      .pipe(finalize(() => (this.loaderNavbar = false)))
      .subscribe((res: any) => {
        if (Object.keys(res).length > 0) {
          if (res.status === 200) {
           if (res['body']['responseCode'] === 200) {
             this.dadosNiveisEstoquesCadastrados = res['body']['result'];
             this.noResult = false;
           } else if (res['body']['responseCode'] === 404) {
             this.noResult = true;
             this.pnotifyService.notice('Não há dados');
           }
          }
        }
      });
  }

  getDepositosAssociados(): void {
    let idSituacao = 1;
    this.loaderNavbar = true;
    this.depositos = [];

    this.service
      .getDepositosAssociados(idSituacao, this.idClasse, this.idTipoMaterial)
      .pipe(finalize(() => (this.loaderNavbar = false)))
      .subscribe(
        res => {
          if (Object.keys(res).length > 0) {
            this.depositos = res['body']['result'];
          }
        },
        error => {
          this.pnotifyService.error('Erro ao carregar Depositos');
        }
      );
  }

  onSave(): void {
    let depositos = this.form.get("deposito").value;
    let volumeMinimo = this.form.get("volumeMinimo").value;
    let volumeSeguranca = this.form.get("volumeSeguranca").value;
    let volumeMaximo = this.form.get("volumeMaximo").value;

    let record = {
      ID_MATE: this.idMaterial,
      ID_DEPO: depositos.toString(),
      TT_ESTO_MINI: parseFloat(volumeMinimo),
      TT_ESTO_SEGU: parseFloat(volumeSeguranca),
      TT_ESTO_MAXI: parseFloat(volumeMaximo),
      ID_USUA: parseInt(this.idUsuario),
      IN_STAT: 1
    };

    this.postNivelEstoque(record);
  }

  postNivelEstoque(record: any): void {
    this.loaderNavbar = true;
    
    this.service
      .postNivelEstoque(record)
      .pipe(
        finalize(() => {
          (this.loaderNavbar = false), this.resetValuesForm(), this.loadNiveisEstoqueCadastrados();
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

  onUpdate(item: any): void {
    let idSituaçao = item.IN_STAT;

    if(item.IN_STAT === 0 ){
      idSituaçao = 1;
    } else if (item.IN_STAT === 1) {
      idSituaçao = 0;
    }

    let record = {
      ID_MATE: this.idMaterial,
      ID_DEPO: item.ID_DEPO,
      TT_ESTO_MINI: item.TT_ESTO_MINI,
      TT_ESTO_SEGU: item.TT_ESTO_SEGU,
      TT_ESTO_MAXI: item.TT_ESTO_MAXI,
      ID_USUA: parseInt(this.idUsuario),
      IN_STAT: idSituaçao
    };

    this.postNivelEstoque(record);
  }

  onDelete(item: any): void {
    this.loaderNavbar = true;

    let record = {
      ID_ASSO_MATE_DEPO: item.ID,
      ID_USUA: parseInt(this.idUsuario)
    }

    this.confirmDelete()
    .asObservable()
    .pipe(
      take(1),
      switchMap(result =>
        result ? this.deleteNivelEstoque(record) : EMPTY
      )
    )
    .subscribe(
      (success: any) => {
        this.pnotifyService.success();
        this.loaderNavbar = false;
        this.loadNiveisEstoqueCadastrados();
      },
      (error: any) => {
        this.pnotifyService.error();
        this.loaderNavbar = false;
        this.loadNiveisEstoqueCadastrados();
      }
    );

    this.deleteNivelEstoque(record);

  }

  deleteNivelEstoque(record: any): any {
    return this.service.deleteNivelEstoque(record);
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
    this.form.get('deposito').reset();
    this.form.get("volumeMinimo").reset();
    this.form.get("volumeSeguranca").reset();
    this.form.get("volumeMaximo").reset();
  }

  /* Realiza comparação para verificar se volume minimo < volume seguranca < volume maximo */
  compareValues(field: any): any {
    let minimo = this.form.get("volumeMinimo").value;
    let seguranca = this.form.get("volumeSeguranca").value;
    let maximo = this.form.get("volumeMaximo").value;

    if (this.form.get("volumeMaximo").touched) {
      if(field == "volumeMinimo") {
        if( minimo > seguranca || minimo > maximo) {
          this.minimoBool = false;
          return true;
        } else {
          this.minimoBool = true;
        }
      }
  
      if(field == "volumeSeguranca") {
        if( seguranca > maximo || seguranca < minimo) {
          this.segurancaBool = false;
          return true;
        } else {
          this.segurancaBool = true;
        }
      }
  
      if(field == "volumeMaximo") {
        if( maximo < minimo || maximo < seguranca) {
          this.maximoBool = false;
          return true;
        } else {
          this.maximoBool = true;
        }
      }
    }
  }

  /* Validação para habilitar botão de salvar */
  validatorsSave(): boolean {
    if( this.minimoBool && this.segurancaBool && this.maximoBool ) {
      this.enableSave = true;
    } else {
      this.enableSave = false;
    }
    return this.enableSave;
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
