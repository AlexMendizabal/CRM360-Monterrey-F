import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { writeFile } from 'xlsx';
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
  totalItems = 0;
  clientes: any = [];
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
    this.getEstados();
    this.formFilter = this.formBuilder.group({
      fechaInicial: [''],
      fechaFinal: [''],
      nombreVendedor: [''],
      listaSucursales: [''],
      titulo: [''],
      estado: ['']
    });
    this.reporteAgenda();


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

  getEstados(): void {
    const params = {
      codSituacao: null
    };

    // Llamada al servicio para obtener la lista de estados
    this.agendaService.getCompromissos(params).subscribe(
      (response: any) => {
        console.log(response); // Verificar el tipo de datos de la respuesta
        this.estados = response.result;
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
      id_Vendedor: nombreVendedor,
      sucursal: listaSucursales,
      titulo: titulo,
      Estado: estado,
      fechaInicial: fechaInicial,
      fechaFinal: fechaFinal,
    };
    console.log('dATA')
    console.log(data)
    // Llamada al servicio reporteAgenda
    // this.agendaService.reporteAgenda(params).subscribe(
    //   (response: any) => {
    //     // Manejar la respuesta de texto en lugar de JSON
    //     this.resuldata.push(response);
    //     console.log('respuesta');
    //     console.log(this.resuldata);
    //     // Realizar las acciones necesarias con la respuesta de texto
    //   },
    //   (error: any) => {
    //     console.error(error);
    //   }
    // );
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
      nombreVendedor: [formValue['nombreVendedor'], Validators.required],  // Agrega esta línea para definir el control "nombreVendedor"
      listaSucursales: [formValue['listaSucursales'], Validators.required], // Agrega el control listaSucursales aquí
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

  exportToExcel(): void {
    const dataToExport = this.compromissos.map((compromisso) => ({
      'Nombre de Vendedor': compromisso.nombreVendedor,
      Compromisso: compromisso.compromisso,
      Cita: compromisso.cita,
      Estado: compromisso.estado,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Compromissos');
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    this.saveAsExcelFile(excelBuffer, 'compromissos');
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });
    saveAs(data, fileName + '_export_' + new Date().getTime() + '.xlsx');
  }


//   excelExport(): void {
//   const data = this.prepareDataForExport();
//   const worksheet = XLSX.utils.json_to_sheet(data);
//   console.log('data123')
//   console.log(this.clienteSelecionado);
//   console.log(this.clientesService)
//   console.log(this.dadosCadastrais)
//   console.log(this.checkRouterParams())
//   console.log(this.itemsPerPage)
//   const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
//   const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
//   const excelBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
//   saveAs(excelBlob, 'reporte.xlsx');
// }

  prepareDataForExport(): any[] {
  // Aquí debes implementar la lógica para obtener los datos que deseas exportar
  // y prepararlos en un formato adecuado para la exportación a Excel.
  // Supongamos que tienes los datos en la variable 'clientes' y cada cliente tiene las propiedades 'nombre' y 'edad'.
  const clientes = [
    { nombre: 'Juan', edad: 30 },
    { nombre: 'María', edad: 25 },
    { nombre: 'Pedro', edad: 35 }
  ];

  // Preparar los datos para exportación
  const data: any[] = [];
  clientes.forEach(cliente => {
    data.push({
      Nombre: cliente.nombre,
      Edad: cliente.edad
    });
  });

  return data;
}


}
