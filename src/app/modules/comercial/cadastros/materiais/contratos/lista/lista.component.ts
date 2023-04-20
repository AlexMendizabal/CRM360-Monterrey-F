import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription, Observable, EMPTY } from 'rxjs';
import { finalize, take, switchMap } from 'rxjs/operators';

// ngx-bootstrap
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { DetailPanelService } from 'src/app/shared/templates/detail-panel/detal-panel.service';
import { ComercialService } from 'src/app/modules/comercial/comercial.service';
import { ComercialCadastrosMateriaisContratoService } from '../contratos.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { JsonResponse } from 'src/app/models/json-response';
import { IContrato, IMateriaisContrato } from '../models/contrato';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';

@Component({
  selector: 'comercial-cadastros-materiais-contratos-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class ComercialCadastrosMateriaisContratoListaComponent implements OnInit {
  @ViewChild('scrollToFilter', {}) scrollToFilter: ElementRef;

  loaderNavbar = false;
  loaderFullScreen = true;

  breadCrumbTree: Array<Breadcrumb> = [];

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  tableConfigMateriais: Partial<CustomTableConfig> = {
    hover: false,
  };

  activatedRouteSubscription: Subscription;

  showDetailPanelSubscription: Subscription;
  showDetailPanel = false;
  detailPanelTitle: string;

  form: FormGroup;
  orderBy = 'codContrato';
  orderType = 'ASC';

  linhas: Array<any> = [];
  classes: Array<any> = [];
  filteredClasses: Array<any> = [];
  materiais: Array<any> = [];
  materiaisLoader: boolean;

  maxSize = 10;
  itemsPerPage = 300;
  currentPage = 1;
  totalItems = 0;
  compararData = null;
  dados: IContrato[] = [];
  dadosLoaded = false;
  dadosEmpty = false;

  contratoSelecionado: IContrato;
  materiaisAssociados: IMateriaisContrato[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private titleService: TitleService,
    private detailPanelService: DetailPanelService,
    private comercialService: ComercialService,
    private materiaisContratoService: ComercialCadastrosMateriaisContratoService,
    private confirmModalService: ConfirmModalService
  ) {}

  ngOnInit(): void {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.getFilterValues();
    this.setFormFilter();
    this.titleService.setTitle('Contratos de materiais');
    this.onDetailPanelEmitter();
    this.setContratoSelecionado();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/comercial/home',
        },
        {
          descricao: 'Cadastros',
          routerLink: `/comercial/cadastros/${params.idSubModulo}`,
        },
        {
          descricao: 'Contratos',
        },
      ];
    });
  }

  onDetailPanelEmitter(): void {
    this.showDetailPanelSubscription = this.detailPanelService.config.subscribe(
      (event: any) => {
        this.showDetailPanel = event.showing;
      }
    );
  }

  getFilterValues(): void {
    this.materiaisContratoService
      .getFilterValues()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;

          this.checkValuesLinhaClasse();
        })
      )
      .subscribe((response: any) => {
        if (response[0].responseCode === 200) {
          this.linhas = response[0].result;

          this.linhas.unshift({
            id: 0,
            descricao: 'EXIBIR TODOS',
          });
        } else {
          this.pnotifyService.error();
          this.location.back();
        }

        if (response[1].responseCode === 200) {
          this.classes = response[1].result;

          this.filteredClasses.unshift({
            idClasse: 0,
            nomeClasse: 'EXIBIR TODOS',
          });
        } else {
          this.pnotifyService.error();
          this.location.back();
        }
      });
  }

  onChangeLinha(codLinha: number, reset: boolean) {
    if (reset) {
      if (this.form.value.codLinha !== 0) {
        this.form.controls.codClasse.enable();
        this.form.controls.codClasse.setValue(0);
      } else {
        this.form.controls.codClasse.disable();
        this.form.controls.codClasse.setValue(null);
      }

      this.form.controls.codClasse.updateValueAndValidity();

      this.materiais = [];
      this.form.controls.codContrato.reset();
      this.form.controls.codContrato.disable();
      this.form.controls.codContrato.setValue(null);
      this.form.controls.codContrato.updateValueAndValidity();
    }

    this.filteredClasses = this.classes.filter(
      (value: any) => value.idLinha == codLinha
    );

    this.filteredClasses.unshift({
      idClasse: 0,
      nomeClasse: 'EXIBIR TODOS',
    });
  }

  onChangeClasse(codClasse: number, reset: boolean, src: string) {
    if (reset) {
      this.form.controls.codContrato.reset();
      this.form.controls.codContrato.enable();
      this.form.controls.codContrato.setValue(0);
      this.form.controls.codContrato.updateValueAndValidity();
    }

    this.getMateriais(codClasse, src);
  }

  getMateriais(codClasse: number, src: string): void {
    if (typeof codClasse !== 'undefined' && codClasse !== null) {
      if (src === 'application') {
        this.loaderNavbar = true;
      }
      this.materiaisLoader = true;
      this.materiais = [];

      const params = {
        codClasse: codClasse,
        tipoMaterial: 'Distribuidora',
        comercializa: 0,
      };

      this.comercialService
        .getMateriais(params)
        .pipe(
          finalize(() => {
            if (src === 'application') {
              this.loaderNavbar = false;
            }
            this.materiaisLoader = false;
          })
        )
        .subscribe(
          (response: JsonResponse) => {
            if (
              response.hasOwnProperty('success') &&
              response.success === true
            ) {
              this.materiais = response.data;

              this.materiais.unshift({
                codigoMaterial: 0,
                codigoDescricaoMaterial: 'EXIBIR TODOS',
              });
            } else if (
              response.hasOwnProperty('success') &&
              response.success === false &&
              response.hasOwnProperty('mensagem')
            ) {
              this.pnotifyService.error(response.mensagem);
            } else {
              this.pnotifyService.error();
            }
          },
          (error: any) => {
            if (error['error'].hasOwnProperty('mensagem')) {
              this.pnotifyService.error(error.error.mensagem);
            } else {
              this.pnotifyService.error();
            }
          }
        );
    }
  }

  setFormFilter(): void {
    const formValue: any = this.checkRouterParams();

    this.form = this.formBuilder.group({
      nomeContrato: [formValue.codSituacao],
      codContrato: [formValue.codSituacao],
      codSituacao: [formValue.codSituacao],
      codStatus: [formValue.codStatus],
      orderBy: [formValue.orderBy],
      orderType: [formValue.orderType],
      pagina: [formValue.pagina],
      registros: [formValue.registros, Validators.required],
    });

    this.checkOrder();
  }

  comparaData() {
    if (!this.form.get('dataFinal').value) {
      return false;
    } else if (
      this.form.get('dataInicial').value >
      this.form.get('dataFinal').value
      ) {
        this.compararData = true;
        return this.compararData;
      }
    }

  checkRouterParams(): Object {
    let formValue = {
      nomeContrato:null,
      codContrato: 0,
      codSituacao: '',
      codStatus: '',
      orderBy: this.orderBy,
      orderType: this.orderType,
      pagina: 1,
      registros: this.itemsPerPage,
    };

    this.activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (queryParams: any) => {
        if (Object.keys(queryParams).length > 0) {
          let params = atob(queryParams['q']);
          params = JSON.parse(params);
          this.search(params);

          Object.keys(formValue).forEach((formKey) => {
            Object.keys(params).forEach((paramKey) => {
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

  checkOrder(): void {
    if (this.form.value.orderBy !== this.orderBy) {
      this.orderBy = this.form.value.orderBy;
    }

    if (this.form.value.orderType !== this.orderType) {
      this.orderType = this.form.value.orderType;
    }
  }

  checkValuesLinhaClasse(): void {
    if (this.form.value.codLinha !== 0) {
      this.onChangeLinha(this.form.value.codLinha, false);
    }

    if (this.form.value.codClasse !== 0) {
      this.onChangeClasse(this.form.value.codClasse, false, 'verify');
    } else {
      this.form.controls.codClasse.disable();
      this.form.controls.codContrato.disable();

      this.form.controls.codClasse.updateValueAndValidity();
      this.form.controls.codContrato.updateValueAndValidity();
    }
  }

  setContratoSelecionado(): void {
    this.contratoSelecionado = {
      codContrato: null,
      codLinha: null,
      codClasse: null,
      codSituacao: null,
      codStatus: null,
      nomeContrato: null,
      motivo: null,
      codCliente: null,
      dataInicial: null,
      dataFinal: null,
      quantidade: null,
      nomeUsuario: null,
    };
  }

  setOrderBy(column: string): void {
    if (this.orderBy === column) {
      if (this.orderType == 'DESC') {
        this.orderType = 'ASC';
      } else if (this.orderType == 'ASC') {
        this.orderType = 'DESC';
      }
    } else {
      this.orderBy = column;
      this.orderType = 'ASC';
    }

    this.form.value.orderBy = this.orderBy;
    this.form.value.orderType = this.orderType;

    this.onFilter();
  }

  onFilter(): void {
    if (this.form.valid) {
      this.itemsPerPage = this.form.value.registros;
      this.currentPage = 1;
      this.setRouterParams(this.verificaParams());
    }
  }

  setRouterParams(params: any): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { q: btoa(JSON.stringify(params)) },
    });
    this.search(params);
  }

  verificaParams(): Object {
    let params: any = {};


    if (this.form.value.nomeContrato) {
      params.nomeContrato = this.form.value.nomeContrato;
    }

    if (this.form.value.codContrato) {
      params.codContrato = this.form.value.codContrato;
    }

    if (this.form.value.codSituacao) {
      params.codSituacao = this.form.value.codSituacao;
    }

    if (this.form.value.codStatus) {
      params.codStatus = this.form.value.codStatus;
    }

    params.pagina = this.form.value.pagina;
    params.registros = this.form.value.registros;
    params.orderBy = this.form.value.orderBy;
    params.orderType = this.form.value.orderType;

    return params;
  }

  search(params: any): void {
    this.loaderNavbar = true;
    this.detailPanelService.hide();
    this.dados = [];
    this.dadosLoaded = false;
    this.dadosEmpty = false;

    this.materiaisContratoService
      .getListaContratos(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.dadosLoaded = true;
        })
      )
      .subscribe(
        (response: JsonResponse) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            this.dados = response.data;
            this.totalItems = this.dados[0]['total'];
          } else if (
            response.hasOwnProperty('success') &&
            response.success === false
          ) {
            this.dadosEmpty = true;
          } else {
            this.pnotifyService.error();
            this.dadosEmpty = true;
          }
        },
        (error: any) => {
          this.dadosEmpty = true;

          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      );
  }

  classStatusBorder(contrato: IContrato): string {
    let borderClass: string;

    if (contrato.codSituacao === 0) {
      borderClass = 'border-danger';
    } else if (contrato.codSituacao === 1) {
      borderClass = 'border-success';
    }

    return borderClass;
  }

  onPageChanged(event: PageChangedEvent) {
    if (this.form.value.pagina != event.page) {
      this.detailPanelService.hide();
      this.setContratoSelecionado();
      this.form.value.pagina = event.page;
      this.onFilter();

      this.scrollToFilter.nativeElement.scrollIntoView({
        behavior: 'instant',
      });
    }
  }

  onDetails(contrato: IContrato): void {
    this.loaderNavbar = true;
    this.detailPanelService.show();
    this.detailPanelTitle = `Materiais associados ao contrato ${contrato.nomeContrato}`;
    this.setContratoSelecionado();
    this.contratoSelecionado = contrato;
    this.materiaisAssociados = [];

    this.materiaisContratoService
      .getAssociacoesMateriais(contrato.codContrato)
      .pipe(
        finalize(() => {
          setTimeout(() => {
            this.loaderNavbar = false;
          }, 500);
        })
      )
      .subscribe(
        (response: any) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            // Não está vazio.
            this.detailPanelService.loadedFinished(false);
            this.materiaisAssociados = response.data;
          } else if (
            response.hasOwnProperty('success') &&
            response.success === false
          ) {
            // Vazio.
            this.detailPanelService.loadedFinished(true);
          } else {
            // Vazio e com possível erro.
            this.pnotifyService.error();
            this.detailPanelService.loadedFinished(true);
          }
        },
        (error: any) => {
          // Vazio e com erro.
          this.detailPanelService.loadedFinished(true);

          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      );
  }

  onEdit(contrato: IContrato): void {
    this.router.navigate(['../editar', contrato.codContrato], {
      relativeTo: this.activatedRoute,
    });
  }

  onActivate(index: number, contrato: IContrato): void {
    this.confirmActivate()
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) =>
          result ? this.activateContrato(index, contrato) : EMPTY
        ),
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (success: any) => {
          this.pnotifyService.success();
          this.refreshMainData(contrato);
        },
        (error: any) => {
          this.pnotifyService.error();
          this.dados[index].codSituacao = 0;
        }
      );
  }

  confirmActivate(): any {
    return this.confirmModalService.showConfirm(
      null,
      null,
      'Deseja realmente prosseguir com a ativação do registro?',
      'Cancelar',
      'Confirmar'
    );
  }

  activateContrato(index: number, contrato: IContrato): Observable<any> {
    this.loaderNavbar = true;
    this.dados[index].codSituacao = 1;

    return this.materiaisContratoService.activateContrato(contrato.codContrato);
  }

  onInactivate(index: number, contrato: IContrato): void {
    this.confirmInactive()
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) =>
          result ? this.inactivateContrato(index, contrato) : EMPTY
        ),
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (success: any) => {
          this.pnotifyService.success();
          this.refreshMainData(contrato);
        },
        (error: any) => {
          this.pnotifyService.error();
          this.dados[index].codSituacao = 1;
        }
      );
  }

  confirmInactive(): any {
    return this.confirmModalService.showConfirm(
      'inactivate',
      'Confirmar inativação',
      'Deseja realmente prosseguir com a inativação do registro?',
      'Cancelar',
      'Confirmar'
    );
  }

  inactivateContrato(index: number, contrato: IContrato): Observable<any> {
    this.loaderNavbar = true;
    this.dados[index].codSituacao = 0;

    return this.materiaisContratoService.inactivateContrato(contrato.codContrato);
  }

  refreshMainData(contrato: IContrato): void {
    for (let i = 0; i < this.dados.length; i++) {
      if (contrato.codContrato === this.dados[i].codContrato) {
        this.dados[i].codSituacao = contrato.codSituacao;
        return;
      }
    }
  }
}
