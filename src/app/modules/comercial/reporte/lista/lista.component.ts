import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import * as XLSXStyle from 'xlsx-style';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';

// ngx-bootstrap
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

// Services
import { ComercialClientesService } from 'src/app/modules/comercial/services/clientes.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { ComercialClientesCadastroDadosFaturamentoFormularioService } from '../../clientes/cadastro/dados-faturamento/formulario/formulario.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { DetailPanelService } from 'src/app/shared/templates/detail-panel/detal-panel.service';
import { ComercialVendedoresService } from '../../services/vendedores.service';
import { ComercialAgendaService } from 'src/app/modules/comercial/agenda/agenda.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EscritoriosService } from 'src/app/shared/services/requests/escritorios.service';
import { ComercialCadastrosTitulosAgendaService } from 'src/app/modules/comercial/cadastros/titulos-agenda/titulos-agenda.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { JsonResponse } from 'src/app/models/json-response';
import { dataLoader } from '@amcharts/amcharts4/core';
 // calendario
@Component({

  selector: 'comercial-clientes-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class ComercialClientesListaComponent implements OnInit, OnDestroy {
  loaderNavbar = false;

  breadCrumbTree: Array<Breadcrumb> = [
    {
      descricao: 'Home',
      routerLink: '/comercial/home',
    },
    {
      descricao: 'reporte',
    },
  ];

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  activatedRouteSubscription: Subscription;
  showDetailPanelSubscription: Subscription;
  showDetailPanel = false;
  vendedores: any[];
  dataLoaded = false;
  dadosCadastraisLoaded = false;
  dadosCadastraisEmpty = false;
  contatosLoaded = false;
  contatosEmpty = false;
  searchSubmitted = false;
  showAdvancedFilter = true;
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  matricula = this.currentUser['info']['matricula'];
  formFilter: FormGroup;
  buscandoPor: number;
  pesquisa: string;
  orderBy = 'codCliente';
  orderType = 'desc';
  maxSize = 10;
  itemsPerPage = 50;
  currentPage = 1;
  totalItems: number = 0;
  clientes: any[] = [];
  clientesPagination: any = [];
  clienteSelecionado: number;
  dadosCadastrais: any = {};
  contatos: any = [];
  filteredVendedores: any[] = [];
  escritorios: any[] = [];
  codSituacao: any[] = [];
  statusList: any[] = [];
  compromissos: any[];
  titulos: any[] = [];
  estados: any[] = [];
  resuldata: any[] = [];
  params: any;
  result: any[] = []; // Declarar la variable 'result' en la clase
  

  constructor(
    private activatedRoute: ActivatedRoute,
    private vendedoresService: ComercialVendedoresService,
    private router: Router,
    private clientesService: ComercialClientesService,
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private dadosFaturamentoService: ComercialClientesCadastroDadosFaturamentoFormularioService,
    private titleService: TitleService,
    private escritoriosService: EscritoriosService,
    private detailPanelService: DetailPanelService,
    private titulosAgendaService: ComercialCadastrosTitulosAgendaService,
    private agendaService: ComercialAgendaService,
    
    
    
  ) {
    this.pnotifyService.getPNotify();
    
  }

  ngOnInit(): void {
    this.registrarAcesso();
    this.getVendedores();
    this.titleService.setTitle('Busqueda de clientes');
    this.onDetailPanelEmitter();
    this.setFormFilter(); // Agregar esta línea para inicializar el formulario
    this.getEscritorios();
    this.getTitulosAgenda();
    this.formFilter = this.formBuilder.group({
      fechaInicial: [''], // Valor inicial del campo fechaInicial
      fechaFinal: [''], // Valor inicial del campo fechaFinal
      nombreVendedor: [''], // Valor inicial del campo nombreVendedor
      listaSucursales: [''], // Valor inicial del campo listaSucursales
      titulo: [''], // Valor inicial del campo titulo
      estado: [''] // Valor inicial del campo estado
      // Agrega más campos de filtrado avanzado si es necesario
    });
    this.reporteAgenda();
    this.resuldata = [];
    this.estadosAgenda(); 

    

  }

  getVendedores(): void {
    this.vendedoresService.getVendedores().subscribe(
      (response: any) => {
        console.log(response); // Verificar el tipo de datos de la respuesta
        this.vendedores = response.result;
      },
      (error: any) => {
        // Manejar el error en caso de que ocurra
      }
    );
  }

  estadosAgenda(): void {
    this.agendaService.estadosAgenda().subscribe(
      (response: any) => {
        console.log(response); // Verificar el tipo de datos de la respuesta
        this.estados = response.result; // Almacena los estados en la variable estados
      },
      (error: any) => {
        // Manejar el error en caso de que ocurra
      }
    );
  }
  
  
  
  getEscritorios(): void {
    this.escritoriosService.getEscritorios().subscribe(
      (response: any) => {
        console.log(response); // Verificar la respuesta en la consola
        this.escritorios = response.result;
      },
      (error: any) => {
        // Manejar el error en caso de que ocurra
      }
    );
  }

  getTitulosAgenda(): void {
    // Llamada al servicio para obtener la lista de títulos
    this.titulosAgendaService.getListaTitulosAgenda({ codSituacao: null }).subscribe(
      (response: any) => {
        this.titulos = response.data; // Asignar la lista de títulos a la variable "titulos"
      },
      (error: any) => {
        // Manejar el error en caso de que ocurra
      }
    );
  }
  

  filterCompromissos(): void {
    const params = {
      // Agrega aquí los parámetros de filtro según tus necesidades
    };

    this.agendaService.getCompromissos(params).subscribe(
      (response: any) => {
        console.log(response); // Verifica la respuesta en la consola
        this.compromissos = response.result;
      },
      (error: any) => {
        // Maneja el error en caso de que ocurra
      }
    );
  }
  reporteAgenda(): void {
    const nombreVendedor = this.formFilter.value['nombreVendedor'];
    const listaSucursales = this.formFilter.value['listaSucursales'];
    const titulo = this.formFilter.value['titulo'];
    const estado = this.formFilter.value['estado'];
    const fechaInicial = this.formFilter.value['fechaInicial'];
    const fechaFinal = this.formFilter.value['fechaFinal'];
  
    const data = {
      id_vendedor: nombreVendedor,
      sucursal: listaSucursales,
      titulo: titulo, 
      estado: estado,
      fechaInicial: fechaInicial ? fechaInicial : null,
      fechaFinal: fechaFinal ? fechaFinal : null,
    };
  
    // Llamada al servicio reporteAgenda
    this.agendaService.reporteAgenda(data).subscribe(
      (response: any) => {
        this.resuldata = response.result;
        console.log('respuesta');
        console.log(this.resuldata);
        // Realizar las acciones necesarias con la respuesta
      },
      (error: any) => {
        console.error(error);
      }
    );
  }
  
  
  
  
  filtrar() {
    this.resuldata=[];
    // Obtener los valores del formulario
    const filtro = this.formFilter.value;
  
    // Obtener los valores de fecha individualmente
    const fechaInicial = filtro.fechaInicial;
    const fechaFinal = filtro.fechaFinal;
  
    // Crear un nuevo objeto de filtro con los valores de fecha
    const filtroConFecha = { ...filtro, fechaInicial, fechaFinal };
  
    // Realizar la solicitud de filtrado con el nuevo objeto de filtro
    this.agendaService.reporteAgenda(filtroConFecha).subscribe(
      (response: any) => {
        // Procesar la respuesta y asignar los datos al arreglo resuldata
        this.resuldata = response.result;
        this.totalItems = response.total;
  
        // Resto del código necesario para gestionar los datos filtrados
      },
      (error: any) => {
        console.error(error);
        // Manejar el error en caso de que ocurra
      }
    );
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
  setFormFilter(): void {
    const formValue = this.checkRouterParams();

    this.formFilter = this.formBuilder.group({
      pesquisa: [formValue['pesquisa']],
      buscarPor: [formValue['buscarPor'], Validators.required],
      titulo: [formValue['titulo']],
      fechaInicial: [null, Validators.required],
      fechaFinal: [null, Validators.required],
      vendedores: [formValue['vendedores'], Validators.required],
      tipoPessoa: [formValue['tipoPessoa'], Validators.required],

      carteira: [formValue['carteira'], Validators.required],
      pagina: [formValue['pagina']],
      nombreVendedor: [formValue['nombreVendedor'], Validators.required],
      listaSucursales: [formValue['listaSucursales'], Validators.required],
      estado: [formValue['estado'], Validators.required], 
    });
  }


  checkRouterParams(): Object {
    let formValue = {
      pesquisa: null,
      buscarPor: 1,
      promotores: 'T',
      tipoPessoa: 'T',
      carteira: 'T',
      pagina: 1,
    };

    if (this.activatedRouteSubscription) {
      this.activatedRouteSubscription.unsubscribe();
    }

    return formValue;
  }

  classStatusBorder(status: string): string {
    if (status === 'registrado') {
      return 'border-primary';
    } else {
      return 'border-secondary';
    }
  }
  
  onAdvancedFilter(): void {
    this.showAdvancedFilter = !this.showAdvancedFilter;
  }

  filterByStatus(status: string): void {
    this.formFilter.get('vendedores').setValue(status);
    this.onFilter();
  }

  onFilter() {
    //const filters = this.formFilter.value;
    this.dataLoaded = true;
    let params = this.formFilter.value;
    params['orderBy'] = this.orderBy;
    params['orderType'] = this.orderType;

    this.currentPage = 1;
    this.setRouterParams(params);
  }



  setSubmittedSearch(): void {
    this.searchSubmitted = true;
  }
  setRouterParams(params: any): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { q: btoa(JSON.stringify(params)) },
      queryParamsHandling: 'merge',
    });
    this.setSubmittedSearch();
    this.search(params);
    // console.log('a')
    // console.log(JSON.stringify(params))
  }

  search(params: any): void {
    if (this.searchSubmitted) {
      this.loaderNavbar = true;
      //this.dataLoaded = false;
      this.detailPanelService.hide();
      this.clientes = [];
      this.buscandoPor = params['buscarPor'];
      this.pesquisa = params['pesquisa'];
      this.vendedores;
      this.clientesService
        .getClientes(params)
        .pipe(
          finalize(() => {
            this.loaderNavbar = false;
           // this.dataLoaded = true;
          })
        )

    }
  }
  viewDetails(cliente: any): void {
    this.detailPanelService.loadedFinished(false);
    this.clienteSelecionado = cliente.codCliente;
    this.dadosCadastraisLoaded = false;
    this.dadosCadastraisEmpty = false;
    this.contatosLoaded = false;
    this.contatosEmpty = false;

    this.clientesService
      .getDetalhes(cliente.codCliente)
      .pipe(
        finalize(() => {
          this.dadosCadastraisLoaded = true;
        })
      )
      .subscribe((response: JsonResponse) => {
        if (response.success === true) {
          this.dadosCadastrais = response.data;
        } else {
          this.dadosCadastraisEmpty = true;
        }
      });

    this.clientesService
      .getContatosResumido(cliente.codCliente)
      .subscribe((response: any) => {
        this.contatosLoaded = true;

        if (response['responseCode'] === 200) {
          if (Object.keys(response['result']).length > 0) {
            this.contatos = response['result'];
          } else {
            this.contatosEmpty = true;
          }
        } else {
          this.contatosEmpty = true;
        }
      });
  }

  onCloseDetailPanel() {
    this.resetClienteSelecionado();

    setTimeout(() => {
      this.dadosCadastraisLoaded = false;
      this.dadosCadastraisEmpty = false;
      this.dadosCadastrais = {};

      this.contatosEmpty = false;
      this.contatosLoaded = false;
      this.contatos = [];
    }, 500);
  }

  async exportToExcel(): Promise<void> {
    const headers = ['', 'Nombre de Vendedor', 'Sucursal', 'Cliente', 'Titulo', 'Estado', 'Fecha Inicial'];
    const data = this.resuldata.map(cliente => [
      '', // Columna A vacía
      cliente.vendedor,
      cliente.sucursal,
      cliente.cliente,
      cliente.motivo, // Asegúrate de que cliente.titulo sea una cadena de caracteres
      cliente.Estado, // Asegúrate de que cliente.estado sea una cadena de caracteres
      cliente.fecha // Asegúrate de que cliente.fechaInicial sea una cadena de caracteres o un objeto de tipo Date
    ]);
  
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('data');
  
    // Agregar encabezados en la fila 1
    worksheet.addRow(headers);
  
    data.forEach((row, rowIndex) => {
      const formattedDate = formatDate(row[6]); // Formatear la fecha (row[6])
      row[6] = formattedDate; // Reemplazar el valor original con la fecha formateada
      worksheet.addRow(row);
    });
  
    // Agregar estilos a las celdas
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell(cell => {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
      if (rowNumber === 1) {
        row.font = { bold: true };
      }
    });
  
    // Ajustar el ancho de las columnas B a G
    for (let i = 2; i <= headers.length; i++) {
      const column = worksheet.getColumn(i);
      column.width = 20; // Establecer el ancho de la columna en 20 píxeles
    }
  
    function formatDate(date: string): string {
      const currentDate = new Date(date);
      const day = currentDate.getDate();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      return `${day}-${month}-${year}`;
    }
  
    const currentDate = new Date().toISOString().split('T')[0]; // Obtener la fecha actual
    const fileName = `${currentDate}_reporte.xlsx`; // Crear el nombre del archivo con la fecha actual
    const buffer = await workbook.xlsx.writeBuffer();
    const excelBlob: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
    // Guardar el archivo Excel
    saveAs(excelBlob, fileName);
  }
  
  
  
  
  
  

  onPageChanged(event: PageChangedEvent) {
    if (this.formFilter.value['pagina'] != event.page) {
      this.detailPanelService.hide();
      this.resetClienteSelecionado();
      this.formFilter.value['pagina'] = event.page;
      this.onFilter();
    }
  }


  handleCounter(value: any) {
    return value.toFixed(0);
  }

  resetClienteSelecionado() {
    this.clienteSelecionado = null;
  }
}

