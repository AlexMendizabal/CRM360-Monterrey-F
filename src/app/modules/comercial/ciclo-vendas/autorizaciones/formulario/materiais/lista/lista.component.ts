import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialCicloVendasAutorizacionesService } from '../../../autorizaciones.service';
import { ComercialCicloVendasCotacoesFormularioService } from '../../formulario.service';
import { ComercialService } from 'src/app/modules/comercial/comercial.service';
import { ComercialCicloVendasCotacoesFormularioModalMaterialEstoqueService } from '../../modal/material/estoque/estoque.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';

// Interfaces
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { JsonResponse } from 'src/app/models/json-response';

import { IMateriaisModel } from '../../models/materiais';

@Component({
  selector: 'comercial-ciclo-vendas-cotacoes-formulario-materiais-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class ComercialCicloVendasCotacoesFormularioMateriaisListaComponent
  implements OnInit {
  @Input('codEmpresa') codEmpresa: number;
  @Input('codEndereco') codEndereco: number;
  @Input('codCliente') codCliente: number;
  @Input('codDeposito') codDeposito: number;
  @Input('codFormaPagamento') codFormaPagamento: number;
  @Input('freteConta') freteConta: number;

  filas = [
    { columna1: 'Valor 1', columna2: 'Valor 2', columna3: 'Valor 3', columna4: 'Valor 4', columna5: 'Valor 5', columna6: 'Valor 6', columna7: 'Valor 7', columna8: 'Valor 8', columna9: 'Valor 9', columna10: 'Valor 10' },
    { columna1: 'Valor 1', columna2: 'Valor 2', columna3: 'Valor 3', columna4: 'Valor 4', columna5: 'Valor 5', columna6: 'Valor 6', columna7: 'Valor 7', columna8: 'Valor 8', columna9: 'Valor 9', columna10: 'Valor 10' },
    // Agrega más filas si es necesario
  ];

  @Output('loaderNavbar') loaderNavbar: EventEmitter<
    boolean
  > = new EventEmitter();
  @Output('loaderFullScreen') loaderFullScreen: EventEmitter<
    boolean
  > = new EventEmitter();
  @Output('scrollToCarrinho') scrollToCarrinho: EventEmitter<
    boolean
  > = new EventEmitter();
  @Output('scrollToFormOnTop') scrollToFormOnTop: EventEmitter<
    boolean
  > = new EventEmitter();

  @Output('cliente') cliente: EventEmitter<number> = new EventEmitter();

  showApp = false;
  showBloco2: boolean = true;

  subtitles: Array<Subtitles> = [
    {
      id: 1,
      text: 'Disponible en stock',
      color: 'green',
    },
    {
      id: 2,
      text: 'No disponible en stock',
      color: 'red',
    },
  ];

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
    fixedHeader: false,
    // bodyHeight: 230,
    select: false,
    hover: true
  };

  activatedRouteSubscription: Subscription;

  searching = false;
  searchParams: any = {};

  form: FormGroup;
  orderBy = 'nrPedido';
  orderType = 'desc';

  linhas: Array<any> = [];
  classes: Array<any> = [];
  filteredClasses: Array<any> = [];
  materiais: Array<any> = [];
  materiaisLoader: boolean;

  autoScroll = true;

  firstSearch = false;

  dados: Array<IMateriaisModel> = [];
  dadosLoaded = false;
  dadosEmpty = false;

  toggleAll = false;
  activeRow: number;

  clickCounter = 0;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private formBuilder: FormBuilder,
    private confirmModalService: ConfirmModalService,
    private pnotifyService: PNotifyService,
    private cotacoesService: ComercialCicloVendasAutorizacionesService,
    private formularioService: ComercialCicloVendasCotacoesFormularioService,
    private comercialService: ComercialService,
    private estoqueService: ComercialCicloVendasCotacoesFormularioModalMaterialEstoqueService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.getFilterValues();
    this.cliente.emit(this.codCliente)
  }

  getFilterValues(): void {
    this.loaderFullScreen.emit(true);

    this.cotacoesService
      .getCotacaoFilterValues()
      .pipe(
        finalize(() => {
          this.loaderFullScreen.emit(false);
          this.setFormFilter();
          this.showApp = true;
        })
      )
      .subscribe((response: any) => {
        if (response[0].responseCode === 200) {
          this.linhas = response[0].result;
        } else {
          this.pnotifyService.error();
          this.location.back();
        }

        if (response[1].responseCode === 200) {
          this.classes = response[1].result;
        } else {
          this.pnotifyService.error();
          this.location.back();
        }
      });
  }

  onChangeLinha(codLinha: number, reset: boolean) {
    if (reset) {
      this.form.controls.codClasse.reset();
      this.form.controls.codClasse.setValue(0);

      this.form.controls.codMaterial.reset();
      this.form.controls.codMaterial.disable();
      this.form.controls.codMaterial.setValue(null);
      this.form.controls.codMaterial.updateValueAndValidity();
    }

    this.form.controls.codClasse.enable();
    this.form.controls.codClasse.setValidators([Validators.required]);
    this.form.controls.codClasse.updateValueAndValidity();

    this.filteredClasses = this.classes.filter(
      (value: any) => value.idLinha == codLinha
    );

    this.filteredClasses.unshift({
      idClasse: 0,
      nomeClasse: 'EXIBIR TODOS',
    });
  }

  onChangeClasse(codClasse: number, reset: boolean, src: string) {
    if (reset) {
      this.form.controls.codMaterial.reset();

      if (this.form.value.codClasse === 0) {
        this.form.controls.codMaterial.reset();
        this.form.controls.codMaterial.disable();
        this.form.controls.codMaterial.setValue(null);
        this.form.controls.codMaterial.updateValueAndValidity();
      } else {
        this.getMateriais(codClasse, src);
      }
    } else {
      if (this.form.value.codClasse !== 0) {
        this.getMateriais(codClasse, src);
      }
    }
  }

  getMateriais(codClasse: number, src: string): void {
    if (typeof codClasse !== 'undefined' && codClasse !== null) {
      if (src === 'application') {
        this.loaderNavbar.emit(true);
      }
      this.materiaisLoader = true;
      this.materiais = [];

      const params = {
        codClasse: codClasse,
        tipoMaterial: 'Distribuidora',
        comercializa: 0,
        situacao: 'A',
      };

      this.comercialService
        .getMateriais(params)
        .pipe(
          finalize(() => {
            if (src === 'application') {
              this.loaderNavbar.emit(false);
            }
            this.materiaisLoader = false;
          })
        )
        .subscribe({
          next: (response: JsonResponse) => {
            if (
              response.hasOwnProperty('success') &&
              response.success === true
            ) {
              this.materiais = response.data;

              this.materiais.unshift({
                codigoMaterial: 0,
                codigoDescricaoMaterial: 'EXHIBIR TODOS',
              });

              this.form.controls.codMaterial.enable();
              this.form.controls.codMaterial.setValue(0);
              this.form.controls.codMaterial.updateValueAndValidity();
            } else if (
              response.hasOwnProperty('success') &&
              response.success === false &&
              response.hasOwnProperty('mensagem')
            ) {
              this.pnotifyService.notice('Nenhum material encontrado!');
              this.form.controls.codMaterial.disable();
              this.form.controls.codMaterial.setValue(null);
              this.form.controls.codMaterial.updateValueAndValidity();
            } else {
              this.pnotifyService.error(response.mensagem);
            }
          },
          error: (error: any) => {
            if (error['error'].hasOwnProperty('mensagem')) {
              this.pnotifyService.error(error.error.mensagem);
            } else {
              this.pnotifyService.error();
            }
          }
        });
    }
  }


  onReset(): void {
    this.confirmReset()
        .subscribe({
          next: (response: boolean) => {
            if (response === true) {
             this.executeReset();
            }
          },
          error: (error: any) => {
            this.pnotifyService.error();
          }
        });
  }

  executeReset(): void {
    this.form.reset();
    this.form.patchValue({
      codLinha: null,
      codClasse: null,
      codMaterial: null,
      comEstoque: 1,
      registros: 100,
    });
      this.form.controls.codMaterial.disable();
      this.form.controls.codMaterial.updateValueAndValidity();

      this.form.controls.codClasse.disable();
      this.form.controls.codClasse.updateValueAndValidity();

      this.dados = [];
  }

  confirmReset(): any {
    return this.confirmModalService.showConfirm(
      '',
      'Limpar pesquisa de materiais',
      'Deseja realmente prosseguir com a ação?',
      'Cancelar',
      'Confirmar'
    );
  }

  setFormFilter(): void {
    const formValue: any = this.checkRouterParams();

    this.form = this.formBuilder.group({
      codLinha: [formValue.codLinha, [Validators.required]],
      codClasse: [
        {
          value: formValue.codClasse,
          disabled: formValue.codLinha === null ? true : false,
        },
      ],
      codMaterial: [
        {
          value: formValue.codMaterial,
          disabled: formValue.codMaterial === null ? true : false,
        },
      ],
      comEstoque: [formValue.comEstoque, [Validators.required]],
      registros: [formValue.registros],
      orderBy: [this.orderBy]
    });

    this.checkValuesLinhaClasse();
  }

  checkRouterParams(): Object {
    let formValue = {
      codLinha: null,
      codClasse: null,
      codMaterial: null,
      comEstoque: 1,
      registros: 100,
    };

    this.activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (queryParams: any) => {
        if (Object.keys(queryParams).length > 0) {
          if (queryParams.q) {
            let params = atob(queryParams.q);
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
      }
    );
    this.activatedRouteSubscription.unsubscribe();

    return formValue;
  }

  checkValuesLinhaClasse(): void {
    if (this.form.value.codLinha !== '' && this.form.value.codLinha !== null) {
      this.onChangeLinha(this.form.value.codLinha, false);
    }

    if (
      this.form.value.codClasse !== '' &&
      this.form.value.codClasse !== null
    ) {
      this.onChangeClasse(this.form.value.codClasse, false, 'verify');
    }
  }

  onFieldError(field: string): string {
    if (this.onFieldInvalid(field)) {
      return 'is-invalid';
    }

    return '';
  }

  onFieldInvalid(field: any): boolean {
    field = this.form.get(field);
    return field.status == 'INVALID' && field.touched;
  }

  onFieldRequired(
    abstractControl: AbstractControl,
    abstractControlField?: string
  ): string {
    if (abstractControl.validator) {
      const validator = abstractControl.validator({} as AbstractControl);
      if (validator && validator.required) {
        return 'is-required';
      }
    }

    if (abstractControlField) {
      for (const controlName in abstractControl['controls']) {
        if (abstractControl['controls'][controlName]) {
          if (
            this.onFieldRequired(abstractControl['controls'][controlName]) &&
            controlName == abstractControlField
          ) {
            return 'is-required';
          }
        }
      }
    }

    return '';
  }

  setOrderBy(column: string) {
    if (this.orderBy === column) {
      if (this.orderType == 'desc') {
        this.orderType = 'asc';
      } else if (this.orderType == 'asc') {
        this.orderType = 'desc';
      }
    } else {
      this.orderBy = column;
      this.orderType = 'asc';
    }
    this.onFilter();
  }

  onFilter(): void {
    if (this.checkFieldErrors() === false) {
      //console.log(this.checkFieldErrors);
     if (this.searching === false && this.form.valid) {
       this.setRouterParams(this.getFormFilterValues());
      }
    } else {
      console.log("hola");
      this.setRouterParams(this.getFormFilterValues());
      //this.scrollToFormOnTop.emit(true);
    }
  }

  setRouterParams(params: any): void {
    /* this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        f: btoa(
          JSON.stringify({
            codEmpresa: this.codEmpresa,
            codDeposito: this.codDeposito,
          })
        ),
        q: btoa(JSON.stringify(params)),
      },
      queryParamsHandling: 'merge',
    }); */
    this.search(params);
  }

  getFormFilterValues(): Object {
    let params: any = {};

    //if (this.form.value.codLinha) {
      params.codLinha = this.form.value.codLinha;
    //}

    //if (this.form.value.codClasse && this.form.value.codClasse !== 0) {
      params.codClasse = this.form.value.codClasse;
    //}

    //if (this.form.value.codMaterial && this.form.value.codMaterial !== 0) {
      params.codMaterial = this.form.value.codMaterial;
    //}

    //if (this.codEmpresa) {
      params.codEmpresa = this.codEmpresa;
    //}

    if (this.codDeposito) {
      params.codDeposito = this.codDeposito;
    }

    if (this.form.value.comEstoque) {
      params.comEstoque = this.form.value.comEstoque;
    }

    if (this.form.value.registros) {
      params.registros = this.form.value.registros;
    }

    params.orderBy = this.form.value.orderBy;
    params.orderType = this.orderType;

    return params;
  }

  search(params: any): void {
    if(!this.codCliente){
      return;
    }
    this.loaderNavbar.emit(true);
    this.searching = true;
    this.searchParams = params;
    this.dados = [];
    this.dadosLoaded = false;
    this.dadosEmpty = false;
    const _params = {...params,
      codCliente:this.codCliente,
      codEndereco:this.codEndereco,
      codFormaPagamento:this.codFormaPagamento,
      freteConta:this.freteConta,
      situacao: 'A'}
    this.cotacoesService
      .getMateriais(_params)
      .pipe(
        finalize(() => {
          this.loaderNavbar.emit(false);
          this.searching = false;
          this.firstSearch = true;
          this.dadosLoaded = true;
        })
      )
      .subscribe({
        next: (response: any) => {
          //console.log(response);
         /*  if (response.hasOwnProperty('success')
          && response.success === true
          && !response.data[0].msg) {
            this.dados = response.data.map(function (el: any) {
              var o = Object.assign({}, el);
              o.checked = 0;
              return o;
            }); */
            if ( response.success === true)
             {
              this.dados = response.data.map(function (el: any) {
                var o = Object.assign({}, el);
                o.checked = 0;
                return o;
              });

            //console.log('dados', this.dados);

           // if (this.dados.length > 10) {
              this.tableConfig.fixedHeader = true;
           // } else {
              //this.tableConfig.fixedHeader = false;
          //  }
          //} else {
            //this.pnotifyService.notice("Há campos faltando ou não há dados para sua consulta.");
            //this.dadosEmpty = true;
          }
        },
        error: (error: any) => {
          if (error['error'].hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.pnotifyService.error();
          }
          this.dadosEmpty = true;
        }
      });
  }

  checkFieldErrors(): boolean {

    //let hasError = false;
    let hasError = true;
    //if(this.codCliente == null){
      //this.pnotifyService.notice("Selecione o cliente")
      //hasError = true;
    //}

    //if(this.codFormaPagamento == null){
      //this.pnotifyService.notice("Selecione a forma de pagamento")
      //hasError = true;
    //}


    return hasError;
  }

  classStatusBorder(disponibilidade: number): string {
    let borderClass: string;

    if (disponibilidade == 1) {
      borderClass = 'border-success';
    } else if (disponibilidade == 2) {
      borderClass = 'border-danger';
    } else {
      borderClass = 'border-secondary';
    }

    return borderClass;
  }

  columSize(key: string): string {
    let size: number;

    switch (key) {
      case 'disponibilidade':
        size = 5;
        break;
      case 'codMaterial':
        size = 10;
        break;
      case 'nomeMaterial':
        size = 30;
        break;
      case 'nomeLinha':
        size = 12;
        break;
      case 'nomeDeposito':
        size = 13;
        break;
      case 'estoqueDisponivel':
        size = 10;
        break;
      case 'estoqueAtual':
        size = 10;
        break;
      case 'buttons':
        size = 10;
        break;
    }

    return `${size}%`;
  }

  onToggleAll() {
    this.toggleAll = !this.toggleAll;

    for (let index = 0; index < this.dados.length; index++) {
      if (this.dados[index].codSituacao == "A") {
        this.dados[index].checked = this.toggleAll === true ? 1 : 0;
      }
    }
  }

  onClickMaterial(index: number, material: IMateriaisModel) {
    this.clickCounter++;

    setTimeout(() => {
      if (this.clickCounter === 1) {
        this.onCheckMaterial(index, material);
      } else if (this.clickCounter === 2) {
        this.onDoubleClickMaterial(index);
      }
      this.clickCounter = 0;
    }, 250);
  }

  onDoubleClickMaterial(index: number): void {
    if (this.dados[index].codSituacao == "A") {
      let materiais = [];
      materiais.push(this.dados[index]);
      this.formularioService.materiaisSubject.next(materiais);
      this.scrollToCarrinho.emit(this.autoScroll);
      this.dados[index].checked = 0;
    } else {
      this.pnotifyService.notice('Material inativo, favor entrar em contato com o Marketing');
    }
  }

  onCheckMaterial(index: number, material: IMateriaisModel): void {
    if(this.dados[index].codSituacao == "A") {
      this.dados[index].checked = material.checked == 0 ? 1 : 0;
    }else {
      this.pnotifyService.notice('Material inativo, favor entrar em contato com o Marketing');
    }

  }

  onAddMaterial(): void {
    

    let materiais = [];

    for (let index = 0; index < this.dados.length; index++) {
      if (this.dados[index].checked === 1) {
        materiais.push(this.dados[index]);
        this.dados[index].checked = 0;
      this.pnotifyService.success('Material agregado.');

      }
    }

    if (materiais.length > 0) {
      this.formularioService.materiaisSubject.next(materiais);
      this.toggleAll = this.toggleAll === true ? false : this.toggleAll;
      this.scrollToCarrinho.emit(this.autoScroll);
    } else {
      this.pnotifyService.notice('Selecione ao menos um material.');
    }
  }

  onActiveRow(index: number): void {
    this.activeRow = index;
  }

  onChangeDeposito(event: any): void {
    /* this.dados[event.index].codDeposito = event.deposito.codDeposito;
    this.dados[event.index].nomeDeposito = event.deposito.nomeDeposito;
    this.dados[event.index].quantidade = event.deposito.quantidade; */
    // Validar o que vai fazer aqui.
    /* this.form.controls.codDeposito.setValue(event.deposito.codDeposito);
    this.onFilter(); */
  }

  onEstoqueDetalhes(material: IMateriaisModel): void {
      this.estoqueService.showModal({
        pesquisa: {
          deposito: material.codDeposito,
          codMaterial: material.codMaterial,
          estoqueDisponivel: this.form.value.comEstoque,
        },
        material: material,
      });
  }

  onShowBloco(){
    this.showBloco2 = !this.showBloco2;
  }
}
