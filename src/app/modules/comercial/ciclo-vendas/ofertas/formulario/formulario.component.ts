// Angular Core Imports
import { Location } from '@angular/common';  // Para manejar navegación y ubicación en la aplicación
import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ElementRef,
  Output,
  ViewChild,
  Input,
  EventEmitter,
  SimpleChanges
} from '@angular/core';  // Para gestionar ciclo de vida del componente y manipulación de vistas

// RxJS (Programación reactiva)
import { BehaviorSubject, EMPTY, Subscription, Subject, Observable } from 'rxjs';  // Para manejar estados y suscripciones
import { debounceTime, switchMap, distinctUntilChanged, finalize, takeUntil } from 'rxjs/operators';

// Angular Router (Navegación y rutas)
import { ActivatedRoute, Router } from '@angular/router';  // Para capturar rutas activas y manejar redirecciones

// Angular Forms (Formularios reactivos)
import { FormBuilder, FormGroup } from '@angular/forms';  // Para construir y gestionar formularios reactivos

// ngx-bootstrap (Modales y componentes adicionales)
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';  // Para manejar la lógica y referencia de modales

// Servicios compartidos del proyecto
import { TitleService } from 'src/app/shared/services/core/title.service';  // Para actualizar el título de la página
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';  // Para mostrar notificaciones
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';  // Para manejar modales de confirmación

// Guards (Protección de rutas)
import { IFormCanDeactivate } from 'src/app/guards/iform-candeactivate';  // Interfaz para manejar lógica de desactivación de formularios

// Servicios del componente actual
import { AuthService } from 'src/app/shared/services/core/auth.service';  // Servicio de autenticación
import { FormularioService } from './formulario.service';  // Servicio personalizado para este componente

// Modelos
import { ICarrinhoModel } from './models/carrinho';  // Modelo de carrito para gestionar datos
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';

// Interfaces y tipos adicionales
import { JsonResponse } from 'src/app/models/json-response';
interface Almacen {
  DEPOSITOS: string;  // Definición de la interfaz Almacen con propiedad DEPOSITOS
}

// Component Metadata
@Component({
  selector: 'formulario',  // Selector del componente para usarlo en la plantilla
  templateUrl: './formulario.component.html',  // Ruta de la plantilla HTML del componente
  styleUrls: ['./formulario.component.scss']  // Ruta de los estilos asociados al componente
})


export class FormularioComponent implements OnInit, OnDestroy, IFormCanDeactivate {

  // Variables privadas y suscripciones
  private destroy$ = new Subject<void>();
  private user = this.authService.getCurrentUser();  // Usuario actual autenticado
  private selectedClientSubject = new BehaviorSubject<string | null>(null);  // Subject para gestionar el cliente seleccionado
  selectedClient$ = this.selectedClientSubject.asObservable();  // Observable para suscribirse a los cambios del cliente seleccionado

  // Decoradores y Variables
  @ViewChild('scrollToCarrinho', {}) scrollToCarrinho: ElementRef;  // Referencia a un elemento HTML para desplazarse
  // Valor inicial recibido como input (Carrito)
  @Input() id_tipo_cliente: string | number;  // ID del tipo de cliente (input)
  @Input() id_lista: string | number;  // ID de la lista de precios (input)
  @Output() resetRequested = new EventEmitter<void>();  // Evento para notificar cuando se requiere un reset
  @Input() carrinho: any;  // Carrito (input)

  // Variables de carga y estado
  loaderNavbar = false;
  loaderFullScreen = false;
  carrito: Array<ICarrinhoModel> = [];
  tituloOferta: string = "ADICIONAR OFERTA"; // Titulo por defecto
  // Listas y datos para formularios
  almacenes: Almacen[] = [];  // Lista de almacenes
  tipoContacto: any[] = [];  // Lista de tipos de contacto
  ejecutivos: any[] = [];  // Lista de ejecutivos
  condicionPago: any[] = [];  // Lista de condiciones de pago

  // Variables del componente
  appTitle: string;  // Título de la aplicación
  visualizar = false;  // Flag para mostrar o no contenido
  breadCrumbTree: Array<Breadcrumb> = [];  // Estructura del breadcrumb

  // Identificadores
  idReservado: number;  // ID reservado para el formulario
  form: FormGroup;  // Formulario reactivo

  // Suscripciones (inicializadas con EMPTY para evitar errores)
  activatedRouteSubscription: Subscription = EMPTY.subscribe();
  materiaisSubscription: Subscription = EMPTY.subscribe();

  // Variable para gestionar modales
  modalRef: BsModalRef;  // Referencia al modal
  filteredClients: any[] = [];  // Clientes filtrados
  codigoSubscription: Subscription;  // Suscripción para obtener el código seleccionado

  // Filas y selección
  rows = [];
  selectedClient: string = '';  // Cliente seleccionado
  selectedAlmacen: string = '';  // Almacén seleccionado

  // Columnas de la tabla
  columns = [
    { prop: 'CODIGO' },  // Columna Código
    { prop: 'NOMBRE' }   // Columna Nombre
  ];

  almacenDespacho: any;  // Almacén de despacho seleccionado
  pagoQROpciones = [  // Opciones para pago QR
    { id: 0, descripcion: 'NO' },
    { id: 1, descripcion: 'SI' }
  ];

  // Variables relacionadas con productos
  private searchTerms = new Subject<string>();  // Para gestionar términos de búsqueda
  materiales: any[] = [];  // Lista de materiales
  peso: number;  // Peso total de los productos
  valorTotal: number;  // Valor total
  valorTotalBruto: number;  // Valor bruto total
  valorTotalBs: number;  // Valor total en Bs
  valorTotalBrutoBs: number;  // Valor bruto total en Bs
  impuesto: number;  // Valor de impuestos
  impuestoTotal: number;  // Impuesto total
  cantidad_total: number;  // Cantidad total
  descuento_total: number;  // Descuento total
  autorizacion: string = '2';  // Autorización ('1' = SI, '2' = NO)
  autorizacionStatus: any;  // Estado de la autorización
  estadoOferta: string;  // Estado de la oferta
  id_cliente: number;  // ID del cliente
  contacts: any[] = [];  // Lista de contactos
  personaContacto: number;  // ID de la persona de contacto
  validoHasta: any;  // Fecha de validez
  fechaDocumento: any;  // Fecha del documento
  duplicarOferta: boolean = false;


  // Datos logísticos
  logisticaData: any;
  razonsocial: string;  // Razón social del cliente
  valorSeleccionado: any;
  codCotacao: number;
  urlPath: string;
  tipoEntrega: number;
  destinarioFactura: string;
  centroLogisticoControl: number;
  fechaEntrega: string;
  cordenadas: string;
  action: string;

  constructor(
    private activatedRoute: ActivatedRoute,  // Servicio de rutas activas
    private titleService: TitleService,  // Servicio para actualizar el título de la página
    private pnotifyService: PNotifyService,  // Servicio de notificaciones
    private location: Location,  // Servicio de ubicación/navegación
    private authService: AuthService,  // Servicio de autenticación
    private router: Router,  // Servicio para manejar la navegación
    private modalService: BsModalService,  // Servicio para manejar los modales
    private formularioService: FormularioService,  // Servicio personalizado para el formulario
    private confirmModalService: ConfirmModalService,  // Servicio para modales de confirmación
    private fb: FormBuilder,  // FormBuilder para crear el formulario
  ) {
    // Inicialización del servicio de notificaciones
    this.pnotifyService.getPNotify();

    // Inicialización del formulario
    this.form = this.fb.group({
      CODIGO_OFERTA: [''],
      codigo_cliente: [''],
      nombre: [''],
      razonsocial: [''],
      nodocumento: [''],
      idcategoria: [''],
      categoria: [''],
      ejecutivo: [''],
      listaPrecios: [''],
      idlistaPrecios: [''],
      almacenDespacho: [''],
      tipoContacto: ['2'],  // Valor predeterminado de tipo de contacto
      condicionPago: [''],
      ejecutivos: [''],
      idpropietario: [''],
      pagoQR: ['0'],  // Valor predeterminado de pago QR
      autorizacion: [''],
      id_cliente: [''],
      comentarios: [''],
      personaContacto: [''],
      validoHasta: [''],
      fechaDocumento: [''],
      estadoOferta: ['Borrador'],  // Estado predeterminado de la oferta
      destino: [''],
      destinarioFactura: [''],
      despachoMercaderia: [''],
      centroLogisticoControl: [''],
      fechaEntrega: [''],
      cordenadas: ['']
    });
    if (this.urlPath === 'editar') {
      this.tituloOferta = "EDITAR OFERTA";
    } else if (this.urlPath === 'duplicar') {
      this.duplicarOferta = true;
      this.tituloOferta = "DUPLICAR OFERTA";
    } else {
      this.tituloOferta = "ADICIONAR OFERTA";
    }

    // Subscripción al flujo de datos de logística
    this.formularioService.logisticaData$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data) {
        this.logisticaData = data;
      }
    });

    // Subscripción al cliente seleccionado
    this.formularioService.selectedClient$.pipe(takeUntil(this.destroy$)).subscribe(codigo => {
      if (codigo) {
        this.selectedClient = codigo;
        this.formClienteBox();  // Actualiza el formulario cuando cambia el cliente seleccionado
      }
    });
  }

  // Inicialización del componente
  ngOnInit(): void {
    this.urlPath = this.activatedRoute.snapshot.url[0].path;
    this.visualizar = false; // Asegúrate de que visualizar está en false para pruebas
    this.getCarteira(this.urlPath);

    // Cambia el título basado en la acción
    if (this.urlPath === 'editar') {
      this.tituloOferta = "EDITAR OFERTA";
    } else {
      this.tituloOferta = "ADICIONAR OFERTA";
    }

    this.loadData();
    this.user = this.authService.getCurrentUser();

    // Verifica si hay un usuario seleccionado
    if (this.user && this.user.info) {
      this.valorSeleccionado = this.user.info;
    } else {
    }

    // Suscribirse al loader observable
    this.formularioService.loader$.pipe(takeUntil(this.destroy$)).subscribe((isLoading) => {
      this.loaderNavbar = isLoading;
    });

    // Monitorea cambios en el almacén de despacho
    this.form.get('almacenDespacho').valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.almacenDespacho = value;
    });

    this.setupSearch();  // Configura la búsqueda reactiva
  }
  initializeSubscriptions() {
    throw new Error('Method not implemented.');
  }
  getCarteira(action: string) {

    if (action == 'editar') {
      const id_num = this.activatedRoute.snapshot.url[1].path;
      this.formularioService.getDatoEdita(id_num)
        .subscribe((response: JsonResponse) => {
          if (response.success == true) {
            this.codCotacao = parseInt(id_num);
            this.action = action;
            this.carrito = response.data.ofertaDetalle;
            this.id_tipo_cliente = response.data[0].CODIGO_CATEGORIA_CLIENTE;
            this.almacenDespacho = response.data[0].ALMACENDESPACHO;
            this.id_lista = response.data[0].IDLISTAPRECIO;
            this.tipoEntrega = parseInt(response.data[0].tipoEntrega);
            this.destinarioFactura = response.data[0].destinarioFactura;
            this.centroLogisticoControl = response.data[0].centro_logistico;
            this.fechaEntrega = response.data[0].fechaEntrega;
            this.cordenadas = response.data[0].cordenadas;
            // Llamamos a OnClienteDatos para llenar el formulario

            this.OnClienteDatos(response.data[0]);
            this.formularioService.logisticaData$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
              if (data) {
                this.logisticaData = data;
              }
            });
          }
        });
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['carrinho'] && changes['carrinho'].currentValue) {
      this.onCarrinho(changes['carrinho'].currentValue);
    }
  }

  hasUnsavedData(): boolean {
    // En su estado actual, siempre devuelve 'false', pero aquí podrías verificar si hay datos sin guardar
    return false; // Reemplazar con 'this.form.dirty' si es necesario verificar cambios sin guardar en el formulario
  }


  onCancel(): void {
    const idSubModulo = this.activatedRoute.snapshot.params.idSubModulo;
    // Navegar de regreso a la lista de ofertas del ciclo de ventas
    this.router.navigate([`/comercial/ciclo-vendas/${idSubModulo}/ofertas/lista`]);
  }

  hasAccessToClient(): void {
    const resolver = this.activatedRoute.snapshot.data.cliente;
    if (resolver.success === true) {
      if (resolver.data.podeAcessar === true) {
        // Si el cliente tiene acceso, configuramos la ruta de migas de pan
        this.setBreadCrumb();
      } else {
        this.pnotifyService.error();
        this.location.back(); // Regresa a la página anterior si no tiene acceso
      }
    } else {
      this.pnotifyService.error();
      this.location.back(); // Error al resolver los datos del cliente
    }
  }

  setBreadCrumb(): void {
    const id = this.activatedRoute.snapshot.params.idSubModulo;

    this.activatedRoute.params.subscribe((params: any) => {
      if (params.idReservado) {
        this.idReservado = parseInt(params.idReservado);
        this.appTitle = 'Nueva Oferta';
      }
      this.appTitle = 'Nueva Oferta';

      // Configuración del título de la página y migas de pan
      this.titleService.setTitle(this.appTitle);

      this.breadCrumbTree = [
        { descricao: 'Home', routerLink: '/comercial/home' },
        { descricao: 'Ciclo de Ventas', routerLink: `/comercial/ciclo-vendas/${id}` },
        { descricao: 'Oferta', routerLink: `/comercial/ciclo-vendas/${id}/ofertas/lista` },
        { descricao: this.appTitle }
      ];
    });
  }


  // Abrir modal de cliente con plantilla específica
  openModalCliente(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      animated: false,
      class: 'modal-xl',
    });
  }

  // Abrir modal para visualizar cliente con código opcional
  openModalverCliente(template: TemplateRef<any>, codigoCliente?: string) {
    this.modalRef = this.modalService.show(template, {
      animated: false,
      class: 'modal-xl',
    });
    if (codigoCliente) {
      // Acción adicional con el código de cliente si es necesario
    }
  }

  // Abrir modal con datos maestros
  openModaldataMaestro(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      animated: false,
      class: 'modal-xl',
    });
  }

  // Filtrar clientes al escribir en el campo de búsqueda
  updateFilter(event: any): void {
    const searchTerm = event.target.value.trim();
    if (searchTerm) {
      this.loaderNavbar = true; // Mostrar loader mientras se busca
      this.searchTerms.next(searchTerm); // Enviar término de búsqueda al Subject
    } else {
      this.filteredClients = []; // Limpiar resultados si no hay término de búsqueda
    }
  }

  // Selecciona un cliente y actualiza el formulario
  selectClient(client: any) {
    this.selectedClient = client.CODIGO;
    this.filteredClients = [];
    this.formClienteBox(); // Actualizar el formulario con los datos del cliente seleccionado
    this.formularioService.setSelectedClient(this.selectedClient); // Guardar el cliente seleccionado
  }

  // Configurar la búsqueda con debounce y switchMap para minimizar solicitudes
  setupSearch(): void {
    this.searchTerms.pipe(
      debounceTime(300), // Esperar 300 ms después de dejar de escribir
      distinctUntilChanged(), // Solo ejecutar la búsqueda si el término ha cambiado
      switchMap((term: string) => {
        return this.formularioService.getClienteTextBox({ search: term }).pipe(
          finalize(() => {
            this.loaderNavbar = false; // Desactivar loader cuando termine la búsqueda
          })
        );
      })
    ).subscribe(
      (response: any) => {
        this.filteredClients = response['data']; // Mostrar los resultados de la búsqueda
      },
      (error) => {
        this.loaderNavbar = false; // Desactivar loader en caso de error
      }
    );
  }

  // Ocultar las sugerencias de clientes después de un pequeño retraso
  hideSuggestions(): void {
    setTimeout(() => {
      this.filteredClients = [];
    }, 200);
  }

  formCanDeactivate(): boolean {
    // Preguntar si los datos del formulario no están guardados antes de navegar
    if (this.hasUnsavedData()) {
      return confirm('Este cliente no forma parte de tu cartera?');
    }
    return true; // Permitir la navegación si no hay datos sin guardar
  }
  // Método genérico para manejar las solicitudes
  handleRequest(serviceCall: Observable<any>, dataProp: string, controlName: string, fallbackIndex?: number): void {
    this.toggleLoader(true);

    serviceCall.subscribe(
      response => {
        if (this.isValidResponse(response)) {
          this[dataProp] = response['data'];

          // Establecer valor predeterminado si se proporciona fallbackIndex y el control existe
          if (this[dataProp].length > 0 && fallbackIndex !== undefined && this.form.controls[controlName]) {
            this.form.controls[controlName].setValue(this[dataProp][fallbackIndex].ID);
          }
        }
      },
      error => {
      },
      () => {
        // Desactivar el loader cuando el servicio ha terminado
        this.toggleLoader(false);
      }
    );
  }


  // Carga los datos iniciales para el formulario
  loadData(): void {
    this.handleRequest(this.formularioService.getTipoContacto(), 'tipoContacto', 'tipoContacto', 1);  // Tipo de Contacto
    this.handleRequest(this.formularioService.getCondicionPago(), 'condicionPago', 'condicionPago', 0);  // Condiciones de Pago
    this.handleRequest(this.formularioService.getAlmacenes(), 'almacenes', 'almacenDespacho');  // Almacenes
    this.getEjecutivos();  // Carga los ejecutivos disponibles
  }


  getEjecutivos(): void {
    this.formularioService.getEjecutivos().subscribe(response => {
      if (response && response['data']) {
        this.ejecutivos = response['data'];
        const ejecutivoSeleccionado = this.ejecutivos.find(ejecutivo => ejecutivo.ID === this.valorSeleccionado.idVendedor);
        if (ejecutivoSeleccionado) {
          this.form.patchValue({
            ejecutivo: ejecutivoSeleccionado.NOMBRE,
            ejecutivos: ejecutivoSeleccionado.ID,
          });
        }
      }
    });
  }


  // Función utilitaria para validar respuestas
  private isValidResponse(response: any): boolean {
    return response && response['data'];
  }

  // Función genérica para activar/desactivar el loader
  private toggleLoader(active: boolean): void {
    this.loaderNavbar = active;
  }

  formClienteBox(): void {
    this.toggleLoader(true);

    // Limpiar la lista de contactos
    this.contacts = [];
    this.form.controls['personaContacto'].setValue('');

    if (this.selectedClient) {
      this.formularioService.PostCodigoCliente(this.selectedClient).subscribe(
        response => {
          if (this.isValidResponse(response)) {
            const filteredClients = response['data'];
            if (filteredClients['basicData'] && filteredClients['basicData'].length > 0) {
              const data = filteredClients['basicData'][0];
              this.selectedAlmacen = data.ALMACENEJECUTIVO;

              // Rellenar formulario
              this.OnClienteDatos(data);

              // Actualizar contactos
              this.contacts = response['data']['contacts'] || [];
              if (this.contacts.length > 0) {
                this.form.controls['personaContacto'].setValue(this.contacts[0].IDCONT);
              } else {
                this.contacts.push({ IDCONT: null, CONTACTOS: 'Sin contacto disponible' });
                this.form.controls['personaContacto'].setValue(null);
              }

              // Actualizar otros datos
              this.id_lista = data['IDLISTAPRECIO'];
              this.id_tipo_cliente = data['CODIGO_CATEGORIA_CLIENTE'];
            } else {
              // Si no hay datos básicos, limpiar los campos relevantes
              this.OnClienteDatos({});
            }
          }
        },
        error => {
        },
        () => this.toggleLoader(false)
      );
    } else {
      this.toggleLoader(false);
    }
  }

  private formatDateToYMD(dateString: string): string {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;  // Formato 'yyyy-MM-dd'
  }





  // Nueva función para rellenar los controles del formulario
  OnClienteDatos(data: any) {
    this.form.controls['CODIGO_OFERTA'].setValue(data.CODIGO_OFERTA);
    this.form.controls['codigo_cliente'].setValue(data.CODIGOSAP);
    this.form.controls['id_cliente'].setValue(data.id_cliente);
    this.form.controls['nombre'].setValue(data.NOMBRE.toUpperCase());
    this.form.controls['razonsocial'].setValue(data.RAZONSOCIAL);
    this.form.controls['nodocumento'].setValue(data.NODOCUMENTO);
    this.form.controls['comentarios'].setValue(data.observacion);
    this.form.controls['idcategoria'].setValue(data.CODIGO_CATEGORIA_CLIENTE);
    this.form.controls['categoria'].setValue(data.CATEGORIACLIENTE);
    this.form.controls['ejecutivo'].setValue(data.EJECUTIVO);
    this.form.controls['listaPrecios'].setValue(data.LISTAPRECO);
    this.form.controls['idlistaPrecios'].setValue(data.IDLISTAPRECIO);
    const almacenDespachoValue = data.ALMACENEJECUTIVO || 'ALM-V-00';
    this.form.controls['almacenDespacho'].setValue(almacenDespachoValue);
    // Convertir las fechas al formato 'yyyy-MM-dd'
    const validoHastaFormatted = this.formatDateToYMD(data.VALIDOHASTA);
    const fechaDocumentoFormatted = this.formatDateToYMD(data.FECHADOCUMENTO);

    this.form.controls['validoHasta'].setValue(validoHastaFormatted);
    this.form.controls['fechaDocumento'].setValue(fechaDocumentoFormatted);
    const tipoContactoValue = this.tipoContacto.find(tc => tc.ID === data.tipoContacto);
    if (tipoContactoValue) {
      this.form.controls['tipoContacto'].setValue(tipoContactoValue.ID);
    } else {
    }
    this.form.controls['idpropietario'].setValue(data.IDPROPIETARIO);
    // Aquí verificamos si el campo 'Propietario' está vacío
    if (!this.form.controls['ejecutivo'].value || this.form.controls['ejecutivo'].value.trim() === '') {
      const selectedEjecutivo = this.ejecutivos.find(ej => ej.ID === this.form.controls['ejecutivos'].value);
      if (selectedEjecutivo) {
        this.form.controls['ejecutivo'].setValue(selectedEjecutivo.NOMBRE);
      }
    }

  }
  duplicar(): void {
    this.duplicarOferta = true;  // Ahora duplicarOferta se establece correctamente en true
    this.sendClienteData();      // Llama a sendClienteData después de establecer duplicarOferta
  }



  onSubmit() {
    // Lógica para manejar el envío del formulario
  }
  sendClienteData(): void {
    // Validar si hay algún descuento negativo
    const tieneDescuentoNegativo = this.materiales.some(material => parseFloat(material.descuento) < 0);

    if (tieneDescuentoNegativo) {
      this.pnotifyService.notice('No debe haber descuentos negativos. Corrija los valores antes de enviar.');
      return; // Detener el envío si hay descuentos negativos
    }
    // Validar si el campo id_vendedor está vacío
    const idVendedor = this.form.get('ejecutivos').value;
    if (!idVendedor) {
      this.pnotifyService.notice('Debe ingresar el ejecutivo.');
      return; // Detener el envío si el campo id_vendedor está vacío
    }
    // Definir los mensajes según la acción
    let confirmTitle = 'Confirmar envío de datos';
    let confirmMessage = '¿Desea continuar con esta acción? Se enviarán los datos de oferta.';
    let confirmButtonText = 'Confirmar';

    // Verificar si la acción es "editar" para personalizar la ventana de confirmación
    if (this.urlPath === 'editar') {
      confirmTitle = 'Confirmar editado de oferta';
      confirmMessage = '¿Desea continuar con el editado? Se enviarán los datos de oferta editados.';
      confirmButtonText = 'Confirmar oferta editada';
    }
    if (this.duplicarOferta) {
      // Mensajes personalizados para la acción de duplicar
      confirmTitle = 'Confirmar duplicación de oferta';
      confirmMessage = '¿Desea duplicar esta oferta? Se guardará como una nueva oferta.';
      confirmButtonText = 'Confirmar duplicación';
    }

    // Mostrar ventana de confirmación con los mensajes personalizados
    this.confirmModalService
      .showConfirm(
        null,
        confirmTitle,
        confirmMessage,
        'Cancelar',
        confirmButtonText
      )
      .subscribe((response: boolean) => {
        if (response) {
          const formValue = this.form.getRawValue();
          const clienteData = {
            codCotacao: this.duplicarOferta ? undefined : this.codCotacao,
            action: this.action ? this.action : null,
            codigo_cliente: formValue.codigo_cliente,
            nombre: formValue.nombre,
            razonsocial: formValue.razonsocial ? formValue.razonsocial.toUpperCase() : '', // Convierte a mayúsculas si no está vacío
            nodocumento: formValue.nodocumento,
            categoria: formValue.idcategoria,
            id_vendedor: formValue.ejecutivos,
            id_lista_precio: formValue.idlistaPrecios,
            almacenDespacho: formValue.almacenDespacho,
            forma_contacto: formValue.tipoContacto || 2,
            id_forma_pago: formValue.condicionPago,
            id_propietario: formValue.idpropietario || formValue.ejecutivos,
            qr: formValue.pagoQR || 0,
            peso_total: this.peso,
            monto_total: this.valorTotal,
            monto_total_bruto: this.valorTotalBruto,
            totalbs: this.valorTotalBs,
            valorTotalBrutoBs: this.valorTotalBrutoBs,
            impuesto: this.impuesto,
            impuestoTotal: this.impuestoTotal,
            descuento_total: this.descuento_total,
            cantidada_total: this.cantidad_total,
            autorizacion: this.autorizacion,
            id_cliente: formValue.id_cliente,
            observacion: formValue.comentarios,
            id_contacto: formValue.personaContacto || 0,
            logistica: this.logisticaData,
            fecha_inicial: formValue.fechaDocumento,
            fecha_final: formValue.validoHasta,
            carrinho: {
              materiales: this.materiales.map((material) => ({
                ...material,
                Autorizacion: material.resultadoComparacion
              }))
            }
          };

          this.formularioService.postOferta(clienteData).subscribe(
            (response) => {
              this.router.navigate([`/comercial/ciclo-vendas/23/ofertas/lista`]);
            },
            (error) => {
            }
          );
        }
      });

  }

  formatCurrency(value: number, currency: string = 'USD'): string {
    // Verifica si el valor es un número válido, si no lo es, devuelve "0.00"
    const formattedNumber = value === null || value === undefined ? '0.00' :
      new Intl.NumberFormat(currency === 'BOB' ? 'es-BO' : 'en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);

    return formattedNumber;
  }


  formatWeight(weight: number): string {
    // Verifica si el peso es un número válido, si no lo es, devuelve "0.00"
    const formattedWeight = weight === null || weight === undefined ? '0.00' :
      new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(weight);
    return `${formattedWeight} Kg.`;
  }



  onCarrinho(carrinho: any): void {

    if (carrinho) {
        // Cargar materiales y datos del carrito
        this.materiales = carrinho.materiais;
        this.peso = carrinho.total.peso.toFixed(2);
        this.valorTotal = carrinho.total.valorTotal.toFixed(2);
        this.valorTotalBruto = carrinho.total.valorTotalBruto.toFixed(2);
        this.valorTotalBs = carrinho.total.valorTotalBs.toFixed(2);
        this.valorTotalBrutoBs = carrinho.total.valorTotalBrutoBs.toFixed(2);
        this.impuesto = carrinho.total.impuesto.toFixed(2);
        this.impuestoTotal = carrinho.total.impuestoTotal.toFixed(2);
        this.descuento_total = carrinho.total.descuento_total;
        this.cantidad_total = carrinho.total.cantidad_total;

        // Evaluar cada material
        let requiereAutorizacion = false;

        this.autorizacionStatus = this.materiales.map((material: any) => {
            const descuentoPermitidoValor = parseFloat(material.descuento_permitido_valor);
            const cantidad = parseFloat(material.cantidad) || 0;
            const stockDisponible = parseFloat(material.stock) || 0;
            const comprometido = parseFloat(material.comprometido) || 0;
            const cantidadMaxima = stockDisponible - comprometido;

            // Comprobar si el descuento excede el permitido o la cantidad excede el stock
            if (material.descuento > descuentoPermitidoValor || cantidad > cantidadMaxima) {
                material.descuento_permitido = 'Invalido';
                material.resultadoComparacion = 1;  // Marcado como 'Invalido'
                requiereAutorizacion = true;
            } else {
                material.descuento_permitido = 'Valido';
                material.resultadoComparacion = 2;  // Marcado como 'Valido'
            }
            return material;
        });

        // Actualizar el estado de la oferta: si alguno requiere autorización → Pendiente
        this.form.controls['estadoOferta'].setValue(requiereAutorizacion ? 'Pendiente' : 'Borrador');

        // Autorización: '1' si algún material requiere autorización, '2' si todos son válidos
        this.autorizacion = requiereAutorizacion ? '1' : '2';


    } else {
    }
}




  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.materiaisSubscription) {
      this.materiaisSubscription.unsubscribe();
    }
    if (this.activatedRouteSubscription) {
      this.activatedRouteSubscription.unsubscribe();
    }
  }

  classStatusBorder(material: ICarrinhoModel): string {
    let borderClass: string;
    borderClass = 'border-success';
    return borderClass;
  }



}



