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

  clientes: any = [];
  clientesPagination: any = [];

  clienteSelecionado: number;
  dadosCadastrais: any = {};
  contato: any = [];
  contatos: any = [];
  editingMode: boolean = false;
  editedFields: any = {};
  vendedoresList: any[] = [];
  editingContacto: boolean = false;
  originalVendedorId: number;

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
    private modalService: BsModalService
  ) {
    this.pnotifyService.getPNotify();
    
  }

  ngOnInit(): void {
    this.registrarAcesso();
    this.getFormFilters();
    this.setFormFilter();
    this.titleService.setTitle('Busqueda de clientes');
    this.onDetailPanelEmitter();
    this.vendedoresService.getVendedores().subscribe(
      (response: any) => {
        this.vendedoresList = response.result;
        console.log('Lista de vendedores:', this.vendedoresList);
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
      id_group_econ: [formValue['grupoEconomico'], Validators.required], // Se Agrega este campo
    });
  }
  searchInputValue: string;

  checkRouterParams(): Object {
    var aux_cartera;
    if (this.matricula == 1){
      aux_cartera ='T'
    }else{
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
  // openAgregarContactoModal() {
  //   console.log("openAgregarContactoModal() se ha ejecutado.");
  //   // Resto del código para abrir el modal
  //   this.modalRef = this.modalService.show(this.modalDetalhes, {
  //     class: 'modal-x1',
  //   });
  // }
  

  // closeModal() {
  //   // Cierra el modal
  //   this.modalRef.hide();
  // }
  // guardarContacto() {
  //   if (this.agregarContactoForm.valid) {
  //     const nuevoContacto = this.agregarContactoForm.value;
  //     // Realiza aquí la lógica para guardar el nuevo contacto en el backend
  //     // Luego, cierra el modal
  //     this.closeModal();
  //   } else {
  //     // Marcar los campos inválidos en el formulario
  //     this.agregarContactoForm.markAllAsTouched();
  //   }
  // }
  editarContacto(contato: any) {
    contato.editedIdCont = contato.id_cont;
    contato.editedContacto = contato.contacto;
    contato.editedds_cont_meio = contato.ds_cont_meio;
    contato.editedDireccion = contato.direccion;
    contato.editedDsCont = contato.ds_cont;
    contato.originalDsTipoCont = contato.ds_tipo_cont;
    contato.editing = true; // Indicar que este contacto está en modo de edición
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
    this.editingMode = true;

    // Guardar los valores actuales de los campos editables
    this.editedFields.carnet = this.dadosCadastrais.cnpj_cpf;
    this.editedFields.nombres = this.dadosCadastrais.nombres;
    this.editedFields.razonSocial = this.dadosCadastrais.razaoSocial;
    this.editedFields.ciudad = this.dadosCadastrais.ciudad;
    this.editedFields.NombreVendedor = this.dadosCadastrais.NombreVendedor;
    this.editedFields.sucursal = this.dadosCadastrais.sucursal;
    this.editedFields.direccion = this.dadosCadastrais.direccion;
    this.editedFields.id_cliente = this.dadosCadastrais.id_cliente;
    this.editedFields.tipo_persona = this.dadosCadastrais.tipo_persona;
    this.editedFields.tipo_pessoa = this.dadosCadastrais.tipo_pessoa;
    this.editedFields.telefono = this.dadosCadastrais.telefono;
    this.editedFields.celular = this.dadosCadastrais.celular;
    this.editedFields.nit = this.dadosCadastrais.nit;
    this.editedFields.id_vendedor = this.dadosCadastrais.id_vendedor;
    this.originalVendedorId = this.dadosCadastrais.id_vendedor; 
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
    const editedData = {
      ...this.editedFields, 
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
      } else if (status[i]['situacao'] == 'Inativo'|| status[i]['situacao'] == null) {
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
        if (response.data) {
          this.dadosCadastrais = response.data;
          console.log(this.dadosCadastrais);
        } else {
          this.dadosCadastraisEmpty = true;
        }
      });

    this.clientesService
      .getContatosResumido(cliente.codCliente)
      .subscribe((response: any) => {
        console.log('Datos recibidos desde getContatosResumido:', response);  
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
