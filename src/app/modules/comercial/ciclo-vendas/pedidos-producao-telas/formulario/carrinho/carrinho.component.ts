import { ComercialCicloVendasPedidosProducaoTelasFormularioService } from './../formulario.service';
import { ComercialCicloVendasCotacoesFormularioModalMaterialComboService } from './../../../cotacoes/formulario/modal/material/combo/combo.service';
import { ComercialCicloVendasPedidosProducaoTelasService } from './../../pedidos-producao-telas.service';
import { ISimilaridadeModel } from './../../../cotacoes/formulario/models/similaridade';
import { IMateriaisModel } from './../../../cotacoes/formulario/models/materiais';
import { ICalculoModel } from './../../../cotacoes/formulario/models/calculo';
import { ComercialCicloVendasCotacoesFormularioModalMaterialDescontoService } from './../../../cotacoes/formulario/modal/material/desconto/desconto.service';
import { ComercialCicloVendasCotacoesFormularioService } from './../../../cotacoes/formulario/formulario.service';
import { IDescontoCarrinhoModel, IDescontoModel } from './../../../cotacoes/formulario/models/descontos';
import { ICarrinhoModel } from './../../../cotacoes/formulario/models/carrinho';
import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild
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

// Interfaces
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { JsonResponse } from 'src/app/models/json-response';
import { CardCounterConfig } from 'src/app/shared/templates/card-counter/models/config';
import { ComercialCicloVendasPedidosProducaoTelasFormularioModalMaterialCalculoService } from '../modal/material/calculo/calculo.service';
import { isThisHour } from 'date-fns';

@Component({
  selector: 'comercial-ciclo-vendas-pedidos-producao-telas-formulario-carrinho',
  templateUrl: './carrinho.component.html',
  styleUrls: ['./carrinho.component.scss'],
})
export class ComercialCicloVendasPedidosProducaoTelasFormularioCarrinhoComponent
  implements OnInit, OnDestroy {
  private subscriptionSubmit: Subscription;

  @Input('idReservado') idReservado: number;
  @Input('codCotacao') codCotacao: number;
  @Input('codCliente') codCliente: number;
  @Input('initialValue') initialValue: Array<ICarrinhoModel>;
  @Input('dadosCalculo') dadosCalculo: Array<any>;


  @Output('loaderNavbar') loaderNavbar: EventEmitter<
    boolean
  > = new EventEmitter();
  @Output('hasError') hasError: EventEmitter<boolean> = new EventEmitter();
  @Output('scrollTop') scrollTop: EventEmitter<boolean> = new EventEmitter();
  @Output('carrinho') carrinho: EventEmitter<Object> = new EventEmitter();

  @ViewChild('scrollToCarrinho', {}) scrollToCarrinho: ElementRef;

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

  // quantidade: Subscription;
  // peso: Subscription;


  materiaisSubscription: Subscription;
  limparCarrinhoSubscription: Subscription;
  calculoSubscription: Subscription;
  descontoSubscription: Subscription;
  dataSubscription: Subscription;

  deposito: string;
  nrPedido: number;
  nrItem: number;
  newMaterial: boolean;

  selectedCodEmpresa: number = null;

  descontoCarrinho: IDescontoCarrinhoModel = {
    tipo: null,
    desconto: null,
  };

  total = {
    quantidade: 0,
    pesoEspecifico: 0,
    valor: 0,
    valorIpi: 0,
    valorIcms: 0,
    valorDescMaterial: 0,
    valorDescCarrinho: 0,
    valorTotalOri: 0,
    valorTotal: 0,
    valorProposta: 0,
  };

  cardCounterConfig: Partial<CardCounterConfig> = {
    showDecimals: true,
    format: 'currency',
  };


  constructor(
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private confirmModalService: ConfirmModalService,
    private formularioService: ComercialCicloVendasCotacoesFormularioService,
    private calculoService: ComercialCicloVendasPedidosProducaoTelasFormularioModalMaterialCalculoService,
    private descontoService: ComercialCicloVendasCotacoesFormularioModalMaterialDescontoService,
    private comboService: ComercialCicloVendasCotacoesFormularioModalMaterialComboService,
    private pedidosProducaoTelasService: ComercialCicloVendasPedidosProducaoTelasService,
    private formularioProducaoService: ComercialCicloVendasPedidosProducaoTelasFormularioService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.submitSubscription();
    this.materiaisSubject();
    this.calculoSubject();
    this.setFormBuilder();
    // this.checkPreviously();
  }

  ngOnDestroy(): void {
    this.subscriptionSubmit.unsubscribe();
    this.materiaisSubscription.unsubscribe();
    this.calculoSubscription.unsubscribe();
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

  materiaisSubject(): void {
    this.newMaterial = false;
    this.materiaisSubscription = this.formularioService.materiaisSubject.subscribe(
      (response: any) => {
        if (this.nrPedido === undefined) {
          const materiais = this.formatMateriais(response);
          this.newMaterial = true;
          this.onAddMaterial(materiais);
        } else {
          const materiaisUpdate = this.formatMateriaisUpdate(response);
          this.onAddMaterial(materiaisUpdate);
        }

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
    this.calculoSubscription = this.formularioProducaoService.calculoSubject.subscribe(
      (calculo: ICalculoModel) => {

        const formArray = this.form.controls.materiais as FormArray;
        const formGroup = formArray.controls[calculo.index] as FormGroup;

        formGroup.controls.quantidade.setValue(calculo.qtde);
        formGroup.controls.pesoEspecifico.setValue(calculo.tonelada);
        formGroup.controls.valor.setValue(calculo.valorUnitario);
        formGroup.controls.percentualIpi.setValue(calculo.aliquotaIpi);
        formGroup.controls.valorIpi.setValue(calculo.valorIpi);
        formGroup.controls.percentualIcms.setValue(calculo.aliquotaIcms);
        formGroup.controls.valorIcms.setValue(calculo.valorIcms);
        formGroup.controls.valorIcmsSt.setValue(calculo.valorIcmsSt);
        formGroup.controls.valorTotalOri.setValue(
          calculo.tonelada * calculo.valorUnitario
        );
        formGroup.controls.valorTotal.setValue(
          calculo.tonelada * calculo.valorUnitario
        );

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
  }

  setFormBuilder(): void {
    this.form = this.formBuilder.group({
      materiais: this.formBuilder.array([]),
    });

    this.checkInitialValues();
  }

  checkInitialValues(): void {
    if (this.initialValue.length > 0) {
      this.newMaterial = true;
      this.onAddMaterial(this.initialValue);

    }
  }

  get materiais(): FormArray {
    return this.form.get('materiais') as FormArray;
  }



  onAddMaterial(materiais: Array<any>): void {

    this.nrPedido = materiais[0].nrPedido;

    if (this.newMaterial === true) {

      if (materiais.length > 0) {
        let hasError = false,
          qtdeAdicionados = 0;

        for (let i = 0; i < materiais.length; i++) {
          if (
            (this.selectedCodEmpresa === null ||
              this.selectedCodEmpresa === materiais[i].codEmpresa) &&
            hasError === false
          ) {
            if (this.checkMaterialExists(materiais[i]) === false) {
              this.materiais.push(
                this.formBuilder.group({
                  nrItem: [materiais[i].nrItem],
                  idReservado: [materiais[i].idReservado],
                  codCotacao: [materiais[i].codCotacao],
                  codMaterial: [materiais[i].codMaterial],
                  nomeMaterial: [materiais[i].nomeMaterial],
                  quantidade: [materiais[i].qtdeItem, [Validators.required]],
                  valorUnit: [materiais[i].valorUnit],
                  valor: [materiais[i].valor, [Validators.required]],
                  percentualIpi: [materiais[i].percentualIpi],
                  valorIpi: [materiais[i].valorIpi, [Validators.required]],
                  percentualIcms: [materiais[i].percentualIcms],
                  valorIcms: [materiais[i].valorIcms, [Validators.required]],
                  valorIcmsSt: [
                    materiais[i].valorIcmsSt != null
                      ? materiais[i].valorIcmsSt
                      : 0,
                    [Validators.required],
                  ],
                  tipoDesc: [materiais[i].tipoDesc],
                  valorDesc: [materiais[i].valorDesc],
                  percentualDesc: [materiais[i].percentualDesc],
                  valorTotalOri: [materiais[i].valorTotalOri],
                  valorTotal: [materiais[i].valorTotal, [Validators.required]],
                  codEmpresa: [materiais[i].codEmpresa],
                  nomeEmpresa: [materiais[i].nomeEmpresa],
                  codDeposito: [materiais[i].codDeposito],
                  nomeDeposito: [materiais[i].nomeDeposito],
                  medida1: [materiais[i].medida1],
                  medida2: [materiais[i].medida2],
                  pesoEspecifico: [materiais[i].peso],
                  materialAssociado: [materiais[i].materialAssociado],
                })
              );

              this.setSelectedCodEmpresa(materiais[i].codEmpresa);
              qtdeAdicionados++;
            }
          } else {
            hasError = true;
          }
        }


        if (qtdeAdicionados > 0) {
          this.setLocalStorage(this.form.value.materiais);
          console.log(this.form.value.materiais);
          this.onCalcularTotais(true);
          setTimeout(() => {
          }, 500);
        }
      }
      this.newMaterial = false;
    } else {

      if (materiais.length > 0) {
        let hasError = false,
          qtdeAdicionados = 0;

        for (let i = 0; i < materiais[0].length; i++) {

            if (this.checkMaterialExists(materiais[i]) === false) {
              this.materiais.push(
                this.formBuilder.group({
                  nrItem: [this.nrItem],
                  idReservado: [materiais[0][i].idReservado],
                  codCotacao: [materiais[0][i].codCotacao],
                  codMaterial: [materiais[0][i].codMaterial],
                  nomeMaterial: [materiais[0][i].nomeMaterial],
                  quantidade: [materiais[0][i].qtdeItem, [Validators.required]],
                  valorUnit: [materiais[0][i].valorUnit],
                  valor: [materiais[0][i].valor, [Validators.required]],
                  percentualIpi: [materiais[0][i].percentualIpi],
                  valorIpi: [materiais[0][i].valorIpi, [Validators.required]],
                  percentualIcms: [materiais[0][i].percentualIcms],
                  valorIcms: [materiais[0][i].valorIcms, [Validators.required]],
                  valorIcmsSt: [
                    materiais[0][i].valorIcmsSt != null
                      ? materiais[0][i].valorIcmsSt
                      : 0,
                    [Validators.required],
                  ],
                  tipoDesc: [materiais[0][i].tipoDesc],
                  valorDesc: [materiais[0][i].valorDesc],
                  percentualDesc: [materiais[0][i].percentualDesc],
                  valorTotalOri: [materiais[0][i].valorTotalOri],
                  valorTotal: [materiais[0][i].valorTotal, [Validators.required]],
                  codEmpresa: [materiais[0][i].codEmpresa],
                  nomeEmpresa: [materiais[0][i].nomeEmpresa],
                  codDeposito: [materiais[0][i].codDeposito],
                  nomeDeposito: [materiais[0][i].nomeDeposito],
                  medida1: [materiais[0][i].medida1],
                  medida2: [materiais[0][i].medida2],
                  pesoEspecifico: [materiais[0][i].peso],
                  materialAssociado: [materiais[0][i].materialAssociado],
                })
              );

              this.setSelectedCodEmpresa(materiais[0][i].codEmpresa);
              qtdeAdicionados++;
            }

        }


        if (qtdeAdicionados > 0) {
          this.setLocalStorage(this.form.value.materiais);
          console.log(this.form.value.materiais);
          this.onCalcularTotais(true);
          setTimeout(() => {
          }, 500);
        }
      }

    };


  }


  checkMaterialExists(material: ICarrinhoModel): boolean {
    return this.form.value.materiais.some((el: ICarrinhoModel) => {
      return el.codMaterial === material.codMaterial;
    });
  }

  onAssocMaterial(material: ICarrinhoModel): void {
    if (material.materialAssociado === 1) {
      this.comboService.showModal(material);
    }
  }

  onCalcMaterial(index: number, material: ICarrinhoModel): void {
    if (this.codCliente !== null) {
      this.calculoService.showModal(index, material, this.codCliente);
    } else {
      this.scrollTop.emit(true);
    }
  }

  onDescontoMaterial(index: number, material: ICarrinhoModel): void {
    if (material.valorTotal > 0) {
      this.descontoService.descontoMaterial(index, material);
    } else {
      this.pnotifyService.notice(
        'Realize o cálculo de quantidades para continuar.'
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

  onLimparCarrinho(): void {
    const materiais = this.form.get('materiais') as FormArray;
    materiais.clear();

    this.setSelectedCodEmpresa(null);
    this.onCalcularTotais(true);
    this.clearLocalStorage();
  }


  onDeleteMaterial(index: number, material: IMateriaisModel): void {
    const nrItem = index + 1;

    if (this.nrPedido != undefined) {
      this.confirmDelete()
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) =>
          result
            ? this.deleteMaterialCotacao(nrItem, this.nrPedido)
            : EMPTY
        ),
        finalize(() => {
          this.loaderNavbar.emit(false);
        })
      )
      .subscribe(
        (response: JsonResponse) => {
          if (response.success === true) {
            this.materiais.removeAt(index);
            this.onCalcularTotais(false);
            this.carrinhoEmitter();
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
      this.materiais.removeAt(index);
    }


  }

  confirmDelete(): any {
    return this.confirmModalService.showConfirm(
      'delete',
      'Confirmar exclusão',
      'Deseja realmente prosseguir com a exclusão do material?',
      'Cancelar',
      'Confirmar'
    );
  }

  deleteMaterialCotacao(index: number, codMaterial: number): Observable<any> {
    this.loaderNavbar.emit(true);
    return this.pedidosProducaoTelasService.deleteMaterialCotacao(index, codMaterial);
  }


  formatMateriais(
    data: Array<IMateriaisModel & ISimilaridadeModel>
  ): Array<ICarrinhoModel> {
    let materiais = [];

    for (let index = 0; index < data.length; index++) {
      let material =
        {
          idReservado: this.idReservado !== null ? this.idReservado : null,
          codCotacao: this.codCotacao !== null ? this.codCotacao : null,
          codMaterial: data[index].codMaterial,
          nomeMaterial: data[index].nomeMaterial,
          quantidade: 0,
          valorUnit: data[index].valorUnit,
          valor: 0,
          percentualIpi: data[index].percentualIpi,
          valorIpi: 0,
          percentualIcms: data[index].percentualIcms,
          valorIcms: 0,
          valorIcmsSt: 0,
          tipoDesc: null,
          valorDesc: 0,
          percentualDesc: 0,
          valorTotalOri: 0,
          valorTotal: 0,
          codEmpresa: data[index].codEmpresa,
          nomeEmpresa: data[index].nomeEmpresa,
          codDeposito: data[index].codDeposito,
          nomeDeposito: data[index].nomeDeposito,
          medida1: data[index].medida1,
          medida2: data[index].medida2,
          pesoEspecifico: data[index].pesoEspecifico,
          materialAssociado: data[index].materialAssociado,
        }

      materiais.push(material);
    }

    return materiais;
  }

  formatMateriaisUpdate(
    data: Array<IMateriaisModel & ISimilaridadeModel>
  ): Array<ICarrinhoModel> {

    let materiais = [];

    for (let index = 0; index < data.length; index++) {
      let material = [
        {
          idReservado: this.idReservado !== null ? this.idReservado : null,
          codCotacao: this.codCotacao !== null ? this.codCotacao : null,
          codMaterial: data[index].id_material,
          nomeMaterial: data[index].nomeMaterial,
          quantidade: 0,
          valorUnit: data[index].valorUnit,
          valor: 0,
          percentualIpi: data[index].percentualIpi,
          valorIpi: 0,
          percentualIcms: data[index].percentualIcms,
          valorIcms: 0,
          valorIcmsSt: 0,
          tipoDesc: null,
          valorDesc: 0,
          percentualDesc: 0,
          valorTotalOri: 0,
          valorTotal: 0,
          codEmpresa: data[index].codEmpresa,
          nomeEmpresa: data[index].nomeEmpresa,
          codDeposito: data[index].codDeposito,
          nomeDeposito: data[index].nomeDeposito,
          medida1: data[index].medida1,
          medida2: data[index].medida2,
          pesoEspecifico: data[index].pesoEspecifico,
          materialAssociado: data[index].materialAssociado,
        }
      ]

      materiais.push(material);

    }

    return materiais;
  }

  // checkPreviously(): void {
  //   const _localStorage = localStorage.getItem('materiais');

  //   if (_localStorage !== null) {
  //     const materiais = JSON.parse(atob(_localStorage));

  //     if (
  //       materiais.length > 0 &&
  //       this.idReservado !== null &&
  //       this.idReservado == materiais[0].idReservado
  //     ) {
  //       this.confirmModalService
  //         .showConfirm(
  //           null,
  //           `#${this.idReservado} / Cotação não finalizada`,
  //           'Parece que essa cotação foi iniciada e não foi finalizada. Deseja recuperar os materiais da cotação?',
  //           'Cancelar',
  //           'Confirmar'
  //         )
  //         .subscribe((response: boolean) =>
  //           response
  //             ? this.onConfirmAddMaterial(materiais)
  //             : this.clearLocalStorage()
  //         );
  //     }
  //   }
  // }

  onConfirmAddMaterial(materiais: Array<ICarrinhoModel>): void {
    this.onAddMaterial(materiais);

    setTimeout(() => {
      this.scrollToCarrinho.nativeElement.scrollIntoView({
        behavior: 'instant',
      });
    }, 500);
  }

  setLocalStorage(data: Array<ICarrinhoModel>): void {

      this.clearLocalStorage();
      localStorage.setItem('materiais', btoa(JSON.stringify(data)));

  }

  clearLocalStorage(): void {
    localStorage.removeItem('materiais');
  }

  onCalcularTotais(emitter: boolean): void {
    const materiais = this.form.value.materiais;

    this.total.quantidade = 0;
    this.total.pesoEspecifico = 0;
    this.total.valor = 0;
    this.total.valorIcms = 0;
    this.total.valorIpi = 0;
    this.total.valorDescMaterial = 0;
    this.total.valorDescCarrinho = 0;
    this.total.valorTotalOri = 0;
    this.total.valorTotal = 0;
    this.total.valorProposta = 0;

    if (materiais.length > 0) {
      for (let index = 0; index < materiais.length; index++) {
        this.total.quantidade += materiais[index].quantidade;
        this.total.pesoEspecifico += materiais[index].pesoEspecifico;
        this.total.valor += materiais[index].valor;
        this.total.valorIcms += materiais[index].valorIcms;
        this.total.valorIpi += materiais[index].valorIpi;
        this.total.valorDescMaterial += materiais[index].valorDesc;
        this.total.valorTotalOri += materiais[index].valorTotalOri;
        this.total.valorTotal += materiais[index].valorTotal;
      }

      if (this.descontoCarrinho.tipo !== null) {
        if (this.descontoCarrinho.tipo === 'valor') {
          this.total.valorDescCarrinho =
            this.total.valorDescMaterial + this.descontoCarrinho.desconto;

          this.total.valorProposta =
            this.total.valorTotal +
            this.total.valorIpi -
            this.total.valorDescCarrinho;
        } else if (this.descontoCarrinho.tipo === 'percentual') {
          this.total.valorTotal =
            ((100 - this.descontoCarrinho.desconto) / 100) *
            this.total.valorTotal;

          this.total.valorDescCarrinho =
            this.total.valorDescMaterial +
            (this.total.valorTotalOri - this.total.valorTotal);

          this.total.valorProposta =
            this.total.valorTotal +
            this.total.valorIpi -
            this.total.valorDescCarrinho;
        } else {
          this.total.valorDescCarrinho = this.total.valorDescMaterial;

          this.total.valorProposta =
            this.total.valorTotal + this.total.valorIpi;
        }
      } else {
        this.total.valorDescCarrinho = this.total.valorDescMaterial;

        this.total.valorProposta = this.total.valorTotal + this.total.valorIpi;
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
        size = 4;
        break;
      case 'nomeMaterial':
        size = 22;
        break;
      case 'quantidade':
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
        size = 9;
        break;
      case 'nomeDeposito':
        size = 11;
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
}
