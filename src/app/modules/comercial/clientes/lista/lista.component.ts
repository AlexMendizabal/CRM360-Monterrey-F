import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';



// ngx-bootstrap
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

// Services
import { ComercialClientesService } from 'src/app/modules/comercial/services/clientes.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { ComercialClientesCadastroDadosFaturamentoFormularioService } from '../cadastro/dados-faturamento/formulario/formulario.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { DetailPanelService } from 'src/app/shared/templates/detail-panel/detal-panel.service';
import { ComercialVendedoresService } from 'src/app/modules/comercial/services/vendedores.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ComercialClientesPreCadastroService } from '../pre-cadastro/pre-cadastro.service';
import { EditarClienteService } from '../editar/editar.service';





// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { JsonResponse } from 'src/app/models/json-response';

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
      descricao: 'Busqueda de clientes',
    },
  ];

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  activatedRouteSubscription: Subscription;

  showDetailPanelSubscription: Subscription;
  showDetailPanel = false;

  setorAtividades: any = [
    {
      id: 'T',
      descricao: 'TODOS',
    },
  ];

  dataLoaded = false;
  dadosCadastraisLoaded = false;
  dadosCadastraisEmpty = false;
  contatosLoaded = false;
  contatosEmpty = false;
  direccionEmpty = false;
  searchSubmitted = false;
  showAdvancedFilter = true;

  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  matricula = this.currentUser['info']['matricula'];

  ativos = 0;
  inativos = 0;
  potencial = 0;
  arquivados = 0;

  countoAtivos: number;
  countoInativos: number;
  countoPotencial: number;
  countoArquivados: number;

  formFilter: FormGroup;
  buscandoPor: number;
  pesquisa: string;
  orderBy = 'codCliente';
  orderType = 'desc';

  maxSize = 10;
  itemsPerPage = 50;
  currentPage = 1;
  totalItems = 0;
  modalRef: BsModalRef;
  clientes: any = [];
  clientesPagination: any = [];

  clienteSelecionado: number;
  dadosCadastrais: any = {};
  contato: any = [];
  contatos: any = [];
  tipos_clientes: any = [];

  cliente: any = [];

  direcciones: any = [];
  editingMode: boolean = false;
  editedFields: any = {};
  vendedoresList: any[] = [];
  editingContacto: boolean = false;
  originalVendedorId: number;
  ciudades: any = [];
  cnaes: any = [];
  codigoClienteSap: any = [];

  latitudPromedio: number;
  longitudPromedio: number;
  informacionMarcador: { nombre: string, direccion: string } | null = null;


  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private clientesService: ComercialClientesService,
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private dadosFaturamentoService: ComercialClientesCadastroDadosFaturamentoFormularioService,
    private titleService: TitleService,
    private detailPanelService: DetailPanelService,
    private vendedoresService: ComercialVendedoresService,
    private modalService: BsModalService,
    private preCadastroService: ComercialClientesPreCadastroService,
    private editarClienteService: EditarClienteService
  ) {
    this.pnotifyService.getPNotify();

  }

  ngOnInit(): void {
    this.registrarAcesso();
    this.getFormFilters();
    this.setFormFilter();
    this.titleService.setTitle('Busqueda de clientes');
    this.onDetailPanelEmitter();
    this.getCenaes();
    this.obtenerTiposClientes();
    this.getCiudades();

    this.vendedoresService.getVendedores().subscribe(
      (response: any) => {
        this.vendedoresList = response.result;
        if (this.vendedoresList.length > 0) {
          this.editedFields.id_vendedor = this.vendedoresList[0].id;
        }
      },
      (error) => {
        console.error('Error al obtener la lista de vendedores:', error);
      }
    );

  }

  ngOnDestroy(): void {
    this.showDetailPanelSubscription.unsubscribe();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  onFecharModal(event) {
    this.modalRef.hide();
  }


  openModalEditar(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      animated: false,
      class: 'modal-lg',
    });

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

  getCenaes(): void {
    this.preCadastroService.getCenaes()
      .pipe(
        finalize(() => {

        })
      )
      .subscribe(
        (response: any) => {
          if (response[0].responseCode === 200) {
            this.cnaes = response[0].result.map(cnae => ({
              id_cnae: cnae.id,
              descripcion: cnae.descricao,
              codigo: cnae.codigo

            })
            );
            console.log("cnaes: ", this.cnaes);
          }
        }
      )
  }

  getCiudades(): void {
    this.preCadastroService.getCiudades()
      .pipe(
        finalize(() => {
        })
      )
      .subscribe(
        (response: any) => {
          if (response[0].responseCode === 200) {
            this.ciudades = response[0].result;
          }
        }
      )
  }

  getFormFilters(): void {
    this.dadosFaturamentoService
      .getSetorAtividades()
      .pipe(
        finalize(() => {
          this.setorAtividades.unshift({
            id: 'T',
            descricao: 'TODOS',
          });
        })
      )
      .subscribe((response: any) => {
        if (response['responseCode'] === 200) {
          this.setorAtividades = response['result'];
        }
      });
  }

  setFormFilter(): void {
    const formValue = this.checkRouterParams();

    this.formFilter = this.formBuilder.group({
      pesquisa: [formValue['pesquisa']],
      buscarPor: [formValue['buscarPor'], Validators.required],
      situacao: [formValue['situacao'], Validators.required],
      setorAtividade: [formValue['setorAtividade'], Validators.required],
      tipoPessoa: [formValue['tipoPessoa'], Validators.required],
      grupoEconomico: [formValue['grupoEconomico'], Validators.required],
      segurado: [formValue['segurado'], Validators.required],
      carteira: [formValue['carteira'], Validators.required],
      pagina: [formValue['pagina']],
      registros: [formValue['registros'], Validators.required],
      cnae: [formValue['cnae'], Validators.required],
    });
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
        this.informacionMarcador = null;
        if (response.responseCode === 200) {
          this.cliente = response.result;

          this.contatosLoaded = true;
          this.dadosCadastrais = response.result.datos_cliente;
          if (response.result && response.result.datos_contacto && response.result.datos_contacto.length > 0) {
            this.contatosEmpty = false;
          } else {
            this.contatos = [];
            this.contatosEmpty = true;
          }
          if (response.result && response.result.datos_direccion && response.result.datos_direccion.length > 0) {
            this.direccionEmpty = false;

          } else {
            this.direcciones = [];
            this.direccionEmpty = true;
          }
          this.contatos = response.result.datos_contacto;
          this.direcciones = response.result.datos_direccion;
          this.editedFields.id_vendedor = this.dadosCadastrais.id_vendedor;
          this.calcularPromedioUbicaciones(response.result.datos_direccion);


          //console.log("Datos de dadosCadastrais:", this.dadosCadastrais); // Agrega el console.log aquí
        } else {
          this.dadosCadastraisEmpty = true;
          this.contatosEmpty = true;
          this.cliente = [];

        }
      });

    /* this.clientesService
      .getContatosResumido(cliente.codCliente)
      .subscribe((response: any) => {
        this.contatosLoaded = true;
  
        if (response['responseCode'] === 200) {
          if (Object.keys(response['data']).length > 0) {
            this.contatos = response['data'];
          } else {
            this.contatosEmpty = true;
          }
        } else {
          this.contatosEmpty = true;
        }
      }); */
  }

  calcularPromedioUbicaciones(direcciones) {
    let sumLatitud = 0;
    let sumLongitud = 0;
    for (const ubicacion of direcciones) {
      sumLatitud += ubicacion.latitud;
      sumLongitud += ubicacion.longitud;
    }
    this.latitudPromedio = sumLatitud / this.direcciones.length;
    this.longitudPromedio = sumLongitud / this.direcciones.length;
  }

  obtenerTiposClientes() {
    this.clientesService.getTipoClientes()
      .subscribe(
        (response: any) => {
          if (response.responseCode === 200) {
            this.tipos_clientes = response.result;

          } else {

          }
        },
        (error) => {
        }
      )
  }

  verInformacion(index: number) {
    const ubicacion = this.direcciones[index];
    this.informacionMarcador = {
      nombre: ubicacion.nombre || 'NO INFORMADO',
      direccion: ubicacion.direccion || 'NO INFORMADO'
    };
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
  searchInputValue: string;

  checkRouterParams(): Object {
    var aux_cartera;
    if (this.matricula == 1) {
      aux_cartera = 'T'
    } else {
      aux_cartera = 'S'
    }
    let formValue = {
      pesquisa: this.searchInputValue, // aquí se actualizaría el valor de pesquisa
      buscarPor: 1,
      situacao: 'T',
      setorAtividade: 'T',
      tipoPessoa: 'T',
      grupoEconomico: 'T',
      segurado: 'T',
      carteira: aux_cartera,
      pagina: 1,
      registros: this.itemsPerPage,
    };

    this.activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (queryParams: any) => {
        if (Object.keys(queryParams).length > 0) {
          let params = atob(queryParams['q']);
          params = JSON.parse(params);
          this.setSubmittedSearch();
          this.search(params);

          if (params['registros']) {
            this.itemsPerPage = params['registros'];
          }

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
          this.listStatus();
        }
      }
    );
    this.activatedRouteSubscription.unsubscribe();

    return formValue;
  }

  editarContacto(contato: any) {
    contato.editedIdCont = contato.id_cont;
    contato.editedContacto = contato.contacto;
    contato.editedds_cont_meio = contato.ds_cont_meio;
    contato.editedDireccion = contato.direccion;
    contato.editedDsCont = contato.ds_cont;
    contato.originalDsTipoCont = contato.ds_tipo_cont;
    contato.editing = true;
    this.editingContacto = true;
  }

  cancelEditingContact(contato: any) {
    contato.editing = false; // Salir del modo de edición
    this.editingContacto = false;
  }

  saveEditedContact(contato: any) {
    const codigoCliente = contato.id_cliente;

    const editedData = {
      id_cont: contato.editedIdCont !== undefined ? contato.editedIdCont : contato.id_cont,
      contacto: contato.editedContacto !== undefined ? contato.editedContacto : contato.contacto,
      ds_tipo_cont: contato.originalDsTipoCont,
      direccion: contato.editedDireccion !== undefined ? contato.editedDireccion : contato.direccion,
      ds_cont: contato.editedDsCont !== undefined ? contato.editedDsCont : contato.ds_cont,
    };

    const tipo_medio = contato.originalDsTipoCont === 'TELEFONO' ? 5 : 2;

    if (contato.originalDsTipoCont === 'TELEFONO') {
      editedData['telefono_contacto'] = contato.editedds_cont_meio !== undefined ? contato.editedds_cont_meio : contato.ds_cont_meio;
    } else {
      editedData['celular_contacto'] = contato.editedds_cont_meio !== undefined ? contato.editedds_cont_meio : contato.ds_cont_meio;
    }

    editedData['tipo_medio'] = tipo_medio;
    editedData['id_cont_meio'] = contato.id_cont_meio;
    editedData['id_cont'] = contato.id_cont;

    this.clientesService.sapUpdateContacto(codigoCliente, editedData).subscribe(
      (response) => {
        console.log('Cambios en el contacto guardados exitosamente:', response);
        contato.editing = false; // Salir del modo de edición
        this.editingContacto = false;
        // Actualizar los valores del contacto en el objeto local
        contato.contacto = editedData.contacto;
        contato.ds_tipo_cont = editedData.ds_tipo_cont;
        contato.ds_cont_meio = editedData['telefono_contacto'] || editedData['celular_contacto'];
        contato.direccion = editedData.direccion;
        contato.ds_cont = editedData.ds_cont;

        this.clientesService.getDetalhes(codigoCliente);
      },
      (error) => {
        console.error('Error al guardar cambios en el contacto:', error);
      }
    );
  }

  mapTipoPessoaToTipoPersona(tipoPessoa: string): string {
    const map = {
      'S': 'Sociedades',
      'P': 'Privado',
      'G': 'Gobierno',
      'E': 'Empleado'
      // Agrega más mapeos si es necesario...
    };

    return map[tipoPessoa] || '';
  }
  tipoPersonaOptions = [
    { label: 'Sociedades', value: 'S' },
    { label: 'Privado', value: 'P' },
    { label: 'Gobierno', value: 'G' },
    { label: 'Empleado', value: 'E' }
  ];

  getTipoPersonaLabel(value: string): string {
    const option = this.tipoPersonaOptions.find(opt => opt.value === value);
    return option ? option.label : 'NO INFORMADO';
  }
  getVendedorNome(id_vendedor: number): string {
    if (isNaN(id_vendedor)) {
      return 'NO INFORMADO';
    }

    const vendedor = this.vendedoresList.find(v => v.id_vendedor === id_vendedor);
    return vendedor ? vendedor.nome : 'NO INFORMADO';
  }

  enableEditing() {
    this.editarClienteService.showModal();


    /* this.editingMode = true;

    // Guardar los valores actuales de los campos editables
    this.editedFields.carnet = this.dadosCadastrais.carnet;
    this.editedFields.nit = this.dadosCadastrais.nit;
    this.editedFields.nombres = this.dadosCadastrais.nombre;
    this.editedFields.razonSocial = this.dadosCadastrais.razon_social;
    this.editedFields.ciudad = this.dadosCadastrais.ciudad;
    this.editedFields.NombreVendedor = this.dadosCadastrais.NombreVendedor;
    this.editedFields.sucursal = this.dadosCadastrais.sucursal;
    this.editedFields.direccion = this.dadosCadastrais.direccion;
    this.editedFields.id_cliente = this.dadosCadastrais.id_cliente;
    this.editedFields.tipo_persona = this.dadosCadastrais.id_tipo_persona;
    this.editedFields.codigo_cliente = this.clientes.codigo_cliente;
    this.editedFields.tipo_pessoa = this.dadosCadastrais.tipo_pessoa;
    this.editedFields.telefono = this.dadosCadastrais.telefono;
    this.editedFields.celular = this.dadosCadastrais.celular;
    this.editedFields.id_rubro = this.dadosCadastrais.id_rubro;

    // this.editedFields.nit = this.dadosCadastrais.nit;
    this.editedFields.id_vendedor = this.dadosCadastrais.id_vendedor;
    this.originalVendedorId = this.dadosCadastrais.id_vendedor; */
    // Repite para otros campos editables...
  }
  cancelEditing() {
    // Reinicia los campos editados a sus valores originales
    this.editedFields = {};
    this.originalVendedorId = null;

    // Desactiva el modo de edición
    this.editingMode = false;
  }
  saveChanges() {
    const codigoCliente = this.dadosCadastrais.id_cliente;
    const codigo_cliente = this.dadosCadastrais.codigo_cliente;
    const editedData = {
      ...this.editedFields,
      codigo_cliente: this.dadosCadastrais.codigo_cliente,
      ubicacion: [
        {
          direccion: this.editedFields.direccion
        }
      ]
    };

    this.editedFields.tipo_persona = this.mapTipoPessoaToTipoPersona(this.editedFields.tipo_pessoa);


    if (this.editedFields.id_vendedor !== this.originalVendedorId) {
      editedData.id_vendedor = this.editedFields.id_vendedor;
    }

    console.log('Datos antes de enviarlos a sapUpdateClient:', editedData);
    // Llamar a la función para guardar los cambios
    this.clientesService.sapUpdateClient(codigoCliente, editedData).subscribe(
      (response) => {
        console.log('Cambios guardados exitosamente:', response);
        // Limpiar los campos editados y desactivar el modo de edición
        this.editedFields = {};
        this.editingMode = false;
        // Llamar a la función para obtener los detalles actualizados
        this.clientesService.getDetalhes(codigoCliente);
      },
      (error) => {
        console.error('Error al guardar cambios:', error);
      }
    );
  }



  listStatus(): void {
    this.clientesService.getStatus().subscribe({
      next: (response: any) => {
        if (response['responseCode'] === 200) {
          this.setStatus(response['result']);
        }
      },
      error: (error: any) => {
        this.pnotifyService.error();
      }
    });
  }


  setStatus(status: any): void {
    for (let i = 0; i < status.length; i++) {
      if (status[i]['situacao'] == 'Ativo') {
        this.ativos = status[i]['quantidade'];
      } else if (status[i]['situacao'] == 'Inativo' || status[i]['situacao'] == null) {
        this.inativos += status[i]['quantidade'];
      } else if (status[i]['situacao'] == 'Potenci') {
        this.potencial = status[i]['quantidade'];
      } else if (status[i]['situacao'] == 'Arquivo') {
        this.arquivados = status[i]['quantidade'];
      }
    }
  }

  setOrderBy(column: string): void {
    if (this.orderBy === column) {
      if (this.orderType == 'desc') {
        this.orderType = 'asc';
      } else if (this.orderType == 'asc') {
        this.orderType = 'desc';
      }
    } else {
      this.orderBy = column;
      this.orderType = 'asc';
    }
    this.onFilter();
  }

  onAdvancedFilter(): void {
    this.showAdvancedFilter = !this.showAdvancedFilter;
  }

  filterByStatus(status: string): void {
    this.formFilter.get('situacao').setValue(status);
    this.onFilter();
  }

  onFilter(): void {
    let params = this.formFilter.value;
    params['orderBy'] = this.orderBy;
    params['orderType'] = this.orderType;

    this.itemsPerPage = this.formFilter.value['registros'];
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
  }

  search(params: any): void {
    if (this.searchSubmitted) {
      this.loaderNavbar = true;
      this.dataLoaded = false;
      this.detailPanelService.hide();
      this.clientes = [];
      this.buscandoPor = params['buscarPor'];
      this.pesquisa = params['pesquisa'];

      this.clientesService
        .getClientes(params)
        .pipe(
          finalize(() => {
            this.loaderNavbar = false;
            this.dataLoaded = true;
          })
        )
        .subscribe(
          (response: any) => {
            if (response['responseCode'] === 200) {
              this.clientes = response['result']['analitico'].slice(
                0,
                this.itemsPerPage
              );
              this.totalItems = this.clientes[0]['total'];
              this.setStatus(response['result']['sintetico']);
            } else if (response['responseCode'] === 204) {
              this.ativos = 0;
              this.inativos = 0;
              this.potencial = 0;
              this.arquivados = 0;
            }
          },
          (error: any) => {
            this.pnotifyService.error();
          }
        );
    }
  }

  classStatusBorder(status: string): string {
    let borderClass: string;

    if (status == 'Ativo') {
      borderClass = 'border-success';
    } else if (status == 'Inativo') {
      borderClass = 'border-danger';
    } else if (status == 'Potenci') {
      borderClass = 'border-primary';
    } else if (status == 'Arquivo') {
      borderClass = 'border-secondary';
    }

    return borderClass;
  }

  viewRegister(cliente: any): void {
    if (cliente['podeAcessar'] == 1 || cliente['podeAcessar'] == 0) {
      this.router.navigate(['../Detalles', cliente.codCliente], {
        relativeTo: this.activatedRoute,

      });
    } else {
      this.pnotifyService.notice('Este cliente no pertenece a su cartera.');
    }
  }

  onPageChanged(event: PageChangedEvent) {
    if (this.formFilter.value['pagina'] != event.page) {
      this.detailPanelService.hide();
      this.resetClienteSelecionado();
      this.formFilter.value['pagina'] = event.page;
      this.onFilter();
    }
  }

  onPreCadastroCpfCnpj() {
    let pesquisa = this.pesquisa.replace(/\D/g, '');

    if (pesquisa.length === 11) {
      return { cpf: pesquisa };
    } else if (pesquisa.length === 14) {
      return { cnpj: pesquisa };
    }

    return {};
  }

  handleCounter(value: any) {
    return value.toFixed(0);
  }

  resetClienteSelecionado() {
    this.clienteSelecionado = null;
  }
}
