import { Component, OnInit, ViewChild, ElementRef, NgModule, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Subscription, EMPTY, Observable, of } from 'rxjs';
import { take, switchMap, finalize, catchError } from 'rxjs/operators';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
// ngx-translate
import { DatatableComponent } from '@swimlane/ngx-datatable';
// ngx-bootstrap
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

// Services
import { OfertasService } from '../ofertas.service'
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { DetailPanelService } from 'src/app/shared/templates/detail-panel/detal-panel.service';
import { AuthService } from 'src/app/shared/services/core/auth.service';
// Interfaces
import { JsonResponse } from 'src/app/models/json-response';
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

//import { ICampanhas } from '../models/campanhas';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { ListaService } from './lista.service'
import { BsModalRef, BsModalService, ModalModule } from 'ngx-bootstrap';
import { PdfComponent } from './pdf/pdf.component';
import { ComercialCicloVendasCotacoesService } from 'src/app/modules/comercial/ciclo-vendas/cotacoes/cotacoes.service';
import { VistaComponent } from './vista/vista.component';
import { FormularioService } from 'src/app/modules/comercial/ciclo-vendas/ofertas/formulario/formulario.service';
interface ApiResponse {
  success: boolean;
  message?: string; // Usa '?' si 'message' no es obligatorio
  data?: any; // O el tipo específico que esperas para 'data'
}

@Component({
  selector: 'lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})

export class ListaComponent implements OnInit {
  private user = this.authService.getCurrentUser();
  valorSeleccionado = this.user.info.idVendedor;
  @ViewChild('myTable') table: any;
  rows: any[] = [];
  expanded: any = {};
  timeout: any;

  ColumnMode = ColumnMode;

  loaderFullScreen = false;
  loaderNavbar: boolean;
  breadCrumbTree: Array<Breadcrumb> = [];
  modalRef: BsModalRef;
  modalRef2: BsModalRef;
  subtitles: Array<Subtitles> = [
    {
      id: 1,
      text: 'Ativo',
      color: 'green',
    },
    {
      id: 2,
      text: 'Inativo',
      color: 'red',
    },
  ];

  leyendas: any[] = [
    {
      id: 1,
      text: 'Enviado a SAP',
      hex: '#32a852',
    },
    {
      id: 2,
      text: 'Sin envío a SAP',
      hex: '#c40f06',
    },
    {
      id: 3,
      text: 'Pendiente de aprobación',
      hex: '#e8c515',
    },
  ];

  data = [];
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
  orderBy = 'id';
  orderType = 'ASC';

  maxSize = 10;
  itemsPerPage = 300;
  currentPage = 1;
  totalItems = 0;
  ejecutivos: any[] = [];
  ejecutivo: [''];
  dados: Array<any> = [];
  dadosLoaded = false;
  dadosEmpty = false;
  bsConfig: Partial<BsDatepickerConfig>;
  selectedItem: any;
  ofertasPasadas7Dias: any[];
  disableFiltrar = false;

  //campanhasSelecionada: ICampanhas;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private campanhasSOfertasServiceervice: OfertasService,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private titleService: TitleService,
    private confirmModalService: ConfirmModalService,
    private cotacoesService: ComercialCicloVendasCotacoesService,
    private ListaService: ListaService,
    private modalService: BsModalService,
    private formularioService: FormularioService,
    private authService: AuthService,
  ) {
    this.pnotifyService.getPNotify();
  }
  ngOnInit(): void {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.setFormFilter();
    this.titleService.setTitle('OFERTAS POS');
    this.getEjecutivos();
    this.onFiltrar();

    // Llama a listapost aquí para cargar datos iniciales si es necesario
    this.user = this.authService.getCurrentUser();

    if (this.user && this.user.info && this.user.info) {
      this.valorSeleccionado = this.user.info;
      console.log('user seleccionado:', this.valorSeleccionado);
      this.listapost();
    } else {
      console.warn('No se encontraron datos del usuario.');
    }
  }
  openModalWithClass2(template: TemplateRef<void>) {
    this.modalRef = this.modalService.show(template, Object.assign({}, { class: 'gray modal-lg' }));
  }
  editar(pedido) {
    console.log('pedido nro', pedido);
    const idSubModulo = this.activatedRoute.snapshot.params.idSubModulo;
    console.log('Navegando con ID de oferta:', pedido);
    this.router.navigate([`/comercial/ciclo-vendas/${idSubModulo}/ofertas/editar/${pedido}`,]);
  }
  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }
  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/comercial/home'
        },
        {
          descricao: 'Cadastros',
          routerLink: `/comercial/ciclo-vendas/${params.idSubModulo}`
        },
        {
          descricao: 'OFERTAS POS'
        }
      ];
    });
  }
  setFormFilter(): void {
    this.form = this.formBuilder.group({
      codigo_oferta: [''],
      fecha_inicial: [''],
      fecha_final: [''],
      nombre_cliente: [''],
      nombre_vendedor: [''],
      modo_entrega: [''],
      estado_oferta: [''],
      tipo_estado: [''],
      ofertas_vencidas: ['']
    });
  }
  getEjecutivos(): void {
    this.formularioService.getEjecutivos().subscribe(response => {
      if (response && response['data']) {
        this.ejecutivos = response['data'];

        // Encontrar el ejecutivo basado en el idVendedor del usuario
        const ejecutivoSeleccionado = this.ejecutivos.find(ejecutivo => ejecutivo.ID === this.valorSeleccionado.idVendedor);

        // Si encontramos un ejecutivo, seleccionarlo en el formulario
        if (ejecutivoSeleccionado) {
          this.form.patchValue({
            nombre_vendedor: ejecutivoSeleccionado.NOMBRE // Selecciona el nombre en la lista
          });
        } else {
          console.warn('El vendedor no está en la lista de ejecutivos.');
        }
      }
    });
  }


  checkOrder(): void {
    if (this.form.value.orderBy !== this.orderBy) {
      this.orderBy = this.form.value.orderBy;
    }

    if (this.form.value.orderType !== this.orderType) {
      this.orderType = this.form.value.orderType;
    }
  }

  listapost(): void {
    const params = this.form.value; // Obtén los valores del formulario
  
    this.ListaService.postListaOferta(params).subscribe(
      (response: ApiResponse) => { // Aplica la interfaz ApiResponse
        console.log('Datos recibidos:', response);
  
        // Verificar si la respuesta indica que no se encontraron resultados
        if (!response.success) {
          this.pnotifyService.notice(response.message); // Muestra el mensaje de error del servidor
          return; // Termina la ejecución si no hay resultados
        }
  
        const dataCompleta = response.data; // Todas las ofertas
        const ofertasVencidas = this.ListaService.filtrarOfertasPasados7DiasHabiles(dataCompleta);
  
        // Obtener ID_VENDEDOR del usuario logueado
        const idVendedorLogueado = this.valorSeleccionado.idVendedor; // ID del vendedor logueado
  
        // Obtener el nombre del vendedor seleccionado en el filtro
        const nombreVendedorSeleccionado = this.form.value.nombre_vendedor;
  
        // Verificar el estado de la oferta seleccionado
        const estadoSeleccionado = this.form.value.estado_oferta;
        const fechaInicial = this.form.value.fecha_inicial;
        const fechaFinal = this.form.value.fecha_final;
        const codigoOferta = this.form.value.codigo_oferta;
  
        // Filtrar ofertas según el vendedor seleccionado
        const ofertasFiltradas = ofertasVencidas.filter(oferta => {
          const vendedorOferta = this.ejecutivos.find(ejecutivo => ejecutivo.ID === oferta.ID_VENDEDOR)?.NOMBRE;
          // Mostrar todas las ofertas si se selecciona "TODOS" (nombreVendedorSeleccionado es una cadena vacía)
          return !nombreVendedorSeleccionado || (vendedorOferta === nombreVendedorSeleccionado);
        });
  
        // Inicializar data
        if (idVendedorLogueado) {
          // Mostrar todas las ofertas filtradas por vendedor si se seleccionó "TODOS"
          this.data = dataCompleta.filter(oferta => {
            const vendedorOferta = this.ejecutivos.find(ejecutivo => ejecutivo.ID === oferta.ID_VENDEDOR)?.NOMBRE;
  
            // Verifica el estado de la oferta
            const estadoCoincide = !estadoSeleccionado ||
              (estadoSeleccionado === '1' && oferta.tipo_estado === 'ABIERTO') ||
              (estadoSeleccionado === '2' && oferta.tipo_estado === 'CERRADO');
              
  
              const codigoCoincide = !codigoOferta || oferta.CODIGO_SAP === codigoOferta;
              const fechaCoincide = (!fechaInicial || new Date(oferta.fecha_inicial) >= new Date(fechaInicial)) &&
                (!fechaFinal || new Date(oferta.fecha_final) <= new Date(fechaFinal));
  
            return (vendedorOferta === nombreVendedorSeleccionado || !nombreVendedorSeleccionado) &&
              estadoCoincide &&
              codigoCoincide &&
              fechaCoincide;
          });
        } else {
          // Si el idVendedor es null, mostrar todas las ofertas
          this.data = dataCompleta; // Mostrar todas las ofertas si el ID_VENDEDOR es null
        }
  
        // Si se seleccionan ofertas vencidas, asegúrate de que se muestren solo esas
        if (this.form.value.ofertas_vencidas === 'vencidas') {
          this.data = this.data.filter(oferta => ofertasVencidas.some(vencida => vencida.ID === oferta.ID && vencida.tipo_estado === 'ABIERTO'));
        }
  
        // Mostrar alerta si hay ofertas vencidas y la opción 'TODOS' está seleccionada
        if (this.form.value.ofertas_vencidas !== 'vencidas' && ofertasFiltradas.length > 0) {
          this.mostrarOfertasPasadas(ofertasFiltradas);
        }
  
        // Verificar si no hay resultados después de aplicar los filtros
        if (this.data.length === 0) {
          this.pnotifyService.error('No hay resultados');
        }
      },
      (error) => {
        console.error('Error al obtener la lista:', error);
        this.pnotifyService.error('Ocurrió un error al obtener la lista.'); // Muestra un mensaje de error general
      }
    );
  }
  
  



  mostrarOfertasPasadas(ofertas_vencidas: any[]): void {
    const ofertasVencidasAbiertas = ofertas_vencidas.filter(oferta => oferta.tipo_estado === 'ABIERTO');
  
    // Solo desactiva el botón si hay ofertas vencidas abiertas y el vendedor tiene un idVendedor
    this.disableFiltrar = this.valorSeleccionado.idVendedor && ofertasVencidasAbiertas.length > 0;
  
    // Mostrar notificación solo si hay ofertas vencidas abiertas
    if (ofertasVencidasAbiertas.length > 0) {
      const mensaje = `Se encontraron ${ofertasVencidasAbiertas.length} ofertas abiertas que han pasado los 7 días hábiles`;
      this.pnotifyService.notice(mensaje);
    }
  }
  
  
  

  onFiltrar(): void {
    this.listapost(); // Llama a listapost cuando se presiona el botón de filtrar
  }
  onPage(event) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      console.log('paged!', event);
    }, 100);
  }

  toggleExpandRow(row) {
    console.log('Toggled Expand Row!', row);
    this.table.rowDetail.toggleExpandRow(row);
  }

  onDetailToggle(event) {
    console.log('Detail Toggled', event);
  }

  checkRouterParams(): Object {
    let formValue = {
      codigo: null,
      nome: null,
      codSituacao: '',
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
          /* this.setSubmittedSearch();
          this.search(params); */

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
  @ViewChild('template') template!: TemplateRef<any>;

  onImprimir(id: number): void {
    console.log('CODIGO_SAP recibido:', id);
    this.loaderNavbar = true;

    this.ListaService.getImprimirCotacao(id)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        }),
        catchError((error) => {
          console.error('Error en getImprimirCotacao:', error);
          this.pnotifyService.error('Ocurrió un error al intentar imprimir');
          return of(null);
        })
      )
      .subscribe(
        (response: any) => {
          if (response && response.hasOwnProperty('success') && response.success === true) {
            this.selectedItem = response.data;
            // Enviar los datos al componente hijo
            this.modalRef = this.modalService.show(PdfComponent, {
              initialState: { selectedItem: this.selectedItem }
            });
          } else {
            this.pnotifyService.error('Error al obtener la cotización');
          }
        }
      );
  }
  @ViewChild('scrollToDetails', {}) scrollToDetails: ElementRef;
  onVista(id_oferta: number): void {
    //this.router.navigate([]).then(result => {  window.open("/comercial/ciclo-vendas/23/cotacoes-pedidos/lista/vista", '_blank'); });
    var params = {
      id_oferta: id_oferta,
    };
    /*     console.log('parametros', params);
     */ this.loaderNavbar = true;
    this.cotacoesService
      .getDetalleOferta(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (response: JsonResponse) => {
          if (response.estado === true) {
            this.modalRef2 = this.modalService.show(VistaComponent, {
              initialState: { resultFromParent: response.result },
            });

            this.modalRef2.content.onClose.subscribe((result) => {
              /*               console.log('Modal closed with result:', result);
               */
            });
          } else {
            this.pnotifyService.error();
          }
        },
        (error: any) => {
          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
        }
      );
    /*     console.log(params);
     */
  }

  onEnviarSap(id_oferta: number): void {
    console.log('Enviando SAP para oferta ID:', id_oferta);
    this.loaderNavbar = true;
    this.ListaService
      .getenviarsap(id_oferta)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (response: JsonResponse) => {
          // console.log('Respuesta del servidor:', response);

          if (response.data_sap.CodigoRespuesta === 200) {
            this.pnotifyService.success('Se envió SAP');
            return;
          } else {
            console.error('Error al enviar SAP. Detalles:', response.data_sap);
            this.pnotifyService.error(response.data_sap.Mensaje);
          }
        },
        (error: any) => {
          // console.error('Error en la solicitud:', error);

          if (error.error.hasOwnProperty('Mensaje')) {
            console.error('Mensaje de error:', error.error.Mensaje);
            this.pnotifyService.error(error.error.Mensaje);
          } else {
            this.pnotifyService.error();
          }
        }
      );
  }

  manejoEvento(fn: () => Promise<void>): () => Promise<void> {
    let executing = false;
    return async () => {
      if (!executing) {
        executing = true;
        await fn();
        setTimeout(() => {
          executing = false;
        }, 10000);
      }
    }
  }


  isButtonDisabled(oferta: any): boolean {
    const disabledStates = ['NO EXISTE EN SAP', 'CERRADO CON FACTURA', 'CERRADO SIN FACTURA'];
    return oferta.CODIGO_SAP !== null || disabledStates.includes(oferta.estado_oferta);
  }

  /* getButtonClass(oferta: any): string {
    if (oferta.CODIGO_SAP !== null || oferta.estado_oferta === 'CERRADO CON FACTURA' || oferta.estado_oferta === 'CERRADO SIN FACTURA') {
      return 'btn btn-success'; // Botón verde deshabilitado
    }

    if (oferta.estado_oferta === 'BORRADOR' && oferta.tipo_estado === 'ABIERTO') {
      return 'btn btn-danger'; // Botón rojo
    }

    if (oferta.estado_oferta === 'PENDIENTE' && oferta.tipo_estado === 'ABIERTO') {
      return 'btn btn-warning'; // Botón amarillo
    }

    return 'btn'; // Clase por defecto
  } */

  getButtonClass(oferta: any): string {
    if (oferta.CODIGO_SAP !== null || oferta.estado_oferta !== 'BORRADOR' ) {
      return 'text-success'; // Botón verde deshabilitado
    }

    if (oferta.estado_oferta === 'BORRADOR' && oferta.tipo_estado === 'ABIERTO') {
      return 'text-danger'; // Botón rojo
    }

    if (oferta.estado_oferta === 'PENDIENTE' && oferta.tipo_estado === 'ABIERTO') {
      return 'text-warning'; // Botón amarillo
    }

    return 'text'; // Clase por defecto
  }




  manejoEstadoOferta(codigo_oferta: string): void {
    const estadoOferta = this.manejoEvento(() => this.onEstadoOferta(codigo_oferta));
    estadoOferta();
  }

  async onEstadoOferta(codigo_oferta: string): Promise<void> {
    console.log(`Handling codigo_oferta: ${codigo_oferta}`);
    this.loaderNavbar = true;
    this.ListaService
      .postverifica_oferta(codigo_oferta)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (response: JsonResponse) => {
          console.log('Resputs', response);
          if (response.CodigoRespuesta === 200) {
            this.pnotifyService.success(response.message);
            /*    verificadorElement.classList.replace('far fa-sync-alt fa-spin', 'fas fa-sync-alt'); */
            this.loaderNavbar = false;
            return;
          } else {
            this.pnotifyService.error(response.message);
          }
        },
        (error: any) => {
          if (error.error.hasOwnProperty('Mensaje')) {
            console.error('Mensaje de error:', error.error.Mensaje);
            this.pnotifyService.error(error.error.Mensaje);
          } else {
            this.pnotifyService.error();
          }
        }
      );
  }

  async verificarTodasLasOfertas(): Promise<void> {
    const ofertasVerificables = this.data.filter(oferta => 
      oferta.tipo_estado !== 'CERRADO' && 
      oferta.estado_oferta !== 'PENDIENTE' && 
      oferta.CODIGO_SAP !== null
    );
  
    // Ejecuta todas las verificaciones en paralelo
    await Promise.all(ofertasVerificables.map(oferta => this.onEstadoOferta(oferta.CODIGO_SAP)));
  }
  
  

}
