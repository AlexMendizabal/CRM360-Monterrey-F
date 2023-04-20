//angular
import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';

//models
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { ILogisticaEntregaFormacaoCargaPedido } from '../models/pedido';
import { ILogisticaMotorista } from '../../../cadastros/motoristas/models/motorista';

//rxjs
import { finalize } from 'rxjs/operators';
import { Subscription, forkJoin } from 'rxjs';

//ngx
import {
  BsLocaleService,
  BsDatepickerConfig,
  BsModalService,
  BsModalRef,
  PageChangedEvent,
} from 'ngx-bootstrap';

// services
import { LogisticaEntregaRetirasService } from '../services/retiras.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { LogisticaMotoristaService } from '../../../cadastros/motoristas/services/motorista.service';
import { EstadosService } from 'src/app/shared/services/requests/estados.service';
import { LogisticaVeiculoService } from '../../../cadastros/veiculos/services/veiculo.service';

//models
import { ILogisticaEntregaFormacaoCargaMateriais } from '../models/materiais';
import { ILogisticaEntregaFormacaoCargaRomaneio } from '../models/romaneio';
import { ILogisticaVeiculo } from '../../../cadastros/veiculos/models/veiculo';

//masks
import { MASKS } from 'ng-brazil';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { AdminAtividadesService } from 'src/app/modules/admin/atividades/services/atividades.service';

@Component({
  selector: 'logistica-entrega-retiras-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss'],
})
export class LogisticaEntregaRetirasCadastroComponent
  implements OnInit, OnDestroy {
  appTitle = 'Cadastro';

  public MASKS = MASKS;

  bsConfig: Partial<BsDatepickerConfig>;
  modalRef: BsModalRef;


  loading = true;
  loadingNavBar = false;
  loadingSalvarRomaneio = false;
  breadCrumbTree: Array<Breadcrumb> = [
    {
      descricao: 'Logística',
    },
    {
      descricao: 'GESTIÓN DE ENTREGAS',
      routerLink: '../../',
    },
    {
      descricao: 'Retiras',
      routerLink: '../',
    },
    {
      descricao: this.appTitle,
    },
  ];

  filiais = [];
  
  /* Pagination */
  itemsPerPage: number = 100;
  currentPage: number = 1;
  totalItems: any = 0;
  begin: number = 0;
  end: number = this.itemsPerPage;
  /* Pagination */

  pedidos: Array<ILogisticaEntregaFormacaoCargaPedido> = new Array();
  pedidosSelecionados: Array<ILogisticaEntregaFormacaoCargaPedido> = new Array();
  pedidosSelecionadosLoading = false;

  materiais: Array<ILogisticaEntregaFormacaoCargaMateriais> = new Array();
  materiaisLoading = false;

  form: FormGroup;
  formTransporte: FormGroup;

  $activatedRouteSubscription: Subscription;

  motoristas: Array<ILogisticaMotorista> = new Array();
  loadingMotoristas = true;

  veiculos: Array<ILogisticaVeiculo> = new Array();
  loadingVeiculos = true;

  estados: Array<any>;
  pedido: ILogisticaEntregaFormacaoCargaPedido;

  routeTrucker: string;
  routeTruck: string;

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true
  };

  constructor(
    private service: LogisticaEntregaRetirasService,
    private formBuilder: FormBuilder,
    private localeService: BsLocaleService,
    private routerService: RouterService,
    private atividadesService: AtividadesService,
    private atividaesAdminService: AdminAtividadesService,
    private activatedRoute: ActivatedRoute,
    private dateService: DateService,
    private route: Router,
    private pnotify: PNotifyService,
    private motoristasService: LogisticaMotoristaService,
    private veiculosService: LogisticaVeiculoService,
    private estadosService: EstadosService,
    private modalService: BsModalService
  ) {
    this.formTransporte = this.formBuilder.group({
      ID_LOGI_MOTO: [null, Validators.required],
      ID_LOGI_VEIC: [null, Validators.required],
      ID_LOGI_ROMA: [null],
      CD_FILI: [null, Validators.required],
    });

    this.form = this.formBuilder.group({
      DT_INIC: [new Date()],
      DT_FINA: [new Date()],
      CD_FILI: [null],
      CD_CLIE: [null],
      CD_PEDI: [null],
      DS_ESTA: [null, Validators.maxLength(2)],
      CD_CEP: [null, Validators.maxLength(9)],
      DS_CIDA: [null],
      NM_CLIE: [null],
      NOTA_FISC: [null],
      TIME: [new Date().getTime()],
    });

    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );
  }

  ngOnInit(): void {
    this.atividadesService.registrarAcesso().subscribe();
    this.getRoutesRegister();
    this.onActivatedRoute();
    this.getMotoristas({ IN_PAGI: '0', IN_STAT: '1' });
    this.getVeiculos({ IN_PAGI: '0', IN_STAT: '1' });
    this.getEstados();
    this.getFiliais();
  }

  ngOnDestroy() {
    this.$activatedRouteSubscription.unsubscribe();
  }

  onActivatedRoute() {
    this.$activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (response) => {
        const _response = this.routerService.getBase64UrlParams(response);

        if(!_response){
          return
        }
        
        if(_response.hasOwnProperty('ID_LOGI_ROMA')){
          this.loading = false;
          this.getRomaneio({ID_LOGI_ROMA: _response['ID_LOGI_ROMA']})
          this.getPedidosRomaneio({ID_LOGI_ROMA: _response['ID_LOGI_ROMA'], IN_STAT: 1})
          return
        }

        this.form.patchValue(_response);
        this.getPedidos(this.getParams());


      }
    );
  }

  getFiliais(){
    this.service
      .getFiliais()
      .subscribe(
        response => {
          this.filiais = response;
        }
      )
  }

  getPedidos(params) {
    this.pedidos = [];

    if (!this.loading) this.loadingNavBar = true;

    this.service
      .getPedidos(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.pedidos = response.body['data'];
            this.totalItems = response.body['total'];
            this.begin = 0;
            this.end = this.itemsPerPage;
          } else if (response.status === 204) {
            
          } else {
            this.pnotify.error();
          }
        },
        (error) => {
          const message = error?.error?.message;
          message ? this.pnotify.error(message) : this.pnotify.error();
        }
      );
  }

  getPedidosRomaneio(params) {

    this.pedidosSelecionados = [];
    this.pedidosSelecionadosLoading = true

    this.service
      .getPedidos(params)
      .pipe(
        finalize(() => {
          this.pedidosSelecionadosLoading = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status !== 200) {
            return
          }

          this.pedidosSelecionados = response.body['data'];
        },
        (error) => {
          const message = error?.error?.message;
          message ? this.pnotify.error(message) : this.pnotify.error();
        }
      );
  }  

  getRomaneio(params) {

    this.service
      .getRomaneios(params)
      .pipe(
        finalize(() => {
        })
      )
      .subscribe(
        (response) => {
          
          if (response.status !== 200) {
            this.pnotify.error('Falha ao carregar o romaneio.')
            return
          }
          
          const romaneio = response.body['data'][0];

          this.formTransporte.patchValue(romaneio);

        },
        (error) => {
          const message = error?.error?.message;
          message ? this.pnotify.error(message) : this.pnotify.error();
        }
      );
  }

  postRomaneio() {
    this.loadingSalvarRomaneio = true;

    const romaneio = this.formTransporte.value;

    this.service
      .postRomaneio(romaneio)
      .pipe(
        finalize(() => {
        })
      )
      .subscribe(
        (response) => {
          if (response.status !== 200 || !response.body['data']) {
            this.pnotify.error('Falha ao salvar o romaneio.');
            return
          } 
          this.formTransporte.get('ID_LOGI_ROMA').setValue(response.body['data']);
          this.postPedidos();
        },
        (error) => {
          this.pnotify.error(error.error['message']);
        }
      );
  }

  postPedidos() {
    
    const params = {'ID_LOGI_ROMA': this.formTransporte.get('ID_LOGI_ROMA').value, 'PEDI': this.pedidosSelecionados}

    this.service
      .postPedidos(params)
      .pipe(
        finalize(() => {
          this.loadingSalvarRomaneio = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.pedidosSelecionados = [];
            this.formTransporte.reset();
            this.route.navigate([]);
            this.pnotify.success();
          } else {
            this.pnotify.error();
          }
        },
        (error) => {
          const message = error?.error?.message;
          message ? this.pnotify.error(message) : this.pnotify.error();
        }
      );
  }

  getParams(params?) {
    let _params = {};
    let _obj = params ?? this.form.value;

    for (let prop in _obj) {
      if (_obj[prop]) {
        if (_obj[prop] instanceof Date)
          _params[prop] = this.dateService
            .convertToBrazilianDate(_obj[prop])
            .substring(0, 10);
        else _params[prop] = _obj[prop];
      }
    }

    return _params;
  }

  onSearch() {
    this.form.get('TIME').setValue(new Date().getTime());
    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
    });
  }

  onReset() {
    this.form.reset();
    this.form.updateValueAndValidity();
    this.pedidos = [];
    this.route.navigate([]);
  }

  // Validação de formulário
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
  // Validação de formulário

  /* Paginação */
  onPageChanged(event: PageChangedEvent): void {
    /* this.form.get('PAGINA').setValue(event.page);
    this.onSearch(); */
    this.begin = (event.page - 1) * event.itemsPerPage;
    this.end = event.page * event.itemsPerPage;
  }
  /* Paginação */

  getMotoristas(params?) {
    this.loadingMotoristas = true;
    this.motoristasService
      .getMotoristas(params)
      .pipe(
        finalize(() => {
          this.loadingMotoristas = false;
        })
      )
      .subscribe(
        (response) => {
          
          if (response.status !== 200) {
            this.pnotify.notice("Nenhum motorista localizado");
            return;
          }

          this.motoristas = response.body['data'];
        },
        (error) => {
          this.pnotify.error('Erro ao carregar motoristas.');
        }
      );
  }

  getVeiculos(params?) {
    this.loadingVeiculos = true;
    this.veiculosService
      .getVeiculos(params)
      .pipe(
        finalize(() => {
          this.loadingVeiculos = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.veiculos = response.body['data'];
          }
        },
        (error) => {
          this.pnotify.error('Erro ao carregar motoristas');
        }
      );
  }

  getEstados() {
    this.estados = this.estadosService.getEstados();
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      animated: false,
      class: 'modal-xl',
    });
  }

  getMateriais(pedido: ILogisticaEntregaFormacaoCargaPedido) {
    this.materiaisLoading = true;
    this.service
      .getMateriais(pedido)
      .pipe(
        finalize(() => {
          this.materiaisLoading = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.materiais = response.body['data'];
          } else {
            this.pnotify.error('Falha ao carregar materiais');
            this.materiais = [];
          }
        },
        (error) => {
          this.pnotify.error('Falha ao carregar materiais');
          this.materiais = [];
        }
      );
  }

  openDetails(
    pedido: ILogisticaEntregaFormacaoCargaPedido,
    template: TemplateRef<any>
  ) {
    /* this.setPedido(pedido); */
    this.getMateriais(pedido);
    this.openModal(template);
  }

  getRoutesRegister() {
    this.atividaesAdminService
      .getAtividades({
        'rota': '/logistica/cadastros/@id'
      })
      .subscribe(
        response => {
          this.routeTrucker = `/logistica/cadastros/${response.body['atividades'][0]['idSubmodulo']}/motoristas/novo`;
          this.routeTruck = `/logistica/cadastros/${response.body['atividades'][0]['idSubmodulo']}/veiculos/novo`;
        }
      )
  }

  setItensPerPage(itemsPerPage): number {
    this.itemsPerPage = itemsPerPage;
    this.end = itemsPerPage;
    return this.itemsPerPage;
  }

  onAdd(pedido){
    
    this.pedidosSelecionados = this.pedidosSelecionados
      .filter(el =>  !((el?.CD_FILI === pedido?.CD_FILI) &&
      (el?.CD_PEDI === pedido?.CD_PEDI)) )

    this.pedidosSelecionados = [...this.pedidosSelecionados, pedido];
    
    this.pedidos = this.pedidos
      .filter(el =>  !((el?.CD_FILI === pedido?.CD_FILI) &&
                       (el?.CD_PEDI === pedido?.CD_PEDI)) )
  }

  onRemove(pedido){
    
    this.pedidosSelecionados = this.pedidosSelecionados
      .filter(el =>  !((el?.CD_FILI === pedido?.CD_FILI) &&
      (el?.CD_PEDI === pedido?.CD_PEDI)) )
    
    this.pedidos = this.pedidos
      .filter(el =>  !((el?.CD_FILI === pedido?.CD_FILI) &&
      (el?.CD_PEDI === pedido?.CD_PEDI)) )
    
    this.pedidos = [...this.pedidos, pedido];
  }

  isValidForm(form: FormGroup){
    return form.valid;
  }

}
