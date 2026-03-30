// angular
import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

// rxjs
import { Subscription, forkJoin, EMPTY } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

// services
import { RouterService } from 'src/app/shared/services/core/router.service';
import { CepService } from 'src/app/shared/services/ws/cep.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { LogisticaEntregaPedidosService } from '../services/pedidos.service';
import { ComercialClientesService } from 'src/app/modules/comercial/services/clientes.service';
import { DetailPanelService } from 'src/app/shared/templates/detail-panel/detal-panel.service';

// ngx
import { BsDatepickerConfig, BsLocaleService, BsModalRef, BsModalService } from 'ngx-bootstrap';
import { finalize, take, switchMap } from 'rxjs/operators';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { DateService } from 'src/app/shared/services/core/date.service';

//ng-brazil
import { MASKS, NgBrazilValidators } from 'ng-brazil';

// models
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { ILogisticaEntregaColetaDocumento } from '../models/documento';
import { ILogisticaEntregaColeta } from '../models/coleta';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { Location } from '@angular/common';
import { LogisticaEntergaRestricoesService } from '../../../cadastros/restricoes-transporte/services/restricoes.service';
import { LogisticaPrazoEntregaService } from '../../../cadastros/prazo-entrega/services/prazo-entrega.service';
import { LogisticaRegioesEntregaService } from '../../../cadastros/regioes-entrega/services/regioes-entrega.service';
import { LogisticaEntregaFusionService } from '../../services/fusion.service';
import { LogisticaFiliaisService } from '../../../cadastros/filiais/services/filiais.service';

@Component({
  selector: 'logistica-entrega-cadastro-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss']
})
export class LogisticaEntregaColetasCadastroComponent implements OnInit, OnDestroy {

  public MASKS = MASKS;
  appTitle = "Cadastro"

  form: FormGroup;
  formPesquisaCliente: FormGroup;
  modalRef: BsModalRef;

  breadCrumbTree: Array<Breadcrumb>;
  $activatedRouteSubscription: Subscription;
  $detailPanelSubscription: Subscription;

  bsConfig: Partial<BsDatepickerConfig>;

  loadingClientes = false;
  clientes: Array<any> = new Array();
  cliente;

  restricoesTransporte: Array<any> = new Array();

  /*loading*/
  loading = true;
  loadingNavBar = false;
  noResult = true;
  /*loading*/

  isDisable = false;
  formDisabled = false;

  enderecos: Array<any> = new Array();
  loadingEnderecos = false;

  showDetailPanel = false;

  formData: Array<FormData> = [];
  documentos: Array<Partial<ILogisticaEntregaColetaDocumento>> = [];

  tableConfig: Partial<CustomTableConfig> = {
    isFixed: true
  };

  empresas = [];
  loadingEmpresas = false;

  constructor(
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private routerService: RouterService,
    private localeService: BsLocaleService,
    private cepService: CepService,
    private pnotify: PNotifyService,
    private pedidosService: LogisticaEntregaPedidosService,
    private atividadesService: AtividadesService,
    private dateService: DateService,
    private modalService: BsModalService,
    private clientesService: ComercialClientesService,
    private detailPanelService: DetailPanelService,
    private restricoesTransporteService: LogisticaEntergaRestricoesService,
    private confirmModalService: ConfirmModalService,
    private prazoEntregaService: LogisticaPrazoEntregaService,
    private location: Location,
    private regioesService: LogisticaRegioesEntregaService,
    private filiaisService: LogisticaFiliaisService
  ) {

    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false },
    );
  }

  ngOnInit(): void {
    this.buildForm();
    this.setBreadCrumb();
    this.registraAcesso();
    this.onActivatedRoute();
    this.onDetailPanelEmitter();
    this.onRestricoesTransporte();
    this.cnpjSubscription();
    this.calculaPrazoAtendimento();
    this.getEmpresas();
  }

  ngOnDestroy() {
    //this.$activatedRouteSubscription.unsubscribe();
    this.$detailPanelSubscription.unsubscribe();
  }

  onActivatedRoute() {

    const params = this.activatedRoute.snapshot.params;
    const queryParams = this.activatedRoute.snapshot.queryParams;

    if(params?.id){
      this.getPedidos({ID_LOGI_COLE: params.id});
      this.getDocumentos({ID_LOGI_COLE: params.id}); 
      return
    }

    const _response = this.getParams(this.routerService.getBase64UrlParams(queryParams));

    if (Object.keys(_response).length == 0) {
      this.loading = false;
      return;
    }

    _response["IBGE"] = _response["CD_IBGE"]
    _response["NM_FANT_CLIE"] = _response["NM_FANT"]
    _response["QT_PESO"] = _response["TT_PESO"]

    this.form.patchValue(_response);
    this.loading = false;
    
    /* if (_response["IN_PEDI_EXTE"] == 1) {
      this.setDisabledFieldForm();
      this.isDisable = true;
      return
    } */

  }

  getEmpresas(){
      this.loadingEmpresas = true;
      this.filiaisService.getFiliais({ status: '1' })
        .pipe(
          finalize(() => {
            this.loadingEmpresas = false;
          })
        )
        .subscribe({
          next: response => {
            this.empresas = response.body['data'];
          },
          error: () => {
            this.pnotify.error();
          }
        })
    }

  cnpjSubscription() {
    this.form.get('CD_EMPR')
      .valueChanges
      .subscribe(
        id => {
          if (id) {
            const cnpj = this.empresas.filter(empresa => empresa.id == id).shift()['cnpj'];
            this.form.get('CD_EMPR_CNPJ_CPF').setValue(cnpj);
          }
        }
      )
  }

  buildForm(): void {
    this.form = this.formBuilder.group({
      "ID_LOGI_COLE": [null],
      "CD_PEDI": [null, Validators.required],
      "DT_PEDI": [null, Validators.required],
      "QT_PESO": [null, Validators.required],
      "TIPO_ENTR": ["Servico", Validators.required],
      "CD_CLIE_ORIG": [null, Validators.required],
      "CD_CLIE_CNPJ_CPF": [null],
      "NM_FANT_CLIE": [null, Validators.required],
      "NM_CLIE": [null, Validators.required],
      "NOTA_FISC": [null],
      "DT_EMIS_NOTA_FISC": [null],
      "VL_NOTA_FISC": [null],
      "DS_LOCA_ENTR": [null, Validators.required],
      "DS_BAIR": [null],
      "IBGE": [null],
      "DS_CIDA": [null, Validators.required],
      "DS_ESTA": [null],
      "CD_CEP": [null],
      "CD_PRAC": [null],
      "DS_PRAC": [null],
      "CD_REGI_ENTR": [null],
      "DS_REGI_ENTR": [null],
      "CD_EMPR": [null, Validators.required],
      "CD_DEPO": [null],
      "CD_EMPR_CNPJ_CPF": [null, [Validators.required]],
      "PRAZO": [{ value: new Date(), disabled: true }, Validators.required],
      "SEGM_CLIE": [null],
      "CD_REST": [null],
      "TP_PESS": ["J"],
      "DS_OBSE": [null]
    });

    this.formPesquisaCliente = this.formBuilder.group({
      "buscarPor": [1],
      "pesquisa": [null, Validators.required],
      "situacao": ["T", Validators.required]
    })
  }

  onDetailPanelEmitter(): void {
    this.$detailPanelSubscription = this.detailPanelService.config.subscribe(
      (event: any) => {
        this.showDetailPanel = event.showing;
      }
    );
  }

  registraAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb() {
    this.breadCrumbTree = [
      {
        descricao: 'Logistica'
      },
      {
        descricao: 'GESTIÓN DE ENTREGAS',
        routerLink: '../../'
      },
      {
        descricao: 'Lista de Coletas',
        routerLink: '../'
      },
      {
        descricao: this.appTitle
      }
    ];
  }

  getPedidos(params?) {

    if (!this.loading) this.loadingNavBar = true;

    this.pedidosService
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
            this.noResult = false;
            const data: ILogisticaEntregaColeta = response['body']['data'][0];
            this.form.patchValue(this.getParams(data));
            
            if (!this.isEditable(data)) {
              this.formDisabled = true;
              this.isDisable = true;
            } else if (data.IN_PEDI_EXTE == '1') {
              this.isDisable = true;
              this.setDisabledFieldForm();
            }

          } else {
            this.noResult = true;
          }
        },
        (error) => {
          this.noResult = true;
        }
      )
  }

  castJavascriptDate(dateStr) {
    if (!dateStr) return dateStr;
    const [year, month, day] = dateStr.split("-")
    return new Date(year, month - 1, day)
  }

  postPedido() {

    this.loadingNavBar = true;
    let params = JSON.parse(JSON.stringify(this.form.getRawValue()));
    params['PRAZO'] = this.dateService.convertToUrlDate(new Date(params['PRAZO']));
    params['DT_PEDI'] = this.dateService.convertToUrlDate(new Date(params['DT_PEDI']));

    if (params['DT_EMIS_NOTA_FISC'])
      params['DT_EMIS_NOTA_FISC'] = this.dateService.convertToUrlDate(new Date(params['DT_EMIS_NOTA_FISC']));

    this.pedidosService
      .postPedido(params)
      .pipe(
        finalize(() => {
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {

          if (response.status === 200) {

            const id = response.body['data'];
            this.form.get('ID_LOGI_COLE').setValue(id);
            this.postDocumentos({'ID_LOGI_COLE': id});


          } else {
            this.pnotify.error(response.body['message'])
          }
        },
        (error) => {
          this.pnotify.error(error['error']['message'] || 'Ocorreu um erro durante a requisição.')
        }
      );
  }

  checkCEP(cep) {
    this.loadingNavBar = true;
    this.cepService
      .getData(cep)
      .pipe(
        finalize(() => {
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response['success'] == false) {
            this.form.controls['CD_CEP'].setErrors({ 'incorrect': true });
            this.pnotify.notice(response['mensagem']);
          } else {
            this.form.patchValue({
              'DS_LOCA_ENTR': response['data']['logradouro'],
              'DS_BAIR': response['data']['bairro'],
              'IBGE': response['data']['ibge'],
              'DS_CIDA': response['data']['localidade'],
              'DS_ESTA': response['data']['uf'],
              'CD_CEP': cep.toString()
            })

          }
        }
      )
  }

  getParams(obj) {

    let _params = {};
    const regexDate = new RegExp("([0-9]{4})(-)([0-9]{2})(-)([0-9]{2})(.*)");

    for (let prop in obj)
      if (obj[prop]) {
        _params[prop] = regexDate.test(obj[prop]) ? new Date((obj[prop]).substring(0, 10).split("-")) : obj[prop]
      }

    return _params;

  }

  setDisabledFieldForm() {
    this.form.controls['CD_PEDI'].disable();
    this.form.controls['DT_PEDI'].disable();
    this.form.controls['QT_PESO'].disable();
    this.form.controls['CD_CLIE_ORIG'].disable();
    this.form.controls['CD_EMPR_CNPJ_CPF'].disable();
    this.form.controls['TP_PESS'].disable();
    this.form.controls['CD_CLIE_CNPJ_CPF'].disable();
    this.form.controls['NM_FANT_CLIE'].disable();
    this.form.controls['NM_CLIE'].disable();
    this.form.controls['NOTA_FISC'].disable();
    this.form.controls['DT_EMIS_NOTA_FISC'].disable();
    this.form.controls['VL_NOTA_FISC'].disable();
    this.form.controls['CD_EMPR'].disable();
    this.form.controls['CD_DEPO'].disable();
    this.form.controls['CD_PRAC'].disable();
    this.form.controls['DS_PRAC'].disable();
    this.form.controls['CD_REGI_ENTR'].disable();
    this.form.controls['DS_REGI_ENTR'].disable();
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

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      animated: false,
      class: 'modal-lg',
      backdrop: 'static'
    });
  }

  hideModal() {
    this.modalRef.hide();
  }

  getClientes() {
    this.closeDetails();
    this.loadingClientes = true;
    const params = this.formPesquisaCliente.value;

    this.clientesService
      .getClientes(params)
      .pipe(
        finalize(() => {
          this.loadingClientes = false;
        })
      )
      .subscribe(
        (response) => {
          if (response['responseCode'] === 200) {
            this.clientes = response['result']['analitico'];
          } else if (response['responseCode'] === 204) {
            this.pnotify.notice("Não houve resultados para sua pesquisa");
          } else {
            this.pnotify.error();
          }
        },
        (error) => {
          this.pnotify.error();
        }
      )
  }

  getEnderecos(codCliente) {

    this.loadingEnderecos = true;

    this.clientesService
      .getEnderecos(codCliente, {
        "localEntrega": 1
      })
      .pipe(
        finalize(() => {
          this.detailPanelService.loadedFinished(false);
          this.loadingEnderecos = false;
        })
      )
      .subscribe(
        (response) => {
          if (response['success'] == true) {
            this.enderecos = response['data']['enderecos'];
          } else {
            this.enderecos = [];
            this.pnotify.notice("Nenhum endereço de entrega localizado para este cliente");
          }
        },
        (error) => {
          this.pnotify.error();
          this.enderecos = [];
        }
      )
  }

  closeDetails() {
    this.detailPanelService.hide()
  }

  viewDetails(cliente) {
    this.cliente = cliente;
    this.detailPanelService.show();
    this.showDetailPanel = true;
    this.getEnderecos(cliente.codCliente)

  }

  setCliente(cliente) {
    this.form.patchValue({
      "CD_CLIE_ORIG": cliente.codCliente,
      "CD_CLIE_CNPJ_CPF": cliente.tipo === 'J' ? cliente.cnpj.toString() : cliente.cpf.toString(),
      "NM_FANT_CLIE": cliente.nomeFantasia,
      "NM_CLIE": cliente.razaoSocial,
      "TP_PESS": cliente.tipo
    });
  }

  setEndereco(endereco) {
    this.setCliente(this.cliente);
    this.form.patchValue({
      "DS_LOCA_ENTR": endereco.endereco,
      "DS_BAIR": endereco.bairro,
      "IBGE": endereco.codIbge,
      "DS_CIDA": endereco.cidade,
      "DS_ESTA": endereco.uf,
      "CD_CEP": endereco.cep.toString(),
      "CD_REGI_ENTR": endereco.idRegiaoEntrega,
      "DS_REGI_ENTR": endereco.descRegiaoEntrega,
    });
    this.closeDetails();
  }

  onRestricoesTransporte() {
    this.restricoesTransporteService
      .getRestricoes()
      .subscribe(
        response => {
          if (response.status === 200) {
            this.restricoesTransporte = response.body['data'];
          } else {
            this.pnotify.notice("Falha ao carregar restrições de transporte");
          }
        }, error => {
          this.pnotify.notice("Falha ao carregar restrições de transporte");
        }
      )
  }

  appendFile(files: FileList) {
    if (files.length === 0) return;
    const fd = new FormData();
    fd.append('file', files[0]);
    this.formData.push(fd);
    this.documentos.push({ 'NM_DOCU': files[0]['name'] })
  }

  postDocumentos(pedido) {

    let req = [];

    const params = {ID_LOGI_COLE: pedido?.ID_LOGI_COLE} 

    this.formData.forEach((element, index) => {
      req.push(this.pedidosService
        .postDocumento(element, params))
    });

    if (req.length === 0) {
      this.form.reset();
      this.pnotify.success();
      this.location.back();
      return;
    }

    forkJoin(req)
      .subscribe(
        response => {
          this.documentos = [];
          this.formData = [];
          this.form.reset();
          this.pnotify.success(`Documentos salvos com sucesso`)
          this.location.back();
        },
        error => {
          this.pnotify.error('Erro ao salvar documentos');
        }
      )

  }

  putDocumento(documento: ILogisticaEntregaColetaDocumento) {

    const [type, title, message, cancelTxt, okTxt] = ['inactivate', 'Confirmar inativação', 'Deseja realmente prosseguir com a inativação do registro?', 'Cancelar', 'Confirmar']

    this.confirmModalService
      .showConfirm(type, title, message, cancelTxt, okTxt)
      .pipe(
        take(1),
        switchMap((result) => {
          if (!result) return EMPTY;

          this.loadingNavBar = true;

          return this.pedidosService
            .putDocumento(documento)

        }),
        finalize(() => {
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        response => {
          this.pnotify.success('Documento atualizado com sucesso')
          this.getDocumentos(this.form.value);
        }
      )
  }

  getDocumentos(params) {

    this.pedidosService
      .getDocumentos(params)
      .subscribe(
        response => {
          if (response.status === 200) {
            this.documentos = response.body['data']
          } else {
            this.documentos = [];
          }
        },
        error => {
          this.documentos = [];
        }
      )
  }

  onRemove(documento: ILogisticaEntregaColetaDocumento) {
    documento.IN_STAT = '0';
    this.putDocumento(documento);
  }

  isEditable(pedido: ILogisticaEntregaColeta): boolean {

    const _user = JSON.parse(localStorage.getItem("currentUser"));
    const _id = _user['info']['id'];

    if (pedido.ID_USUA_RESP_CADA == _id && pedido.IN_INTE != 'I')
      return true;

    return false;

  }

  calculaPrazoAtendimento() {

    const cdEmpresa = this.form.get('CD_EMPR').value;
    const cdRegiao = this.form.get('CD_REGI_ENTR').value;

    if (!cdEmpresa || !cdRegiao) return

    let params = {
      'CD_FILI': cdEmpresa,
      'CD_REGI_ENTR': cdRegiao
    }

    this.loadingNavBar = true;
    this.isDisable = true;

    this.prazoEntregaService
      .getPrazosEntrega(params)
      .pipe(
        finalize(() => {
          this.loadingNavBar = false
          this.isDisable = false
        })
      )
      .subscribe(
        response => {
          if (response.status === 200) {

            let data = response.body['data'][0];
            let prazo = data["TT_PRZO"];
            if (!prazo) prazo = 2;

            const date = new Date();

            //prazo para atendimento
            let dataPrevista = new Date(date.setDate(date.getDate() + parseInt(prazo)));

            //se for domingo
            if (dataPrevista.getDay() == 0)
              dataPrevista.setDate(dataPrevista.getDate() + 1);

            //se for sábado
            if (dataPrevista.getDay() == 6)
              dataPrevista.setDate(dataPrevista.getDate() + 2);

            this.form.get('PRAZO').setValue(dataPrevista);
            this.pnotify.success('Prazo para atendimento estimado: ' + dataPrevista.toLocaleDateString());
          }
        }
      )
  }
}
