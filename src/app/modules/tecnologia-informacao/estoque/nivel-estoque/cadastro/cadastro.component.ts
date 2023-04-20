import { ITecnologiaInformacaoEstoqueProduto } from './../../produtos/models/produto';
import { TecnologiaInformacaoEstoqueProdutosService } from './../../produtos/services/produtos.service';
import { TecnologiaInformacaoEstoqueService } from './../../services/estoque.service';
import { ITecnologiaInformacaoNivelEstoque } from './../models/nivelEstoque';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import {
  BsLocaleService,
  BsDatepickerConfig,
  BsModalService,
  BsModalRef,
} from 'ngx-bootstrap';
import { finalize } from 'rxjs/operators';

import { TecnologiaInformacaoEstoqueNivelEstoqueService } from '../services/nivel-estoque.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  AbstractControl,
  Validators,
  FormControl,
} from '@angular/forms';
//interfaces

import { Subscription } from 'rxjs';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { ITecnologiaInformacaoItem } from '../../../contratos/item/models/item';
import { TecnologiaInformacaoCadastroItemService } from '../../../contratos/item/services/item.service';

@Component({
  selector: 'tecnologia-informacao-estoque-nivel-estoque-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss'],
})
export class TecnologiaInformacaoEstoqueNivelEstoqueCadastroComponent
  implements OnInit, OnDestroy {
  noResult: boolean;
  loading = false;
  loadingNivelEstoque = false;
  loadingNavBar = false;
  loadingProdutos = false;
  loadingEmpresas: boolean;
  breadCrumbTree: Array<any> = [];
  precisao = 3;
  form: FormGroup;
  modalRef: BsModalRef;
  appTitle: string;
  bsConfig: Partial<BsDatepickerConfig>;
  produtos: Array<ITecnologiaInformacaoItem> = [];
  empresas = [];
  formPesquisaProduto: FormGroup;
  $activatedRouteSubscription: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private pnotify: PNotifyService,
    private estoqueService: TecnologiaInformacaoEstoqueService,
    private produtosService: TecnologiaInformacaoEstoqueProdutosService,
    private modalService: BsModalService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private routerService: RouterService,
    private titleService: TitleService,
    private atividadesService: AtividadesService,
    private nivelEstoqueService: TecnologiaInformacaoEstoqueNivelEstoqueService
  ) {}

  ngOnInit(): void {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.getEmpresas();
    this.setFormBuilder();
    this.onActivatedRoute();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
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
        descricao: 'Estoque',
        routerLink: `/tecnologia-informacao/estoque/${id}`,
      },
      {
        descricao: 'Nivel Estoque',
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

  getEmpresas(params?) {
    this.loadingEmpresas = true;
    const _params = params ?? {};
    _params.IN_STAT = '1';
    _params.TT_REGI_PAGI = '1000000';

    this.estoqueService
      .getEmpresas(_params)
      .pipe(
        finalize(() => {
          this.loadingEmpresas = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.empresas = response.body['result'];
          } else {
            this.noResult = true;
            this.empresas = [];
          }
        },
        (error) => {
          this.pnotify.error();
          this.noResult = true;
        }
      );
  }

  onActivatedRoute() {
    this.$activatedRouteSubscription = this.activatedRoute.params
      .subscribe(
        response => {
          if(response.hasOwnProperty('id')){
            this.getNivelEstoque(response.id);
            this.form.controls['ID_TEIN_ESTO_PROD'].disable();
          }
        }
      )
  }

  getNivelEstoque(id: number){
    this.loading = true;
    this.nivelEstoqueService
      .getNivelEstoque(id)
      .subscribe(
        response => {
          if (response.status != 200){
            this.pnotify.error();
            this.loading = false;
            return
          }
          let tipoQuantidade = response.body["data"]['DS_UNID_MEDI']
          this.getProdutos(response.body["data"]['ID_TEIN_ESTO_PROD'])
          this.form.patchValue(response.body["data"]);
          if(tipoQuantidade == 'KG' ||  tipoQuantidade == 'TON' ){
            this.precisao = 3;
          } else {
            this.precisao = 0;
          }
        },
        error => {
          try {
            this.pnotify.error(error.error.message);
            this.loading = false;
          } catch (error) {
            this.pnotify.error();
            this.loading = false;
          }
        }
      )
  }


  //formulario
  setFormBuilder(): void {
    this.form = this.formBuilder.group({
      ID_TEIN_ESTO_NIVL: [null],
      ID_TEIN_ESTO_PROD: [{value:null , disabled: true},  Validators.required],
      NM_PROD: [null],
      DS_UNID_MEDI: [null,  Validators.required],
      UUID_EMPR: [null,  Validators.required],
      ID_EMPR: [null],
      TT_ESTO_MNMO: [null, Validators.required],
      TT_ESTO_MXMO: [null,  Validators.required],
      IN_STAT: ['1'],
      DS_OBSE: [null],
    });
    this.formPesquisaProduto = this.formBuilder.group({
      buscarPor: ['ID_TEIN_ESTO_PROD'],
      pesquisa: [null, Validators.required],
      ID_TEIN_ESTO_PROD: [null],
      NM_PROD: [null],
      NM_MRCA: [null],
    });
  }

  getProdutos(params?) {
    const _obj = this.formPesquisaProduto.value;
    const _params = params ?? {};
    if (_obj['pesquisa']) _params[_obj['buscarPor']] = _obj['pesquisa'];
    this.loadingProdutos = true;
    this.produtosService
      .getProdutos(_params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingProdutos = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.produtos = response.body['data'];
          } else {
            this.pnotify.notice('Nenhum registro encontrado!');
            this.produtos = [];
          }
        },
        (error) => {
          this.pnotify.error();
        }
      );
  }
  setProduto(produto: ITecnologiaInformacaoEstoqueProduto) {
    this.form.get('TT_ESTO_MNMO').reset()
    this.form.get('TT_ESTO_MXMO').reset()
    this.form.get('ID_TEIN_ESTO_PROD').setValue(produto.ID_TEIN_ESTO_PROD);
    this.form.get('NM_PROD').setValue(produto.NM_PROD);
    this.form.get('DS_UNID_MEDI').setValue(produto.DS_UNID_MEDI);
    if(produto.DS_UNID_MEDI == 'KG' ||  produto.DS_UNID_MEDI == 'TON' ){
      this.precisao = 3;
      return
    }
    this.precisao = 0;
    this.hideModal();
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

  postNiveisEstoque() {
    let params = JSON.parse(JSON.stringify(this.form.getRawValue())) ;
    this.loadingNavBar = true;
    this.nivelEstoqueService
      .postNiveisEstoque(params)
      .pipe(
        finalize(() => {
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
          this.pnotify.error();
        }
      );
  }
}
