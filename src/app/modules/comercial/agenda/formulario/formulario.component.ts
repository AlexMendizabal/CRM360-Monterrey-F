import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { finalize } from 'rxjs/operators';

// ngx-bootstrap
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { ptBrLocale } from 'ngx-bootstrap/locale';

defineLocale('pt-br', ptBrLocale);

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { ComercialAgendaFormularioService } from './formulario.service';
import { ComercialAgendaService } from 'src/app/modules/comercial/agenda/agenda.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { ComercialCicloVendasCotacoesService } from '../../ciclo-vendas/cotacoes/cotacoes.service';
import { ComercialCadastrosTitulosAgendaService } from './../../cadastros/titulos-agenda/titulos-agenda.service';

// Interfaces
import { IFormCanDeactivate } from 'src/app/guards/iform-candeactivate';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { JsonResponse } from 'src/app/models/json-response';

@Component({
  selector: 'comercial-agenda-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
})
export class ComercialAgendaFormularioComponent
  implements OnInit, IFormCanDeactivate {
  permissoesAcesso: {
    simuladorVendas: boolean;
  };

  colors = [
    {
      hex: '#FFFF01',
      descricao: 'Amarelo',
    },
    {
      hex: '#0033FF',
      descricao: 'Azul',
    },
    {
      hex: '#FB6602',
      descricao: 'Laranja',
    },
    {
      hex: '#FF0087',
      descricao: 'Rosa',
    },
    {
      hex: '#610069',
      descricao: 'Roxo',
    },
    {
      hex: '#FA1100',
      descricao: 'Vermelho',
    },
  ];
<<<<<<< HEAD
  selectedColor: any; // Declaración en el componente


=======
>>>>>>> jimmy

  loaderNavbar = false;
  loaderFullScreen = true;
  action: string;

  breadCrumbTree: Array<Breadcrumb> = [];

  form: FormGroup;
  formChanged = false;
  submittingForm = false;

  clientes: any = [];
  formasContato: any = [];
  origensContato: any = [];
  listarTitulosAgenda: any = [];
  motivosReagendamento: any = [];

  showInputClientes = true;

  isDisabledTime = false;

  bsConfig: Partial<BsDatepickerConfig>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private atividadesService: AtividadesService,
    private formService: ComercialAgendaFormularioService,
    private agendaService: ComercialAgendaService,
    private router: Router,
    private formBuilder: FormBuilder,
    private location: Location,
    private localeService: BsLocaleService,
    private pnotifyService: PNotifyService,
    private dateService: DateService,
    private titleService: TitleService,
    private cotacoesService: ComercialCicloVendasCotacoesService
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

  ngOnInit() {
    this.registrarAcesso();
    this.checkAcessos();
    this.checkUrlParams();
    this.getFormFields();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  // checkAcessos(): void {
  //   const acessos: JsonResponse = this.activatedRoute.snapshot.data.acessos;
  //   if (acessos.success === true) {

  //     this.permissoesAcesso = acessos.data;
  //   } else {
  //     this.permissoesAcesso.simuladorVendas = false;
  //   }
  // }
<<<<<<< HEAD
  
=======

>>>>>>> jimmy
    checkAcessos(): void {
    const acessos = this.activatedRoute.snapshot.data.detalhes;
    if (acessos.responseCode === 200) {

      this.permissoesAcesso = acessos.result;
    } else {
      this.permissoesAcesso.simuladorVendas == false;
    }
  }

  checkUrlParams(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        let routerUrl = this.router.url.split('/');
        this.action = routerUrl[routerUrl.length - 2];
        this.setBreadCrumb(this.action, params.id);
      } else {
        this.action = 'novo';
        this.setBreadCrumb(this.action);
      }

      this.setFormBuilder();
    });
  }

  appTitle(): string {
    let title: string;

    if (this.action == 'novo') {
      title = 'Nuevo contacto';
    } else if (this.action == 'editar') {
      title = 'Editar contato';
    } else if (this.action == 'reagendar') {
      title = 'Reagendar contato';
    }

    return title;
  }

  setFormBuilder(): void {
    if (this.activatedRoute.snapshot.data.detalhes.responseCode === 200) {
      const detalhes = this.activatedRoute.snapshot.data.detalhes.result;

      let inicioData: Date,
        inicioHorario: Date,
        terminoData: Date,
        terminoHorario: Date;

      if (detalhes.start === null) {
        inicioData = new Date();
        inicioHorario = new Date();
        terminoData = new Date();
        terminoHorario = new Date();
      } else {
        inicioData = new Date(detalhes.start);
        inicioHorario = new Date(detalhes.start);
        terminoData = new Date(detalhes.end);
        terminoHorario = new Date(detalhes.end);
      }

      this.form = this.formBuilder.group({
        id: [detalhes.id],
        // codTitulosAgenda: [detalhes.codTitulosAgenda, [Validators.required]],
        cor: [detalhes.color.primary],
        codTitulo: [
          {
            value: detalhes.codTitulo,
            disabled: this.action == 'reagendar' ? true : false,
          },
          [Validators.required],
        ],
        cliente: [
          {
            value: detalhes.codClient,
            disabled: this.action == 'novo' ? false : true,
          },
        ],
        gerarCotacaoPedido: [false],
        codFormaContato: [detalhes.formContactId],
        codOrigemContato: [detalhes.typeContactId],
        inicioData: [inicioData, [Validators.required]],
        inicioHorario: [
          { value: inicioHorario, disabled: detalhes.allDay },
          [Validators.required],
        ],
        terminoData: [{ value: terminoData, disabled: detalhes.allDay }],
        terminoHorario: [{ value: terminoHorario, disabled: detalhes.allDay }],
        diaInteiro: [detalhes.allDay],
        motivoReagendamento: [detalhes.rescheduleId],
        observacao: [
          {
            value: detalhes.description,
            disabled: this.action == 'reagendar' ? true : false,
          },
        ],
      });

      if (detalhes.allDay) {
        this.isDisabledTime = true;
      }

      if (this.action == 'reagendar') {
        this.form.controls.motivoReagendamento.setValidators([
          Validators.required,
        ]);
        this.form.controls.motivoReagendamento.updateValueAndValidity();
      }
    } else {
      this.pnotifyService.error();
      this.location.back();
    }
  }

  setBreadCrumb(action: string, id: number = null): void {
    if (action == 'novo') {
      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/comercial/home',
        },
        {
          descricao: 'Agenda',
          routerLink: `/comercial/agenda/compromissos`,
        },
        {
          descricao: 'Nuevo contacto',
        },
      ];
    } else {
      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/comercial/home',
        },
        {
          descricao: 'Agenda',
          routerLink: `/comercial/agenda/compromissos`,
        },
        {
          descricao: 'Detalles',
          routerLink: `/comercial/agenda/detalhes/${id}`,
        },
        {
          descricao:
            this.action == 'editar' ? 'Editar contato' : 'Reagendar contato',
        },
      ];
    }

    this.titleService.setTitle(
      this.breadCrumbTree[this.breadCrumbTree.length - 1].descricao
    );
  }

  getFormFields(): void {
    this.loaderFullScreen = true;

    this.formService
      .loadDependencies()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe((response: Array<JsonResponse>) => {
        if (response[0].success === true) {
          this.clientes = response[0].data;
        } else if (response[0].success === false) {
          this.showInputClientes = false;
        } else {
          this.handleLoadDependenciesError();
        }

        if (response[1].success === true) {
          this.formasContato = response[1].data;

          this.formasContato.unshift({
            codFormaContato: null,
            nomeFormaContato: '',
          });

        } else {
          this.handleLoadDependenciesError();
        }

        if (response[2].success === true) {
          this.origensContato = response[2].data;

          this.origensContato.unshift({
            codOrigemContato: null,
            nomeOrigemContato: '',
          });
        } else {
          this.handleLoadDependenciesError();
        }

        if (response[3].success === true) {
          this.motivosReagendamento = response[3].data;
        } else {
          this.handleLoadDependenciesError();
        }

        if (response[4].success === true) {
          this.listarTitulosAgenda = response[4].data;
        } else {
          this.handleLoadDependenciesError();
        }
      });
  }

  handleLoadDependenciesError(): void {
    this.pnotifyService.error();
    this.location.back();
  }

  onColorChange(color: any): void {
    this.form.controls.cor.setValue(color.hex);
  }
<<<<<<< HEAD
  onCodTituloChange(): void {
    const selectedIndex = this.form.controls.codTitulo.value; // Obtener el índice del elemento seleccionado en el dropdown "codTitulo"
    const selectedColor = this.colors[selectedIndex]; // Obtener el color correspondiente al índice seleccionado en el dropdown "codTitulo"
    this.onColorChange(selectedColor); // Establecer el valor del color correspondiente en el dropdown "color-dropdown"
  }
=======
>>>>>>> jimmy

  triggerAllDay(): void {
    this.isDisabledTime = !this.isDisabledTime;

    if (!this.isDisabledTime) {
      this.form.controls.inicioHorario.enable();
      this.form.controls.terminoHorario.enable();
      this.form.controls.terminoData.enable();
    } else {
      this.form.controls.inicioHorario.disable();
      this.form.controls.terminoHorario.disable();
      this.form.controls.terminoData.disable();
    }
  }

  checkValidatorsDate(): boolean {
    let validation = true,
      inicioData: Date,
      inicioHorario: Date,
      terminoData: Date,
      terminoHorario: Date;

    if (!this.form.value.diaInteiro) {
      inicioData = this.form.value.inicioData;
      inicioHorario = this.form.value.inicioHorario;
      terminoData = this.form.value.terminoData;
      terminoHorario = this.form.value.terminoHorario;

      inicioData.setHours(inicioHorario.getHours(), inicioHorario.getMinutes());
      terminoData.setHours(
        terminoHorario.getHours(),
        terminoHorario.getMinutes()
      );

      if (inicioData.getTime() > terminoData.getTime()) {
        validation = false;
      }
    }

    return validation;
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

  onSubmit(): void {
    if (!this.checkValidatorsDate()) {
      this.pnotifyService.notice('Data de término deve ser maior que início.');
      return;
    }

    if (this.form.valid) {
      this.loaderNavbar = true;
      this.submittingForm = true;
      const formValue = this.form.getRawValue();

      let client: string,
        formContactDesc: string,
        typeContactDesc: string,
        inicioData: Date,
        inicioHorario: Date,
        terminoData: Date,
        terminoHorario: Date;

      let msgSuccess = 'Su cita fue creada.';
      let msgError = 'Ocurrio un error al crear cita.';

      if (formValue.id) {
        msgSuccess = 'Su cita fue editada.';
        msgError = 'Ocurrio un error al editar cita.';
      }

      if (formValue.cliente != '') {
        for (let index = 0; index < this.clientes.length; index++) {
          if (this.clientes[index].id == formValue.cliente) {
            client = this.clientes[index].razaoSocial;
          }
        }
      }

      if (formValue.codFormaContato != '') {
        for (let index = 0; index < this.formasContato.length; index++) {
          if (
            this.formasContato[index].codFormaContato ==
            formValue.codFormaContato
          ) {
            formContactDesc = this.formasContato[index].nomeFormaContato;
          }
        }
      }

      if (formValue.codOrigemContato != '') {
        for (let index = 0; index < this.origensContato.length; index++) {
          if (
            this.origensContato[index].codOrigemContato ==
            formValue.codFormaContato
          ) {
            typeContactDesc = this.origensContato[index].nomeOrigemContato;
          }
        }
      }

      if (formValue.diaInteiro) {
        inicioData = formValue.inicioData;
        terminoData = inicioData;

        inicioData.setHours(0, 0, 0);
        terminoData.setHours(0, 0, 0);
      } else {
        inicioData = formValue.inicioData;
        inicioHorario = formValue.inicioHorario;
        terminoData = formValue.terminoData;
        terminoHorario = formValue.terminoHorario;

        inicioData.setHours(
          inicioHorario.getHours(),
          inicioHorario.getMinutes()
        );
        terminoData.setHours(
          terminoHorario.getHours(),
          terminoHorario.getMinutes()
        );
      }

      const inicio = this.dateService.convert2PhpDate(inicioData);
      const termino = this.dateService.convert2PhpDate(terminoData);

      let formObj = {
        id: formValue.id,
        color: {
          primary: formValue.cor,
        },
        // title: formValue.codTitulo,
        codTitulo: formValue.codTitulo,
        codClient: formValue.cliente,
        client: client,
        formContactId: formValue.codFormaContato,
        formContactDesc: formContactDesc,
        typeContactId: formValue.codOrigemContato,
        typeContactDesc: typeContactDesc,
        start: inicio,
        end: termino,
        allDay: formValue.diaInteiro,
        rescheduleId: formValue.motivoReagendamento,
        description: formValue.observacao
          ? formValue.observacao.toUpperCase()
          : null,
      };

      this.agendaService.save(this.action, formObj).subscribe({
        next: (response: any) => {
          if (response.responseCode === 200) {
            this.pnotifyService.success(msgSuccess);
            this.formChanged = false;

            if (this.action == 'reagendar') {
              this.router.navigate(['../../compromissos'], {
                relativeTo: this.activatedRoute,
              });
            } else {
              if (
                this.permissoesAcesso.simuladorVendas === true &&
                this.form.value.gerarCotacaoPedido === true
              ) {
                this.onAddCotacaoPedido();
              } else {
                this.location.back();
              }
            }
          } else {
            this.handleErrorOnSubmit(msgError);
          }
        },
        error: (error: any) => {
          this.handleErrorOnSubmit(msgError);
        }
      });
    }
  }

  handleErrorOnSubmit(message: string): void {
    this.loaderNavbar = false;
    this.submittingForm = false;
    this.pnotifyService.error(message);
  }

  onInput(): void {
    this.formChanged = true;
  }

  formCanDeactivate(): boolean {
    if (this.formChanged) {
      if (confirm('La información no guardada se perderá. ¿Desea continuar?')) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  }

  onCancel(): void {
    this.location.back();
  }

  onGerarCotacaoPedido(): void {
    if (this.form.value.gerarCotacaoPedido === true) {
      this.form.controls.cliente.setValidators([Validators.required]);
      this.form.controls.codFormaContato.setValidators([Validators.required]);
      this.form.controls.codOrigemContato.setValidators([Validators.required]);

      if (this.form.value.cliente === null) {
        this.form.controls.cliente.markAsTouched();
        this.form.controls.cliente.setErrors({ incorrect: true });
      }

      if (this.form.value.codFormaContato === null) {
        this.form.controls.codFormaContato.markAsTouched();
        this.form.controls.codFormaContato.setErrors({ incorrect: true });
      }

      if (this.form.value.codOrigemContato === null) {
        this.form.controls.codOrigemContato.markAsTouched();
        this.form.controls.codOrigemContato.setErrors({ incorrect: true });
      }
    } else if (this.form.value.gerarCotacaoPedido === false) {
      this.form.controls.cliente.setValidators(null);
      this.form.controls.codFormaContato.setValidators(null);
      this.form.controls.codOrigemContato.setValidators(null);
    }

    this.form.controls.cliente.updateValueAndValidity();
    this.form.controls.codFormaContato.updateValueAndValidity();
    this.form.controls.codOrigemContato.updateValueAndValidity();
  }

  onAddCotacaoPedido(): void {
    this.loaderNavbar = true;

    const params = {
      codFormaContato: this.form.value.codFormaContato,
      codOrigemContato: this.form.value.codOrigemContato,
    };

    this.cotacoesService
      .getReservarIdCotacao()
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe((response: JsonResponse) => {
        if (response.hasOwnProperty('success') && response.success === true) {
          this.router.navigate(
            [
              '/comercial/ciclo-vendas/cotacoes-pedidos/novo/',
              response.data.idReservado,
              this.form.value.cliente,
            ],
            {
              queryParams: { f: btoa(JSON.stringify(params)) },
            }
          );
        } else {
          this.pnotifyService.error();
        }
      });
  }
}