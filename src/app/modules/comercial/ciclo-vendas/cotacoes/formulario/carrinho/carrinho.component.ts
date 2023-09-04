import { ILoteModel } from './../models/lote';
import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  SimpleChanges,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  FormControl,
} from '@angular/forms';
import { Subscription, EMPTY, Observable } from 'rxjs';
import { take, switchMap, finalize } from 'rxjs/operators';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { ComercialCicloVendasCotacoesFormularioService } from '../formulario.service';
import { ComercialCicloVendasCotacoesService } from '../../cotacoes.service';
import { ComercialCicloVendasCotacoesFormularioModalMaterialCalculoService } from '../modal/material/calculo/calculo.service';
import { ComercialCicloVendasCotacoesFormularioModalMaterialLoteService } from '../modal/material/lote/lote.service';
import { ComercialCicloVendasCotacoesFormularioModalMaterialDescontoService } from '../modal/material/desconto/desconto.service';
import { ComercialCicloVendasCotacoesFormularioModalMaterialComboService } from '../modal/material/combo/combo.service';

// Interfaces
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { JsonResponse } from 'src/app/models/json-response';
import { CardCounterConfig } from 'src/app/shared/templates/card-counter/models/config';
import { IMateriaisModel } from '../models/materiais';
import { ICarrinhoModel } from '../models/carrinho';
import { ISimilaridadeModel } from '../models/similaridade';
import { ICalculoModel } from '../models/calculo';
import { IDescontoCarrinhoModel, IDescontoModel } from '../models/descontos';


@Component({
  selector: 'comercial-ciclo-vendas-cotacoes-formulario-carrinho',
  templateUrl: './carrinho.component.html',
  styleUrls: ['./carrinho.component.scss'],
})
export class ComercialCicloVendasCotacoesFormularioCarrinhoComponent
  implements OnInit, OnDestroy {
  private subscriptionSubmit: Subscription;

  @Input('appTitle') appTitle: string;
  @Input('idReservado') idReservado: number;
  @Input('codCotacao') codCotacao: number;
  @Input('codCliente') codCliente: number;
  @Input('codEndereco') codEndereco: number;
  @Input('id_departamento') id_departamento: number;
  @Input('id_tipo_cliente') id_tipo_cliente: number;

  @Input('codFormaPagamento') codFormaPagamento: number;
  @Input('freteConta') freteConta: number;
  @Input('initialValue') initialValue: Array<ICarrinhoModel>;

  @Output('loaderNavbar')
  loaderNavbar: EventEmitter<boolean> = new EventEmitter();
  @Output('hasError') hasError: EventEmitter<boolean> = new EventEmitter();
  @Output('scrollTop') scrollTop: EventEmitter<boolean> = new EventEmitter();
  @Output('carrinho') carrinho: EventEmitter<Object> = new EventEmitter();

  @Output() resetRequested = new EventEmitter<void>();

  @ViewChild('scrollToCarrinho', {}) scrollToCarrinho: ElementRef;

  visualizar = false;
  showBloco3: boolean = true;

  subtitles: Array<Subtitles> = [
    {
      id: 1,
      text: 'Preço acima do mínimo',
      color: 'green',
    },
    {
      id: 2,
      text: 'Preço abaixo do mínimo',
      color: 'red',
    },
  ];

  tableHeadConfig: Partial<CustomTableConfig> = {
    border: false,
    small: false,
    theme: {
      color: 'white',
    },
  };

  tableBodyConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
    isFixed: true,
    border: false,
    small: false,
    hover: false,
    theme: {
      color: 'white',
    },
  };

  form: FormGroup;

  loteSubscription: Subscription;
  materiaisSubscription: Subscription;
  limparCarrinhoSubscription: Subscription;
  calculoSubscription: Subscription;
  descontoSubscription: Subscription;

  selectedCodEmpresa: number = null;

  descontoCarrinho: IDescontoCarrinhoModel = {
    tipo: null,
    desconto: null,
  };

  total = {
    quantidade: 0,
    qtdeItem: 0,
    qtdePecas: 0,
    quantidadeItem: 0,
    valor: 0,
    valorIpi: 0,
    valorIcms: 0,
    valorIcmsSt: 0,
    valorDescMaterial: 0,
    valorDescCarrinho: 0,
    valorTotalOri: 0,
    valorTotal: 0,
    valorTotalBruto: 0,
    valorProposta: 0,
    bruto: 0,
  };

  cardCounterConfig: Partial<CardCounterConfig> = {
    showDecimals: true,
    format: 'currency',
  };

  descuento_permitido: number = 0;
  id_presentacion: number = 0;
  swDescuentoPermitido = false;
  

  descuento: number = 0;

  canLoadRelacionados = false;
  materiaisRelacionados: number[];

  constructor(
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private confirmModalService: ConfirmModalService,
    private formularioService: ComercialCicloVendasCotacoesFormularioService,
    private cotacoesService: ComercialCicloVendasCotacoesService,
    private calculoService: ComercialCicloVendasCotacoesFormularioModalMaterialCalculoService,
    private loteService: ComercialCicloVendasCotacoesFormularioModalMaterialLoteService,
    private descontoService: ComercialCicloVendasCotacoesFormularioModalMaterialDescontoService,
    private comboService: ComercialCicloVendasCotacoesFormularioModalMaterialComboService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.submitSubscription();
    this.loteSubject();
    this.materiaisSubject();
    this.calculoSubject();
    this.descontoSubject();
    this.setFormBuilder();
    if (this.appTitle == 'visualizar cotizacion/pedido') {
      this.visualizar = true;
    }
    // this.checkPreviously();
  }

  ngOnDestroy(): void {
    this.subscriptionSubmit.unsubscribe();
    this.loteSubscription.unsubscribe();
    this.materiaisSubscription.unsubscribe();
    this.calculoSubscription.unsubscribe();
    this.descontoSubscription.unsubscribe();
    this.clearLocalStorage();
  }

  submitSubscription(): void {
    this.subscriptionSubmit = this.formularioService.notifySubmitObservable$.subscribe(
      (response: any) => {
        if (response) {
          if (this.form.valid) {
            this.carrinhoEmitter();
          } else {
            this.hasError.emit(true);
            this.pnotifyService.notice(
              'Preencha os valores de todos os materiais.'
            );
          }
        }
      }
    );
  }

  loteSubject(): void {
    this.loteSubscription = this.formularioService.loteSubject.subscribe(
      (response: any) => {
        this.onLoteSelecionado(response);
        this.loaderNavbar.emit(false);
      }
    );
  }

  materiaisSubject(): void {
    this.materiaisSubscription = this.formularioService.materiaisSubject.subscribe(
      (response: any) => {
        const materiais = this.formatMateriais(response);
        /*         (materiais);
         */      /*   ('materiales'); * */

        this.onAddMaterial(materiais);
      }
    );
  }

  limparCarrinhoSubject(): void {
    this.limparCarrinhoSubscription = this.formularioService.limparCarrinhoSubject.subscribe(
      (response: boolean) => {
        if (response === true) {
          this.onLimparCarrinho();
        }
      }
    );
  }

  calculoSubject(): void {
    this.calculoSubscription = this.formularioService.calculoSubject.subscribe(
      (calculo: ICalculoModel) => {
        const formArray = this.form.controls.materiais as FormArray;
        const formGroup = formArray.controls[calculo.index] as FormGroup;

        let qtdePecas: number;

        if (calculo.tipoLancamento == 6) {
          qtdePecas = 0;
        } else {
          qtdePecas = calculo.qtde;
        }

        if (
          calculo.tipoCalculo == 2 ||
          calculo.tipoCalculo == 4 ||
          calculo.tipoCalculo == 5
        ) {
          formGroup.controls.quantidade.setValue(calculo.tonelada);
          if (calculo.unidade == "To" || calculo.unidade == "Ton") {
            formGroup.controls.quantidadeItem.setValue(calculo.tonelada);
          } else {
            formGroup.controls.quantidadeItem.setValue(calculo.qtde);
          }
          formGroup.controls.qtdeItem.setValue(calculo.qtde);
          formGroup.controls.qtdePecas.setValue(qtdePecas);
          formGroup.controls.medida1.setValue(calculo.medida);
          formGroup.controls.valor.setValue(calculo.valorUnitario);
          formGroup.controls.percentualIpi.setValue(calculo.aliquotaIpi);
          formGroup.controls.valorIpi.setValue(calculo.valorIpi);
          formGroup.controls.percentualIcms.setValue(calculo.aliquotaIcms);
          formGroup.controls.valorIcms.setValue(calculo.valorIcms);
          formGroup.controls.valorIcmsSt.setValue(calculo.valorIcmsSt);
          formGroup.controls.valorTotalOri.setValue(calculo.valorItem
            //calculo.qtde * calculo.valorUnitario
          );
          formGroup.controls.nrPedidoCliente.setValue(calculo.nrPedidoCliente);
          formGroup.controls.codItemPedidoCliente.setValue(calculo.codItemPedidoCliente);
          formGroup.controls.codProdutoCliente.setValue(calculo.codProdutoCliente);
          formGroup.controls.valorTotal.setValue(calculo.valorTotal
            //calculo.qtde * calculo.valorUnitario + calculo.valorIpi
          );
          formGroup.controls.valorBaseIcmsSt.setValue(calculo.valorBaseIcmsSt);
          formGroup.controls.aliquotaReducaoIcms.setValue(calculo.aliquotaReducaoIcms);
          formGroup.controls.nrPedidoCliente.setValue(calculo.nrPedidoCliente);
          formGroup.controls.codItemPedidoCliente.setValue(calculo.codItemPedidoCliente);
          formGroup.controls.codProdutoCliente.setValue(calculo.codProdutoCliente);
        } else {
          formGroup.controls.quantidade.setValue(calculo.tonelada);
          formGroup.controls.quantidadeItem.setValue(calculo.tonelada);
          // @ts-ignore: Ignorar error TS2339
          formGroup.controls.qtdeItem.setValue(calculo.cantidad);
          formGroup.controls.qtdePecas.setValue(qtdePecas);
          formGroup.controls.medida1.setValue(calculo.medida);
          formGroup.controls.valor.setValue(calculo.valorUnitario);
          formGroup.controls.percentualIpi.setValue(calculo.aliquotaIpi);
          formGroup.controls.valorIpi.setValue(calculo.valorIpi);
          formGroup.controls.percentualIcms.setValue(calculo.aliquotaIcms);
          formGroup.controls.valorIcms.setValue(calculo.valorIcms);
          formGroup.controls.valorIcmsSt.setValue(calculo.valorIcmsSt);
          formGroup.controls.valorTotalOri.setValue(calculo.valorItem
            //calculo.tonelada * calculo.valorUnitario
          );
          formGroup.controls.valorTotal.setValue(calculo.valorTotal
            //calculo.tonelada * calculo.valorUnitario + calculo.valorIpi
          );
          formGroup.controls.valorBaseIcmsSt.setValue(calculo.valorBaseIcmsSt);
          formGroup.controls.aliquotaReducaoIcms.setValue(calculo.aliquotaReducaoIcms);
          formGroup.controls.nrPedidoCliente.setValue(calculo.nrPedidoCliente);
          formGroup.controls.codItemPedidoCliente.setValue(calculo.codItemPedidoCliente);
          formGroup.controls.codProdutoCliente.setValue(calculo.codProdutoCliente);
          // @ts-ignore: Ignorar error TS2339
          formGroup.controls.valorTotalBruto.setValue(calculo.valorTotalBruto);
          formGroup.controls.cantidad.setValue(2);
          // @ts-ignore: Ignorar error TS2339
          formGroup.controls.id_presentacion.setValue(calculo.id_presentacion);

        }

        this.onCalcularTotais(true);
      }
    );
  }

  descontoSubject(): void {
    this.descontoSubscription = this.formularioService.descontoSubject.subscribe(
      (desconto: IDescontoModel) => {
        const formArray = this.form.controls.materiais as FormArray;
        /* ('descuento')
        (desconto) */


        /*  console.log(desconto)
         desconto.aplicarDesconto = 'percentual'; */

        if (desconto.aplicarDesconto === 'carrinho') {
          if (desconto.desconto === 0) {
            this.resetDescontoCarrinho();
          } else {
            this.descontoCarrinho = {
              tipo: desconto.tipo,
              desconto: desconto.desconto,
            };
          }
        } else if (desconto.aplicarDesconto === 'material') {
          const formGroup = formArray.controls[desconto.index] as FormGroup;
          const valor = formGroup.value.valorTotalBruto;
          let valorDesc = 0;

          if (desconto.tipo === 'valor') {
            valorDesc = desconto.desconto;
            formGroup.controls.percentualDesc.setValue(
              (100 * desconto.desconto) / valor
            );
            /* (formGroup.controls.percentualDesc) */
          } else if (desconto.tipo === 'percentual') {
            valorDesc = valor - ((100 - desconto.desconto) / 100) * valor;
           /*  console.log(valorDesc);
            console.log(desconto);
            console.log(valor); */

            formGroup.controls.percentualDesc.setValue(desconto.desconto);
          }

          /* const quantidade = formGroup.value.quantidade; */
          const valorTotal = valor - valorDesc;

          formGroup.controls.tipoDesc.setValue(desconto.tipo);
          formGroup.controls.valorDesc.setValue(valorDesc);
          formGroup.controls.valorTotal.setValue(valorTotal);
          // @ts-ignore: Ignorar error TS2339
          formGroup.controls.descuento_permitido.setValue(desconto.descuento_permitido);
          /* formGroup.controls.descuento_permitido.setValue(desconto.descuento_permitido); */
          /*  ('form group');
 
           (formGroup); */
          /* if (formGroup.controls.percentualDesc > formGroup.controls.descuento_permitido) {
            formGroup.controls.swDescuentoPermitido = true;
          } */
          /*  this.descuento_permitido = desconto.descuento_permitido;
           /* ('descuentos');
           (desconto.desconto)
           (desconto.descuento_permitido) */
          /*   this.swDescuentoPermitido = false;
            if (desconto.desconto > this.descuento_permitido) {
              this.swDescuentoPermitido = true;
            } */
        }
        this.onCalcularTotais(true);
      }
    );
  }

  carrinhoEmitter(): void {
    this.hasError.emit(false);

    this.carrinho.emit({
      materiais: this.form.value.materiais,
      total: this.total,
    });
    /*  (this.form.value.materiais) */
  }

  setFormBuilder(): void {
    this.form = this.formBuilder.group({
      materiais: this.formBuilder.array([]),
    });

    this.checkInitialValues();
  }

  checkInitialValues(): void {
    if (this.initialValue.length > 0) {
      this.onAddMaterial(this.initialValue);
    }
  }

  get materiais(): FormArray {
    return this.form.get('materiais') as FormArray;
  }

  onAddMaterial(materiais: Array<ICarrinhoModel>): void {
    /* (materiais) */
    if (materiais.length > 0) {
      let hasError = false,
        qtdeAdicionados = 0;

      for (let i = 0; i < materiais.length; i++) {
        /* (materiais[i]); */
        if (
          (this.selectedCodEmpresa === null ||
            this.selectedCodEmpresa === materiais[i].codEmpresa) &&
          hasError === false
        ) {

          let quantidadeItem: number;

          if (materiais[i].unidade == 'To' || materiais[i].unidade == 'Ton') {
            quantidadeItem = materiais[i].quantidade;
          } else {
            quantidadeItem = materiais[i].qtdeItem;
          }
          /* Aqui para cargar al modal */
          /*     ('crear');
    
              (materiais[i]); */
          // if (this.checkMaterialExists(materiais[i]) === false) {
          /* ('datos')
          (materiais[i]) */
          /* ('materiales');
          () */
         /*  console.log(materiais) */
          this.materiais.push(
            this.formBuilder.group({
              codCotacao: [materiais[i].codCotacao],
              codDeposito: [materiais[i].codDeposito],
              // @ts-ignore: Ignorar error TS2339
              id_almacen_carrito: [materiais[i].id_almacen_carrito],
              codEmpresa: [materiais[i].codEmpresa],
              codMaterial: [materiais[i].codMaterial],
              idReservado: [materiais[i].idReservado],
              fatorMultiplo: [materiais[i].fatorMultiplo],
              materialAssociado: [materiais[i].materialAssociado],
              medida1: [materiais[i].medida1],
              medida2: [materiais[i].medida2],
              nomeDeposito: [materiais[i].nomeDeposito],
              nomeEmpresa: [materiais[i].nomeEmpresa],
              nomeMaterial: [materiais[i].nomeMaterial],
              percentualDesc: [materiais[i].percentualDesc],
              percentualIcms: [materiais[i].percentualIcms],
              percentualIpi: [materiais[i].percentualIpi],
              // @ts-ignore: Ignorar error TS2339
              pesoEspecifico: [materiais[i].peso],
              quantidade: [materiais[i].quantidade, [Validators.required]],
              quantidadeItem: [quantidadeItem],
              qtdeItem: [
                materiais[i].qtdeItem === materiais[i].quantidade
                  ? 0
                  : materiais[i].qtdeItem
              ],
              qtdePecas: [materiais[i].qtdePecas],
              unidade: [materiais[i].unidade],
              // @ts-ignore: Ignorar error TS2339
              id_unidad: [materiais[i].id_unidad],

              tipoDesc: [materiais[i].tipoDesc],
              valor: [materiais[i].valor, [Validators.required]],
              valorDesc: [materiais[i].valorDesc],
              valorIcms: [materiais[i].valorIcms, [Validators.required]],
              valorIcmsSt: [
                materiais[i].valorIcmsSt != null
                  ? materiais[i].valorIcmsSt
                  : 0,
                [Validators.required],
              ],
              valorIpi: [materiais[i].valorIpi, [Validators.required]],
              valorTotal: [materiais[i].valorTotal, [Validators.required]],
              // @ts-ignore: Ignorar error TS2339
              valorTotalBruto: [materiais[i].valorTotalBruto],
              valorTotalOri: [materiais[i].valorTotalOri],
              valorMaterialBarra: [materiais[i].valorMaterialBarra],
              valorMaterialContrato: [materiais[i].valorMaterialContrato],
              valorMaterialPreco: [materiais[i].valorMaterialPreco],
              valorServicoApsContrato: [materiais[i].valorServicoApsContrato],
              valorServicoContrato: [materiais[i].valorServicoContrato],
              valorUnit: [materiais[i].valorUnit],
              valorBaseIcmsSt: [materiais[i].valorBaseIcmsSt],
              aliquotaReducaoIcms: [materiais[i].aliquotaReducaoIcms],
              controladoPorLote: [materiais[i].controladoPorLote],
              sequenciaLote: [materiais[i].sequenciaLote],
              loteFabricacao: [materiais[i].loteFabricacao],
              estoqueLote: [materiais[i].estoqueLote],
              nrPedidoCliente: [materiais[i].nrPedidoCliente],
              codItemPedidoCliente: [materiais[i].codItemPedidoCliente],
              codProdutoCliente: [materiais[i].codProdutoCliente],
              // @ts-ignore: Ignorar error TS2339
              precio: [materiais[i].precio],
              // @ts-ignore: Ignorar error TS2339
              codigo_material: [materiais[i].codigo_material],
              // @ts-ignore: Ignorar error TS2339
              descuento: [materiais[i].descuento],
              descuento_permitido: [this.descuento_permitido],
              // @ts-ignore: Ignorar error TS2339
              id_presentacion: [materiais[i].id_presentacion_material],
              cantidad: [2],
              id_departamento: [this.id_departamento],
              id_tipo_cliente: [this.id_tipo_cliente],
              /*  id_presentacion: form[] */
            })
          );

          this.setSelectedCodEmpresa(materiais[i].codEmpresa);
          qtdeAdicionados++;
          // }
        } else {
          hasError = true;
        }
      }

      if (hasError === true) {
        this.pnotifyService.notice(
          'Favor adicionar materiais do mesmo depósito.'
        );
      }

      if (qtdeAdicionados > 0) {
        this.setLocalStorage(this.form.value.materiais);
        this.onCalcularTotais(true);
        this.setMateriaisRelacionados(this.form.value.materiais);
        setTimeout(() => {
          this.canLoadRelacionados = true;
        }, 500);
      }
    }
  }

  // checkMaterialExists(material: ICarrinhoModel): boolean {
  //   return this.form.value.materiais.some((el: ICarrinhoModel) => {
  //     return el.codMaterial === material.codMaterial;
  //   });
  // }

  setMateriaisRelacionados(materiais: ICarrinhoModel[]): void {
    if (materiais.length > 0) {
      let materiaisRelacionados: any = {
        codMaterial: '',
      };

      materiais.map(
        (material) =>
          (materiaisRelacionados['codMaterial'] = material.codMaterial)
      );

      this.materiaisRelacionados = materiaisRelacionados;
    }
  }

  onAssocMaterial(material: ICarrinhoModel): void {
    if (material.materialAssociado === 1) {
      this.comboService.showModal(material, this.codCliente, this.codEndereco, this.codFormaPagamento, this.freteConta);
    }
  }

  onCalcMaterial(index: number, material: ICarrinhoModel): void {

    /* (material) */
    this.calculoService.showModal(
      index,
      material,
      this.codCliente,
      1,
      this.codEndereco
    );

    /*     ('pruebas');
        (material) */

    /* if (material.controladoPorLote == 1) {
      if (material.sequenciaLote == null) {
        this.pnotifyService.notice("Selecione o lote do material");
      } else {
        if (this.codCliente !== null) {
          this.calculoService.showModal(
            index,
            material,
            this.codCliente,
            this.codFormaPagamento,
            this.codEndereco
          );
        } else {
          this.scrollTop.emit(true);
        }
      }
    } else {
      if (this.codCliente !== null) {
        (index);
        this.calculoService.showModal(
          index,
          material,
          this.codCliente,
          this.codFormaPagamento,
          this.codEndereco
        );
      } else {
        this.scrollTop.emit(true);
      }
    } */
  }

  onSelecionaLote(index: number, material: ICarrinhoModel): void {
    this.loaderNavbar.emit(true);
    if (this.codCliente !== null) {
      this.loteService.showModal(
        index,
        material
      );
    } else {
      this.scrollTop.emit(true);
    }
  }

  onDescontoMaterial(index: number, material: ICarrinhoModel): void {

    /*   ("onDescontoMaterial")
       (material)  */
    //Buscar descuento aplicado al cliente
    (material);
    const params = {
      // @ts-ignore: Ignorar error TS2339
      id_tipo_cliente: material.id_tipo_cliente,
      cantidad: material.qtdeItem,
      id_material: material.codMaterial,
      // @ts-ignore: Ignorar error TS2339
      id_departamento: material.id_departamento,
    }



    this.cotacoesService.descuentoCliente(params)
      .subscribe(
        (response: JsonResponse) => {
          // @ts-ignore: Ignorar error TS2339
          if (response.responseCode == 200) {
            /* (response); */
            // @ts-ignore: Ignorar error TS2339
            this.descuento = response.result.descuento;
            this.descuentoModal(index, material, this.descuento)

          } else {
            this.pnotifyService.error();
            this.descuentoModal(index, material, this.descuento)
          }
        },
        (error: any) => {
          this.pnotifyService.error();
          this.descuentoModal(index, material, this.descuento)
        }
      );


  }

  descuentoModal(index, material, descuento) {
    if (material.valorTotal > 0) {
      this.descontoService.descontoMaterial(index, material, descuento);
    } else {
      this.pnotifyService.notice(
        'Realice el calculo de cantidades para continuar '
      );
    }
  }
  onDescontoCarrinho(): void {
    let hasError = false;
    const materiais: Array<ICarrinhoModel> = this.form.value.materiais;

    for (let i = 0; i < materiais.length; i++) {
      if (materiais[i].valorTotal === 0) {
        hasError = true;
      }
    }

    if (hasError === false) {
      this.descontoService.descontoCarrinho(this.descontoCarrinho);
    } else {
      this.pnotifyService.notice(
        'Realize o cálculo de quantidades para continuar.'
      );
    }
  }

  onReset(): any {
    this.confirmReset().subscribe(
      (response: boolean) => {
        if (response === true) {
          this.onLimparCarrinho();
        }
      },
      (error: any) => {
        this.pnotifyService.error();
      }
    );
  }

  onLoteSelecionado(lote: ILoteModel): void {
    const formArray = this.form.controls.materiais as FormArray;
    const formGroup = formArray.controls[lote.index] as FormGroup;

    formGroup.controls.sequenciaLote.setValue(lote.sequenciaLote);
    formGroup.controls.estoqueLote.setValue(lote.estoque);
    formGroup.controls.quantidade.setValue(lote.estoque);
    formGroup.controls.loteFabricacao.setValue(lote.loteFabricacao);

    this.setLocalStorage(this.form.value.materiais);

  }
  limpiarCarrito(): void {
    const materiais = this.form.get('materiais') as FormArray;
    materiais.clear();
  }
  
  onLimparCarrinho(): void {
    const materiais = this.form.get('materiais') as FormArray;
    materiais.clear();

    this.setSelectedCodEmpresa(null);
    this.onCalcularTotais(true);
    this.clearLocalStorage();
  }

  onDeleteMaterial(index: number, material: IMateriaisModel): void {
    if (this.appTitle == 'Editar cotizacion/pedido') {
      this.confirmDelete()
        .asObservable()
        .pipe(
          take(1),
          switchMap((result) =>
            result ? this.deleteMaterialCotacao(material) : EMPTY
          ),
          finalize(() => {
            this.loaderNavbar.emit(false);
          })
        )
        .subscribe(
          (response: JsonResponse) => {
            if (response.success === true) {
              this.materiais.removeAt(index);
              this.onCalcularTotais(true);
              this.setLocalStorage(this.form.value.materiais);

              if (this.form.value.materiais.length === 0) {
                this.setSelectedCodEmpresa(null);
              }
            } else {
              this.pnotifyService.error();
            }
          },
          (error: any) => {
            this.pnotifyService.error();
          }
        );
    } else {
      this.confirmDelete()
        .pipe(
          finalize(() => {
            this.loaderNavbar.emit(false);
          })
        )
        .subscribe(
          (response: boolean) => {
            if (response === true) {
              this.materiais.removeAt(index);
              this.onCalcularTotais(true);
              this.setLocalStorage(this.form.value.materiais);

              if (this.form.value.materiais.length === 0) {
                this.setSelectedCodEmpresa(null);
              }
            } else {
              this.pnotifyService.error();
            }
          },
          (error: any) => {
            this.pnotifyService.error();
          }
        );
    }
  }

  confirmDelete(): any {
    return this.confirmModalService.showConfirm(
      'delete',
      'Confirmar eliminación',
      'Esta seguro de retirar este ítem de la lista? ',
      'Cancelar',
      'Confirmar'
    );
  }

  confirmReset(): any {
    return this.confirmModalService.showConfirm(
      '',
      'Limpiar resumen de cotización',
      'Desea realmente proseguir con esta acción?',
      'Cancelar',
      'Confirmar'
    );
  }

  deleteMaterialCotacao(params: any): Observable<any> {
    this.loaderNavbar.emit(true);
    return this.cotacoesService.deleteMaterialCotacao(
      this.setParamsDeleteMaterial(params)
    );
  }

  setParamsDeleteMaterial(params: any): Object {
    let _params: any = {};

    _params.codDeposito = params.codDeposito;
    _params.nrPedido = this.codCotacao;
    _params.codMaterial = params.codMaterial;

    return _params;
  }

  formatMateriais(
    data: Array<IMateriaisModel & ISimilaridadeModel>
  ): Array<ICarrinhoModel> {
    let materiais = [];
    /*  ('data')
     (data); */
    /*(data); */

    for (let index = 0; index < data.length; index++) {
      let material = {
        codCotacao: this.codCotacao !== null ? this.codCotacao : null,
        // @ts-ignore: Ignorar error TS2339
        codDeposito: data[index].nombre_almacen,
        // @ts-ignore: Ignorar error TS2339
        id_almacen_carrito: data[index].id_almacen,
        codEmpresa: data[index].codEmpresa,
        // @ts-ignore: Ignorar error TS2339
        codMaterial: data[index].id_material,
        idReservado: this.idReservado !== null ? this.idReservado : null,
        fatorMultiplo: data[index].fatorMultiplo,
        materialAssociado: data[index].materialAssociado,
        medida1: data[index].medida1,
        medida2: data[index].medida2,
        nomeDeposito: data[index].nomeDeposito,
        nomeEmpresa: data[index].nomeEmpresa,
        // @ts-ignore: Ignorar error TS2339
        nomeMaterial: data[index].nombre_material,
        percentualDesc: 0,
        percentualIcms: data[index].percentualIcms,
        percentualIpi: data[index].percentualIpi,
        // @ts-ignore: Ignorar error TS2339
        pesoEspecifico: data[index].peso,
        quantidade: 0,
        quantidadeItem: 0,
        qtdeItem: 0,
        qtdePecas: 0,
        // @ts-ignore: Ignorar error TS2339
        unidade: data[index].unidad,
        // @ts-ignore: Ignorar error TS2339
        id_unidad: data[index].id_unidad,
        tipoDesc: null,
        valor: 0,
        valorDesc: 0,
        valorIcms: 0,
        valorIcmsSt: 0,
        valorIpi: 0,
        valorTotal: 0,
        valorTotalBruto: 0,
        valorTotalOri: 0,
        valorMaterialBarra: data[index].valorMaterialBarra,
        valorMaterialContrato: data[index].valorMaterialContrato,
        valorMaterialPreco: data[index].valorMaterialPreco,
        valorServicoApsContrato: data[index].valorServicoApsContrato,
        valorServicoContrato: data[index].valorServicoContrato,
        valorUnit: data[index].valorUnit,
        sequenciaLote: null,
        loteFabricacao: null,
        controladoPorLote: data[index].controladoPorLote,
        estoqueLote: 0,
        // @ts-ignore: Ignorar error TS2339
        precio: data[index].precio,
        // @ts-ignore: Ignorar error TS2339
        codigo_material: data[index].codigo_material,
        // @ts-ignore: Ignorar error TS2339
        peso: data[index].peso,
        // @ts-ignore: Ignorar error TS2339
        descuento: data[index].descuento,
        // @ts-ignore: Ignorar error TS2339
        unidad: data[index].unidad,
        id_presentacion_material: 3,
        id_linea: data[index].id_linea,
        nombre_linea: data[index].nombre_linea,
        largo_material: data[index].largo_material
      };

      materiais.push(material);
    }
    /* (materiais); */
    return materiais;
  }

  checkPreviously(): void {
    const _localStorage = localStorage.getItem('materiais');

    if (_localStorage !== null) {
      const materiais = JSON.parse(atob(_localStorage));

      if (
        materiais.length > 0 &&
        this.idReservado !== null &&
        this.idReservado == materiais[0].idReservado
      ) {
        this.confirmModalService
          .showConfirm(
            null,
            `#${this.idReservado} / Cotizacion no finalizada`,
            'Parece que esta cotizacion se ha iniciado y no se ha finalizado. Desea recuperar los materiales de la cotizacion?',
            'Cancelar',
            'Confirmar'
          )
          .subscribe((response: boolean) =>
            response
              ? this.onConfirmAddMaterial(materiais)
              : this.clearLocalStorage()
          );
      }
    }
  }

  onConfirmAddMaterial(materiais: Array<ICarrinhoModel>): void {
    this.onAddMaterial(materiais);

    setTimeout(() => {
      this.scrollToCarrinho.nativeElement.scrollIntoView({
        behavior: 'instant',
      });
    }, 500);
  }

  setLocalStorage(data: Array<ICarrinhoModel>): void {
    if (this.idReservado !== null) {
      this.clearLocalStorage();
      localStorage.setItem('materiais', btoa(JSON.stringify(data)));
    }
  }

  clearLocalStorage(): void {
    localStorage.removeItem('materiais');
  }

  onCalcularTotais(emitter: boolean): void {
    const materiais = this.form.value.materiais;

    this.total.quantidade = 0;
    this.total.qtdeItem = 0;
    this.total.qtdePecas = 0;
    this.total.valor = 0;
    this.total.valorIcms = 0;
    this.total.valorIcmsSt = 0;
    this.total.valorIpi = 0;
    this.total.valorDescMaterial = 0;
    this.total.valorDescCarrinho = 0;
    this.total.valorTotalOri = 0;
    this.total.valorTotal = 0;
    this.total.valorProposta = 0;
    // @ts-ignore: Ignorar error TS2339
    this.total.monedaLocal = 0;
    this.total.bruto = 0;
    // @ts-ignore: Ignorar error TS2339
    this.total.total = 0;
    // @ts-ignore: Ignorar error TS2339
    this.total.impuesto = 0;

    if (materiais.length > 0) {
      /*  ('aqui_material')
        */

      /* (materiais) */
      for (let index = 0; index < materiais.length; index++) {
        this.total.quantidade += materiais[index].quantidade;
        this.total.qtdeItem += materiais[index].qtdeItem;
        this.total.qtdePecas += materiais[index].qtdePecas;
        this.total.valor += materiais[index].valor;
        this.total.valorIcms += materiais[index].valorIcms;
        this.total.valorIcmsSt += materiais[index].valorIcmsSt;
        this.total.valorIpi += materiais[index].valorIpi;
        this.total.valorDescMaterial += materiais[index].valorDesc;
        this.total.valorTotalOri += materiais[index].valorTotalOri;
        this.total.valorTotal += materiais[index].valorTotal;
        this.total.bruto += materiais[index].valorTotalBruto;
        // @ts-ignore: Ignorar error TS2339
        this.total.impuesto = this.total.valorTotal * 0.13;


      }

      /* (this.total.bruto); */

      if (this.descontoCarrinho.tipo !== null) {
        if (this.descontoCarrinho.tipo === 'valor') {
          this.total.valorDescCarrinho =
            this.total.valorDescMaterial - this.descontoCarrinho.desconto;

          this.total.valorProposta =
            this.total.valorTotal +
            // this.total.valorIpi -
            this.total.valorDescCarrinho;
            // @ts-ignore: Ignorar error TS2339
          this.total.monedaLocal = (this.total.valorProposta * 6.96).toFixed(2);

        } else if (this.descontoCarrinho.tipo === 'percentual') {
          this.total.valorTotal =
            ((100 - this.descontoCarrinho.desconto) / 100) *
            this.total.valorTotal;
          this.total.valorDescCarrinho =
            /*  this.total.valorDescMaterial +
             (this.total.valorTotalOri - this.total.valorTotal); */

            this.total.valorProposta =
            this.total.valorTotal +
            // this.total.valorIpi -
            this.total.valorDescCarrinho;
            // @ts-ignore: Ignorar error TS2339
          this.total.monedaLocal = (this.total.valorProposta * 6.96).toFixed(2);

        } else {
          this.total.valorDescCarrinho = this.total.valorDescMaterial;

          this.total.valorProposta = this.total.valorTotal;
          // @ts-ignore: Ignorar error TS2339
          this.total.monedaLocal = (this.total.valorProposta * 6.96).toFixed(2);

          // + this.total.valorIpi
        }
      } else {
        this.total.valorDescCarrinho = this.total.valorDescMaterial;

        this.total.valorProposta = this.total.valorTotal;
        // @ts-ignore: Ignorar error TS2339
        this.total.monedaLocal = (this.total.valorProposta * 6.96).toFixed(2);

        /* console.log(this.total) */
      }


      this.setLocalStorage(this.form.value.materiais);
    }

    if (emitter === true) {
      this.carrinhoEmitter();
    }
  }

  resetDescontoCarrinho(): void {
    this.descontoCarrinho = {
      tipo: null,
      desconto: null,
    };
  }

  onNestedFieldError(formGroup: string, index: number, field: string) {
    if (this.onNestedFieldInvalid(formGroup, index, field)) {
      return 'is-invalid';
    }

    return '';
  }

  onNestedFieldInvalid(formGroup: string, index: number, field: any) {
    let nestedForm: any = this.form.controls[formGroup];
    field = nestedForm.controls[index].get(field);

    return field.status == 'INVALID' && field.touched;
  }

  onNestedFieldRequired(formGroup: string, index: number, field: string) {
    let required = false;
    let formControl = new FormControl();
    let nestedForm: any = this.form.controls[formGroup];

    if (nestedForm.controls[index].get(field).validator) {
      let validationResult = nestedForm.controls[index]
        .get(field)
        .validator(formControl);
      required =
        validationResult !== null && validationResult.required === true;
    }

    if (required) {
      return 'is-required';
    }
  }

  classStatusBorder(material: ICarrinhoModel): string {
    let borderClass: string;

    if (Math.floor(material.valorUnit * 100) / 100 > material.valor) {
      borderClass = 'border-danger';
    } else {
      borderClass = 'border-success';
    }

    return borderClass;
  }

  checkValorMaterial(material: ICarrinhoModel): boolean {
    let validator: boolean;

    if (Math.floor(material.valorUnit * 100) / 100 > material.valor) {
      validator = false;
    } else {
      validator = true;
    }

    return validator;
  }

  columSize(key: string): string {
    let size: number;

    switch (key) {
      case 'index':
        size = 3;
        break;
      case 'nomeMaterial':
        size = 18;
        break;
      case 'quantidade':
        size = 8;
        break;
      case 'qtdeItem':
        size = 8;
        break;
      case 'valor':
        size = 8;
        break;
      case 'valorIcms':
        size = 8;
        break;
      case 'valorIpi':
        size = 8;
        break;
      case 'valorDesc':
        size = 8;
        break;
      case 'valorTotal':
        size = 8;
        break;
      case 'nomeDeposito':
        size = 9;
        break;
      case 'buttons':
        size = 13;
        break;
    }

    return `${size}%`;
  }

  setSelectedCodEmpresa(codEmpresa: number): void {
    this.selectedCodEmpresa = codEmpresa;
  }

  onShowBloco() {
    this.showBloco3 = !this.showBloco3;
  }

}
