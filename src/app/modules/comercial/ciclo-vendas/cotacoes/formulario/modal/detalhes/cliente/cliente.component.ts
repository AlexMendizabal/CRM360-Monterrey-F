import { Component, OnInit, Input } from '@angular/core';

// ngx-bootstrap
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'comercial-ciclo-vendas-cotacoes-formulario-modal-detalhes-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.scss'],
})
export class ComercialCicloVendasCotacoesFormularioModalDetalhesClienteComponent
  implements OnInit {

  @Input('cliente') cliente: any;
    
  datoscliente: any;
  constructor(private bsModalRef: BsModalRef) {}

  ngOnInit(): void {

    this.datoscliente = this.cliente.datos_cliente;
    // @ts-ignore: Ignorar error TS2339
    this.datosdireccion = this.cliente.datos_direccion;
  }

  onClose(): void {
    this.bsModalRef.hide();
  }
}
