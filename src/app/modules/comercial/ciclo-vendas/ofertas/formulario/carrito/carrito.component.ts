import {
  Component, OnInit, TemplateRef, Input,
  OnDestroy,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef
} from '@angular/core';
import { BsModalRef, BsModalService, } from 'ngx-bootstrap/modal';
import { Subscription, EMPTY, Observable, throwError } from 'rxjs';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  FormControl,
} from '@angular/forms';
import { take, switchMap, finalize, catchError } from 'rxjs/operators';
import { JsonResponse } from 'src/app/models/json-response';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
//carrito
import { ICarrinhoModel } from '../models/carrinho';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
//servicio de ofertas
import { FormularioService } from '../formulario.service';
import { IMaterial } from '../models/materiales';
import { OfertasService } from '../../ofertas.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { number } from 'ng-brazil/number/validator';


@Component({
  selector: 'carrito',
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.scss']
})
export class CarritoComponent implements OnInit, OnDestroy, OnChanges {
  modalRef: BsModalRef;
  //contruir carrito
  private subscriptionSubmit: Subscription;
  private totalBrutoSubject: Subject<any> = new Subject();
  private descuentoSubject: Subject<any> = new Subject();

  @Input('appTitle') appTitle: string;
  @Input('initialValue') initialValue: Array<ICarrinhoModel>;
  @Input('codCotacao') codCotacao: number;
  @Input('id_lista') id_lista: number;
  @Input('id_tipo_cliente') id_tipo_cliente: number;
  @Input('almacen') almacen: string;
  @Input('tipoEntrega') tipoEntrega: number;
  @Input('destinarioFactura') destinarioFactura: string;
  @Input('centroLogisticoControl') centroLogisticoControl: number;
  @Input('fechaEntrega') fechaEntrega: string;
  @Input('cordenadas') cordenadas: string;


  @Output('loaderNavbar') loaderNavbar: EventEmitter<boolean> = new EventEmitter();
  @Output('hasError') hasError: EventEmitter<boolean> = new EventEmitter();
  @Output('carrito') carrito: EventEmitter<Object> = new EventEmitter();
  @Output('listaVacio') sWvacio: EventEmitter<boolean> = new EventEmitter<boolean>();
  materiaisSubscription: Subscription = EMPTY.subscribe();

  //form group u otros
  form: FormGroup;
  swDescuentoPermitido = false;
  tipoEntrega2 : number;
  //totales
  valorTotalBs: number;
  idReservado: number;
  quantidade: number = 1;

  tipoEntregas = [
    { id: 0, descripcion: 'Ninguno' },
    { id: 1, descripcion: 'Doblado' },
    { id: 2, descripcion: 'Recto' }
  ];
  materiales = [];
  selectedItem: any;
  selectedModoEntrega: number;
  datosCalculadora: [];
  materialesFiltrados = [];
  busquedaItems = [];
  total = {
    peso: 0,
    valorTotal: 0,
    valorTotalBruto: 0,
    valorTotalBs: 0,
    valorTotalBrutoBs: 0,
    impuesto: 0,
    impuestoTotal: 0,
    descuento_total: 0,
    cantidad_total: 0,
    autorizacion: 0,
  };
  constructor(
    private modalService: BsModalService,
    private formularioService: FormularioService,
    private pnotifyService: PNotifyService,
    private confirmModalService: ConfirmModalService,
    private formBuilder: FormBuilder,
    private ofertasService: OfertasService,
    private elementRef: ElementRef,
    private cdRef: ChangeDetectorRef
  ) {
     // Configurar debounce para total bruto
  this.totalBrutoSubject.pipe(
    debounceTime(500), // Espera 500 ms después del último evento
    distinctUntilChanged() // Solo ejecuta si el valor cambia
  ).subscribe(params => {
    this.onCalcularTotalBruto(params.event, params.material, params.codigo, params.lista, params.tipo, params.cantidad, params.descuento);
  });

  // Configurar debounce para descuento
  this.descuentoSubject.pipe(
    debounceTime(500), // Espera 500 ms después del último evento
    distinctUntilChanged() // Solo ejecuta si el valor cambia
  ).subscribe(params => {
    this.onCalcularDescuento(params.event, params.material, params.codigo, params.lista, params.tipo, params.cantidad);
  });
  }

  ngOnInit(): void {
    this.submitSubscription();
    this.checkPreviously();
    this.materiaisSubject();
    this.setFormBuilder();
    this.modoEntregas();
    this.formularioService.loader$.subscribe((isLoading) => {
    });
  }

  onSelect(event: any): void {
    console.log('Selected value:', event.item);
  }
  onKeyUpTotalBruto(event: any, material: FormGroup): void {
    const codigo = material.get('articulo').value;
    const lista = material.get('id_lista').value;
    const tipo = material.get('id_tipo_cliente').value;
    const cantidad = material.get('cantidad').value;
    const descuento = material.get('descuento').value;

    // Emitir los datos para el debounce
    this.totalBrutoSubject.next({ event, material, codigo, lista, tipo, cantidad, descuento });
  }

  onKeyUpDescuento(event: any, material: FormGroup): void {
    const codigo = material.get('articulo').value;
    const lista = material.get('id_lista').value;
    const tipo = material.get('id_tipo_cliente').value;
    const cantidad = material.get('cantidad').value;

    // Emitir los datos para el debounce
    this.descuentoSubject.next({ event, material, codigo, lista, tipo, cantidad });
  }
  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    //console.log('carrito', this.codCotacao, this.initialValue, 'TipoEntrega',this.tipoEntrega);
    this.tipoEntrega2 = this.tipoEntrega;
    if (this.initialValue.length > 0) {
      this.onAddMaterial(this.initialValue);
    }
    if (changes['almacen']) {

      // Asegúrate de que el FormArray 'materiais' esté disponible
      const materiaisFormArray = this.form.get('materiais') as FormArray;
      

      if (materiaisFormArray) {
        // Itera sobre cada control del FormArray y actualiza el valor de almacen
        for (const control of materiaisFormArray.controls) {
          const materialControl = control.get('articulo');

          if (materialControl) {
            const material = materialControl.value; // Obtén el material actual del formulario

            const dataStock = await this.almacenStockDisponible(material, changes['almacen'].currentValue);


            // Actualiza los valores en el control
            control.patchValue({
              almacen: changes['almacen'].currentValue,
              stock: dataStock.StockDisponible || 0 ,
              comprometido: dataStock.Comprometido || 0 ,
              StockAlmacen: dataStock.StockTotal || 0 
            });
          } else {
            console.warn('Control "material" no encontrado en el FormGroup', control);
          }
        }

        // Actualiza el valor en localStorage si es necesario
        this.setLocalStorage(materiaisFormArray.value);
      }
    }

    if (changes['id_lista']) {
      // Lógica que deseas ejecutar cuando 'id_lista' cambie
      // Asegúrate de que el FormArray 'materiais' esté disponible

      let id_lista = changes['id_lista'].currentValue;
      const materiaisFormArray = this.form.get('materiais') as FormArray;

      if (materiaisFormArray) {
        // Itera sobre cada control del FormArray y actualiza el valor de almacen

        for (const control of materiaisFormArray.controls) {
          let id_tipo_cliente = 0;
          let totalbruto = 0;
          let descuento = 0;

          if (changes['id_tipo_cliente']) {
            id_tipo_cliente = changes['id_tipo_cliente'].currentValue
          }
          else {
            const id_tipo_clienteControl = control.get('id_tipo_cliente');
            id_tipo_cliente = id_tipo_clienteControl.value;
          }
          const materialControl = control.get('articulo');
          const cantidadControl = control.get('cantidad');
          if (control.get('totalbruto')) {
            totalbruto = control.get('totalbruto').value;
          }
          if (control.get('descuento')) {
            descuento = control.get('descuento').value;
          }
          /*   descuento = descuentoControl.value; */

          if (materialControl) {
            const material = materialControl.value; // Obtén el material actual del formulario
            const cantidad = cantidadControl.value; // Obtén cantidad actual del formulario

             const dataCambioLista = await this.onPrimerCalculo(cantidad, material, id_lista, id_tipo_cliente, totalbruto, descuento);


            // Actualiza los valores en el control
              control.patchValue({
                id_tipo_cliente: id_tipo_cliente,
                id_lista: id_lista,
                cantidad: dataCambioLista.cantidad,
                descuento: 0,
                descuento_permitido: 'Valido',
                descuento_permitido_valor: dataCambioLista.descuento_permitido,
                pesoEspecifico: dataCambioLista.pesoEspecifico,
                precio: dataCambioLista.precio,
                preciobruto: dataCambioLista.preciobruto,
                descuenttoneladao: dataCambioLista.tonelada,
                totalbs: dataCambioLista.totalbs,
                valorTotal: dataCambioLista.valorTotal,
                valorTotalBruto: dataCambioLista.valorTotalBruto,
              });
          } else {
            console.warn('Control "material" no encontrado en el FormGroup', control);
          }
        }

        // Actualiza el valor en localStorage si es necesario
        this.setLocalStorage(materiaisFormArray.value);
      }
    }

    if (changes['id_tipo_cliente']) {
      let id_tipo_cliente = changes['id_tipo_cliente'].currentValue;
      const materiaisFormArray = this.form.get('materiais') as FormArray;

      if (materiaisFormArray) {
        // Itera sobre cada control del FormArray y actualiza el valor de almacen
        let id_lista = '';
        let totalbruto = '';
        let descuento = '';

        for (const control of materiaisFormArray.controls) {

          if (changes['id_lista']) {
            id_tipo_cliente = changes['id_lista'].currentValue;
          }
          else {
            const id_tipo_clienteControl = control.get('id_lista');
            id_lista = id_tipo_clienteControl.value;
          }
          const materialControl = control.get('articulo');
          const cantidadControl = control.get('cantidad');
          if (control.get('totalbruto')) {
            totalbruto = control.get('totalbruto').value;
          }
          if (control.get('descuento')) {
            descuento = control.get('descuento').value;
          }
          /*   descuento = descuentoControl.value; */
          if (materialControl && cantidadControl) {
            const material = materialControl.value; // Obtén el material actual del formulario
            const cantidad = cantidadControl.value; // Obtén cantidad actual del formulario
            const dataCambioLista = await this.onPrimerCalculo(cantidad, material, id_lista, id_tipo_cliente, 0, descuento);
            // Actualiza los valores en el control
              control.patchValue({
                id_tipo_cliente: id_tipo_cliente,
                id_lista: id_lista,
                cantidad: dataCambioLista.cantidad,
                descuento: 0,

                descuento_permitido: 'Valido',
                descuento_permitido_valor: dataCambioLista.descuento_permitido,
                pesoEspecifico: dataCambioLista.pesoEspecifico,
                precio: dataCambioLista.precio,
                preciobruto: dataCambioLista.preciobruto,
                descuenttoneladao: dataCambioLista.tonelada,
                totalbs: dataCambioLista.totalbs,
                valorTotal: dataCambioLista.valorTotal,
                valorTotalBruto: dataCambioLista.valorTotalBruto,
              });
          } else {
            console.warn('Control "material" no encontrado en el FormGroup', control);
          }
        }

        // Actualiza el valor en localStorage si es necesario
        this.setLocalStorage(materiaisFormArray.value);
      }
    }
    if (changes['modoEntrega']) {
      //console.log('modoEntrega ha cambiado:', changes['modoEntrega'].currentValue);
      // Lógica que deseas ejecutar cuando 'id_tipo_cliente' cambie
    }
  }

  modoEntregas(): void {
    const materiaisFormArray = this.form.get('materiais') as FormArray;

    if (materiaisFormArray) {
      materiaisFormArray.controls.forEach((control: FormGroup) => {
        const modoEntregaControl = control.get('modoEntrega');

        if (modoEntregaControl) {
          modoEntregaControl.valueChanges.subscribe((newValue) => {
            this.setLocalStorage(materiaisFormArray.value);
          });
        }
      });
    }
  }
  checkPreviously(): void {
    const _localStorage = localStorage.getItem('materiais');

    if (_localStorage !== null) {
      const materiais = JSON.parse(atob(_localStorage));

      if (materiais.length > 0) {
        this.confirmModalService
          .showConfirm(
            null,
            `Cotizacion no finalizada`,
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
  ngOnDestroy(): void {
    if (this.subscriptionSubmit) {
      this.subscriptionSubmit.unsubscribe();
      this.subscriptionSubmit = null;
    }
    this.materiaisSubscription.unsubscribe();
    this.clearLocalStorage();
  }
  materiaisSubject(): void {
    this.materiaisSubscription =
      this.formularioService.materiaisSubject.subscribe((response: any) => {
        const materiais = this.formatMateriais(response);
        this.onAddMaterial(materiais);
      });
  }

  formatMateriais(data: Array<IMaterial>): Array<ICarrinhoModel> {
    let materiais = [];
    for (let index = 0; index < data.length; index++) {
      let material = {
        codCotacao: this.codCotacao !== null ? this.codCotacao : null,
        id_material: data[index].ID_CODIGOMATERIAL,
        articulo: data[index].CODIGOMATERIAL,
        descripcion: data[index].DESCRICAO,
        id_unidad: data[index].id_unidad,
        unidad: data[index].SIGLAS_UNI,
        cantidad: data[index].cantidad ?? 1,
        peso: data[index].PESO,
        id_tipo_cliente: data[index].id_tipo_cliente,
        id_lista: data[index].id_lista,
        modoEntrega: data[index].modoEntrega ?? 0,
      };
      materiais.push(material);
    }
    return materiais;
  }


  clearLocalStorage(): void {
    localStorage.removeItem('materiais');
  }

  openModaldataMaestro(template: TemplateRef<any>, articulo: string, lista: number) {
    this.formularioService.updateArticulo(articulo, lista);
    this.modalRef = this.modalService.show(template, {
      animated: false,
      class: 'modal-xl',
    });
}


  submitSubscription(): void {
    this.subscriptionSubmit =
      this.formularioService.notifySubmitObservable$.subscribe(
        (response: any) => {
          if (response) {
            if (this.form.valid) {
              this.carritoEmitter();
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
  carritoEmitter(): void {
    this.hasError.emit(false);

    this.carrito.emit({
      materiais: this.form.value.materiais,
      total: this.total,
    });
  }

  onConfirmAddMaterial(materiais: Array<ICarrinhoModel>): void {
    this.onAddMaterial(materiais);
  }

  setFormBuilder() {
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

  async almacenStockDisponible(material, almacen): Promise<JsonResponse> {
    const params = {
      codDepo: almacen,
      codMate: material
    }

    try {
      const response = await this.onStockDisponible(params);
      //console.log('datos de respuesta', response);
      if (response.success === true) {
        return response.data; // Devuelve el resultado para asignarlo a `data`
      } else {
        /* this.pnotifyService.notice(response.mensagem); */
        return null; // Devuelve `null` si hay un error
      }
    } catch (error) {
      //console.error('Error en la calculadora', error);
      return null; // Devuelve `null` si hay un error
    }
  }
  onStockDisponible(params): Promise<JsonResponse> {
    return this.formularioService.getAlmacenStockDisponible(params).pipe(
      finalize(() => {
      })
    ).toPromise() as Promise<JsonResponse>;
  }

  get materiais(): FormArray {
    return this.form.get('materiais') as FormArray;
  }


  async onAddMaterial(materiais: Array<ICarrinhoModel>): Promise<void> {
    //console.log('ICarrinhoModel materiais:', materiais);
    if (materiais.length > 0) {
      let qtdeAdicionados = 0;
      for (let i = 0; i < materiais.length; i++) {
        const material = materiais[i];
        const existe = this.materiais.controls.some(control => control.get('id_material')?.value === material.id_material);
            if (existe) {
                continue; // Si ya existe, salta al siguiente material
            }
        // Determina la cantidad
        this.quantidade = material.cantidad ?? 1;
        // Determina el tipo de cliente
        const tipo_cliente = material.id_tipo_cliente ?? this.id_tipo_cliente;
        // Determina la lista del cliente
        const lista_cliente = material.id_lista ?? this.id_lista;
        // Determina el almacen
        const almacen = material.almacen ?? this.almacen;
        let descuento1 = material.descuento ?? 0.0000;

        // Realiza el cálculo inicial
        const dataCalculo = await this.onPrimerCalculo(this.quantidade, material.articulo, lista_cliente, tipo_cliente, 0, material.descuento ?? 0);
        const dataStock = await this.almacenStockDisponible(material.articulo, almacen);
        
        if (dataCalculo.descuento != '.0000' && dataCalculo.descuento != undefined) {
            descuento1 = dataCalculo.descuento;
        }
        let stock = 0
        let pedido = 0
        let comprometido = 0
        let StockAlmacen = 0
        if (dataStock != null && dataStock.StockDisponible != null || dataStock.StockDisponible == 0) {
          stock = dataStock.StockDisponible;
          pedido = dataStock.Pedido;
          comprometido = dataStock.Comprometido;
          StockAlmacen = dataStock.StockTotal;
        }

        this.selectedModoEntrega = material.modo_entrega ?? 0;

        // Agrega el material al FormArray `materiais`
        this.materiais.push( 
          this.formBuilder.group({
            id_material: [material.id_material],
            articulo: [material.articulo],
            descripcion: [material.descripcion],
            cantidad: [dataCalculo.cantidad],
            id_unidad: [material.id_unidad],
            unidad: [material.unidad],
            peso_unidad: [material.peso],
            peso: [material.peso],
            precioUnitario: [material.precioUnitario],
            id_tipo_cliente: [tipo_cliente],
            id_lista: [lista_cliente],
            descuento: [descuento1],
            descuento_permitido: 'Valido',
            descuento_permitido_valor: [parseFloat(dataCalculo.descuento_permitido ).toFixed(4)],
            pesoEspecifico: [dataCalculo.pesoEspecifico],
            precio: [dataCalculo.precio],
            preciobruto: [dataCalculo.preciobruto],
            descuenttoneladao: [dataCalculo.tonelada],
            totalbs: [dataCalculo.totalbs],
            valorTotal: [dataCalculo.valorTotal],
            valorTotalBruto: [dataCalculo.valorTotalBruto],
            almacen: [almacen], 
            StockAlmacen: [StockAlmacen], 
            stock: [dataStock.StockDisponible],
            pedido: [pedido], 
            comprometido: [comprometido],
            modoEntrega: [this.selectedModoEntrega],
            tipoEntrega: this.tipoEntrega ?? 0
          })
        );
        // console.log("Materiales de carrito",this.materiais);
        qtdeAdicionados++;
      }
      this.onCalcularTotais(true);
      if (qtdeAdicionados > 0) {
        this.setLocalStorage(this.form.value.materiais);
      }
    }
  }


  classStatusBorder(material: ICarrinhoModel): string {
    let borderClass: string;

    /*  if (Math.floor(material.valorUnit * 100) / 100 > material.valor) {
       borderClass = 'border-danger';
     } else { */
    borderClass = 'border-success';
    /*    } */

    return borderClass;
  }

  buscarMaterial(event){
    const valorBusqueda = event.target.value;
    if (valorBusqueda) {
      this.formularioService.getDataMateriales({ search: valorBusqueda }).subscribe((response: Array<JsonResponse | any>) => {
        this.materiales = response['data'];
       // console.log('materiales buscados:', this.materiales);
      });
    } else {
      this.materiales = [];
    }
  }
  async seleccionarMaterial(data){
    const materiais =  this.formatMateriais([data]);

    await this.onAddMaterial(materiais);
    this.materiales = [];
  }
  hideSuggestions() {
    setTimeout(() => {
      this.materiales = [];
    }, 200);
  }

  onCalcularTotais(emitter: boolean): void {
    const materiais = this.form.value.materiais;
   // console.log("materiales calculo",materiais);
    this.total.peso = 0;
    this.total.valorTotal = 0;
    this.total.valorTotalBruto = 0;
    this.total.valorTotalBs = 0;
    this.total.valorTotalBrutoBs = 0;
    this.total.impuesto = 0;
    this.total.impuestoTotal = 0;
    this.total.descuento_total = 0;
    this.total.cantidad_total = 0;
    this.total.autorizacion= 0;
    if (materiais.length > 0) {
      for (let index = 0; index < materiais.length; index++) {
        this.total.peso += materiais[index].pesoEspecifico;
        this.total.valorTotal += materiais[index].valorTotal;
        this.total.valorTotalBruto += materiais[index].valorTotalBruto;
        this.total.valorTotalBs += materiais[index].valorTotalBruto * 6.96;
        this.total.impuesto = this.total.valorTotalBruto * 0.13;
        this.total.impuestoTotal = this.total.valorTotalBruto - (this.total.valorTotalBruto * 0.13);
        this.total.valorTotalBrutoBs += materiais[index].totalbs;
        this.total.descuento_total += parseInt(materiais[index].descuento, 10) || 0;
        this.total.cantidad_total += parseInt(materiais[index].cantidad, 10) || 0;
        if(materiais[index].Autorizacion == 1)
        {
          this.total.autorizacion=materiais[index].Autorizacion;
        }
      }
      this.setLocalStorage(this.form.value.materiais);
    }

    if (emitter === true) {
      this.carrinhoEmitter();
    }
  }
  carrinhoEmitter(): void {
    this.hasError.emit(false);
    this.carrito.emit({
      materiais: this.form.value.materiais,
      total: this.total,
    });
    
  }

  setLocalStorage(data: Array<ICarrinhoModel>): void {
    this.clearLocalStorage();
    localStorage.setItem('materiais', btoa(JSON.stringify(data)));
  }

  onReset(): any {
    this.confirmReset().subscribe(
      (response: boolean) => {
        if (response === true) {
          this.sWvacio.emit(true);
          this.onLimparCarrinho();
        }
      },
      (error: any) => {
        this.pnotifyService.error();
      }
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

  onLimparCarrinho(): void {
    const materiais = this.form.get('materiais') as FormArray;
    materiais.clear();
    this.onCalcularTotais(true);
    this.clearLocalStorage();
  }

  limpiarCarrito(): void {
    const materiais = this.form.get('materiais') as FormArray;
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
  deleteMaterialCotacao(params: any): Observable<any> {
    this.loaderNavbar.emit(true);
    return this.ofertasService.deleteMaterialCotacao(
      this.setParamsDeleteMaterial(params)
    );
  }
  setParamsDeleteMaterial(params: any): Object {
    let _params: any = {};

    _params.codDeposito = params.codDeposito;
    _params.codMaterial = params.codMaterial;

    return _params;
  }
  onDeleteMaterial(index: number, material: IMaterial): void {
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
              if (this.materiais.controls.length <= 0) {
                this.sWvacio.emit(true);
              } else {
                this.sWvacio.emit(false);
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
  onLoteSelecionado(): void {
    const formArray = this.form.controls.materiais as FormArray;
    this.setLocalStorage(this.form.value.materiais);
  }
  async onCalcularCantidad(event, material: FormGroup, codigo, lista, tipo, totalbruto, descuento): Promise<any> {
    this.quantidade = event.target.value;
    let params = {
      codigo_material: codigo,
      quantidade: this.quantidade,
      lista_precio: lista,
      id_tipo_cliente: tipo,
      totalbruto: 0,
      descuento: descuento,
    };
    //console.log('datos que enviar calculadora', params);
    const response = await this.onCalculadora(params);
   // console.log('datos de respuesta', response);
    if (response.estado === true) {
      const result = response.result;
      const estadoDescuento = result.descuento > result.descuento_permitido ? 'Invalido' : 'Valido';
      // Actualiza los valores directamente en el FormGroup `material`
      material.patchValue({
        precio: result.precio,
        valorTotalBruto: result.valorTotalBruto,
        descuento: result.descuento,
        descuento_permitido: estadoDescuento,
        preciobruto: result.preciobruto,
        totalbs: result.totalbs,
        pesoEspecifico: result.pesoEspecifico
      });
      this.onCalcularTotais(true);
      return result;
    } else {
      this.pnotifyService.notice(response.mensagem);
      return null;
    }
  }
  async onCalcularDescuento(event, material: FormGroup, codigo, lista, tipo, cantidad): Promise<any> {
    let descuento = event.target.value;

    let params = {
      codigo_material: codigo,
      quantidade: cantidad,
      lista_precio: lista,
      id_tipo_cliente: tipo,
      totalbruto: 0,
      descuento: descuento,
    };

   //console.log('datos que enviar calculadora', params);
    const response = await this.onCalculadora(params);
   // console.log('datos de respuesta', response);
    if (response.estado === true) {
      const result = response.result;
      const estadoDescuento = result.descuento > result.descuento_permitido ? 'Invalido' : 'Valido';
      // Actualiza los valores directamente en el FormGroup `material`
      material.patchValue({
        precio: result.precio,
        valorTotalBruto: result.valorTotalBruto,
        descuento: result.descuento,
        descuento_permitido: estadoDescuento,
        preciobruto: result.preciobruto,
        totalbs: result.totalbs,
        pesoEspecifico: result.pesoEspecifico
      });

      this.onCalcularTotais(true);
      return result;
    } else {
      this.pnotifyService.notice(response.mensagem);
      return null;
    }
  }

  async onCalcularTotalBruto(event, material: FormGroup, codigo, lista, tipo, cantidad, descuento): Promise<any> {
    let totalbruto = event.target.value;

    let params = {
      codigo_material: codigo,
      quantidade: cantidad,
      lista_precio: lista,
      id_tipo_cliente: tipo,
      totalbruto: totalbruto,
      descuento: descuento,
    };

    //console.log('datos que enviar calculadora', params);
    const response = await this.onCalculadora(params);
    //console.log('datos de respuesta', response);
    if (response.estado === true) {
      const result = response.result;
      const estadoDescuento = result.descuento > result.descuento_permitido ? 'Invalido' : 'Valido';
      // Actualiza los valores directamente en el FormGroup `material`
      material.patchValue({
        precio: result.precio,
        valorTotalBruto: result.valorTotalBruto,
        descuento: result.descuento,
        descuento_permitido: estadoDescuento,
        preciobruto: result.preciobruto,
        totalbs: result.totalbs,
        pesoEspecifico: result.pesoEspecifico
      });
      this.onCalcularTotais(true);
      return result;
    } else {
      this.pnotifyService.notice(response.mensagem);
      return null;
    }
  }

  async onPrimerCalculo(cantidad, codigo, lista, tipo, totalbruto, descuento): Promise<any> {
    let params = {
      codigo_material: codigo,
      quantidade: cantidad,
      lista_precio: lista,
      totalbruto: totalbruto,
      descuento: descuento,
      id_tipo_cliente: tipo,
    };
   // console.log('datos que enviar calculadora', params);
    try {
      const response = await this.onCalculadora(params);
      //console.log('datos de respuesta', response);
      if (response.estado === true) {
        this.onCalcularTotais(true);
        return response.result; // Devuelve el resultado para asignarlo a `data`
      } else {
        this.pnotifyService.notice(response.mensagem);
        return null; // Devuelve `null` si hay un error
      }
    } catch (error) {
      console.error('Error en la calculadora', error);
      return null; // Devuelve `null` si hay un error
    }
  }
  onCalculadora(params): Promise<JsonResponse> {
    return this.formularioService.postCalculo(params).pipe(
      finalize(() => {
      })
    ).toPromise() as Promise<JsonResponse>;
  }

 /*  onModoEntregaChange(event, material: FormGroup) {
    const selectedValue = event.target.value;
    console.log('modo de entrega', selectedValue);

  } */
    async onModoEntregaChange(event: any, material: FormGroup, codigo: string, lista: number, tipo: number, totalbruto: number, cantidad: number, descuento: number) {
      const modoEntregaSeleccionado = event;
      let params = {
        codigo_material: codigo,
        lista_precio: lista,
        id_tipo_cliente: tipo,
        totalbruto: totalbruto,
        quantidade: cantidad,
        descuento: descuento,
      };
      const response = await this.onCalculadora(params);
      const result = response.result;
      material.patchValue({
        tipoEntrega: modoEntregaSeleccionado
      });
      this.onCalcularTotais(true);
      return result;
    }


}
