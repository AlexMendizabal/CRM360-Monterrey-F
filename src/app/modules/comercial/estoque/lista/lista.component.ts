import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';

// ngx-bootstrap
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialEstoqueService } from './../estoque.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { Estoque } from '../models/estoque';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { JsonResponse } from 'src/app/models/json-response';

@Component({
  selector: 'comercial-estoque-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class ComercialEstoqueListaComponent implements OnInit {
  @ViewChild('scrollToFilter', {}) scrollToFilter: ElementRef;

  loaderNavbar = false;
  loaderFullScreen = true;

  breadCrumbTree: Array<Breadcrumb> = [
    {
      descricao: 'Home',
      routerLink: '/comercial/home',
    },
    {
      descricao: 'STOCK',
    },
  ];

  subtitles: Array<Subtitles> = [
    {
      text: 'Acciones suspendidas',
      color: 'red',
    },
  ];

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  activatedRouteSubscription: Subscription;

  form: FormGroup;
  idEmpresa: number;
  codMaterial: number;

  modalRef: BsModalRef;

  itemsPerPage = 50;
  currentPage = 1;
  maxSize = 10;

  clientesPagination: Array<any> = [];

  detalhes = false;

  nomeMaterial: string;
  idMaterial = 0;
  totalItems = 10;
  showAdvancedFilter = true;

  materialSelected: string;
  linhaSelected: string;
  classeSelected: string;
  empresaSelected: string;

  empresas: Array<any> = [];
  depositos: Array<any> = [];
  filteredDepositos: Array<any> = [];
  linhas: Array<any> = [];
  classes: Array<any> = [];
  filteredClasses: Array<any> = [];

  dados: Array<Estoque> = [];
  dadosReturned: Array<Estoque> = [];
  dadosLoaded = false;
  dadosEmpty = false;

  estoqueUnidades: Array<any> = [];
  pedidosCompra: Array<any> = [];

  pedidos: Array<any> = [];
  totaisPedCompra: Array<any> = [];
  estoqueComprometido: Array<any> = [];
  totaisComprometido: Array<any> = [];
  detalhesLote: Array<any> = [];
  totaisLote: Array<any> = [];
  detalhesSuspenso: Array<any> = [];

  unidadesLoaded: boolean;
  pedidosCompraLoaded: boolean;
  pedidosCompraEmpty: boolean;
  comprometidoLoaded: boolean;
  comprometidoEmpty: boolean;
  loteLoaded: boolean;
  loteEmpty: boolean;
  suspensoLoaded: boolean;
  suspensoEmpty: boolean;
  possuiLote: boolean;

  modalDetalhes: TemplateRef<any>;

  constructor(
    private modalService: BsModalService,
    private router: Router,
    private location: Location,
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private atividadesService: AtividadesService,
    private estoqueService: ComercialEstoqueService,
    private titleService: TitleService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit() {
    this.registrarAcesso();
    this.getFiltros();
    this.setFormFilter();
    this.titleService.setTitle('Estoque');
  }

  registrarAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
  }

  getFiltros() {
    this.estoqueService
      .getFiltros()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response[0].responseCode == 200) {
            this.empresas = response[0].result;
          }

          if (response[1].responseCode == 200) {
            this.depositos = response[1].result;
            this.filteredDepositos = this.depositos;
          }

          if (response[2].responseCode == 200) {
            for (let i = 0; i < response[2].result.length; i++) {
              if (response[2].result[i].id != 2) {
                this.linhas.push(response[2].result[i]);
              }
            }

            this.linhas.unshift({
              id: 0,
              descricao: 'EXIBIR TODOS',
            });
          }

          if (response[3].responseCode == 200) {
            this.classes = response[3].result;
            this.filteredClasses = this.classes;

            this.filteredClasses.unshift({
              idClasse: 0,
              idLinha: 0,
              nomeClasse: 'EXIBIR TODOS',
            });
          }
        },
        error: (error: any) => {
          this.handleSearchError('Se ha producido un error al cargar los filtros.');
        }
      });
  }

  setFormFilter() {
    const formValue: any = this.checkRouterParams();

    this.form = this.formBuilder.group({
      empresa: [formValue.empresa, Validators.required],
      deposito: [formValue.deposito, Validators.required],
      linha: [formValue.linha],
      classeMaterial: [formValue.classeMaterial],
      estoqueDisponivel: [formValue.estoqueDisponivel],
      codMaterial: [formValue.codMaterial],
      descMaterial: [formValue.descMaterial],
      registros: [formValue.registros],
    });
  }

  checkRouterParams(): Object {
    let formValue = {
      empresa: null,
      deposito: null,
      linha: 0,
      classeMaterial: 0,
      estoqueDisponivel: 0,
      codMaterial: null,
      descMaterial: null,
      registros: 300,
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

  onFilter() {
    this.setRouterParams(this.verificaParams());
    this.currentPage = 1;
    this.itemsPerPage = this.form.value.registros;

    this.scrollToFilter.nativeElement.scrollIntoView({
      behavior: 'instant',
    });
  }

  onResetForm() {
    this.form.reset();
    this.form.controls.registros.setValue(300);
    this.filteredDepositos = this.depositos;
    this.showAdvancedFilter = true;
  }

  setRouterParams(params: any) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { q: btoa(JSON.stringify(params)) },
    });
    this.search(params);
  }

  onAdvancedFilter() {
    this.showAdvancedFilter = !this.showAdvancedFilter;
  }

  search(params: any) {
    this.loaderNavbar = true;
    this.idEmpresa = params.deposito;
    this.dadosLoaded = false;
    this.dadosEmpty = false;
    this.dados = [];
    this.dadosReturned = [];
    this.totalItems = 0;

    this.estoqueService
      .getEstoqueAtual(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.success === true) {
            this.dados = response.data;
            this.dadosReturned = this.dados.slice(0, this.itemsPerPage);
            this.totalItems = this.dados.length;
            this.dadosLoaded = true;
          } else {
            this.dadosEmpty = true;
          }
        },
        error: (error: any) => {
          this.handleSearchError('Error al cargar lista de materiales.');
        }
      });
  }

  verificaParams() {
    let params: any = {};

    if (this.form.value.empresa) {
      params.empresa = parseInt(this.form.value.empresa);
    }

    if (this.form.value.deposito) {
      params.deposito = parseInt(this.form.value.deposito);
    }

    if (this.form.value.linha) {
      params.linha = parseInt(this.form.value.linha);
    }

    if (this.form.value.classeMaterial) {
      params['classe'] = parseInt(this.form.value.classeMaterial);
    }

    if (this.form.value.estoqueDisponivel) {
      params.estoqueDisponivel = this.form.value.estoqueDisponivel;
    }

    if (this.form.value.codMaterial) {
      params.codMaterial = parseInt(this.form.value.codMaterial);
    }

    if (this.form.value.descMaterial) {
      params.descMaterial = btoa(this.form.value.descMaterial);
    }

    if (this.form.value.registros) {
      params.registros = this.form.value.registros;
    }

    return params;
  }

  onPageChanged(event: PageChangedEvent) {
    const startItem = (event.page - 1) * event.itemsPerPage;
    const endItem = event.page * event.itemsPerPage;
    this.dadosReturned = this.dados.slice(startItem, endItem);
  }

  onChangeEmpresa(idEmpresa: number) {
    this.form.controls.deposito.reset();

    this.filteredDepositos = this.depositos.filter(
      (value: any) => value.idEmpresa == idEmpresa
    );
    if(this.filteredDepositos.length == 1){
      this.form.controls.deposito.setValue(this.filteredDepositos[0].idEmpresa);
    }
  }

  onChangeDeposito(deposito: any) {
    this.form.controls.empresa.setValue(deposito.idEmpresa);
  }

  onChangeLinha(idLinha: number) {
    this.form.controls.classeMaterial.setValue(0);

    if (idLinha != 0) {
      this.filteredClasses = this.classes.filter(
        (value: any) => value.idLinha == idLinha
      );

      this.filteredClasses.unshift({
        idClasse: 0,
        idLinha: 0,
        nomeClasse: 'EXIBIR TODOS',
      });
    } else {
      this.filteredClasses = this.classes;
    }
  }

  onChangeClasse(classe: any) {
    this.form.controls.linha.setValue(classe.idLinha);
  }

  openModal(
    modalRef: TemplateRef<any>,
    titulo: string,
    idMaterial: number,
    estoqueSuspenso: any
  ) {
    this.loaderNavbar = true;
    this.possuiLote = false;
    this.nomeMaterial = `(${idMaterial}) ${titulo}`;
    this.codMaterial = idMaterial;

    if (estoqueSuspenso > 0) {
      this.possuiLote = true;
    }

    this.onGetOutrasUnidades(idMaterial);

    setTimeout(() => {
      this.loaderNavbar = false;
      this.modalRef = this.modalService.show(modalRef, {
        class: 'modal-xl',
      });
    }, 600);
  }

  closeModal(modalRef: TemplateRef<any>) {
    this.modalRef.hide();
    this.codMaterial = null;
  }

  onSelectPedidos() {
    this.onGetPedidosCompra(this.idEmpresa, this.codMaterial);
  }

  onSelectComprometidos() {
    this.onGetEstoqueComprometido(this.idEmpresa, this.codMaterial);
  }

  onSelectLote() {
    this.onGetLote(this.idEmpresa, this.codMaterial);
  }

  onSelectEstoqueSuspenso() {
    this.onGetEstoqueSuspenso(this.idEmpresa, this.codMaterial);
  }

  onGetOutrasUnidades(idMaterial: number) {
    this.unidadesLoaded = false;

    this.estoqueService.getOutrasUnidades(idMaterial).subscribe({
      next: (response: any) => {
        if (response.responseCode === 200) {
          this.estoqueUnidades = response.result;
          this.unidadesLoaded = true;
        } else {
          this.pnotifyService.notice('Datos no encontrados.');
        }
      },
      error: (error: any) => {
        this.handleSearchError('Error al cargar stock de otras unidades.');
      }
    });
  }

  onGetPedidosCompra(idEmpresa: number, idMaterial: number) {
    this.pedidosCompraLoaded = false;
    this.pedidosCompraEmpty = false;

    let params: any = {
      idEmpresa: idEmpresa,
      idMaterial: idMaterial,
    };

    this.estoqueService.getPedidosCompra(params).subscribe({
      next: (response: any) => {
        if (response.responseCode === 200) {
          this.pedidosCompra = response.result.analitico;
          this.totaisPedCompra = response.result.total;
          this.pedidosCompraLoaded = true;
        } else {
          this.pnotifyService.notice('Datos no encontrados.');
          this.pedidosCompraEmpty = true;
        }
      },
      error: (error: any) => {
        this.handleSearchError('Error al cargar los pedidos de compra.');
      }
    });
  }

  onGetEstoqueComprometido(idEmpresa: number, idMaterial: number) {
    this.comprometidoLoaded = false;
    this.comprometidoEmpty = false;

    let params: any = {
      idEmpresa: idEmpresa,
      idMaterial: idMaterial,
    };

    this.estoqueService.getComprometido(params).subscribe(
      (response: any) => {
        if (response.responseCode === 200) {
          this.estoqueComprometido = response.result.analitico;
          this.totaisComprometido = response.result.total;
          this.comprometidoLoaded = true;
        } else {
          this.pnotifyService.notice('Datos no encontrados.');
          this.comprometidoEmpty = true;
        }
      },
      (error: any) => {
        this.handleSearchError('Erro ao carregar estoque comprometido.');
      }
    );
  }

  onGetLote(idEmpresa: number, idMaterial: number) {
    this.loteLoaded = false;
    this.loteEmpty = false;
    let params: any = {
      idEmpresa: idEmpresa,
      idMaterial: idMaterial,
    };

    this.estoqueService.getLote(params).subscribe(
      (response: any) => {
        if (response.responseCode === 200) {
          this.detalhesLote = response.result.analitico;
          this.totaisLote = response.result.total;
          this.loteLoaded = true;
        } else {
          this.pnotifyService.notice('Datos no encontrados.');
          this.loteEmpty = true;
        }
      },
      (error: any) => {
        this.handleSearchError('Erro ao carregar dados de lote.');
      }
    );
  }

  onGetEstoqueSuspenso(idEmpresa: number, idMaterial: number) {
    this.suspensoLoaded = false;
    this.suspensoEmpty = false;

    let params: any = {
      idEmpresa: idEmpresa,
      idMaterial: idMaterial,
    };

    this.estoqueService.getEstoqueSuspenso(params).subscribe(
      (response: any) => {
        if (response.responseCode === 200) {
          this.detalhesSuspenso = response.result;
          this.suspensoLoaded = true;
        } else {
          this.pnotifyService.notice('Datos no encontrados.');
          this.suspensoEmpty = true;
        }
      },
      (error: any) => {
        this.handleSearchError('Erro ao carregar dados de estoque suspenso.');
      }
    );
  }

  onFieldError(field: string) {
    if (this.onFieldInvalid(field)) {
      return 'is-invalid';
    }

    return '';
  }

  onFieldInvalid(field: any) {
    field = this.form.get(field);

    return field.status == 'INVALID' && field.touched;
  }

  onFieldRequired(field: string) {
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

  classComparativo(value: number) {
    let textClass = '';

    if (value > 0) {
      textClass = 'text-success';
    } else if (value < 0) {
      textClass = 'text-danger';
    }

    return textClass;
  }

  estoqueSuspensoClassStatusBorder(suspenso: number) {
    let borderClass = '';

    if (suspenso > 0) {
      borderClass = 'border-danger';
    } else {
      borderClass = 'border-light';
    }

    return borderClass;
  }

  estoqueComprometidoClassStatusBorder(suspenso: number) {
    let borderClass = '';

    if (suspenso > 0) {
      borderClass = 'border-primary';
    } else {
      borderClass = 'border-light';
    }

    return borderClass;
  }

  handleSearchError(msg: string = null) {
    this.pnotifyService.error(msg);
    this.location.back();
  }
}
