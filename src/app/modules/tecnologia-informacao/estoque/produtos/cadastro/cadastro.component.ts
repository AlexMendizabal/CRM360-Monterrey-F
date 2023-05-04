import { TecnologiaInformacaoEstoqueMarcasService } from './../../marcas/services/marcas.service';
import { TecnologiaInformacaoEstoqueModeloService } from './../../modelo/services/modelo.service';
import { TecnologiaInformacaoEstoqueTipoProdutosService } from './../../tipo-produto/services/tipo-produto.service';
//services
import { TecnologiaInformacaoEstoqueProdutosService } from './../services/produtos.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

//angular
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';

//modelos
import { BsDatepickerConfig } from 'ngx-bootstrap';

//rxjs
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';

//interfaces
import { ITecnologiaInformacaoEstoqueProduto } from './../models/produto';
import { ITecnologiaInformacaoEstoqueModelo } from '../../../estoque/modelo/models/modelo';
import { ITecnologiaInformacaoTipoProduto } from '../../../estoque/tipo-produto/models/tipoProduto';
import { ITecnologiaInformacaoEstoqueMarcas } from '../../marcas/models/marcas';

@Component({
  selector: 'tecnologia-informacao-estoque-produtos-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss'],
})
export class TecnologiaInformacaoEstoqueProdutosCadastroComponent
  implements OnInit, OnDestroy {
  noResult: boolean;
  loading = false;
  loadingNavBar = false;
  loadingModelo = false;
  loadingTipoProduto: boolean;
  loadingMarca: boolean;
  breadCrumbTree: Array<any> = [];
  form: FormGroup;
  appTitle: string;
  bsConfig: Partial<BsDatepickerConfig>;
  modelos: Array<ITecnologiaInformacaoEstoqueModelo>;
  $activatedRouteSubscription: Subscription;
  tipoProduto: ITecnologiaInformacaoTipoProduto[] = [];
  marca: ITecnologiaInformacaoEstoqueMarcas[] = [];
  produtos: ITecnologiaInformacaoEstoqueProduto[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private pnotify: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private titleService: TitleService,
    private atividadesService: AtividadesService,
    private modeloService: TecnologiaInformacaoEstoqueModeloService,
    private tipoProdutosService: TecnologiaInformacaoEstoqueTipoProdutosService,
    private marcasService: TecnologiaInformacaoEstoqueMarcasService,
    private produtosService: TecnologiaInformacaoEstoqueProdutosService
  ) {}

  ngOnInit(): void {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.setFormBuilder();
    this.onActivatedRoute();
    this.getTiposProduto();
    this.getModelos();
    this.getMarcas();
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
        routerLink: '/tecnologia-informacao/home',
      },
      {
        descricao: 'Estoque',
        routerLink: `/tecnologia-informacao/estoque/${id}`,
      },
      {
        descricao: 'Produtos',
        routerLink: `./../`,
      },
      {
        descricao: this.appTitle,
      },
    ];
  }

  //Consumir informações que estão na rota para editar
  ngOnDestroy() {
    this.$activatedRouteSubscription.unsubscribe();
  }

  getProduto(id: number){
    this.loading = true;
    this.produtosService
      .getProduto(id)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(
        response => {

          if (response.status != 200){
            this.pnotify.error();
            return
          }
          let produto = response.body["data"];
          produto.IN_CODI_SERI = produto?.IN_CODI_SERI == '1' ? true : false
          this.form.patchValue(produto);

        },
        error => {
          try {
            this.pnotify.error(error.error.message);
          } catch (error) {
            this.pnotify.error();
          }
        }
      )
  }

  getTiposProduto(params?: Partial<ITecnologiaInformacaoTipoProduto>) {
    const _params = params ?? {};
    _params.IN_STAT = '1';
    _params.IN_PAGI = '0';

    this.loadingTipoProduto = true;
    this.tipoProdutosService
      .getTiposProduto(_params)
      .pipe(
        finalize(() => {
          this.loadingTipoProduto = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.tipoProduto = response.body['data'];
          } else {
            this.tipoProduto = [];
          }
        },
        (error) => {
          this.tipoProduto = [];
        }
      );
  }

  getMarcas(params?: Partial<ITecnologiaInformacaoEstoqueMarcas>) {
    const _params = params ?? {};
    _params.IN_STAT = '1';
    _params.IN_PAGI = '0';

    this.loadingMarca = true;
    this.marcasService
      .getMarcas(_params)
      .pipe(
        finalize(() => {
          this.loadingMarca = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.marca = response.body['data'];
          } else {
            this.marca = [];
          }
        },
        (error) => {
          this.marca = [];
        }
      );
  }

  getModelos(params?: Partial<ITecnologiaInformacaoEstoqueModelo>) {
    const _params = params ?? {};
    _params.IN_STAT = '1';
    _params.IN_PAGI = '0';

    this.loadingModelo = true;
    this.modeloService
      .getModelos(_params)
      .pipe(
        finalize(() => {
          this.loadingModelo = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.modelos = response.body['data'];
          } else {
            this.modelos = [];
          }
        },
        (error) => {
          this.modelos = [];
        }
      );
  }

  onActivatedRoute() {
    this.$activatedRouteSubscription = this.activatedRoute.params
      .subscribe(
        response => {
          if(response.hasOwnProperty('id')){
            this.getProduto(response.id);
          }
        }
      )
  }

  //formulario
  setFormBuilder(): void {
    this.form = this.formBuilder.group({
      ID_TEIN_ESTO_PRMO: [null, [Validators.required]],
      ID_TEIN_ESTO_PRTP: [null, [Validators.required]],
      ID_TEIN_ESTO_PRMA: [null],
      NM_PROD: [null, [Validators.required]],
      DS_UNID_MEDI: ['UN', [Validators.required]],
      TT_PESO_UNIT: [null],
      IN_STAT: ['1', [Validators.required]],
      NM_TIPO: [null],
      NM_MODE: [null],
      IN_CODI_SERI: [null],
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

  postProdutos() {
    this.loadingNavBar = true;
    let params = this.form.value;
    params.IN_CODI_SERI = params?.IN_CODI_SERI ? '1' : '0'
    this.produtosService
      .postProdutos(this.form.value)
      .pipe(
        finalize(() => {
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response: any) => {
          if (response.status === 200) {
            this.form.reset();
            this.pnotify.success();
            this.router.navigate(['../'], {
              relativeTo: this.activatedRoute,
            });
          } else {
            this.pnotify.error();
          }
        },
        (error: any) => {
          try{
            this.pnotify.error(error.error.message)
          }catch(error){
            this.pnotify.error();
          }
        }
      );
  }
}
