//import { Map } from 'ol/Map';
import { Subtitles } from './../../../../../../../../shared/modules/subtitles/subtitles';
import { Component, OnInit, Input } from '@angular/core';
import { EMPTY } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

// ngx-bootstrap
import { BsModalRef } from 'ngx-bootstrap/modal';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { ComercialCicloVendasCotacoesFormularioService } from '../../../formulario.service';
import { ComercialCicloVendasAutorizacionesService } from '../../../../autorizaciones.service';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { IMateriaisModel } from '../../../models/materiais';

@Component({
  selector:
    'comercial-ciclo-vendas-cotacoes-formulario-modal-historico-compras',
  templateUrl: './historico-compras.component.html',
  styleUrls: ['./historico-compras.component.scss'],
})
export class ComercialCicloVendasCotacoesFormularioModalHistoricoComprasComponent
  implements OnInit
{
  @Input('_codEndereco') _codEndereco: number;
  @Input('_codCliente') _codCliente: number;
  @Input('_ultimasCompras') _ultimasCompras: any[];
  @Input('_maisComprados') _maisComprados: IMateriaisModel[];

  tableConfigUltimasCompras: Partial<CustomTableConfig> = {
    isFixed: true,
    subtitleBorder: true,
  };

  tableConfigMaisComprados: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  subtitlesUltimasCompras: Array<Subtitles> = [
    {
      id: 1,
      text: 'Disponível em estoque',
      color: 'green',
    },
    {
      id: 2,
      text: 'Indisponível em estoque',
      color: 'red',
    },
  ];

  subtitlesMaisComprados: Array<Subtitles> = [
    {
      id: 1,
      text: 'Disponível em estoque',
      color: 'green',
    },
    {
      id: 2,
      text: 'Indisponível em estoque',
      color: 'red',
    },
  ];

  loader = false;

  codCliente: number;
  codEndereco: number;
  ultimasCompras: Array<any> = [];
  maisComprados: Array<IMateriaisModel> = [];
  material: Array<any> = [];

  activeRow: any;

  addedMaterial: boolean;

  constructor(
    private bsModalRef: BsModalRef,
    private pnotifyService: PNotifyService,
    private confirmModalService: ConfirmModalService,
    private formularioService: ComercialCicloVendasCotacoesFormularioService,
    private cotacoesService: ComercialCicloVendasAutorizacionesService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.codCliente = this._codCliente;
    this.codEndereco = this._codEndereco;
    this.setUltimasCompras(this._ultimasCompras);
    this.setMaisComprados(this._maisComprados);

    this.addedMaterial = false;
  }

  onClose(): void {
    this.bsModalRef.hide();
    this.checkAlterouCliente();
  }

  checkAlterouCliente(): void {
    if (this._codCliente !== this.codCliente) {
      this.confirmModalService
        .showConfirm(
          null,
          'Alteração de cliente',
          'O cliente selecionado no histórico de compras não é o mesmo da cotação. Deseja alterar o cliente da cotação?',
          'Cancelar',
          'Confirmar'
        )
        .subscribe((response: boolean) =>
          response
            ? this.formularioService.codCliente.emit(this.codCliente)
            : EMPTY
        );
    }
  }

  setUltimasCompras(materiais: any): void {
    this.ultimasCompras = materiais.map(function (el: any) {
      var o = Object.assign({}, el);
      o.checked = 0;
      return o;
    });
  }

  setMaisComprados(materiais: IMateriaisModel[]): void {
    this.maisComprados = materiais.map(function (el: any) {
      var o = Object.assign({}, el);
      o.checked = 0;
      return o;
    });
  }

  classTableActive(j: number, i: number): string {
    return this.activeRow == `${j}_${i}` ? 'table-active' : '';
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

  onClonarCompra(ultimaCompra: any): void {
    this.confirmModalService
      .showConfirm(
        null,
        'Clonar compra',
        'Deseja clonar os materiais da cotação?',
        'Cancelar',
        'Confirmar'
      )
      .subscribe((response: boolean) =>
        response ? this.clonarCompra(ultimaCompra) : EMPTY
      );
  }

  clonarCompra(ultimaCompra: any): void {
    let materiais = [];

    for (let index = 0; index < ultimaCompra.materiais.length; index++) {
      materiais.push(ultimaCompra.materiais[index]);
    }

    this.formularioService.materiaisSubject.next(materiais);
    this.onClose();
  }

  onActiveRow(index: any): void {
    this.activeRow = index;
  }

  onCheckMaterialMaisComprados(index: number, material: IMateriaisModel): void {
    if (this.maisComprados[index].codSituacao == 'A') {
      this.maisComprados[index].checked = material.checked == 0 ? 1 : 0;
    } else {
      this.pnotifyService.notice(
        'Material inativo, favor entrar em contato com o Marketing'
      );
    }
  }

  onAddMaterial(historico: string) {
    let materiais = [];
    let inativos: number;
    if (historico == 'maisComprados') {
      for (let index = 0; index < this.maisComprados.length; index++) {
        if (this.maisComprados[index].checked === 1) {
          materiais.push(this.maisComprados[index]);
          this.maisComprados[index].checked = 0;
        }
      }
    } else {
      this.ultimasCompras.forEach((el) => {
        for (let i = 0; i < el.materiais.length; i++) {
          if (
            el.materiais[i]['checked'] == true &&
            el.materiais[i]['codSituacao'] == 'A'
          ) {
            materiais.push(el.materiais[i]);
          } else if (
            el.materiais[i]['checked'] == true &&
            el.materiais[i]['codSituacao'] != 'A'
          ) {
            this.pnotifyService.notice(
              `Material #${el.materiais[i]['codMaterial']} inativo, favor entrar em contato com o Marketing`
            );
            inativos++;
          }
        }
      });
    }

    if (materiais.length > 0) {
      this.formularioService.materiaisSubject.next(materiais);
      this.addedMaterial = true;
      setTimeout(() => {
        this.addedMaterial = false;
      }, 1000);

      this.onClose();
    } else if (materiais.length == 0 && inativos == 0) {
      this.pnotifyService.notice('Selecione ao menos um material.');
    }
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
}
