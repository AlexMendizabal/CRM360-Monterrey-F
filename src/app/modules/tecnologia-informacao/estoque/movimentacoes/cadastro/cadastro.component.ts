import { TecnologiaInformacaoEstoqueService } from './../../services/estoque.service';
import { TecnologiaInformacaoEstoqueTipoMovimentacoesService } from './../../tipo-movimentacoes/services/tipo-movimentacoes.service';
import { ITecnologiaInformacaoTipoMovimentacoes } from './../../tipo-movimentacoes/models/tipoMovimentacoes';
//Services
import { TecnologiaInformacaoEstoqueProdutosService } from './../../produtos/services/produtos.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TecnologiaInformacaoEstoqueMovimentacoesService } from '../services/movimentacoes.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
//Bootstrap
import { utilsBr } from 'js-brasil';
import { BsDatepickerConfig, BsModalRef, BsModalService } from 'ngx-bootstrap';
//Angular
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, TemplateRef } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
//rxjs
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
//interfaces
import { ITecnologiaInformacaoTipoItem } from '../../../contratos/tipo-item/models/tipoItem';
import { ITecnologiaInformacaoModelo } from '../../../contratos/modelo/models/modelo';
import { ITecnologiaInformacaoNivelEstoque } from '../../nivel-estoque/models/nivelEstoque';
import { ITecnologiaInformacaoTipoProduto } from '../../tipo-produto/models/tipoProduto';
import { ITecnologiaInformacaoEstoqueProduto } from '../../produtos/models/produto';

@Component({
  selector: 'tecnologia-informacao-estoque-movimentacoes-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss'],
})
export class TecnologiaInformacaoEstoqueMovimentacoesCadastroComponent
  implements OnInit {
  noResult: boolean;
  $activatedRouteSubscription: Subscription;
  breadCrumbTree: Array<any> = [];
  form: FormGroup;
  appTitle: string;
  modalRef: BsModalRef;
  formData: Array<FormData> = [];
  bsConfig: Partial<BsDatepickerConfig>;

  tipos = [
    {
      cod: 'ENTRADA',
      nome: 'ENTRADA',
    },
    {
      cod: 'SAIDA',
      nome: 'SAIDA',
    },
  ];


  //loading
  disabledForm = false;
  loadingTipoItem: boolean;
  loadingModelo: boolean;
  loadingEmpresa: boolean;
  loading = false;
  loadingNavBar = false;
  anexosLoaded: boolean = false;
  // loadingMoeda: boolean;

  //Interfaces
  tipoItem: ITecnologiaInformacaoTipoItem[] = [];
  modelo: ITecnologiaInformacaoModelo[] = [];
  empresas = [];
  precisao = 3;
  produtos: Array<ITecnologiaInformacaoEstoqueProduto> = [];

  constructor(
    private formBuilder: FormBuilder,
    private pnotify: PNotifyService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private modalService: BsModalService,
    private produtosService: TecnologiaInformacaoEstoqueProdutosService,
    private titleService: TitleService,
    private estoqueService: TecnologiaInformacaoEstoqueService,
    private atividadesService: AtividadesService,
    private movimentacoesService: TecnologiaInformacaoEstoqueMovimentacoesService
  ) {}
  public MASKS = utilsBr.MASKS;

  ngOnInit(): void {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.setFormBuilder();
    this.onActivatedRoute();
    this.getEmpresas();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  onActivatedRoute() {
    const _params = this.activatedRoute.snapshot.params;
    if (!_params.hasOwnProperty('id')) return this.getProdutos();
    this.getProdutos({ ID_TEIN_ESTO_PROD: _params['id'] });
  }
  

  getEmpresas(params?) {
    this.loading = true;
    const _params = params ?? {};
    _params.IN_STAT = '1';
    _params.TT_REGI_PAGI = '1000000';

    this.loading = true;
    this.estoqueService
      .getEmpresas(_params)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.empresas = response.body['result'];
        }
      });
  }

  getProdutos(params?: Partial<ITecnologiaInformacaoEstoqueProduto>) {
    this.loading = true;
    const _params = params ?? {};
    _params.IN_STAT = '1';
    _params.IN_PAGI = '0';
    this.produtosService
      .getProdutos(_params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            let tipoQuantidade = response.body['data'][0]['DS_UNID_MEDI']
            let codigoSerie = response.body['data'][0]['IN_CODI_SERI']
            if(params){
              this.form.get('ID_TEIN_ESTO_PROD').patchValue(response.body['data'][0]['ID_TEIN_ESTO_PROD'])
              this.form.get('DS_UNID_MEDI').patchValue(tipoQuantidade)
              this.form.controls['DS_UNID_MEDI'].disable();
              this.tipoQuantidade(tipoQuantidade)
              this.codigoSerie(codigoSerie)
            } 
            this.produtos = response.body['data'];
            this.noResult = false;
          } else {
            this.noResult = true;
            this.produtos = [];
          }
        },
        (error) => {
          this.pnotify.error();
          this.noResult = true;
        }
      );
  }

  tipoQuantidade(params){
    let tipoQuantidade = params
    if(tipoQuantidade == 'KG' ||  tipoQuantidade == 'TON' ){
      this.precisao = 3;
    } else {
      this.precisao = 0;
    }
  }

  codigoSerie(params){
    let codigoSerie = params
    if(codigoSerie == 1 ){
      this.form.controls['CD_ITEM'].setValidators(Validators.required);
      this.form.controls['CD_ITEM'].enable();
      this.form.controls['CD_ITEM'].updateValueAndValidity();
    } else {
      this.form.controls['CD_ITEM'].clearValidators();
      this.form.controls['CD_ITEM'].disable();
      this.form.controls['CD_ITEM'].updateValueAndValidity();
      this.form.controls['CD_ITEM'].reset()
      return
    }
  }
  setBreadCrumb(): void {
    const id = this.activatedRoute.snapshot.params.idSubModulo;
    this.appTitle = 'Cadastro';
    this.titleService.setTitle(this.appTitle);
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: '/tecnologia-informacao/home',
      },
      {
        descricao: 'Inventario',
        routerLink: `/tecnologia-informacao/estoque/${id}`,
      },
      {
        descricao: 'Movimentações',
        routerLink: `../`,
      },
      {
        descricao: this.appTitle,
      },
    ];
  }

  //formulario
  setFormBuilder(): void {
    this.form = this.formBuilder.group({
      ID_TEIN_ESTO_PROD: [null, [Validators.required]],
      TP_MOVI: [null, [Validators.required]],
      TT_PROD: [null, [Validators.required]],
      VL_UNIT: [null],
      DS_UNID_MEDI: [null],
      CD_REFE: [null],
      CD_PEDI: [null],
      NR_NOTA_FISC: [null],
      ID_TECN_INFO_MOVI: [null],
      IN_STAT: [null],
      UUID_EMPR: [null, [Validators.required]],
      IN_CODI_SERI: [0],
      CD_ITEM: [null],
      NM_MODE: [null],
      DS_OBSE: [null],
    });
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

  validateFormProduto(produto) {
    let codigoSerie= produto.IN_CODI_SERI
    let tipoQuantidade = produto.DS_UNID_MEDI
    this.form.get('ID_TEIN_ESTO_PROD').patchValue(produto.ID_TEIN_ESTO_PROD)
    this.form.get('DS_UNID_MEDI').patchValue(tipoQuantidade)
    this.form.controls['DS_UNID_MEDI'].disable();
    this.tipoQuantidade(tipoQuantidade)
    this.codigoSerie(codigoSerie)
  }

  // validateValor(produto: ITecnologiaInformacaoTipoMovimentacoes) {
  //   if (produto.SG_MOVI_TIPO == 'SAID') {
  //     this.form.controls['VL_UNIT'].disable();
  //     return;
  //   }
  //   this.form.controls['VL_UNIT'].enable();
  // }

  postMovimentacoes() {
    this.loadingNavBar = true;
    this.movimentacoesService
      .postMovimentacoes(this.form.value)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response: any) => {
          if (response.status === 200) {
            this.pnotify.success();
            this.router.navigate(['../'], {
              relativeTo: this.activatedRoute,
            });
          } else {
            this.pnotify.error();
          }
        },
        (error: any) => {
          try {
            this.pnotify.error(error.error.message);
          } catch (error) {
            this.pnotify.error();
          }
        }
      );
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      animated: false,
      class: 'modal-lg',
      backdrop: 'static',
    });
  }
  hideModal() {
    this.modalRef.hide();
  }
}
