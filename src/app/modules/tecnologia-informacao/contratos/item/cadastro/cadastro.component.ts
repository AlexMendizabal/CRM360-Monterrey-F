import { TecnologiaInformacaoEstoqueMovimentacoesService } from './../../../estoque/movimentacoes/services/movimentacoes.service';
import { TecnologiaInformacaoEstoqueService } from './../../../estoque/services/estoque.service';
import { ITecnologiaInformacaoEstoqueProduto } from './../../../estoque/produtos/models/produto';
import { TecnologiaInformacaoFuncionariosService } from './../../services/funcionarios.service';
import { TecnologiaInformacaoCadastroContratoService } from './../../contrato/services/contrato.service';
import { ITecnologiaInformacaoContrato } from './../../contrato/models/contrato';
import { utilsBr } from 'js-brasil';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
//Services
import { TitleService } from 'src/app/shared/services/core/title.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TecnologiaInformacaoCadastroItemService } from '../services/item.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
//Bootstrap
import { BsDatepickerConfig, BsModalRef, BsModalService } from 'ngx-bootstrap';
//Angular
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
//interfaces
import { ITenconologiaInformacaoDocumento } from './../../contrato/models/documento';
import { ITecnologiaInformacaoItem } from './../models/item';
//rxjs
import { finalize, take, switchMap } from 'rxjs/operators';
import { Subscription, EMPTY, forkJoin } from 'rxjs';

@Component({
  selector: 'tecnologia-informacao-cadastros-item-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss'],
})
export class TecnologiaInformacaoCadastrosItemCadastroComponent
  implements OnInit {
  noResult: boolean;
  $activatedRouteSubscription: Subscription;
  breadCrumbTree: Array<any> = [];
  form: FormGroup;
  appTitle: string;
  modalRef: BsModalRef;
  formPesquisaItem: FormGroup;
  formPesquisaFuncionario: FormGroup;
  formEnvioEstoque: FormGroup;
  formData: Array<FormData> = [];
  bsConfig: Partial<BsDatepickerConfig>;

  //loading
  loading = false;
  loadingProduto: boolean;
  loadingContrato: boolean;
  loadingFuncionario: boolean;
  // loadingMoeda: boolean;
  loadingItens = false;
  loadingCcu: boolean;
  loadingNavBar = false;
  anexosLoaded: boolean = false;

  //Interfaces
  documentos: Partial<ITenconologiaInformacaoDocumento>[] = [];
  item: Array<ITecnologiaInformacaoItem>;
  produtos: ITecnologiaInformacaoEstoqueProduto[] = [];
  itens: Array<ITecnologiaInformacaoItem> = [];
  contrato: ITecnologiaInformacaoContrato[] = [];
  funcionarios = [];
  centroCusto = [];
  // tipoMoeda = [];

  constructor(
    private formBuilder: FormBuilder,
    private pnotify: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private confirmModalService: ConfirmModalService,
    private modalService: BsModalService,
    private titleService: TitleService,
    private estoqueService: TecnologiaInformacaoEstoqueService,
    private atividadesService: AtividadesService,
    private itemService: TecnologiaInformacaoCadastroItemService,
    private funcionarioService: TecnologiaInformacaoFuncionariosService,
    private contratos: TecnologiaInformacaoCadastroContratoService,
    private movimentacoesService: TecnologiaInformacaoEstoqueMovimentacoesService,
    private router: Router
  ) {}
  public MASKS = utilsBr.MASKS;

  ngOnInit(): void {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.setFormBuilder();
    this.onActivatedRoute();
    this.getContrato();
    this.getEstoqueItens();
    this.getCentroCusto();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  getEstoqueItens(params?: Partial<ITecnologiaInformacaoEstoqueProduto>) {
    const _params = params ?? {};
    _params.IN_STAT = '1';
    _params.IN_PAGI = '0';

    this.loadingProduto = true;
    this.estoqueService
      .getEstoqueItens(_params)
      .pipe(
        finalize(() => {
          this.loadingProduto = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.produtos = response.body['data'];
        }
      });
  }

  getContrato(params?: Partial<ITecnologiaInformacaoContrato>) {
    const _params = params ?? {};
    _params.IN_STAT = '1';

    this.loadingContrato = true;
    this.contratos
      .getContrato(_params)
      .pipe(
        finalize(() => {
          this.loadingContrato = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.contrato = response.body['data'];
          } else {
            this.contrato = [];
          }
        },
        (error) => {
          this.contrato = [];
        }
      );
  }

  getCentroCusto(params?) {
    this.loadingCcu = true;
    this.funcionarioService
      .getCentroCusto()
      .pipe(
        finalize(() => {
          this.loadingCcu = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.centroCusto = response.body['data'];
        }
      });
  }

  onActivatedRoute() {
    const _params = this.activatedRoute.snapshot.params;
    if (!_params.hasOwnProperty('id')) return;
    this.getItem({ ID_TECN_INFO_ITEM: _params['id'] });
    this.getDocumentos({ ID_TECN_INFO_ITEM: _params['id'], IN_STAT: '1' });
  }

  getItem(params?) {
    this.loading = true;
    this.itemService.getItem(params).subscribe(
      (response) => {
        if (response.status === 200) {
          this.loading = false;
          const _items = response.body['data'][0];
          this.form.patchValue(_items);
          this.formPesquisaItem.patchValue({
            buscarPor: 'ID_TECN_INFO_ITEM',
            pesquisa: _items.ID_TECN_INFO_ITEM_REFE,
          });
          this.getItens();
        }
      },
      (error) => {
        this.pnotify.error();
      }
    );
  }
  getItens() {
    const _obj = this.formPesquisaItem.value;
    const _params = {};
    if (_obj['pesquisa']) _params[_obj['buscarPor']] = _obj['pesquisa'];
    this.loadingItens = true;
    this.itemService
      .getItem(_params)
      .pipe(
        finalize(() => {
          this.loadingItens = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.itens = response.body['data'];
          } else {
            this.pnotify.notice('Nenhum registro encontrado!');
            this.itens = [];
          }
        },
        (error) => {
          this.pnotify.error();
        }
      );
  }

  getFuncionarios(params?) {
    const _obj = this.formPesquisaFuncionario.value;
    const _params = params ?? {};
    _params.CD_STAT_USUA = 1;
    if (_obj['pesquisa']) _params[_obj['buscarPor']] = _obj['pesquisa'];
    this.loadingFuncionario = true;
    this.funcionarioService
      .getFuncionario(_params)
      .pipe(
        finalize(() => {
          this.loadingFuncionario = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.funcionarios = response.body['data'];
          } else {
            this.pnotify.notice('Nenhum registro encontrado!');
            this.funcionarios = [];
          }
        },
        (error) => {
          this.pnotify.error();
          this.funcionarios = [];
        }
      );
  }

  setItem(item: ITecnologiaInformacaoItem) {
    this.getItens();
    this.form.get('ID_TECN_INFO_ITEM_REFE').setValue(item.ID_TECN_INFO_ITEM);
  }

  setFuncionario(funcionario: ITecnologiaInformacaoItem) {
    this.form.get('NR_MATR').setValue(funcionario.NR_MATR);
    this.form.get('NM_USUA').setValue(funcionario.NM_USUA);
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
        descricao: 'Contratos',
        routerLink: `/tecnologia-informacao/contratos/${id}`,
      },
      {
        descricao: 'Itens',
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
      CD_ITEM: [{value: null , disabled: true}, [Validators.required]],
      VL_ITEM: [null],
      ID_TEIN_ESTO_PROD: [null, [Validators.required]],
      ID_TECN_INFO_ITEM: [null],
      ID_TECN_INFO_ITEM_STAT: ['1', [Validators.required]],
      ID_TECN_INFO_CONT: [null],
      ID_TECN_INFO_ITEM_DOCU: [null],
      NR_MATR: [null],
      TP_MOVI:[null],
      ID_EMPR:[null],
      NM_USUA: [{value: null , disabled: true}],
      ID_TIPO_MOED: [null],
      ID_TECN_INFO_ITEM_REFE: [{value: null , disabled: true}],
      CD_CCU: [null],
      DS_OBSE: [null],
    });

    this.formPesquisaItem = this.formBuilder.group({
      buscarPor: ['CD_ITEM'],
      pesquisa: [null, Validators.required],
      ID_TECN_INFO_ITEM: [null],
      CD_ITEM: [null],
      NM_PROD: [null],
      ID_TECN_INFO_CONT: [null],
    });
    this.formPesquisaFuncionario = this.formBuilder.group({
      buscarPor: ['NM_FUNC'],
      pesquisa: [null, Validators.required],
      NR_MATR: [null],
      NM_FUNC: [null],
      NM_EMPR: [null],
      CD_USUA_CPF: [null],
      CD_USUA_RG: [null],
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


  postMovimentacoes() {
    this.loadingNavBar = true;
    let params = JSON.parse(JSON.stringify(this.form.getRawValue()));
    this.movimentacoesService
      .postMovimentacoes({...params,TP_MOVI:'SAIDA',TT_PROD:1})
      .subscribe(
        (response: any) => {
          if (response.status === 200) {
            this.pnotify.success();
            this.postItem()
          } else {
            this.loadingNavBar = false
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
  
  postItem() {
    this.loadingNavBar = true;
    let params = JSON.parse(JSON.stringify(this.form.getRawValue())) ;
    this.itemService.postItem(params).subscribe(
      (response: any) => {
        if (response.status === 200) {
          const _id = response.body['data']['message'];
          this.postDocumentos(_id);
          this.pnotify.success();
        } else {
          this.movimentacoesService.postMovimentacoes({...params,TP_MOVI:'ENTRADA',TT_PROD:1})
          this.pnotify.error('Nenhuma Movimentação foi realizada!');
        }
      },
      (error: any) => {
        this.pnotify.error();
      }
    );
  }

  setNumeroSerie(event){
    console.log(event)
    const cod = event?.CD_ITEM
    const codEmpr = event?.ID_EMPR
    this.form.get('CD_ITEM').setValue(cod)
    this.form.get('ID_EMPR').setValue(codEmpr)
  }

  postDocumentos(id) {
    let req = [];

    if (this.formData.length == 0) {
      this.form.reset();
      this.loadingNavBar = false;
      return;
    }

    this.formData.forEach((element, index) => {
      req.push(this.itemService.postDocumento(element, id));
    });

    forkJoin(req)
      .pipe(
        finalize(() => {
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          this.documentos = [];
          this.formData = [];
          this.pnotify.success(`Documentos salvos com sucesso`);
          this.form.reset();
          this.router.navigate(['../'], {
            relativeTo: this.activatedRoute,
          });
        },
        (error) => {
          this.pnotify.error('Erro ao salvar documentos');
        }
      );
  }

  putDocumento(documento: ITenconologiaInformacaoDocumento) {
    const [type, title, message, cancelTxt, okTxt] = [
      'inactivate',
      'Confirmar inativação',
      'Deseja realmente prosseguir com a inativação do registro?',
      'Cancelar',
      'Confirmar',
    ];

    this.confirmModalService
      .showConfirm(type, title, message, cancelTxt, okTxt)
      .pipe(
        take(1),
        switchMap((result) => {
          if (!result) return EMPTY;

          this.loadingNavBar = true;

          return this.itemService.putDocumento(documento);
        }),
        finalize(() => {
          this.loadingNavBar = false;
        })
      )
      .subscribe((response) => {
        this.pnotify.success('Documento atualizado com sucesso');
        this.getDocumentos({
          ID_TECN_INFO_ITEM: this.form.get('ID_TECN_INFO_ITEM').value,
          IN_STAT: '1',
        });
      });
  }

  getDocumentos(params?) {
    this.itemService.getDocumento(params).subscribe(
      (response) => {
        if (response.status === 200) {
          this.documentos = response.body['data'];
        } else {
          this.documentos = [];
        }
      },
      (error) => {
        this.documentos = [];
      }
    );
  }

  onRemove(documento: ITenconologiaInformacaoDocumento) {
    documento.IN_STAT = '0';
    this.putDocumento(documento);
  }

  appendFile(files: FileList) {
    if (files.length === 0) return;
    const fd = new FormData();
    fd.append('file', files[0]);
    this.formData.push(fd);
    this.documentos.push({ NM_DOCU: files[0]['name'] });
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
