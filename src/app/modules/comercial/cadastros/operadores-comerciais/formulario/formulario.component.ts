import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl
} from '@angular/forms';
import { finalize, take } from 'rxjs/operators';
import { forkJoin, Observable, Subscription } from 'rxjs';

// ngx-bootstrap
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { ptBrLocale } from 'ngx-bootstrap/locale';

defineLocale('pt-br', ptBrLocale);

// ng-brazil
import { NgBrazilValidators } from 'ng-brazil';
import { utilsBr } from 'js-brasil';

// Services
import { ComercialCadastrosOperadorComercialService } from '../operadores-comerciais.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { ComercialCadastrosTipoOperadorService } from 'src/app/modules/comercial/cadastros/tipo-operadores/tipo-operadores.service';
import { ComercialCadastrosEquipeVendaService } from 'src/app/modules/comercial/cadastros/equipe-venda/equipe-venda.service';
import { ComercialService } from 'src/app/modules/comercial/comercial.service';
import { EstadosService } from 'src/app/shared/services/requests/estados.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { CepService } from 'src/app/shared/services/ws/cep.service';

// Interfaces
import { IFormCanDeactivate } from 'src/app/guards/iform-candeactivate';
import { OperadorComercial } from '../models/operador-comercial';
import { EquipeVenda } from '../../equipe-venda/models/equipe-venda';

@Component({
  selector: 'comercial-cadastros-operador-comercial-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss']
})
export class ComercialCadastrosOperadorComercialFormularioComponent
  implements OnInit, IFormCanDeactivate {
  public MASKS = utilsBr.MASKS;

  loaderNavbar: boolean;
  loaderFullScreen = true;

  appTitle: string;
  breadCrumbTree: Array<any> = [];

  activatedRouteSubscription: Subscription;

  bsConfig: Partial<BsDatepickerConfig>;

  codOperador: number = null;

  form: FormGroup;
  formChanged = false;
  submittingForm: boolean;

  tipoOperadores: Array<OperadorComercial> = [];
  equipesVenda: Array<EquipeVenda> = [];
  escritorios: Array<any> = [];
  estados: Array<any> = [];

  showModalAssociacoes: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private localeService: BsLocaleService,
    private formBuilder: FormBuilder,
    private operadorComercialService: ComercialCadastrosOperadorComercialService,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private titleService: TitleService,
    private tipoOperadorService: ComercialCadastrosTipoOperadorService,
    private equipeVendaService: ComercialCadastrosEquipeVendaService,
    private comercialService: ComercialService,
    private estadosService: EstadosService,
    private dateService: DateService,
    private confirmModalService: ConfirmModalService,
    private cepService: CepService
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
    this.setBreadCrumb();
    this.getFormFields();
    this.setFormBuilder();
    this.checkRouterParams();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        this.appTitle = 'Editar operador comercial';
        this.codOperador = params.id;
      } else {
        this.appTitle = 'Novo operador comercial';
      }

      this.titleService.setTitle(this.appTitle);

      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/comercial/home'
        },
        {
          descricao: 'Cadastros',
          routerLink: `/comercial/cadastros/${params.idSubModulo}`
        },
        {
          descricao: 'Operadores comerciais',
          routerLink: `/comercial/cadastros/${params.idSubModulo}/operadores-comerciais/lista`
        },
        {
          descricao: this.appTitle
        }
      ];
    });
  }

  getFormFields(): void {
    this.formDependencies()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (
            response[0].hasOwnProperty('success') &&
            response[0].success === true
          ) {
            this.tipoOperadores = response[0].data;
          } else {
            this.pnotifyService.error();
            this.location.back();
          }

          if (
            response[1].hasOwnProperty('success') &&
            response[1].success === true
          ) {
            this.equipesVenda = response[1].data;
          } else {
            this.pnotifyService.error();
            this.location.back();
          }

          if (response[2].responseCode === 200) {
            this.escritorios = response[2].result;
          } else {
            this.pnotifyService.error();
            this.location.back();
          }

          this.estados = this.estadosService.getEstados();
        },
        error: (error: any) => {
          this.pnotifyService.error();
          this.location.back();
        }
      });
  }

  formDependencies(): Observable<any> {
    const tipoOperadores = this.tipoOperadorService.getListaTipoOperador({
      codSituacao: 1
    });
    const equipesVenda = this.equipeVendaService.getListaEquipesVenda({
      codSituacao: 1
    });
    const escritorios = this.comercialService.getEscritorios();

    return forkJoin([tipoOperadores, equipesVenda, escritorios]).pipe(take(1));
  }

  setFormBuilder(): void {
    if (this.activatedRoute.snapshot.data.detalhes.success === true) {
      const detalhes: OperadorComercial = this.activatedRoute.snapshot.data
        .detalhes.data;

      const dataInicioContrato: Date =
        detalhes.dataInicioContrato === null
          ? null
          : this.dateService.convertStringToDate(
              detalhes.dataInicioContrato,
              'usa'
            );

      const dataFinalContrato: Date =
        detalhes.dataFinalContrato === null
          ? null
          : this.dateService.convertStringToDate(
              detalhes.dataFinalContrato,
              'usa'
            );

      this.form = this.formBuilder.group({
        codOperador: [detalhes.codOperador],
        nomeOperador: [detalhes.nomeOperador, [Validators.required]],
        sobrenomeOperador: [detalhes.sobrenomeOperador, [Validators.required]],
        codTipoOperador: [detalhes.codTipoOperador, [Validators.required]],
        codSituacao: [detalhes.codSituacao, [Validators.required]],
        codEquipe: [detalhes.codEquipe, [Validators.required]],
        codEscritorio: [detalhes.codEscritorio, [Validators.required]],
        tipoPessoa: [detalhes.tipoPessoa, [Validators.required]],
        cpf: [detalhes.cpfCnpj],
        cnpj: [detalhes.cpfCnpj],
        rg: [detalhes.rgIe],
        ie: [detalhes.rgIe],
        telefone: [detalhes.telefone, [Validators.required]],
        celular: [detalhes.celular, [Validators.required]],
        email: [detalhes.email, [Validators.required, Validators.email]],
        endereco: this.formBuilder.group({
          cep: [detalhes.cep, [Validators.required]],
          logradouro: [detalhes.logradouro, [Validators.required]],
          numero: [detalhes.numero, [Validators.required]],
          complemento: [detalhes.complemento],
          referencia: [detalhes.referencia],
          bairro: [detalhes.bairro, [Validators.required]],
          cidade: [detalhes.cidade, [Validators.required]],
          estado: [detalhes.estado, [Validators.required]]
        }),
        dadosBancarios: this.formBuilder.group({
          banco: [detalhes.banco],
          agencia: [detalhes.agencia],
          contaCorrente: [detalhes.contaCorrente]
        }),
        dataInicioContrato: [dataInicioContrato, [Validators.required]],
        dataFinalContrato: [dataFinalContrato]
      });
      this.setType(detalhes.tipoPessoa);
    } else {
      this.pnotifyService.error();
      this.location.back();
    }
  }

  checkRouterParams(): void {
    this.activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (queryParams: any) => {
        if (Object.keys(queryParams).length > 0) {
          let params = atob(queryParams['q']);
          params = JSON.parse(params);

          if (
            params['showModalAssociacoes'] &&
            params['showModalAssociacoes'] === 1
          ) {
            this.showModalAssociacoes = true;
          }
        }
      }
    );
    this.activatedRouteSubscription.unsubscribe();
  }

  setType(tipoPessoa: string): void {
    if (tipoPessoa === 'F') {
      this.form.controls.cpf.markAsUntouched();
      this.form.controls.cpf.enable();
      this.form.controls.cpf.setValidators([
        NgBrazilValidators.cpf,
        Validators.required
      ]);
      this.form.controls.rg.markAsUntouched();
      this.form.controls.rg.enable();
      this.form.controls.rg.setValidators([Validators.required]);

      this.form.controls.cnpj.setValue(null);
      this.form.controls.cnpj.disable();
      this.form.controls.ie.setValue(null);
      this.form.controls.ie.disable();
    } else if (tipoPessoa === 'J') {
      this.form.controls.cnpj.markAsUntouched();
      this.form.controls.cnpj.enable();
      this.form.controls.cnpj.setValidators([
        NgBrazilValidators.cnpj,
        Validators.required
      ]);
      this.form.controls.ie.markAsUntouched();
      this.form.controls.ie.enable();
      this.form.controls.ie.setValidators([Validators.required]);

      this.form.controls.cpf.setValue(null);
      this.form.controls.cpf.disable();
      this.form.controls.rg.setValue(null);
      this.form.controls.rg.disable();
    }

    this.form.controls.cpf.updateValueAndValidity();
    this.form.controls.cnpj.updateValueAndValidity();
    this.form.controls.rg.updateValueAndValidity();
    this.form.controls.ie.updateValueAndValidity();
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

  onFieldRequired(
    abstractControl: AbstractControl,
    abstractControlField?: string
  ): string {
    if (abstractControl.validator) {
      const validator = abstractControl.validator({} as AbstractControl);
      if (validator && validator.required) {
        return 'is-required';
      }
    }

    if (abstractControlField) {
      for (const controlName in abstractControl['controls']) {
        if (abstractControl['controls'][controlName]) {
          if (
            this.onFieldRequired(abstractControl['controls'][controlName]) &&
            controlName == abstractControlField
          ) {
            return 'is-required';
          }
        }
      }
    }

    return '';
  }

  onSubmit(): void {
    if (this.form.pristine) {
      this.location.back();
    } else {
      if (this.form.valid) {
        this.loaderNavbar = true;
        this.submittingForm = true;

        this.operadorComercialService
          .save(this.form.value)
          .pipe(
            finalize(() => {
              this.loaderNavbar = false;
              this.submittingForm = false;
            })
          )
          .subscribe({
            next: (response: any) => {
              if (
                response.hasOwnProperty('mensagem') &&
                response.hasOwnProperty('success') &&
                response.success === true
              ) {
                this.formChanged = false;
                this.pnotifyService.success(response.mensagem);

                this.activatedRoute.params.subscribe((params: any) => {
                  this.activatedRoute.queryParams.subscribe(
                    (queryParams: any) => {
                      if (queryParams.hasOwnProperty('q')) {
                        this.router.navigate(['../../lista'], {
                          relativeTo: this.activatedRoute
                        });
                      } else {
                        if (params.hasOwnProperty('id')) {
                          this.location.back();
                        } else {
                          this.checkAssociacoes(response.data);
                        }
                      }
                    }
                  );
                });
              } else if (
                response.hasOwnProperty('mensagem') &&
                response.hasOwnProperty('success') &&
                response.success === false
              ) {
                this.pnotifyService.notice(response.mensagem);
              } else {
                this.pnotifyService.error();
              }
            },
            error: (error: any) => {
              this.pnotifyService.error();
            }
          });
      }
    }
  }

  checkAssociacoes(codOperador: number): void {
    this.confirmModalService
      .showConfirm(
        null,
        'Associação de operadores',
        'Deseja associar outros operadores comerciais?',
        'Cancelar',
        'Confirmar'
      )
      .subscribe((response: boolean) =>
        response
          ? this.onConfirmAssociacoes(codOperador)
          : this.onRefuseAssociacoes()
      );
  }

  onConfirmAssociacoes(codOperador: number): void {
    this.router.navigate(['../editar', codOperador], {
      relativeTo: this.activatedRoute,
      queryParams: { q: btoa(JSON.stringify({ showModalAssociacoes: 1 })) }
    });
  }

  onRefuseAssociacoes(): void {
    this.router.navigate(['../lista'], {
      relativeTo: this.activatedRoute
    });
  }

  onCancel(): void {
    this.location.back();
  }

  onInput(): void {
    this.formChanged = true;
  }

  onInputCep() {
    if (this.form.get('endereco.cep').status == 'VALID') {
      this.consultaCEP(this.form.value.endereco.cep);
    }
  }

  consultaCEP(cep: string) {
    this.loaderNavbar = true;

    this.cepService
      .getData(cep)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe((response: any) => {
        if (response.hasOwnProperty('success') && response.success === true) {
          this.form.patchValue({
            endereco: {
              logradouro: response.data.logradouro,
              bairro: response.data.bairro,
              cidade: response.data.localidade,
              estado: response.data.uf
            }
          });
        }
      });
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
}
