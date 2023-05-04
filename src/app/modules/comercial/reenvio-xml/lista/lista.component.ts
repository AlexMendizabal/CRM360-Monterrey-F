import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialReenvioXmlService } from '../reenvio-xml.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { ComercialService } from '../../comercial.service';
import { DetailPanelService } from 'src/app/shared/templates/detail-panel/detal-panel.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { ReenvioXml } from '../models/reenvio-xml';

@Component({
  selector: 'comercial-reenvio-xml-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class ComercialReenvioXmlListaComponent implements OnInit, OnDestroy {
  loaderNavbar = false;
  loaderFullScreen = true;

  breadCrumbTree: Array<Breadcrumb> = [
    {
      descricao: 'Home',
      routerLink: '/comercial/home'
    },
    {
      descricao: 'Reenvio de XML'
    }
  ];

  showDetailPanelSubscription: Subscription;
  showDetailPanel = false;

  enviosTotal = 0;
  mes = 0;
  ultimo = 0;
  ultimoEnvio = 0;
  horaUltimoEnvio = 0;
  minutosUltimoEnvio = 0;

  countoEnviosTotal: number;
  countoMes: number;
  countoHoraUltimoEnvio: number;
  countoMinutosUltimoEnvio: number;

  formFilter: FormGroup;
  empresas: Array<any> = [];

  notasFiscais: Array<ReenvioXml> = [];
  dataLoaded = false;
  dataEmpty = false;
  searchSubmitted = false;

  formReagendar: FormGroup;

  notaFiscal: any;
  pedido: number;

  activatedRouteSubscription: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private reenvioXMLService: ComercialReenvioXmlService,
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private titleService: TitleService,
    private comercialService: ComercialService,
    private detailPanelService: DetailPanelService
  ) {}

  ngOnInit(): void {
    this.registrarAcesso();
    this.getFiltros();
    this.setFormFilter();
    this.setFormReagendar();
    this.listCounts();
    this.titleService.setTitle('Reenvio de XML');
    this.onDetailPanelEmitter();
  }

  ngOnDestroy(): void {
    this.showDetailPanelSubscription.unsubscribe();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  onDetailPanelEmitter(): void {
    this.showDetailPanelSubscription = this.detailPanelService.config.subscribe(
      (event: any) => {
        this.showDetailPanel = event.showing;

        if (this.showDetailPanel === false) {
          this.onCloseDetailPanel();
        }
      }
    );
  }

  getFiltros(): void {
    this.comercialService
      .getEmpresas({ tipo: 'search', idEmpresa: '4,6,18,55,79,77,83' })
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.responseCode === 200) {
            this.empresas = response.result;

            this.empresas.unshift({
              idEmpresa: 0,
              nomeEmpresa: 'EXIBIR TODOS'
            });
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
          this.location.back();
        }
      });
  }

  setFormFilter(): void {
    const formValue: any = this.checkRouterParams();

    this.formFilter = this.formBuilder.group({
      codEmpresa: [formValue.codEmpresa, Validators.required],
      numNota: [formValue.numNota, Validators.required]
    });
  }

  setFormReagendar(): void {
    this.formReagendar = this.formBuilder.group({
      email1: [{ value: null, disabled: true }, [Validators.email]],
      email2: [{ value: null, disabled: true }, [Validators.email]],
      email3: [{ value: null, disabled: true }, [Validators.email]]
    });
  }

  checkRouterParams(): Object {
    let formValue = {
      codEmpresa: null,
      numNota: null
    };

    this.activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      queryParams => {
        if (Object.keys(queryParams).length > 0) {
          let params = atob(queryParams['q']);
          params = JSON.parse(params);
          this.setSubmittedSearch();
          this.search(params);

          Object.keys(formValue).forEach(formKey => {
            Object.keys(params).forEach(paramKey => {
              if (
                formKey == paramKey &&
                formValue[formKey] != params[paramKey]
              ) {
                if (!isNaN(Number(params[paramKey]))) {
                  formValue[formKey] = Number(params[paramKey]);
                } else {
                  formValue[formKey] = params[paramKey];
                }
              }
            });
          });
        }
      }
    );
    this.activatedRouteSubscription.unsubscribe();

    return formValue;
  }

  listCounts(): void {
    this.reenvioXMLService.getContadores().subscribe((response: any) => {
      if (response.responseCode === 200) {
        this.enviosTotal = response.result.totalEnvios;
        this.mes = response.result.enviosMes;

        let ultimoEnvio = response.result.ultimoEnvio.split(':');

        this.horaUltimoEnvio = ultimoEnvio[0];
        this.minutosUltimoEnvio = ultimoEnvio[1];
      }
    });
  }

  handleCounter(value: any): void {
    return value.toFixed(0);
  }

  handleCounterHorario(value: any): void {
    value = value.toFixed(0);

    if (value < 10) {
      value = `0${value}`;
    }

    return value;
  }

  onFilter(): void {
    this.setRouterParams(this.formFilter.value);
    this.setSubmittedSearch();
  }

  search(params: any): void {
    if (this.searchSubmitted) {
      this.loaderNavbar = true;
      this.dataLoaded = false;
      this.dataEmpty = false;
      this.detailPanelService.hide();
      this.notaFiscal = [];

      this.reenvioXMLService
        .getLista(params)
        .pipe(
          finalize(() => {
            this.loaderNavbar = false;
          })
        )
        .subscribe({
          next: (response: any) => {
            if (response.responseCode === 200) {
              if (Object.keys(response.result).length > 0) {
                this.notasFiscais = response.result;
                this.dataLoaded = true;
              } else {
                this.dataEmpty = true;
              }
            } else if (response.responseCode === 206) {
              this.pnotifyService.notice(
                'Nota fiscal não faz parte dos seus clientes.'
              );
              this.dataEmpty = true;
            } else if (response.responseCode === 204) {
              this.dataEmpty = true;
            }
          },
          error: (error: any) => {
            this.pnotifyService.error('Erro ao carregar dados');
          }
        });
    }
  }

  setRouterParams(params: any): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { q: btoa(JSON.stringify(params)) }
    });
    this.setSubmittedSearch();
    this.search(params);
  }

  setSubmittedSearch(): void {
    this.searchSubmitted = true;
  }

  viewDetails(notaFiscal: ReenvioXml): void {
    if (
      notaFiscal.enviado == 1 ||
      (notaFiscal.enviado == 0 &&
        notaFiscal.contatos.email1 == '' &&
        notaFiscal.contatos.email2 == '' &&
        notaFiscal.contatos.email3 == '')
    ) {
      this.detailPanelService.loadedFinished(false);
      this.notaFiscal = notaFiscal;
      this.pedido = notaFiscal.pedido;

      this.formReagendar.controls.email1.setValue(notaFiscal.contatos.email1);
      this.formReagendar.controls.email2.setValue(notaFiscal.contatos.email2);
      this.formReagendar.controls.email3.setValue(notaFiscal.contatos.email3);
    } else {
      this.pnotifyService.notice('Essa nota fiscal já foi reagendada.');
    }
  }

  onEditEmail(field: string): void {
    this.formReagendar.controls[field].enable();
  }

  onDeleteEmail(field: string): void {
    this.formReagendar.controls[field].setValue(null);
  }

  onCloseDetailPanel(): void {
    this.notaFiscal = [];
    this.pedido = null;

    this.formReagendar.controls.email1.setValue(null);
    this.formReagendar.controls.email2.setValue(null);
    this.formReagendar.controls.email3.setValue(null);
  }

  checkValidatorsReagendamento(): boolean {
    let validation = true;

    if (
      (this.formReagendar.value.email1 == '' ||
        this.formReagendar.value.email1 == null) &&
      (this.formReagendar.value.email2 == '' ||
        this.formReagendar.value.email2 == null) &&
      (this.formReagendar.value.email3 == '' ||
        this.formReagendar.value.email3 == null)
    ) {
      validation = false;
    }

    return validation;
  }

  onReagendarEnvio(): void {
    if (!this.checkValidatorsReagendamento()) {
      this.pnotifyService.notice('Informe pelo menos um e-mail.');
      return;
    }

    if (this.formReagendar.valid) {
      this.loaderNavbar = true;
      const formObj = this.formReagendar.getRawValue();

      this.reenvioXMLService
        .putReagendarEnvio({
          idEmpresa: this.notaFiscal.idEmpresa,
          pedido: this.notaFiscal.pedido,
          email1: formObj.email1,
          email2: formObj.email2,
          email3: formObj.email3
        })
        .pipe(
          finalize(() => {
            this.loaderNavbar = false;
            this.search({
              codEmpresa: this.notaFiscal.idEmpresa,
              numNota: this.notaFiscal.numNfe
            });
          })
        )
        .subscribe({
          next: (response: any) => {
            if (response.responseCode === 200) {
              this.pnotifyService.success('O envio do e-mail foi reagendado.');
            } else {
              this.pnotifyService.error(
                'Ocorreu um erro ao reagendar o envio.'
              );
            }
          },
          error: (error: any) => {
            this.pnotifyService.error('Ocorreu um erro ao reagendar o envio.');
          }
        });
    }
  }
}
