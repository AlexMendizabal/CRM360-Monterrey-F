import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { EMPTY } from 'rxjs';

// ngx-bootstrap
import { BsModalRef } from 'ngx-bootstrap/modal';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { ComercialCicloVendasCotacoesFormularioService } from '../../../formulario.service';
import { ComercialCicloVendasCotacoesService } from '../../../../cotacoes.service';

// Interfaces
import { ICarrinhoModel } from '../../../models/carrinho';
import { ICalculoModel } from '../../../models/calculo';
import { JsonResponse } from 'src/app/models/json-response';
import { finalize } from 'rxjs/operators';
import { ComercialService } from '../../../../../../comercial.service';

@Component({
  selector: 'comercial-ciclo-vendas-cotacoes-formulario-modal-material-ubicacion',
  templateUrl: './ubicacion.component.html',
  styleUrls: ['./ubicacion.component.scss'],
})


export class ComercialCicloVendasCotacoesFormularioModalMaterialUbicacionComponent
  implements OnInit {

  /* @Input('id_presentacion') id_presentacion : number; */

  @Output() latLngChanged = new EventEmitter<{ latitud: number, longitud: number }>();
  @Output() fecharModal = new EventEmitter();


  loaderModal: boolean;
  swDesactivarForm = true;



  form: FormGroup;

  tipoCalculo: number;
  descPreco: string;
  descQtde: string;

  currencyMaskOptions = {
    align: 'left',
    prefix: '',
    thousands: '.',
    decimal: ',',
    precision: 3,
  };

  opcoesVenda: Array<any> = [];
  arrayPresentacion: Array<any> = [];
  swPresentacion = false;
  id_presentacion: number = 0;
  latitud: number = -17.78629;
  longitud: number = -63.18117;
  direccion: string;
  showModal: boolean = true;



  showImpostos = false;

  constructor(
    private formBuilder: FormBuilder,
    private bsModalRef: BsModalRef,
    private pnotifyService: PNotifyService,
    private confirmModalService: ConfirmModalService,
    private formularioService: ComercialCicloVendasCotacoesFormularioService,
    private cotacoesService: ComercialCicloVendasCotacoesService,
    private comercialService: ComercialService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.setFormBuilder();
    this.getPresentacionMaterial();
    /* throw new Error("Method not implemented."); */

  }

  setFormBuilder(): void {

    this.form = this.formBuilder.group({
      latitud: [this.latitud],
      longitud: [this.longitud],
      direccion: [this.direccion],

    });

    /* this.setFormValidators(); */
  }
 /*  setFormValidators(): void {


  } */

  getPresentacionMaterial() {
    this.comercialService.getPresentacionMaterial()
      .subscribe((response: any) => {
        if (response.responseCode === 200) {
          this.arrayPresentacion = response.result;
        }
      });
  }
  actualizarMarcador(event: any) {
    this.latitud = event.coords.lat;
    this.longitud = event.coords.lng;
    this.form.controls['latitud'].setValue(this.latitud);
    this.form.controls['longitud'].setValue(this.longitud);
    this.actualizarDireccion(event);
  }
  actualizarDireccion(event: any) {
    this.obtenerDireccion(event.coords.lat, event.coords.lng)
      .then((direccion_mapa: string) => {
        this.form.controls['direccion'].setValue(direccion_mapa);
      })
      .catch((error: any) => {
        this.form.controls['direccion'].setValue(
          'Error al obtener la dirección'
        );
      });
  }
  public obtenerDireccion(latitud: number, longitud: number): Promise<string> {
    return fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitud},${longitud}&key=AIzaSyDl5b7STz9xYNDhybTTer2POVncX9FYqCc`
    )
      .then((response) => response.json())
      .then((data) => {
        const resultado = data.results[0];
        if (resultado) {
          return resultado.formatted_address;
        } else {
          return 'Dirección no encontrada';
        }
      })
      .catch((error) => {
        return 'Error al obtener la dirección';
      });
  }








  onCalcular(): void {

    this.swDesactivarForm == false;


    /* this.form.controls['formPresentacion'].enable(); */
    /* this.form.controls['formPresentacion'].setValue(3); */



    /* if (this.checkFormValidators() === false && this.form.valid) {
      if (this.material.valorMaterialContrato > 0) {
        this.postCalculoMaterial(this.tipoCalculo1, this.form.value.preco1);
      } else if (this.form.value.preco2 > 0) {
        if (
          Math.floor(this.material.valorUnit * 100) / 100 >
          this.form.value.preco2
          ) {
            this.confirmModalService
            .showConfirm(
              null,
              'Preço abaixo do mínimo',
              'O preço informado está abaixo do valor mínimo. Deseja continuar mesmo assim?',
              'Cancelar',
              'Confirmar'
              )
            .subscribe((response: boolean) =>
            response
            ? this.postCalculoMaterial(
              this.tipoCalculo2,
              this.form.value.preco2
              )
              : EMPTY
              );
            } else {
              this.postCalculoMaterial(this.tipoCalculo2, this.form.value.preco2);
            }
          } else if (this.form.value.preco1 > 0 && this.tipoLancamento == 6) {
            if (
              Math.floor(this.material.valorUnit * 100) / 100 >
              this.form.value.preco1
              ) {
                this.confirmModalService
            .showConfirm(
              null,
              'Preço abaixo do mínimo',
              'O preço informado está abaixo do valor mínimo. Deseja continuar mesmo assim?',
              'Cancelar',
              'Confirmar'
            )
            .subscribe((response: boolean) =>
              response
                ? this.postCalculoMaterial(
                  this.tipoCalculo1,
                  this.form.value.preco1
                )
                : EMPTY
            );
        } else {
          ///ewqeqweqwqw////////////////
          this.postCalculoMaterial(this.tipoCalculo1, this.form.value.preco1);
        }
      } else {
        if (
          Math.floor(this.material.valorMaterialBarra * 100) / 100 >
          this.form.value.preco1
        ) {
          this.confirmModalService
            .showConfirm(
              null,
              'Preço abaixo do mínimo',
              'O preço informado está abaixo do valor mínimo. Deseja continuar mesmo assim?',
              'Cancelar',
              'Confirmar'
            )
            .subscribe((response: boolean) =>
              response
                ? this.postCalculoMaterial(
                  this.tipoCalculo1,
                  this.form.value.preco1
                )
                : EMPTY
            );
        } else {
          this.postCalculoMaterial(this.tipoCalculo1, this.form.value.preco1);
        }
      }
    } */
    /*     this.postCalculoMaterial(this.tipoCalculo1, this.form.value.preco1);
    
     */

    this.calcularTotais();


  }



  calcularTotais(): void {

  }

  resetTotais(): void {
    /* this.calculo = {
      index: null,
      tipoCalculo: 0,
      tipoLancamento: 0,
      tonelada: 0,
      qtde: 0,
      valorUnitario: 0,
      descuento: 0.00,
      valorItem: 0,
      aliquotaIpi: 0,
      valorIpi: 0,
      aliquotaIcms: 0,
      valorIcms: 0,
      valorIcmsSt: 0,
      valorTotal: 0,
      valorBaseIcmsSt: 0,
      aliquotaReducaoIcms: 0,
      unidade: '',
      medida: 0,
      nrPedidoCliente: '',
      codItemPedidoCliente: '',
      codProdutoCliente: '',
      id_presentacion: 0,
    }; */
  }
  emitLatLng() {
    this.latLngChanged.emit({ latitud: this.latitud, longitud: this.longitud });
    this.onClose();
  }
  onSubmit(): void {
    this.emitLatLng();
    //
  }

  onClose(): void {
  this.fecharModal.emit(true);
    
  }
}
