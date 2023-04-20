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

import { AbastecimentoCadastrosIntegradorDepositosService } from './../integrador-depositos.service';

@Component({
  selector: 'cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss']
})
export class AbastecimentoCadastrosIntegradorDepositosCadastroComponent implements OnInit {
  loaderFullScreen = true;
  loaderNavbar: boolean;
  noResultDepositos: boolean = false;

  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  idUsuario: any = this.currentUser['info']['id'];

  form: FormGroup;

  breadCrumbTree: any = [];
  depositos: any = [];
  dadosDepositosAssociados: any = [];
  depositosFilter: any = [];
  Integrador: string;
  IdIntegrador: string;

  activatedRouteSubscription: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private routerService: RouterService,
    private titleService: TitleService,
    private confirmModalService: ConfirmModalService,
    private service: AbastecimentoCadastrosIntegradorDepositosService
  ) {
    this.form = this.formBuilder.group({
      depositos: [null, Validators.required]
    })
   }

  ngOnInit(): void {
    setTimeout(() => {
      this.loaderFullScreen = false;
    }, 1000);
    this.registrarAcesso();
    this.setBreadCrumb();
    this.checkRouterParams();
    this.titleService.setTitle('Vinculo Integrador X Depósitos');  
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
          descricao: 'Vínculo Integrador X Depósitos',
          routerLink: `/abastecimento/cadastros/${params['idSubModulo']}/integrador-depositos/lista`
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
          this.setValuesIntegrador(_response.item);
          this.getDepositos();
        }
      }
    );
    this.activatedRouteSubscription.unsubscribe();
  }

  onSave(): void {
    let depositos = this.form.get("depositos").value;
   
    let record = {
      ID_APOI_INTE_PEDI: this.IdIntegrador,
      ID_DEPO: depositos.toString(),
      IN_STAT: 1,
      ID_USUA: parseInt(this.idUsuario)
    };

    this.postIntegradorDepositos(record);
  }

  postIntegradorDepositos(record: any): void {
    this.loaderNavbar = true;
    
    this.service
      .postIntegradorDepositos(record)
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

  onDelete(item: any): void { 
    this.loaderNavbar = true;

    let record = {
      ID_ASSO_INTE_PEDI_DEPO: item.ID,
      ID_USUA: parseInt(this.idUsuario)
    }

    this.confirmDelete()
    .asObservable()
    .pipe(
      take(1),
      switchMap(result =>
        result ? this.deleteIntegradorDepositos(record) : EMPTY
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

    this.deleteIntegradorDepositos(record);
  }

  deleteIntegradorDepositos(record: any): any {
    return this.service.deleteIntegradorDepositos(record);
  }

  confirmDelete() {
    return this.confirmModalService.showConfirm(
      'delete',
      'Confirmar exclusão',
      'Deseja realmente prosseguir com a exclusão do registro?',
      'Cancelar',
      'Confirmar'
    );
  }

  loadDepositosAssociados(): void {
    this.getIntegradorDepositos({
      ID_APOI_INTE_PEDI: this.IdIntegrador
    });
  }

  getDepositos(): void {
    let idSituacao = 1;
    this.loaderNavbar = true;
    this.depositos = [];

    this.service
      .getDepositos(idSituacao)
      .pipe(finalize(() => {(this.loaderNavbar = false); (this.loadDepositosAssociados())}))
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

  getIntegradorDepositos(params: any): void {
    this.dadosDepositosAssociados = [];
    this.loaderNavbar = true;

    this.service
      .getIntegradorDepositos(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.filterArrayDepositos();
        })
      )
      .subscribe(
        res => {
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
  
  filterArrayDepositos(): void {
    this.depositosFilter = [];
    let depositosFiltrados: Array<any> = [];
    let idDeposito: Array<any> = [];

    if(this.dadosDepositosAssociados.length > 0) {
      this.dadosDepositosAssociados.forEach(deposito => {
        return idDeposito.push(deposito['ID_DEPO']);
      });
      
      depositosFiltrados = this.depositos.filter(item =>
        idDeposito
        .map(val => item.ID.indexOf(val))
        .map(val => (val > -1 ? false : true))
        .reduce((acc, cum) => acc && cum)
        );
        
        this.depositosFilter = depositosFiltrados;
    } else {
      this.depositosFilter = this.depositos;
    }

     
  }

  setValuesIntegrador(params: any): void {
    this.Integrador = params['NM_APOI_INTE_PEDI'];
    this.IdIntegrador = params['ID'];
  }

  resetValuesForm() {
    this.form.get('depositos').reset();
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
