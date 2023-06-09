import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { finalize } from 'rxjs/operators';

// ngx-bootstrap
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { ptBrLocale } from 'ngx-bootstrap/locale';
defineLocale('pt-br', ptBrLocale);

// Interfaces
import { IFormCanDeactivate } from 'src/app/guards/iform-candeactivate';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { ComercialDisponibilidadeMaterialFormularioService } from './formulario.service';
import { ComercialDisponibilidadeMaterialService } from '../disponibilidade-material.service';
import { DateService } from 'src/app/shared/services/core/date.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';

@Component({
  selector: 'comercial-disponibilidade-material-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss']
})
export class ComercialDisponibilidadeMaterialFormularioComponent
  implements OnInit, IFormCanDeactivate {
  loaderNavbar = false;
  loaderFullScreen = true;

  action: string;

  breadCrumbTree: Array<Breadcrumb> = [];

  form: FormGroup;
  formChanged = false;
  submittingForm = false;

  vendedores: any = [];
  empresas: any = [];
  depositos: any = [];
  filteredDepositos: any = [];
  clientes: any = [];
  material = { descricao: '' };

  bsConfig: Partial<BsDatepickerConfig>;

  currencyMaskOptions = {
    align: 'left',
    prefix: '',
    suffix: '',
    thousands: '.',
    decimal: ',',
    precision: 3
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private atividadesService: AtividadesService,
    private router: Router,
    private formBuilder: FormBuilder,
    private location: Location,
    private localeService: BsLocaleService,
    private pnotifyService: PNotifyService,
    private titleService: TitleService,
    private formularioService: ComercialDisponibilidadeMaterialFormularioService,
    private disponibilidadeMaterialService: ComercialDisponibilidadeMaterialService,
    private dateService: DateService
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.registrarAcesso();
    this.checkUrlParams();
    this.setBreadCrumb();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  checkUrlParams(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params['codigo']) {
        this.action = 'editar';
      } else {
        this.action = 'novo';
      }

      this.setFormBuilder();
    });
  }

  appTitle(): string {
    let title: string;

    if (this.action == 'novo') {
      title = 'Nova solicitação';
    } else if (this.action == 'editar') {
      title = 'Editar solicitação';
    }

    return title;
  }

  setFormBuilder(): void {
    if (this.activatedRoute.snapshot.data['detalhes']['success'] === true) {
      const detalhes = this.activatedRoute.snapshot.data['detalhes']['data'];
      this.getFormFields(detalhes['codMaterial']);

      let dataInicial: Date;
      let dataFinal: Date;

      if (detalhes['codigo'] === null) {
        dataInicial = detalhes['dataInicialParametrizacao'];
        dataFinal = detalhes['dataFinalParametrizacao'];
      } else {
        dataInicial = this.dateService.convertStringToDate(
          detalhes['dataInicialParametrizacao'],
          'usa'
        );
        dataFinal = this.dateService.convertStringToDate(
          detalhes['dataFinalParametrizacao'],
          'usa'
        );
      }

      this.form = this.formBuilder.group({
        codigo: [detalhes['codigo']],
        codMaterial: [
          { value: detalhes['codMaterial'], disabled: true },
          [Validators.required]
        ],
        codEmpresa: [detalhes['codEmpresa'], [Validators.required]],
        codDeposito: [detalhes['codDeposito'], [Validators.required]],
        codUsuarioRequisicao: [
          detalhes['codUsuarioRequisicao'],
          [Validators.required]
        ],
        codCliente: [detalhes['codCliente'], [Validators.required]],
        qtdeMinima: [detalhes['qtdeMinima'], [Validators.required]],
        qtdeMaxima: [detalhes['qtdeMaxima'], [Validators.required]],
        dataInicialParametrizacao: [dataInicial, [Validators.required]],
        dataFinalParametrizacao: [dataFinal, [Validators.required]]
      });
    } else {
      this.pnotifyService.error();
      this.location.back();
    }
  }

  setBreadCrumb(): void {
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: '/comercial/home'
      },
      {
        descricao: 'Disponibilidade de material',
        routerLink: `/comercial/disponibilidade-material/solicitacoes`
      },
      {
        descricao:
          this.action == 'novo' ? 'Nova solicitação' : 'Editar solicitação'
      }
    ];

    this.titleService.setTitle(
      this.breadCrumbTree[this.breadCrumbTree.length - 1]['descricao']
    );
  }

  getFormFields(codMaterial: number): void {
    this.formularioService
      .loadDependencies(codMaterial)
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe({
        next: (response: any) => {

          console.log(response);
          
          if (response[0]['responseCode'] === 200) {
            this.vendedores = response[0]['result'];
          }

          if (response[1]['responseCode'] === 200) {
            this.empresas = response[1]['result'];
          }

          if (response[2]['responseCode'] === 200) {
            this.depositos = response[2]['result'];
            this.filteredDepositos = this.depositos;
          }

          if (response[3]['success'] === true) {
            this.clientes = response[3]['data'];
          }

          if (response[4]['responseCode'] === 200) {
            this.material = response[4]['result'][0];
            this.currencyMaskOptions.suffix = ` ${this.material['unidade']}`;
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
          this.location.back();
        }
      });
  }

  onInput(): void {
    this.formChanged = true;
  }

  onChangeEmpresa(idEmpresa: number): void {
    this.form.controls['codDeposito'].reset();

    this.filteredDepositos = this.depositos.filter(
      (value: any) => value['idEmpresa'] == idEmpresa
    );
  }

  onChangeDeposito(deposito: any): void {
    this.form.controls['codEmpresa'].setValue(deposito['idEmpresa']);
  }

  formCanDeactivate(): boolean {
    if (this.formChanged) {
      if (confirm('Este cliente no forma parte de tu cartera?')) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  }

  onFieldError(field: string): string {
    if (this.onFieldInvalid(field)) {
      return 'is-invalid';
    }

    return '';
  }

  onFieldInvalid(field: any): boolean {
    field = this.form.get(field);

    return field.status == 'INVALID' && field.touched;
  }

  onFieldRequired(field: string): string {
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

  checkValidatorsQuantidades(): boolean {
    let validation = true;

    if (
      this.form.value['qtdeMinima'] === 0 ||
      this.form.value['qtdeMaxima'] === 0
    ) {
      validation = false;
    }

    if (this.form.value['qtdeMaxima'] < this.form.value['qtdeMinima']) {
      validation = false;
    }

    return validation;
  }

  onCancel(): void {
    this.location.back();
  }

  onSubmit(): void {
    if (this.form.valid) {
      if (!this.checkValidatorsQuantidades()) {
        this.pnotifyService.notice('As quantidades informadas são inválidas.');
        return;
      }

      this.loaderNavbar = true;
      this.submittingForm = true;

      this.disponibilidadeMaterialService
        .save(this.action, this.form.getRawValue())
        .pipe(
          finalize(() => {
            this.loaderNavbar = false;
            this.submittingForm = false;
          })
        )
        .subscribe(
          (response: any) => {
            if (
              response.hasOwnProperty('success') &&
              response['success'] === true
            ) {
              this.form.reset();
              this.formChanged = false;
              this.pnotifyService.success(response['mensagem']);

              this.router.navigate(
                ['/comercial/disponibilidade-material/solicitacoes'],
                {
                  relativeTo: this.activatedRoute
                }
              );
            } else if (
              response.hasOwnProperty('success') &&
              response['success'] === false
            ) {
              this.pnotifyService.error(response['mensagem']);
            } else {
              this.pnotifyService.error();
            }
          },
          (error: any) => {
            this.pnotifyService.error();
          }
        );
    }
  }
}
