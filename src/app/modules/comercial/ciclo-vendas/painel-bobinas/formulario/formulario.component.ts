import { ComercialCadastrosTransportadoraService } from './../../../cadastros/transportadoras/transportadoras.service';
import { ComercialCicloVendasCotacoesFormularioService } from './../../cotacoes/formulario/formulario.service';
import { FormasPagamento } from './../../../cadastros/formas-pagamento/models/formas-pagamento';
import { JsonResponse } from 'src/app/models/json-response';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ComercialClientesService } from 'src/app/modules/comercial/services/clientes.service';
import { MASKS } from 'ng-brazil';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { IComercialPainelBobinas } from './../models/painel-bobinas';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { finalize } from 'rxjs/operators';
import { ComercialPainelBobinasService } from '../painel-bobinas.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
//interfaces

import { Subscription, forkJoin } from 'rxjs';
import { Location } from '@angular/common';

//servicos
import { ComercialCicloVendasPainelBobinasFormularioModalDetalhesContatoService } from './modal/contato/contato.service';
import { ComercialCicloVendasPainelBobinasFormularioModalDetalhesEnderecoService } from './modal/endereco/endereco.service';
import { ComercialCadastrosFormasPagamentoService } from '../../../cadastros/formas-pagamento/formas-pagamento.service';
import { AuthService } from 'src/app/shared/services/core/auth.service';

@Component({
  selector: 'comercial-ciclo-vendas-painel-bobinas-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
})
export class ComercialPainelBobinasFormularioComponent
  implements OnInit, OnDestroy
{
  public MASKS = MASKS;
  private user = this.authService.getCurrentUser();
  noResult: boolean;
  loading = false;
  loadingNavBar = false;
  breadCrumbTree: Array<any> = [];
  form: FormGroup;
  formClientes: FormGroup;
  materiaisSelecionados: Array<any> = [];
  appTitle: string;
  bsConfig: Partial<BsDatepickerConfig>;
  loadingContato: boolean;
  loadingClientes: boolean;
  loadingFormasPagamento: boolean;

  noClientes: boolean;
  clientes: Array<any> = [];
  contatos: Array<any> = [];
  transportadoras: Array<any> = [];
  loadingTransportadora: boolean;
  tipoForm: number;
  locaisEntrega: Array<any> = [];
  locaisEntregaLoader: boolean;
  materiais: Array<IComercialPainelBobinas>;
  $activatedRouteSubscription: Subscription;
  loaderDetalhesContatoSubscription: Subscription;
  loaderDetalhesEnderecoSubscription: Subscription;
  modalRef: BsModalRef;
  /* Pagination */
  itemsPerPage = 10;
  totalItems = 10;
  currentPage = 1;
  begin = 0;
  end = 10;
  /* Pagination */
  formasPagamento: Array<FormasPagamento> = [];
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private pnotify: PNotifyService,
    private transportadoraService: ComercialCadastrosTransportadoraService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private routerService: RouterService,
    private cotacoesFormularioService: ComercialCicloVendasCotacoesFormularioService,
    private titleService: TitleService,
    private location: Location,
    private atividadesService: AtividadesService,
    private modalService: BsModalService,
    private painelBobinasService: ComercialPainelBobinasService,
    private clientesService: ComercialClientesService,
    private contatoDetalhesService: ComercialCicloVendasPainelBobinasFormularioModalDetalhesContatoService,
    private enderecoDetalhesService: ComercialCicloVendasPainelBobinasFormularioModalDetalhesEnderecoService,
    private formasPagamentoService: ComercialCadastrosFormasPagamentoService
  ) {}

  ngOnInit(): void {
    this.registrarAcesso();
    this.getLocalStorage();
    this.setBreadCrumb();
    this.setFormBuilder();
    this.onActivatedRoute();
    this.getFormasPagamento();
    this.getTransportadoras();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb(): void {
    this.appTitle = 'Cadastro';
    const id = this.activatedRoute.snapshot.params.idSubModulo;
    this.titleService.setTitle(this.appTitle);
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: '/comercial/home',
      },
      {
        descricao: 'Ciclo de ventas',
        routerLink: `/comercial/ciclo-vendas/${id}`,
      },
      {
        descricao: 'Painel de Bobinas',
        routerLink: `/comercial/ciclo-vendas/${id}/painel-bobinas`,
      },
      {
        descricao: this.appTitle,
      },
    ];
  }

  //Consumir informações que estão na rota para editar
  ngOnDestroy() {
    this.$activatedRouteSubscription.unsubscribe();
    this.unsetLoaderEvents();
  }

  unsetLoaderEvents(): void {
    if (this.loaderDetalhesContatoSubscription) {
      this.loaderDetalhesContatoSubscription.unsubscribe();
    }
    if (this.loaderDetalhesEnderecoSubscription) {
      this.loaderDetalhesEnderecoSubscription.unsubscribe();
    }
  }

  onActivatedRoute() {
    this.$activatedRouteSubscription =
      this.activatedRoute.queryParams.subscribe((response) => {
        this.tipoForm = this.routerService.getBase64UrlParams(response);
        this.form.get(['codContato']).disable();
        this.form.get(['codEndereco']).disable();
      });
  }

  getLocalStorage() {
    try {
      const materiais = localStorage.getItem('comercialPainelBobinasMateriais');
      this.materiaisSelecionados = JSON.parse(atob(materiais));
    } catch (error) {
      this.materiaisSelecionados = [];
      localStorage.removeItem('comercialPainelBobinasMateriais');
      this.pnotify.error('Materiais não encontrados!');
      this.location.back();
    }
  }

  //formulario
  setFormBuilder(): void {
    this.form = this.formBuilder.group({
      nomeCliente: [{ value: null, disabled: true }, [Validators.required]],
      codTransportadora: [
        { value: 1525, disabled: false },
        [Validators.required],
      ],
      nfMae: [{ value: null, disabled: false }, [Validators.required]],
      codFormaPagamento: [
        { value: null, disabled: false },
        [Validators.required],
      ],
      valorMaterial: [{ value: null, disabled: false }, [Validators.required]],
      aliquotaIcms: [{ value: null, disabled: false }, [Validators.required]],
      codCliente: [{ value: null, disabled: false }],
      codContato: [{ value: null, disabled: false }],
      codEndereco: [{ value: null, disabled: false }],
    });

    this.formClientes = this.formBuilder.group({
      buscarPor: ['1'],
      pesquisa: [null, Validators.required],
      pagina: [1],
      situacao: ['Ativo'],
      registros: [this.itemsPerPage],
    });
  }

  getFormasPagamento() {
    this.loadingFormasPagamento = true;
    this.formasPagamentoService
      .getListaFormasPagamento({ tipoConsulta: 2 })
      .pipe(
        finalize(() => {
          this.loadingFormasPagamento = false;
        })
      )
      .subscribe((response: any) => {
        if (response.success === true) {
          this.formasPagamento = response.data;
        } else {
          this.pnotify.notice('Nenhum registro encontrado!');
        }
        (error) => {
          this.pnotify.error();
        };
      });
  }

  getClientes() {
    this.loadingClientes = true;
    this.noClientes = this.clientes.length === 0 ? true : false;
    this.clientesService
      .getClientes(this.formClientes.value)
      .pipe(
        finalize(() => {
          this.loadingClientes = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.responseCode === 200) {
            this.clientes = response['result']['analitico'];
            this.totalItems = this.clientes[0]['total'];
            this.noClientes = false;
          } else {
            this.pnotify.notice('Nenhum registro encontrado!');
            this.clientes = [];
            this.noClientes = true;
          }
        },
        error: (error) => {
          this.pnotify.error();
          this.clientes = [];
        }
      });
  }

  openModal(template: TemplateRef<any>) {
    this.noClientes = true;
    this.modalRef = this.modalService.show(template, {
      animated: false,
      class: 'modal-xl',
    });
  }
  hideModal() {
    this.modalRef.hide();
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
  onPageChanged(event) {
    this.formClientes.get('pagina').setValue(event.page);
    this.getClientes();
  }

  async postPainelBobinas() {
    this.loading = true;
    let request = [];
    const materiais = this.materiaisSelecionados;
    if (!materiais) {
      return;
    }
    const promise = () => {
      materiais.forEach((material) => {
        const forms = this.form.value;
        const params = material;

        request.push(
          this.painelBobinasService.postPainelBobinas(
            this.setParams(forms, params)
          )
        );
      });
    };
    
    await Promise.resolve(promise());
    forkJoin([request])
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (responses: Array<any>) => {
          responses.forEach((response) => {
            if (response.success === true) {
              this.pnotify.success();
              this.router.navigate(
                ['/comercial/ciclo-vendas/${id}/painel-bobinas'],
                {
                  relativeTo: this.activatedRoute,
                }
              );
            } else {
              this.pnotify.error();
            }
          });
        },
        error: (error: any) => {
          try {
            this.pnotify.error(error.error.message);
          } catch (error) {
            this.pnotify.error();
          }
        }
      });
  }

  setParams(forms, params): Object {
    let _params: any = {};

    _params.empresa = params.codEmpresa;
    _params.seqLote = params.sequenciaLote;
    _params.matricula = this.user.info.matricula;
    _params.idVendedor = this.user.info.idVendedor;
    _params.codCliente = forms.codCliente;
    _params.codEndereco = forms.codEndereco;
    _params.aliquotaIcms = forms.aliquotaIcms;
    _params.valorUnitario = forms.valorMaterial;

    return _params;
  }

  setCliente(cliente) {
    this.getClientes();
    this.form.get('nomeCliente').setValue(cliente.razaoSocial);
    this.form.get('codCliente').setValue(cliente.codCliente);

    if (this.form.get('codCliente')) {
      this.getContatos(cliente);
      this.getLocaisEntrega(cliente);
    }
  }

  getContatos(cliente) {
    this.loadingContato = true;
    this.clientesService
      .getContatos(cliente.codCliente)
      .pipe(
        finalize(() => {
          this.loadingContato = false;
        })
      )
      .subscribe((response: JsonResponse) => {
        if (response.success === true) {
          this.form.get(['codContato']).enable();
          const _contatos = response.data;
          let contatos = [];

          for (let i = 0; i < _contatos.length; i++) {
            if (
              _contatos[i].nomeCompleto &&
              _contatos[i].nomeCompleto != null &&
              _contatos[i].nomeCompleto != '' &&
              _contatos[i].nomeCompleto.length > 1
            )
              contatos.push({
                codContato: _contatos[i].idSeqTid,
                nomeContato: _contatos[i].nomeCompleto,
              });
          }
          this.contatos = contatos;
        }
      });
  }

  getLocaisEntrega(cliente): void {
    this.locaisEntrega = [];
    this.locaisEntregaLoader = true;

    this.cotacoesFormularioService
      .getLocaisEntrega(cliente.codCliente)
      .pipe(
        finalize(() => {
          this.locaisEntregaLoader = false;
          this.form.controls.codEndereco.enable();
        })
      )
      .subscribe((response: JsonResponse) => {
        if (response.success === true) {
          this.form.get(['codEndereco']).enable();
          const _enderecos = response.data.enderecos;
          const _enderecosAguardando = response.data.enderecosAguardando || [];

          let enderecos = [],
            enderecosAguardando = [];

          for (let i = 0; i < _enderecos.length; i++) {
            enderecos.push({
              codEndereco: _enderecos[i].id,
              descricao: this.formatLocalEntrega(_enderecos[i]),
              tipo: 'Aprovados',
            });
          }

          for (let i = 0; i < _enderecosAguardando.length; i++) {
            enderecosAguardando.push({
              codEndereco: _enderecosAguardando[i].id,
              descricao: this.formatLocalEntrega(_enderecosAguardando[i]),
              tipo: 'Aguardando aprovação',
            });
          }

          this.locaisEntrega = [...enderecos, ...enderecosAguardando];
        }
      });
  }
  formatLocalEntrega(localEntrega: any): string {
    return `${localEntrega.endereco} - ${localEntrega.bairro}, ${localEntrega.cidade} - ${localEntrega.uf} - ${localEntrega.cep}`;
  }

  getTransportadoras(params?) {
    const _params = params ?? {};
    this.loadingTransportadora = true;
    this.transportadoraService
      .getListaTransportadoras(params)
      .pipe(
        finalize(() => {
          this.loadingTransportadora = false;
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            this.transportadoras = response['data'];
          } else {
            this.pnotify.error();
          }
        },
        error: (error: any) => {
          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotify.error(error.error.mensagem);
          } else {
            this.pnotify.error();
          }
        }
      });
  }

  setLoaderEvents(): void {
    this.loaderDetalhesContatoSubscription =
      this.contatoDetalhesService.loaderNavbar.subscribe(
        (response: boolean) => {
          this.loadingNavBar = response;
        }
      );

    this.loaderDetalhesEnderecoSubscription =
      this.enderecoDetalhesService.loaderNavbar.subscribe(
        (response: boolean) => {
          this.loadingNavBar = response;
        }
      );
  }

  onDetalhesContato(): void {
    if (this.form.value.codContato != null) {
      this.contatoDetalhesService.showModal(
        this.form.value.codCliente,
        this.form.value.codContato
      );
    }
  }

  onDetalhesLocalEntrega(): void {
    if (this.form.value.codEndereco != null) {
      this.enderecoDetalhesService.showModal(
        this.form.value.codCliente,
        this.form.value.codEndereco
      );
    }
  }
}
