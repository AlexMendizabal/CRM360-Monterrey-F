import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { ComercialVendedoresService } from 'src/app/modules/comercial/services/vendedores.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { PNotify } from 'pnotify/dist/es/PNotify';
import { JsonResponse } from 'src/app/models/json-response';
import { finalize } from 'rxjs/operators';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'comercial-cliclo-vendas-pedidos-producao-telas-formulario-modal-selecionar',
  templateUrl: './selecionar.component.html',
  styleUrls: ['./selecionar.component.scss']
})
export class ComercialCicloVendasPedidosProducaoTelasFormularioModalSelecionarComponent
  implements OnInit {
  loaderNavbar: EventEmitter<boolean> = new EventEmitter();

  @Output() cliente = new EventEmitter();
  @Output() fecharModal = new EventEmitter();

  formClientes: FormGroup;
  loadingClientes:boolean
  noClientes = true;
  clientes = [];

    /* Pagination */
    itemsPerPage = 10;
    begin = 0;
    end = 20;
    /* Pagination */

  constructor(
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private bsModalRef: BsModalRef,
    private comercialService: ComercialVendedoresService

    ) {}

  ngOnInit(): void {
    this.setFormBuilder();
  }

  onClose(): void {
    this.fecharModal.emit(true)
  }

  getClientes(params?){
    const _params = params ?? {};
    const _obj = this.formClientes.value;
    this.loadingClientes = true;
    if (_obj['pesquisa']) _params[_obj['buscarPor']] = _obj['pesquisa'];
    this.comercialService
      .getCarteiraClientes(_params)
      .pipe(
        finalize(() => {
          this.loadingClientes = false;
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.success === true) {
              this.noClientes = false;
              this.clientes = response.data;
          } else {
            this.noClientes = true;
            this.pnotifyService.notice('Nenhum cliente encontrado!');
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
        }
      });
  }

  setCliente(cliente) {
    console.log(cliente)
    this.cliente.emit(cliente)
  }

  setFormBuilder(): void {
    this.formClientes = this.formBuilder.group({
      buscarPor: ['NM_CLIE'],
      pesquisa: [null, Validators.required],
      NM_CLIE:[null],
      registros: [this.itemsPerPage],
    });
  }


}
