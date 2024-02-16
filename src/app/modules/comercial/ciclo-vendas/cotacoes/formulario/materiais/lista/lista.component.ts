import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormGroup,
  FormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialCicloVendasCotacoesService } from '../../../cotacoes.service';
import { ComercialCicloVendasCotacoesFormularioService } from '../../formulario.service';
import { ComercialService } from 'src/app/modules/comercial/comercial.service';
import { ComercialCicloVendasCotacoesFormularioModalMaterialEstoqueService } from '../../modal/material/estoque/estoque.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';

// Interfaces
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { JsonResponse } from 'src/app/models/json-response';

import { IMateriaisModel } from '../../models/materiais';
import { ComercialEstoqueService } from '../../../../../../comercial/estoque/estoque.service';
import { BrowserModule } from '@angular/platform-browser'; 
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 


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
  @Input('id_lista_precio') id_lista: number;
  @Input ('id_vendedor') id_vendedor : number;
  @Output() resetRequested = new EventEmitter<void>();

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
      text: 'Disponibles en stock',
      color: 'green',
    },
    {
      id: 2,
      text: 'UP SELL',
      color: 'blue',
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

  swTodos = false;
  swVendedor = true;
  swAppSell = false;
  swAppSellColor = false;




  form: FormGroup;
  orderBy = 'nrPedido';
  orderType: 'asc' | 'desc' = 'asc';

  linhas: Array<any> = [];
  classes: Array<any> = [];
  filteredClasses: Array<any> = [];
  lineas: Array<any> = [];
  grupos: Array<any> = [];
  materiais: Array<any> = [];
  materiaisLoader: boolean;
  disabledMaterial = false;

  autoScroll = true;

  firstSearch = false;

  dados: Array<IMateriaisModel> = [];
  upsell: Array<IMateriaisModel> = [];
  crosell: Array<IMateriaisModel> = [];
  
  dadosLoaded = false;
  dadosEmpty = false;
  idMaterial: number = 0;
  idLista: number = 0;
  registros: '';
  swActivarBusqueda = false;


  toggleAll = false;
  activeRow: number;

  clickCounter = 0;
  codigo_material: any;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private formBuilder: FormBuilder,
    private confirmModalService: ConfirmModalService,
    private pnotifyService: PNotifyService,
    private cotacoesService: ComercialCicloVendasCotacoesService,
    private formularioService: ComercialCicloVendasCotacoesFormularioService,
    private comercialService: ComercialService,
    private estoqueService: ComercialCicloVendasCotacoesFormularioModalMaterialEstoqueService,
    private estoqueServices: ComercialEstoqueService,

  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.getFilterValues();
    this.cliente.emit(this.codCliente)
    this.getMateriais(null, 'application')

  }

  getFilterValues(): void {
    this.loaderFullScreen.emit(true);

    this.comercialService.getClasses(null)
      .pipe(
        finalize(() => {
          this.loaderFullScreen.emit(false);
          this.setFormFilter();
          this.showApp = true;
        })
      )
      .subscribe((response: any) => {
        if (response.responseCode === 200) {
          this.linhas = response.result;
                 console.log(response.result);
          
        } else {
          this.pnotifyService.error();
          this.location.back();
        }
        this.linhas.unshift({
          idClasse: 0,
          nomeClasse: 'TODOS',
        });

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
      /* this.form.controls.codClasse.setValue(0); */

      this.form.controls.codMaterial.reset();
      /* this.form.controls.codMaterial.disable(); */
      this.form.controls.codMaterial.setValue(null);
      this.form.controls.codMaterial.updateValueAndValidity();
    }
    var idClase = codLinha;
    this.comercialService.getLinhasId(idClase).subscribe({
      next: (response: any) => {
        if (response.responseCode == 200) {
          this.grupos = response.result;
        } else {
          this.grupos = [];
        }
        /* this.grupos.unshift({
          id_linha: '',
          descricao: 'SELECCIONE',
        });  */
        this.grupos.unshift({
          id_linha: 0,
          descricao: 'TODOS',
        });
      },
      error: (error: any) => {
        /*  */
      }
    });
    this.form.controls.codClasse.enable();
    this.form.controls.codLinea.enable();

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
  cambioMaterial(idMaterial: number) {
    if(idMaterial > 0) {
      this.swActivarBusqueda = true;
    }else{
      this.swActivarBusqueda = false;
    }
    
    this.idMaterial = idMaterial;
    this.registros = this.form.controls.registros.value
  }
  cambioRegistros(registro) {
    this.registros = registro;
  }

  onChangeClasse(codClasse: number, reset: boolean, src: string) {
    if (reset) {
      this.form.controls.codMaterial.reset();

      /*  if (this.form.value.codClasse === 0) {
         this.form.controls.codMaterial.reset();
     /*     this.form.controls.codMaterial.disable(); */
      this.form.controls.codMaterial.setValue(null);
      this.form.controls.codMaterial.updateValueAndValidity();
      /*    } else {  */
      this.getMateriais(codClasse, src);
      /* } */
    } else {
      if (this.form.value.codClasse !== 0) {
        this.getMateriais(codClasse, src);
      }
    }

  }
  onChangegrupo(clase: any) {
    /*      console.log(clase); 
     */
    this.form.controls.codMaterial.reset()
    /*   console.log(clase); */
    var idClase = clase;
    this.comercialService.getSublineasId(idClase).subscribe({
      next: (response: any) => {
        if (response.responseCode == 200) {
          this.lineas = response.result;
        }
        this.lineas.unshift({
          ID: 0,
          NM_SUB_LINH: 'TODOS',
        });
      },
      error: (error: any) => {
        /* this.handleSearchError('Ocurrió un error al cargar los datos.'); */
      }
    });
  }

  getMateriais(codClasse: number, src: string): void {
    /* alert('dasd'); */
    this.materiais = [];
    if (codClasse === null || codClasse === undefined) {
      if (src === 'application') {
        this.loaderNavbar.emit(true);
      }
      /* console.log('aqui'); */
      const params = {
        id_familia: '',
        id_grupo: '',
        id_linea: '',
        registros: this.form.controls.registros.value
      };
      this.getMateriales(params, src);
    } else {
      if (typeof codClasse !== 'undefined' && codClasse !== null) {
        if (src === 'application') {
          this.loaderNavbar.emit(true);
        }
        this.materiaisLoader = true;

        const params = {
          id_familia: this.form.controls.codLinha.value,
          id_grupo: this.form.controls.codClasse.value,
          id_linea: codClasse,
          registros: this.form.controls.registros.value
        };
        this.getMateriales(params, src);
      }
    }
  }

  getMateriales(params, src) {
    this.comercialService.getMaterialesLista(params)
      .pipe(
        finalize(() => {
          if (src === 'application') {
            this.loaderNavbar.emit(false);
          }
          this.materiaisLoader = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (
            response.responseCode == 200
          ) {
            this.materiais = response.result;
            /* this.materiais.unshift({
              id_material: 0,
              nombre: 'EXHIBIR TODOS',
            }); */
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


  onReset(): void {
    this.confirmReset()
      .subscribe({
        next: (response: boolean) =>  {
          if (response === true)  {
            this.executeReset();
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
        }
      });
  }
  limpiarBusqueda(): void {
    this.dados = [];
  }

  executeReset(): void {
    this.form.reset();
    this.form.patchValue({
      codLinha: null,
      codClasse: null,
      codMaterial: null,
      comEstoque: 1,
      registros: 7000,
    });
    /* this.form.controls.codMaterial.disable(); */
    this.form.controls.codMaterial.updateValueAndValidity();

    this.form.controls.codClasse.disable();
    this.form.controls.codClasse.updateValueAndValidity();

    this.dados = [];
    this.resetRequested.emit();
  }

  confirmReset(): any {
    return this.confirmModalService.showConfirm(
      '',
      'Limpiar campos de materiales',
      'Está seguro de continuar con esta acción?',
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
          /* value: formValue.codMaterial,
          disabled: formValue.codMaterial === null ? true : false, */
        },
      ],
      codLinea: [
        {
          value: formValue.codLinea,
          disabled: formValue.codLinea == null ? true : false,
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
      registros: 7000,
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
    /* console.log(column); */
    if (this.orderBy === column) {
      this.orderType = this.orderType === 'asc' ? 'desc' : 'asc'; // Cambiar el tipo de orden si se hace clic nuevamente en la misma columna
    } else {
      this.orderBy = column;
      this.orderType = 'asc'; // Establecer el orden ascendente por defecto al hacer clic en una nueva columna
    }

    // Ordenar la matriz resultcliente en función del orden seleccionado
    this.dados.sort((a, b) => {

      const valueA = a[column]/* .toUpperCase(); */;
      const valueB = b[column]/* .toUpperCase() */;
      /*       console.log(this.datos);
            console.log(column); */
      if (valueA < valueB) {
        return this.orderType === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return this.orderType === 'asc' ? 1 : -1;
      }
      return 0;
    });

/*     this.onFilter();
 */  }

  onFilter(): void {
    var tipo = 2
    if (this.checkFieldErrors() === false) {
      //console.log(this.checkFieldErrors);
      if (this.searching === false && this.form.valid) {
        this.setRouterParams(this.getFormFilterValues(), tipo);
      }
    } else {
      /*    console.log("hola"); */
      this.setRouterParams(this.getFormFilterValues(), tipo);
      /*   this.scrollToFormOnTop.emit(true); */
    }
  }

  onFilterVend(a): void {
    var tipo = a;

    if (this.checkFieldErrors() === false) {
      if (this.searching === false && this.form.valid) {
        this.setRouterParams(this.getFormFilterValues(), tipo);
      }
    } else {
      this.setRouterParams(this.getFormFilterValues(), tipo);
    }
  }

  setRouterParams(params: any, tipo: number): void {
    this.router.navigate([], {
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
    });
    this.search(tipo);
  }

  getFormFilterValues(): Object {
    let params: any = {};

    params.codLinha = this.form.value.codLinha;
    params.codClasse = this.form.value.codClasse;
    params.codMaterial = this.form.value.codMaterial;
    params.codigo_material = this.form.value.codigo_material;

    params.codEmpresa = this.codEmpresa;
    if (this.codDeposito) {
      params.codDeposito = this.codDeposito;
    }

    if (this.form.value.comEstoque) {
      params.comEstoque = this.form.value.comEstoque;
    }

    if (this.form.value.registros) {
      params.registros = this.form.value.registros;
    }

/*     params.orderBy = this.form.value.orderBy;
 */    params.orderType = this.orderType;

    return params;
  }

  search(tipo): void {
    /* console.log(this.codCliente) */
    if (!this.codCliente) {
      return;
    }
    this.loaderNavbar.emit(true);
    this.searching = true;
    /* this.searchParams = params; */
    this.dados = [];
    this.dadosLoaded = false;
    this.dadosEmpty = false;
     let params = {};
    if (tipo == 1 || tipo == 3) {
      params = {
        id_material: this.idMaterial,
        id_lista: this.id_lista,
        id_vendedor: this.id_vendedor,
        registros: this.form.controls.registros.value
      }
    }else if (tipo == 2) {
      params = {
        id_material: this.idMaterial,
        codigo_material: this.codigo_material,
        id_lista: this.id_lista,
        registros: this.form.controls.registros.value
      }
    }
    if (tipo == 1) {

      this.swTodos = false;
      this.swVendedor = true ;
      
      this.comercialService
        .getMaterialesOfertaVendedor(params)
        .pipe(
          finalize(() => {
            this.loaderNavbar.emit(false);
            this.searching = true;
            this.firstSearch = true;
            this.dadosLoaded = true;
          })
        )
        .subscribe({
          next: (response: any) => {
            /*           console.log(response.responseCode);
             */          /*  if (response.hasOwnProperty('success')
            && response.success === true
            && !response.data[0].msg) {
              this.dados = response.data.map(function (el: any) {
                var o = Object.assign({}, el);
                o.checked = 0; 
                return o;
              }); */
            if (response.responseCode === 200) {
              this.swAppSellColor = false;
              this.dados = response.material.map((el) => {
                var o = Object.assign({}, el);
                o.checked = 0;
                return o;
              });

              this.upsell = response.upsell.map((el) => {
                var o = Object.assign({}, el);
                o.checked = 0;
                return o;
              });

              this.crosell = response.crosell.map((el) => {
                var o = Object.assign({}, el);
                o.checked = 0;
                return o;
              });

              console.log(this.upsell);
              this.dadosEmpty = false;
              this.form.controls.codMaterial.enable();
              this.swActivarBusqueda = true ;
              //console.log('dados', this.dados);
              // if (this.dados.length > 10) {
              this.tableConfig.fixedHeader = true;
              // } else {
              //this.tableConfig.fixedHeader = false;
              //  }
              //} else {
              //this.pnotifyService.notice("Há campos faltando ou não há dados para sua consulta.");
              //this.dadosEmpty = true;
            } else {
              this.swTodos = true;
              this.swVendedor = true;
              this.swActivarBusqueda = true;
              this.dadosEmpty = true;
              this.form.controls.codMaterial.disable();
              this.swAppSellColor = true;
            }
          },
          error: (error: any) => {
              this.swTodos = false;
              this.swVendedor = true;
              this.swActivarBusqueda = true;
              this.dadosEmpty = true;
              this.form.controls.codMaterial.disable();
            if (error['error'].hasOwnProperty('mensagem')) {
              this.pnotifyService.error(error.error.mensagem);
            } else {
              this.pnotifyService.error();
            }
            this.dadosEmpty = true;
            this.swAppSellColor = true;

          }
        });

    } else if (tipo == 2) {
      this.swTodos = true;
      this.swVendedor = false;
      
      this.form.controls.codMaterial.disable();
      this.comercialService
        .getMaterialesOferta(params)
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
            /*           console.log(response.responseCode);
             */          /*  if (response.hasOwnProperty('success')
     && response.success === true
     && !response.data[0].msg) {
       this.dados = response.data.map(function (el: any) {
         var o = Object.assign({}, el);
         o.checked = 0; 
         return o;
       }); */
            if (response.responseCode === 200) {
              this.form.controls.codMaterial.enable();
              this.swTodos = false;
              this.swVendedor = true;
              this.swAppSell = false;
              this.swAppSellColor = false;


              this.dados = response.result.map((el) => {
                var o = Object.assign({}, el);
                o.checked = 0;
                return o;
              });
              this.dadosEmpty = false;

              //console.log('dados', this.dados);

              // if (this.dados.length > 10) {
              this.tableConfig.fixedHeader = true;
              // } else {
              //this.tableConfig.fixedHeader = false;
              //  }
              //} else {
              //this.pnotifyService.notice("Há campos faltando ou não há dados para sua consulta.");
              //this.dadosEmpty = true;
            } else {
              this.swTodos = false;
              this.swVendedor = true;
              this.dadosEmpty = true;
              this.swAppSellColor = false;

              this.form.controls.codMaterial.enable();

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
    } else if (tipo === 3) {
      this.swTodos = false;
      this.swVendedor = true;
      this.swAppSell = true;
      this.comercialService
        .getUpSellService(params)
        .pipe(
          finalize(() => {
            this.loaderNavbar.emit(false);
            this.searching = true;
            this.firstSearch = true;
            this.dadosLoaded = true;
          })
        )
        .subscribe({
          next: (response: any) => {
            if (response.responseCode === 200) {
              this.swAppSellColor = true;
              this.form.controls.codMaterial.enable();
              this.swTodos = true;
              this.swVendedor = true;
              this.swAppSell = true;
              this.dados = response.result.map((el) => {
                var o = Object.assign({}, el);
                o.checked = 0;
                return o;
              });
              this.dadosEmpty = false;
              this.form.controls.codMaterial.enable();
              this.tableConfig.fixedHeader = true;
            } else {
              this.swTodos = true;
              this.swVendedor = true;
              this.swAppSell = true;
              this.dadosEmpty = true;
              this.form.controls.codMaterial.enable();
              this.swAppSellColor = true;
              //this.form.controls.codMaterial.enable();
            }
          },
          error: (error: any) => {
            this.swAppSellColor = true;
            this.swTodos = true;
            this.swVendedor = true;
            this.dadosEmpty = true;
            this.swAppSell = true;
            this.form.controls.codMaterial.enable();
            if (error['error'].hasOwnProperty('mensagem')) {
              this.pnotifyService.error(error.error.mensagem);
            } else {
              this.pnotifyService.error();
            }
            this.dadosEmpty = true;
          }
        });

    }
  }

  checkFieldErrors(): boolean {

    //let hasError = false;
    let hasError = true;
    if (this.codCliente == null) {
      this.pnotifyService.notice("Seleccione un cliente")
      hasError = true;
    }

    //console.log(this.id_vendedor)

    if (this.id_vendedor == 0) {
      this.pnotifyService.notice("Seleccione un vendedor")
      hasError = true;
    }

    //if(this.codFormaPagamento == null){
    //this.pnotifyService.notice("Selecione a forma de pagamento")
    //hasError = true;
    //}


    return hasError;
  }

  classStatusBorder(swAppSellColor: boolean): string {
    let borderClass: string;

    if (swAppSellColor == true) {
      borderClass = 'border-primary';
    } else if (swAppSellColor == false) {
      borderClass = 'border-success';
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
      // @ts-ignore: Ignorar error TS2339
      if (this.dados[index].codigo_situacion == "A") {
        this.dados[index].checked = this.toggleAll === true ? 1 : 0;
      }
    }
    console.log(this.dados);
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
    /*  console.log(this.dados[index]);
     if(this.dados[index].codigo_situacion == "A") {
     let materiais = [];
     materiais.push(this.dados[index]); 
     this.formularioService.materiaisSubject.next(materiais);
     this.scrollToCarrinho.emit(this.autoScroll);
     this.dados[index].checked = 0;
   } else {
     this.pnotifyService.notice('Material inativo, favor entrar em contato com o Marketing');
   } */
  }

  onCheckMaterial(index: number, material: IMateriaisModel): void {
    // @ts-ignore: Ignorar error TS2339
    if (this.dados[index].codigo_situacion == "A") {
      this.dados[index].checked = material.checked == 0 ? 1 : 0;
/*  */
    } else {
      this.pnotifyService.notice('Seleccione por lo menos un material');
    }
  }

  onCheckMaterial2(index: number, material: IMateriaisModel): void {
    // @ts-ignore: Ignorar error TS2339
    if (this.upsell[index].codigo_situacion == "A") {
      this.upsell[index].checked = material.checked == 0 ? 1 : 0;
/*  */
    } else {
      this.pnotifyService.notice('Seleccione por lo menos un material');
    }
    console.log('aqui',this.upsell[index]);
  }

  onCheckMaterial3(index: number, material: IMateriaisModel): void {
    // @ts-ignore: Ignorar error TS2339
    if (this.crosell[index].codigo_situacion == "A") {
      this.crosell[index].checked = material.checked == 0 ? 1 : 0;
/*  */
    } else {
      this.pnotifyService.notice('Seleccione por lo menos un material');
    }
    console.log('aqui',this.crosell[index]);
  }

  onAddMaterial(): void {
    this.swVendedor = true;
    this.swTodos = false;
    let materiais = [];
    for (let index = 0; index < this.dados.length; index++) {
      if (this.dados[index].checked === 1) {
        materiais.push(this.dados[index]);
        this.dados[index].checked = 0;
        this.pnotifyService.success('Material agregado.');
      }
    }

    for (let index = 0; index < this.upsell.length; index++) {
      if (this.upsell[index].checked === 1) {
        materiais.push(this.upsell[index]);
        this.upsell[index].checked = 0;
        this.pnotifyService.success('Material agregado.');
      }
    }

    for (let index = 0; index < this.crosell.length; index++) {
      if (this.crosell[index].checked === 1) {
        materiais.push(this.crosell[index]);
        this.crosell[index].checked = 0;
        this.pnotifyService.success('Material agregado.');
      }
    }

    if (materiais.length > 0) {
      this.formularioService.materiaisSubject.next(materiais);
      this.toggleAll = this.toggleAll === true ? false : this.toggleAll;
      this.scrollToCarrinho.emit(this.autoScroll);
    } else {
      this.pnotifyService.notice(' un material');
    }
    this.dados = [];
    this.upsell = [];
    this.crosell = [];
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

    let params: any = {
      // @ts-ignore: Ignorar error TS2339
      idMaterial: material.id_material,
    };
    /* console.log(params); */
    this.estoqueServices.getStockComprometido(params).subscribe(
      (response: any) => {
/*         console.log(response);
 */        if (response.responseCode === 200) {
          /* console.log('ingreso'); */
          this.estoqueService.showModal({
            detalhes: response.result.analitico,
            material: material,
          });

        } else {

        }
      },

    );
  }

  onShowBloco() {
    this.showBloco2 = !this.showBloco2;
  }
}
