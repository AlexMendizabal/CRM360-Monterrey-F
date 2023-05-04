import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  TemplateRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  AbstractControl,
} from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';

// ngx-bootstrap
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { ptBrLocale } from 'ngx-bootstrap/locale';

defineLocale('pt-br', ptBrLocale);

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialGestaoAssociacoesCoordenadoresEscritoriosService } from './../../../gestao/associacoes/coordenadores-escritorios/coordenadores-escritorios.service';
import { ComercialVendedoresService } from './../../../services/vendedores.service';
import { AuthService } from './../../../../../shared/services/core/auth.service';
import { ComercialService } from './../../../comercial.service';
import { DateService } from './../../../../../shared/services/core/date.service';
import { AtividadesService } from './../../../../../shared/services/requests/atividades.service';
import { ComercialKanbanVisaoRoService } from './../visao-ro.service';
import { ConfirmModalService } from './../../../../../shared/modules/confirm-modal/confirm-modal.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ComercialCadastrosMateriaisComboService } from './../../../cadastros/materiais/combos/combos.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { EscritoriosService } from 'src/app/shared/services/requests/escritorios.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';

@Component({
  selector: 'comercial-kanban-visao-ro-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class ComercialKanbanVisaoRoListaComponent implements OnInit {
  @ViewChild('scrollToFilter', {}) scrollToFilter: ElementRef;

  private user = this.authService.getCurrentUser();

  idUsuario: any = this.user['info']['id'];

  loaderNavbar = false;
  loaderFullScreen = true;

  profile: any = {};

  breadCrumbTree: Array<Breadcrumb> = [];

  activatedRouteSubscription: Subscription;

  form: FormGroup;

  showDashboard = false;
  showFilter = false;
  showPermissionDenied = false;

  linhas: Array<any> = [];
  classes: Array<any> = [];
  filteredClasses: Array<any> = [];

  coordenadores: Array<any> = [];
  vendedores: Array<any> = [];
  vendedoresTotal: Array<any> = [];
  filteredVendedores: Array<any> = [];
  empresa: Array<any> = [];

  viewVendedor = false;

  abertas: Array<any> = [];
  fechadas: Array<any> = [];

  itemsPerPage = 50;
  currentPage = 1;
  maxSize = 10;

  modalRef: BsModalRef;
  modalRefDetails: BsModalRef;

  clientesPagination: Array<any> = [];
  detalhes = false;

  dadosLoaded = false;
  dadosEmpty = false;
  bsConfig: Partial<BsDatepickerConfig>;

  orderType;
  orderBy;

  dadosFiltrados: Array<any> = [];

  constructor(
    private router: Router,
    private location: Location,
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private atividadesService: AtividadesService,
    private kanbanVisaoRoService: ComercialKanbanVisaoRoService,
    private dateService: DateService,
    private localeService: BsLocaleService,
    private comercialService: ComercialService,
    private authService: AuthService,
    private comercialVendedoresService: ComercialVendedoresService,
    private gestaoAssociacoesService: ComercialGestaoAssociacoesCoordenadoresEscritoriosService,
    private bsModalService: BsModalService,
    private confirmModalService: ConfirmModalService,
    private modalService: BsModalService,
    private materiaisComboService: ComercialCadastrosMateriaisComboService,
    private titleService: TitleService,
    private escritoriosService: EscritoriosService
  ) {
    this.pnotifyService.getPNotify();
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );
  }

  ngOnInit() {
    this.titleService.setTitle("RO's");
    this.registrarAcesso();
    this.setFormFilter();
    this.getPerfil();
    this.getFilteredValues();
    this.setBreadCrumb();
    this.loadingFilters();
  }

  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/comercial/home',
        },
        {
          descricao: 'Kanban',
          routerLink: `/comercial/kanban/${params.idSubModulo}`,
        },
        {
          descricao: "RO's",
        },
      ];
    });
  }

  registrarAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setFormFilter() {
    const formValue: any = this.checkRouterParams();

    this.form = this.formBuilder.group({
      dataInicial: [
        formValue.dataInicial
          ? formValue.dataInicial
          : this.dateService.getFirstDayMonth(),
        [Validators.required],
      ],
      dataFinal: [
        formValue.dataFinal
          ? formValue.dataFinal
          : this.dateService.getLastDayMonth(),
        [Validators.required],
      ],
      codVendedor: [formValue.codVendedor],
      codGerencia: [formValue.codGerencia],
      codEmpresa: [formValue.codEmpresa],
      codLinha: [formValue.codLinha],
    });

    this.checkValuesGerente();
  }

  checkRouterParams(): Object {
    let formValue = {
      dataInicial: this.dateService.getFirstDayMonth(),
      dataFinal: this.dateService.getLastDayMonth(),
      codEmpresa: '',
      codLinha: '',
      codGerencia: '',
      codVendedor: '',
    };

    this.activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (queryParams: any) => {
        if (Object.keys(queryParams).length > 0) {
          let params: any = atob(queryParams['q']);
          params = JSON.parse(params);
          this.search(params);

          this.showFilter = false;
          this.showDashboard = true;

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
        } else {
          this.showFilter = true;
          this.showDashboard = false;
        }
      }
    );
    this.activatedRouteSubscription.unsubscribe();

    return formValue;
  }

  // Pesquisa
  onFilter(): void {
    if (this.form.valid) {
      this.currentPage = 1;
      this.setRouterParams(this.getParams());
    }
  }

  search(params: any): void {
    this.loaderNavbar = true;
    this.dadosFiltrados = [];
    this.dadosLoaded = false;
    this.dadosEmpty = false;

    this.abertas = [];
    this.fechadas = [];

    this.kanbanVisaoRoService
      .getCards(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.dadosLoaded = true;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (
            response[0].hasOwnProperty('success') &&
            response[0].success === true
          ) {
            this.abertas = response[0].data;
            this.dadosLoaded = true;
          }
          if (
            response[1].hasOwnProperty('success') &&
            response[1].success === true
          ) {
            this.fechadas = response[1].data;
            this.dadosLoaded = true;
          } else if (
            response[0].hasOwnProperty('success') &&
            response[1].hasOwnProperty('success') &&
            ((response[0].success === true && response[1].success === false) ||
              (response[0].success === false && response[1].success === true))
          ) {
            this.abertas = response[0].data;
            this.fechadas = response[1].data;
            this.dadosEmpty = false;
          } else if (
            response[0].hasOwnProperty('success') &&
            response[1].hasOwnProperty('success') &&
            response[0].success === false &&
            response[1].success === false
          ) {
            this.dadosEmpty = true;
          } else {
            this.pnotifyService.error();
          }
        },
        error: (error: any) => {
          this.dadosEmpty = true;

          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      });
  }

  setRouterParams(params: any): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { q: btoa(JSON.stringify(params)) },
    });
    this.search(params);
  }

  getParams() {
    let _params = {};
    let _obj = this.form.value;
    for (let prop in _obj) {
      if (_obj[prop]) {
        if (_obj[prop] instanceof Date)
          _params[prop] = this.dateService.convertToUrlDate(_obj[prop]);
        else _params[prop] = _obj[prop];
      }
    }
    return _params;
  }

  // Get perfil
  getPerfil() {
    this.comercialService.getPerfil().subscribe({
      next: (response: any) => {
        if (response.responseCode === 200) {
          this.profile = response.result;
          if (
            this.profile.coordenador === true ||
            this.profile.gestor === true
          ) {
            this.getVendedores();
            this.form.controls.codGerencia.setValue('');
            this.form.controls.codGerencia.updateValueAndValidity();
          } else if (
            this.profile.vendedor === true
            // this.profile.hasVinculoOperadores === true
          ) {
            this.viewVendedor == true;
            this.getVinculoOperadores();
            this.form.controls.codVendedor.setValue(
              parseInt(this.user.info.idVendedor)
            );
            this.form.controls.codVendedor.updateValueAndValidity();
            this.form.controls.codGerencia.setValue('');
            this.form.controls.codGerencia.updateValueAndValidity();
            this.showDashboard = true;
          } else {
            this.showPermissionDenied = true;
          }
        } else {
          this.showPermissionDenied = true;
        }
      },
      error: (error: any) => {
        this.showPermissionDenied = true;
      }
    });
  }

  onChangeEscritorio(event: any, reset: boolean) {
    if (this.viewVendedor == false) {
      if (reset == true) {
        this.form.controls.codVendedor.reset();
        this.form.controls.codVendedor.setValue('');
        this.vendedores = this.vendedoresTotal;
      }
      this.filteredVendedores = this.vendedores.filter(
        (value: any) => value.idEscritorio == this.form.value.codGerencia
      );

      this.filteredVendedores.unshift({
        id: '',
        nome: 'EXIBIR TODOS',
      });
      this.onChangeVendedores();

      if (this.form.value.codGerencia == '') {
        this.vendedores = this.vendedoresTotal;
      }
    }
  }

  onChangeVendedores(): void {
    this.vendedores = this.filteredVendedores;
  }

  checkValuesGerente(): void {
    if (
      this.form.value.codGerencia !== '' &&
      this.form.value.codGerencia !== null
    ) {
      this.onChangeEscritorio(this.form.value.codGerencia, false);
    }
  }

  getFilteredValues() {
    this.getGestores();
    this.getEmpresas();
    this.getLinhas();
  }

  loadingFilters() {
    this.form.controls.codEmpresa.disable();
    this.form.controls.codLinha.disable();
    this.form.controls.codGerencia.disable();
    this.form.controls.codVendedor.disable();
  }

  getLinhas(): void {
    this.materiaisComboService.getFilterValues().subscribe((response: any) => {
      if (response[0].responseCode === 200) {
        this.linhas = response[0].result;

        this.linhas.unshift({
          id: '',
          descricao: 'EXIBIR TODOS',
        });
      } else {
        this.pnotifyService.error();
        this.location.back();
      }

      if (response[1].responseCode === 200) {
        this.classes = response[1].result;

        this.filteredClasses.unshift({
          idClasse: '',
          nomeClasse: 'EXIBIR TODOS',
        });
        this.form.controls.codLinha.enable();
      } else {
        this.pnotifyService.error();
        this.location.back();
      }
    });
  }

  getGestores() {
    this.escritoriosService.getEscritorios().subscribe({
      next: (response: any) => {
        if (response.responseCode === 200) {
          this.coordenadores = response.result;

          this.coordenadores.unshift({
            codEscritorio: '',
            nomeEscritorio: 'EXIBIR TODOS',
          });
          this.form.controls.codGerencia.enable();
        } else {
          this.pnotifyService.error();
          this.location.back();
        }
      },
      error: (error: any) => {
        this.pnotifyService.error();
        this.location.back();
      }
    });
  }

  getEmpresas() {
    this.comercialService.getEmpresas({ tipo: 'faturamento' }).subscribe({
      next: (response: any) => {
        if (response.responseCode === 200) {
          this.empresa = response.result;

          this.empresa.unshift({
            idEmpresa: '',
            nomeEmpresa: 'EXIBIR TODOS',
          });

          this.form.controls.codEmpresa.enable();
        } else {
          this.pnotifyService.error();
          this.location.back();
        }
      },
      error: (error: any) => {
        this.pnotifyService.error();
        this.location.back();
      }
    });
  }

  getVendedores() {
    this.comercialVendedoresService
      .getVendedores()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          this.vendedores = response['result'];
          this.vendedoresTotal = this.vendedores;
          this.vendedores.unshift({
            id: '',
            nome: 'EXIBIR TODOS',
          });
          this.form.controls.codVendedor.enable();
        },
        error: (error: any) => {
          this.pnotifyService.error();
          this.location.back();
        }
      });
  }

  getVinculoOperadores(): void {
    this.comercialVendedoresService
      .getVinculoOperadores()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe((response: any) => {
        if (response.responseCode === 200) {
          this.vendedores = response.result;
          this.form.controls.codVendedor.enable();
          this.form.controls.codGerencia.disable();
          this.form.controls.codGerencia.setValue('');
          this.form.controls.codGerencia.updateValueAndValidity();
        }
      });
  }
  // modal
  openModalAbertas(abertas: TemplateRef<any>) {
    this.modalRef = this.bsModalService.show(
      abertas,
      Object.assign({}, { class: 'gray modal-lg' })
    );
  }

  openModalFechadas(fechadas: TemplateRef<any>) {
    this.modalRef = this.bsModalService.show(
      fechadas,
      Object.assign({}, { class: 'gray modal-lg' })
    );
  }

  closeModal(modalRef: TemplateRef<any>) {
    this.modalRef.hide();
  }

  // Tratamento de erros
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

  handleFormFieldsError() {
    this.pnotifyService.error();
    this.location.back();
  }

  onRefresh() {
    this.setFormFilter();
  }
}
