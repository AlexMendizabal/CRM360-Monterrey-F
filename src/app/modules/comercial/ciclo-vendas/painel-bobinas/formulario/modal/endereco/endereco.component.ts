import { Component, OnInit, Input } from '@angular/core';

// ngx-bootstrap
import { BsModalRef } from 'ngx-bootstrap/modal';

//service
import { DateService } from 'src/app/shared/services/core/date.service';

@Component({
  selector:
    'comercial-ciclo-vendas-cotacoes-formulario-modal-detalhes-endereco',
  templateUrl: './endereco.component.html',
  styleUrls: ['./endereco.component.scss'],
})
export class ComercialCicloVendasPainelBobinasFormularioModalDetalhesEnderecoComponent
  implements OnInit {
  @Input('endereco') endereco: any;

  constructor(
    private bsModalRef: BsModalRef,
    private dateService: DateService
    ) {}

  ngOnInit(): void {}

  convertMysqlTime(time: string) {
    return this.dateService.convertMysqlTime(time);
  }

  onClose(): void {
    this.bsModalRef.hide();
  }
}
