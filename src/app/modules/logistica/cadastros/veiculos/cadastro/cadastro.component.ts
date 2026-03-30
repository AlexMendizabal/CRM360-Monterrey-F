import { RouterService } from 'src/app/shared/services/core/router.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { BsLocaleService, BsDatepickerConfig, BsModalService, BsModalRef } from 'ngx-bootstrap';
import { finalize } from 'rxjs/operators';

import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  AbstractControl,
  Validators,
  FormControl,
} from '@angular/forms';
//interfaces
import { ILogisticaVeiculo } from './../models/veiculo';
import { ILogisticaTipoVeiculo } from './../../tipo-veiculo/models/tipo-veiculo';

//rxjs
import { Subscription } from 'rxjs';
import { LogisticaTipoVeiculoService } from '../../tipo-veiculo/services/tipo-veiculo.service';
import { LogisticaVeiculoService } from '../services/veiculo.service';
import { LogisticaTransportadorasService } from '../../transportadoras/services/transportadoras.service';
import { DateService } from 'src/app/shared/services/core/date.service';

import { LogisticaVeiculosModaisMotoristasComponent } from './../modais/motoristas/motoristas.component';

@Component({
  selector: 'logistica-veiculos-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss'],
})
export class LogisticaVeiculosCadastroComponent implements OnInit, OnDestroy {

  noResult: boolean;
  loading = false;
  loadingNavBar = false;
  breadCrumbTree: Array<any> = [];
  form: FormGroup;
  appTitle: string;
  bsConfig: Partial<BsDatepickerConfig>;
  modalRef: BsModalRef;
  veiculos: Array<ILogisticaVeiculo>;
  $activatedRouteSubscription: Subscription;

  tipoVeiculo: ILogisticaTipoVeiculo[] = [];
  loadingTipoVeiculo: boolean;

  formTransportadora: FormGroup;
  transportadoras = [];
  loadingTransportadoras = false;

  formMotoristas: FormGroup;
  motoristas = [];
  loadingMotoristas = false;

  /* Pagination */
  itemsPerPage = 100;
  totalItems = 10;
  currentPage = 1;
  /* Pagination */

  constructor(
    private formBuilder: FormBuilder,
    private pnotify: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private routerService: RouterService,
    private titleService: TitleService,
    private atividadesService: AtividadesService,
    private localeService: BsLocaleService,
    private veiculoService: LogisticaVeiculoService,
    private tipoVeiculoService: LogisticaTipoVeiculoService,
    private modalService: BsModalService,
    private dateService: DateService
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );
  }

  ngOnInit(): void {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.setFormBuilder();
    this.onActivatedRoute();
    this.getTipoVeiculo();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb(): void {
    this.appTitle = 'Prontuário';
    const id = this.activatedRoute.snapshot.params.idSubModulo;
    this.titleService.setTitle(this.appTitle);
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: '/logistica/home',
      },
      {
        descricao: 'Prontuários',
        routerLink: `/logistica/cadastros/${id}`,
      },
      {
        descricao: 'Vehículos',
        routerLink: `../`,
      },
      {
        descricao: this.appTitle,
      },
    ];
  }

  //Consumir informações que estão na rota para editar
  ngOnDestroy() {
    this.$activatedRouteSubscription.unsubscribe();
    if(this.modalRef){
      this.modalRef.hide();
    }
  }

  onActivatedRoute() {
    this.$activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (response) => {
        const _response = this.routerService.getBase64UrlParams(response);
        this.form.patchValue(_response);
      }
    );
  }

  //formulario
  setFormBuilder(): void {
    this.form = this.formBuilder.group({
      ID_LOGI_VEIC: [null],
      DS_VEIC: [null],
      PLAC: [null, [Validators.required]],
      NM_TRAN: [{value:null, disabled: true}],
      NM_MOTO: [{value:null, disabled: true}],
      ID_LOGI_MOTO: [null],
      ID_LOGI_TRAN: [null],
      IN_STAT: ['1'],
      DS_OBSE: [null],
      ID_LOGI_VEIC_TIPO: [null, [Validators.required]],
    });

  }

  getTipoVeiculo() {
    this.loadingTipoVeiculo = true;
    this.tipoVeiculoService
      .getTipoVeiculos({ IN_STAT: '1' })
      .pipe(
        finalize(() => {
          this.loadingTipoVeiculo = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.tipoVeiculo = response.body['data'];
        }
      });
  }

  // Validação de formulário
  onFieldError(field: string) {
    if (this.onFieldInvalid(field)) {
      return 'is-invalid';
    }
    return '';
  }

  onFieldInvalid(field: any) {
    field = this.form.get(field);
    return field.status == 'INVALID' && field.touched;
  }

  onFieldRequired(field: string) {
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

  postVeiculo() {
    this.loadingNavBar = true;
    this.veiculoService
      .postVeiculo(this.form.value)
      .pipe(
        finalize(() => {
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response: any) => {
          if (response.status === 200) {
            this.form.reset();
            this.pnotify.success();
            this.router.navigate(['./../'], {
              relativeTo: this.activatedRoute,
            });
          } else {
            this.pnotify.error();
          }
        },
        (error: any) => {
          this.pnotify.error();
        }
      );
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      animated: false,
      ignoreBackdropClick: false,
      class: 'modal-xl'
    });
  }

  getParams(form) {
    let _params = {};
    let _obj = form;

    for (let prop in _obj) {
      if (_obj[prop]) {
        if (_obj[prop] instanceof Date)
          _params[prop] = this.dateService.convertToUrlDate(_obj[prop]);
        else _params[prop] = _obj[prop];
      }
    }

    return _params;
  }

  onMotorista(motorista){
    this.form.patchValue(motorista);
  }

  onTransportadora(transportadora){
    this.form.patchValue(transportadora);
  }

}
