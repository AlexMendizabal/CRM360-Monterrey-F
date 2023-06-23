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
import { esLocale } from 'ngx-bootstrap/locale';

defineLocale('es', esLocale);

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { ComercialAgendaFormularioService } from './formulario.service';
import { ComercialAgendaService } from 'src/app/modules/comercial/agenda/agenda.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { ComercialCicloVendasCotacoesService } from '../../ciclo-vendas/cotacoes/cotacoes.service';
import { ComercialCadastrosTitulosAgendaService } from './../../cadastros/titulos-agenda/titulos-agenda.service';
import { AbstractControl } from '@angular/forms';
import { ComercialVendedoresService } from '../../services/vendedores.service';

// Interfaces
import { IFormCanDeactivate } from 'src/app/guards/iform-candeactivate';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { JsonResponse } from 'src/app/models/json-response';
import { id } from 'date-fns/locale';
import { Column3D } from '@amcharts/amcharts4/charts';
import { titulo } from 'ng-brazil/titulo/validator';

import { compileDirectiveFromRender2 } from '@angular/compiler/src/render3/view/compiler';

@Component({
  selector: 'comercial-agenda-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
})
export class ComercialAgendaFormularioComponent
  implements OnInit, IFormCanDeactivate
{
  permissoesAcesso: {
    simuladorVendas: boolean;
  };

  colors = [
    {
      hex: '#FFFF01',
      descricao: 'Amarillo',
    },
    {
      hex: '#0076d4',
      descricao: 'Azul',
    },
    {
      hex: '#FB6602',
      descricao: 'Naranja',
    },
    {
      hex: '#FF0087',
      descricao: 'Rosado',
    },
    {
      hex: '#610069',
      descricao: 'Morado',
    },
    {
      hex: '#FA1100',
      descricao: 'Rojo',
    },
  ];
  selectedColor: any; // Declaración en el componente

  loaderNavbar = false;
  loaderFullScreen = true;
  action: string;
  latitud: number = -17.78629;
  longitud: number = -63.18117;

  direccion: string;

  breadCrumbTree: Array<Breadcrumb> = [];

  form: FormGroup;
  formChanged = false;
  submittingForm = false;

  clientes: any = [];
  promotores: any = [];
  formasContato: any = [];
  origensContato: any = [];
  listarTitulosAgenda: any = [];
  motivosReagendamento: any = [];
  marcadorArrastrable = true;
  attachedFiles: File[] = [];
  adjunto: File = null;

  showInputClientes = true;
  showInputVendedores = true;
  hideInputVendedores = true;

  mostrarFormulario: boolean = true;

  isDisabledTime = false;

  showFormulario = true;
  hideFormulario = true;
  color: string;

  bsConfig: Partial<BsDatepickerConfig>;
  mostrarElemento: any;
  detalhes: any = {
    status: null,
  };

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
    private cotacoesService: ComercialCicloVendasCotacoesService,
    private ComercialVendedoresService: ComercialVendedoresService
  ) {
    this.localeService.use('es');
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

  // agregarAdjunto() {
  //   const archivo = this.form.get('adjunto').value;
  //   if (archivo) {
  //     this.attachedFiles.push(archivo);
  //     // Borra el campo 'adjunto' para permitir agregar más archivos
  //     this.form.get('adjunto').setValue(null);
  //   }
  // }

  appTitle(): string {
    let title: string;

    if (this.action == 'novo') {
      title = 'Nuevo contacto';
    } else if (this.action == 'editar') {
      title = 'Editar contacto';
    } else if (this.action == 'reagendar') {
      title = 'Reagendar contato';
    } else if (this.action == 'finalizar') {
      title = 'Finalizar Contacto';
    }

    return title;
  }

  setFormBuilder(): void {
    if (this.activatedRoute.snapshot.data.detalhes.responseCode === 200) {
      const detalhes = this.activatedRoute.snapshot.data.detalhes.result;
      const isFinalizarAction = this.action === 'finalizar';
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
        id: [detalhes.id], // Agrega el campo 'id' al formulario
        cor: [detalhes.color.primary],

        codTitulo: [
          {
            value: detalhes.codTitulo,
            disabled: this.action == 'reagendar' || this.action == 'finalizar',
          },
          [Validators.required],
        ],

        cliente: [
          {
            value: detalhes.codClient,
            disabled: this.action != 'novo',
          },
        ],

        promotor: [
          {
            value: detalhes.id_vendedor,
            disabled:
              this.action == 'reagendar' || this.action === 'finalizar'
                ? true
                : false,
          },
        ],
        direccion: [
          {
            value: detalhes.direccion,
            disabled:
              this.action === 'reagendar' || this.action === 'finalizar'
                ? true
                : false,
          },
        ],
        codFormaContato: [
          {
            value: detalhes.formContactId,
            disabled:
              this.action === 'novo' || this.action === 'editar' ? false : true,
          },
        ],

        latitud_clie: [
          {
            value: detalhes.latitud,
          },
        ],
        longitud_clie: [
          {
            value: detalhes.longitud,
          },
        ],
        codigo_cliente: [
          {
            value: detalhes.codigo_cliente,
          },
        ],
        codOrigemContato: [
          {
            value: detalhes.typeContactId,
            disabled:
              this.action === 'novo' || this.action === 'editar' ? false : true,
          },
        ],

        gerarCotacaoPedido: [false],
        inicioData: [
          { value: inicioData, disabled: this.action == 'finalizar' },
          [Validators.required],
        ],
        inicioHorario: [
          { value: inicioHorario, disabled: this.action == 'finalizar' },
          [Validators.required],
        ],
        terminoData: [
          { value: terminoData, disabled: this.action == 'finalizar' },
        ],
        terminoHorario: [
          { value: terminoHorario, disabled: this.action === 'finalizar' },
        ],
        diaInteiro: [
          {
            value: (detalhes.allDay = false),
            disabled: this.action === 'finalizar',
          },
        ],
        motivoReagendamento: [
          {
            value: detalhes.rescheduleId,
            disabled: this.action == 'finalizar',
          },
          this.action == 'reagendar' ? [Validators.required] : null,
        ],
        observacao: [
          {
            value: detalhes.description,
            disabled: this.action == 'finalizar',
          },
        ],
        Obsfinalizar: [
          { value: '', disabled: !isFinalizarAction },
          isFinalizarAction ? [Validators.required] : null,
        ],
      });

      if (detalhes.allDay) {
        this.isDisabledTime = true;
      }
      this.latitud = detalhes.latitud;
      this.longitud = detalhes.longitud;
      if (this.action == 'reagendar') {
        this.form.controls.motivoReagendamento.setValidators([
          Validators.required,
        ]);
        this.form.controls.motivoReagendamento.updateValueAndValidity();
      }

      if (this.action == 'finalizar') {
        this.form.controls.Obsfinalizar.setValidators([Validators.required]);
        this.form.controls.Obsfinalizar.updateValueAndValidity();
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
            this.action === 'editar'
              ? 'Editar contato'
              : this.action === 'reagendar'
              ? 'Reagendar contato'
              : this.action === 'finalizar'
              ? 'Finalizar contato'
              : '',
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
        // @ts-ignore: Ignorar error TS2339
        if (response[5].responseCode == 200) {
          console.log(response[5].data);
          // @ts-ignore: Ignorar error TS2339
          this.promotores = response[5].result;
        } else {
          this.showInputVendedores = false;
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
  onCodTituloChange(): void {
    const selectedIndex = this.form.controls.codTitulo.value; // Obtener el índice del elemento seleccionado en el dropdown "codTitulo"
    const selectedColor = this.colors[selectedIndex]; // Obtener el color correspondiente al índice seleccionado en el dropdown "codTitulo"
    this.onColorChange(selectedColor); // Establecer el valor del color correspondiente en el dropdown "color-dropdown"
  }

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
    let validation = true;
    let inicioData: Date;
    let inicioHorario: Date;
    let terminoData: Date;
    let terminoHorario: Date;

    if (!this.form.value.diaInteiro) {
      inicioData = this.form.value.inicioData;
      inicioHorario = this.form.value.inicioHorario;
      terminoData = this.form.value.terminoData;
      terminoHorario = this.form.value.terminoHorario;

      if (inicioData && inicioHorario && terminoData && terminoHorario) {
        inicioData.setHours(
          inicioHorario.getHours(),
          inicioHorario.getMinutes()
        );
        terminoData.setHours(
          terminoHorario.getHours(),
          terminoHorario.getMinutes()
        );

        if (inicioData.getTime() > terminoData.getTime()) {
          validation = false;
        }
      }
    }

    return validation;
  }

  onFieldError(field: string): string {
    const control = this.form.get(field);

    if (this.onFieldInvalid(control)) {
      return 'is-invalid';
    }

    return '';
  }

  onFieldInvalid(control: AbstractControl): boolean {
    return control && control.invalid && (control.touched || control.dirty);
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
      this.pnotifyService.notice(
        'La fecha de término debe ser mayor que la de inicio.'
      );
      return;
    }

    if (this.form && this.form.valid) {
      this.loaderNavbar = true;
      this.submittingForm = true;
      const formValue = this.form.getRawValue();
      console.log(formValue);
      const obsFinalizar = this.form.get('Obsfinalizar');
      let client: string,
        formContactDesc: string,
        typeContactDesc: string,
        inicioData: Date,
        inicioHorario: Date,
        terminoData: Date,
        terminoHorario: Date;

      let msgSuccess = 'Su cita fue creada.';
      let msgError = 'Ocurrió un error al crear la cita.';

      if (formValue.id) {
        msgSuccess = 'Su cita fue editada.';
        msgError = 'Ocurrió un error al editar la cita.';
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
            formValue.codOrigemContato
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

      let status: number;

      // if (formValue.id) {
      //   status = 0; // 'editar'
      // } else {
      switch (this.action) {
        case 'novo':
          status = 1;
          break;
        case 'finalizar':
          status = 3;
          break;
        case 'reagendar':
          status = 4;
          break;

        case 'editar':
          status = 2;
          break;
        default:
          status = 0;
          break;
      }
      // }

      const inicio = this.dateService.convert2PhpDate(inicioData);
      const termino = this.dateService.convert2PhpDate(terminoData);

      const observacaoUpperCase = formValue.observacao !== null && formValue.observacao !== undefined
        ? formValue.observacao.toUpperCase()
        : null;

      let formObj = {
        id: formValue.id,
        codTitulo: formValue.codTitulo,
        codClient: formValue.cliente,
        idVendedor: formValue.promotor,
        client: client,
        formContactId: formValue.codFormaContato,
        codigo_cliente: formValue.codigo_cliente.value,
        formContactDesc: formContactDesc,
        typeContactId: formValue.codOrigemContato,
        typeContactDesc: typeContactDesc,
        start: inicio,
        end: termino,
        allDay: formValue.diaInteiro,
        rescheduleId: formValue.motivoReagendamento,
        description: formValue.observacao,
        direccion: formValue.direccion,
        latitud: this.latitud,
        longitud: this.longitud,
        status: status,
        /* id_status: id_status, */
        obsFinalizar: formValue.Obsfinalizar,
      };
      console.log(formObj.codClient);
      console.log(formObj.idVendedor);
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
        },
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
    const idVendedor = this.form.value.promotor;
    let params = {
      idVendedor: idVendedor,

    }
    this.ComercialVendedoresService.getCarteiraClientes(params).subscribe((response: JsonResponse) => {
      if(response.success== true){
        this.clientes = response.data;
      }
    })
  }

  updateDireccion(event: any) {
    var direccion_cliente = event.direccion;
    var latitud_cliente = event.latitud;
    var longitud_cliente = event.longitud;
    var codigo_cliente = event.codigo_cliente;

    this.form.controls['latitud_clie'].setValue(latitud_cliente);
    this.form.controls['longitud_clie'].setValue(longitud_cliente);
    this.form.controls['direccion'].setValue(direccion_cliente);
    this.form.controls['codigo_cliente'].setValue(codigo_cliente);

    this.latitud = latitud_cliente;
    this.longitud = longitud_cliente;
  }
  actualizarMarcador(event: any) {
    this.latitud = event.coords.lat;
    this.longitud = event.coords.lng;
    this.form.controls['latitud_clie'].setValue(this.latitud);
    this.form.controls['longitud_clie'].setValue(this.longitud);
    this.actualizarDireccion(event);
  }

  public obtenerDireccion(latitud: number, longitud: number): Promise<string> {
    return fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitud},${longitud}&key=AIzaSyDl5b7STz9xYNDhybTTer2POVncX9FYqCc`
    )
      .then((response) => response.json())
      .then((data) => {
        const resultado = data.results[0];
        if (resultado) {
          return resultado.formatted_address;
        } else {
          return 'Dirección no encontrada';
        }
      })
      .catch((error) => {
        return 'Error al obtener la dirección';
      });
  }

  actualizarDireccion(event: any) {
    this.obtenerDireccion(event.coords.lat, event.coords.lng)
      .then((direccion_mapa: string) => {
        this.form.controls['direccion'].setValue(direccion_mapa);
      })
      .catch((error: any) => {
        this.form.controls['direccion'].setValue(
          'Error al obtener la dirección'
        );
      });
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
      if (this.form.value.promotor === null) {
        this.form.controls.promotor.markAsTouched();
        this.form.controls.promotor.setErrors({ incorrect: true });
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
  filtrovendedor(): void {

    console.log(this.form.value.promotor)
    var params = this.form.value.promotor
    this.agendaService.reporte(params);
  }
}
