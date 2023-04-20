import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

// file-saver
import { saveAs } from 'file-saver/src/FileSaver';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialTidSoftwareService } from './tid-software.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { WindowService } from 'src/app/shared/services/core/window.service';
import { TitleService } from 'src/app/shared/services/core/title.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';

@Component({
  selector: 'comercial-tid',
  templateUrl: './tid-software.component.html',
  styleUrls: ['./tid-software.component.scss'],
  providers: [WindowService]
})
export class ComercialTidSoftwareComponent implements OnInit {
  breadCrumbTree: Array<Breadcrumb> = [
    {
      descricao: 'Home',
      routerLink: '/comercial/home'
    },
    {
      descricao: 'TID Software'
    }
  ];

  loaderFullScreen = true;
  loaderNavbar = false;

  paramSubscription: Subscription;

  form: FormGroup;

  empresas: any = [];
  linhas: any = [];
  modulos: any = [];
  modulosVendas: any = [];
  modulosProducaoTela: any = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private tidSoftwareService: ComercialTidSoftwareService,
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private location: Location,
    private atividadesService: AtividadesService,
    private windowService: WindowService,
    private titleService: TitleService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit() {
    this.registrarAcesso();
    this.getFormFields();
    this.setFormBuilder();
    this.titleService.setTitle('TID Software');
  }

  registrarAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
  }

  getFormFields() {
    this.loaderFullScreen = true;

    this.tidSoftwareService
      .loadDependencies()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
          this.checkRouterParams();
        })
      )
      .subscribe(
        (response: any) => {
          if (response[0]['responseCode'] === 200) {
            this.empresas = response[0]['result'];
          } else {
            this.handleLoadDependenciesError();
          }

          if (response[1]['responseCode'] === 200) {
            this.linhas = response[1]['result'];
          } else {
            this.handleLoadDependenciesError();
          }

          if (response[2]['responseCode'] === 200) {
            this.modulosVendas = response[2]['result'];
          } else {
            this.handleLoadDependenciesError();
          }

          if (response[3]['responseCode'] === 200) {
            this.modulosProducaoTela = response[3]['result'];
          } else {
            this.handleLoadDependenciesError();
          }
        },
        (error: any) => {
          this.handleLoadDependenciesError();
        }
      );
  }

  handleLoadDependenciesError() {
    this.pnotifyService.error();
    this.location.back();
  }

  setFormBuilder() {
    this.form = this.formBuilder.group({
      cliente: [null],
      sistema: [null, [Validators.required]],
      empresa: [null],
      modulo: [null],
      linha: [null]
    });
  }

  onTitleApplication() {
    return this.form.value['sistema'] == null
      ? 'Selecione um módulo'
      : 'Módulo selecionado';
  }

  checkRouterParams() {
    this.paramSubscription = this.activatedRoute.queryParams.subscribe(
      (queryParams: any) => {
        if (Object.keys(queryParams).length > 0) {
          if (queryParams['codCliente']) {
            this.form.get('cliente').setValue(queryParams['codCliente']);
          }

          if (queryParams['sistema']) {
            this.onClick(queryParams['sistema'], false);
          }

          if (queryParams['modulo']) {
            this.form.controls['modulo'].clearValidators();
            this.form.controls['modulo'].disable();
            this.form.controls['modulo'].setValue(
              parseInt(queryParams['modulo'])
            );

            if (queryParams['sistema'] === 'vendas') {
              this.onChangeModuloVendas();
            }
          }
        }
      }
    );
    this.paramSubscription.unsubscribe();
  }

  setRouterParams(queryParams: any) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: queryParams,
      queryParamsHandling: 'merge'
    });
  }

  onShow(sistema: string) {
    if (
      this.form.value['sistema'] == sistema ||
      this.form.value['sistema'] == null
    ) {
      return true;
    }

    return false;
  }

  borderClass(sistema: string) {
    if (this.form.value['sistema'] == sistema) {
      return 'border-success';
    }

    return '';
  }

  columnClass() {
    if (this.form.value['sistema'] == 'vendas') {
      return 'col-8';
    } else if (this.form.value['sistema'] == 'producaoTela') {
      return 'col-5';
    } else if (
      this.form.value['sistema'] == 'liberacaoFaturamento' ||
      this.form.value['sistema'] == 'registroOcorrencias' ||
      this.form.value['sistema'] == 'painelBobinas'
    ) {
      return 'col-3';
    }

    return '';
  }

  checkFormValidators(sistema: string) {
    if (sistema == 'vendas' || sistema == 'producaoTela') {
      this.form.controls['empresa'].setValidators([Validators.required]);
      this.form.controls['modulo'].setValidators([Validators.required]);
      this.form.controls['empresa'].enable();
    } else if (sistema == 'painelBobinas') {
      this.form.controls['empresa'].clearValidators();
      this.form.controls['empresa'].disable();
      this.form.controls['empresa'].setValue(18);
    } else if (sistema == 'FichaCCD') {
      this.form.controls['empresa'].clearValidators();
      this.form.controls['empresa'].disable();
      this.form.controls['empresa'].setValue(3);
    } else {
      if (
        sistema == 'liberacaoFaturamento' ||
        sistema == 'registroOcorrencias'
      ) {
        this.form.controls['empresa'].setValidators([Validators.required]);
        this.form.controls['empresa'].enable();
      } else {
        this.form.controls['empresa'].clearValidators();
      }

      this.form.controls['modulo'].clearValidators();
    }

    this.form.controls['empresa'].updateValueAndValidity();
    this.form.controls['modulo'].updateValueAndValidity();

    this.form.controls['linha'].disable();
    this.form.controls['linha'].clearValidators();
    this.form.controls['linha'].updateValueAndValidity();
  }

  onFieldError(field: string) {
    if (this.onFieldInvalid(field) != '') {
      return 'is-invalid';
    }

    return '';
  }

  onFieldInvalid(field: any) {
    field = this.form.get(field);

    if (field.errors != null) {
      if (field.errors.hasOwnProperty('required') && field.touched) {
        return 'required';
      }
    }

    return '';
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

  onClick(sistema: string, addParam: boolean) {
    this.form.get('sistema').setValue(sistema);
    this.checkFormValidators(sistema);

    if (addParam) {
      this.setRouterParams({ sistema: sistema });
    }

    this.form.controls['empresa'].markAsPristine();
    this.form.controls['modulo'].markAsPristine();
    this.form.controls['linha'].markAsPristine();
    this.form.controls['empresa'].markAsUntouched();
    this.form.controls['modulo'].markAsUntouched();
    this.form.controls['linha'].markAsUntouched();

    if (sistema == 'analiseLimiteCredito') {
      this.onAcessar();
    } else {
      if (sistema == 'vendas') {
        this.modulos = this.modulosVendas;
      } else if (sistema == 'producaoTela') {
        this.modulos = this.modulosProducaoTela;
      }
    }
  }

  onFormShow() {
    if (
      this.form.value['sistema'] == null ||
      this.form.value['sistema'] == 'analiseLimiteCredito'
    ) {
      return false;
    }

    return true;
  }

  onFormModuloShow() {
    if (
      this.form.value['sistema'] == 'vendas' ||
      this.form.value['sistema'] == 'producaoTela'
    ) {
      return true;
    }

    return false;
  }

  onFormLinhaShow() {
    if (this.form.value['sistema'] == 'vendas') {
      return true;
    }

    return false;
  }

  onChangeModuloVendas() {
    if (this.form.value['sistema'] == 'vendas') {
      if (this.form.getRawValue()['modulo'] == 3) {
        this.form.controls['linha'].enable();
        this.form.controls['linha'].setValidators([Validators.required]);
        this.form.controls['linha'].updateValueAndValidity();
      } else {
        this.form.get('linha').setValue(null);
        this.form.controls['linha'].disable();
        this.form.controls['linha'].clearValidators();
        this.form.controls['linha'].updateValueAndValidity();
      }
    }
  }

  onCancel() {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: null
    });

    this.form.get('sistema').setValue(null);
    this.form.get('empresa').setValue(null);
    this.form.get('modulo').setValue(null);
    this.form.get('linha').setValue(null);
  }

  onAcessar() {
    if (this.form.valid) {
      this.loaderNavbar = true;

      this.tidSoftwareService
        .postGerarAcesso(this.form.getRawValue())
        .pipe(
          finalize(() => {
            this.loaderNavbar = false;
          })
        )
        .subscribe({
          next: (response: any) => {
            if (response['responseCode'] === 200) {
              saveAs(response['result']['link'], response['result']['name']);
            } else if (response['responseCode'] === 403) {
              this.pnotifyService.notice('Seu usuário não tem acesso ao TID.');
            } else {
              this.pnotifyService.error();
            }
          },
          error: (error: any) => {
            this.pnotifyService.error();
          }
        });
    } else {
      this.pnotifyService.notice('Selecione empresa e módulo para continuar.');
    }
  }

  checkWindow() {
    return this.windowService.getHostname();
  }
}
