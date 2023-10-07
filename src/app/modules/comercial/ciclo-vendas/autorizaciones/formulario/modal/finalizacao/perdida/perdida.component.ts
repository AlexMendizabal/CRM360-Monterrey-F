import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
// ngx-bootstrap
import { BsModalRef } from 'ngx-bootstrap/modal';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialCicloVendasAutorizacionesService } from '../../../../autorizaciones.service';
import { ComercialCadastrosConcorrenteService } from 'src/app/modules/comercial/cadastros/concorrentes/concorrentes.service';
import { ComercialCicloVendasCotacoesFormularioModalDetalhesConcorrenteService } from '../../detalhes/concorrente/concorrente.service';
import { ComercialCicloVendasCotacoesFormularioService } from '../../../formulario.service';

// Interfaces
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { JsonResponse } from 'src/app/models/json-response';
import { Concorrente } from '../../../../../../cadastros/concorrentes/models/concorrente';
import { ICarrinhoModel } from '../../../models/carrinho';


@Component({
  selector:
    'comercial-ciclo-vendas-cotacoes-formulario-modal-finalizacao-perdida',
  templateUrl: './perdida.component.html',
  styleUrls: ['./perdida.component.scss'],
})
export class ComercialCicloVendasCotacoesFormularioModalFinalizacaoPerdidaComponent
  implements OnInit {
  @Input('dataCotacao') dataCotacao: any;

  tableConfig: Partial<CustomTableConfig> = {
    isFixed: true,
    border: false,
    small: false,
    hover: false,
    theme: {
      color: 'white',
    },
  };

  form: FormGroup;
  submittingForm: boolean;

  concorrentes: Concorrente[] = [];
  concorrentesLoader: boolean;

  constructor(
    private location : Location,
    private bsModalRef: BsModalRef,
    private formBuilder: FormBuilder,
    private pnotifyService: PNotifyService,
    private cotacoesService: ComercialCicloVendasAutorizacionesService,
    private concorrentesService: ComercialCadastrosConcorrenteService,
    private _concorrentesService: ComercialCicloVendasCotacoesFormularioModalDetalhesConcorrenteService,
    private formularioService: ComercialCicloVendasCotacoesFormularioService,
    private router: Router,
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.getConcorrentes();
    this.setFormBuilder();
  }

  getConcorrentes(): void {
    this.concorrentes = [];
    this.concorrentesLoader = true;

    this.concorrentesService
      .getListaConcorrentes({})
      .pipe(
        finalize(() => {
          this.concorrentesLoader = false;
        })
      )
      .subscribe((response: JsonResponse) => {
        this.concorrentes = response.data;
      });
  }

  onDetalhesConcorrente(): void {
    if (this.form.value.codConcorrente !== null) {
      this._concorrentesService.showModal(this.form.value.codConcorrente);
    }
  }

  getLinkAddConcorrente(): string {
    return '/comercial/cadastros/concorrentes/novo';
  }

  onReloadConcorrentes(): void {
    this.getConcorrentes();
  }

  setFormBuilder(): void {
    this.form = this.formBuilder.group({
      codConcorrente: [null],
      materiais: this.formBuilder.array([]),
    });

    this.onAddMaterial(this.dataCotacao.carrinho);
  }

  get materiais(): FormArray {
    return this.form.get('materiais') as FormArray;
  }

  onAddMaterial(materiais: Array<ICarrinhoModel>): void {
    if (materiais.length > 0) {
      for (let i = 0; i < materiais.length; i++) {
        this.materiais.push(
          this.formBuilder.group({
            idReservado: [materiais[i].idReservado],
            codCotacao: [materiais[i].codCotacao],
            codMaterial: [materiais[i].codMaterial],
            nomeMaterial: [materiais[i].nomeMaterial],
            quantidade: [materiais[i].quantidade],
            valorUnit: [materiais[i].valorUnit],
            valor: [materiais[i].valor],
            percentualIpi: [materiais[i].percentualIpi],
            valorIpi: [materiais[i].valorIpi],
            percentualIcms: [materiais[i].percentualIcms],
            valorIcms: [materiais[i].valorIcms],
            valorIcmsSt: [materiais[i].valorIcmsSt],
            valorConcorrente: [materiais[i].valorConcorrente],
            tipoDesc: [materiais[i].tipoDesc],
            valorDesc: [materiais[i].valorDesc],
            percentualDesc: [materiais[i].percentualDesc],
            valorTotalOri: [materiais[i].valorTotalOri],
            valorTotal: [materiais[i].valorTotal],
            codDeposito: [materiais[i].codDeposito],
            nomeDeposito: [materiais[i].nomeDeposito],
            medida1: [materiais[i].medida1],
            medida2: [materiais[i].medida2],
            pesoEspecifico: [materiais[i].pesoEspecifico],
          })
        );
      }
    }
  }

  calcularTotais(field: string): number {
    let total = {
      quantidade: 0,
      valor: 0,
      concorrente: 0,
    };

    for (let index = 0; index < this.dataCotacao.carrinho.length; index++) {
      total.quantidade += this.dataCotacao.carrinho[index].quantidade;
      total.valor += this.dataCotacao.carrinho[index].valorTotal;
    }

    if (field === 'concorrente') {
      for (let index = 0; index < this.form.value.materiais.length; index++) {
        const material = this.form.value.materiais[index];

        total.concorrente += material.valorConcorrente;
      }
    }

    return total[field];
  }

  onSubmit(): void {
    if (this.checkFormValidators() === true) {
      return;
    }

    this.submittingForm = true;

    const formValue = {
      codConcorrenteTid: this.form.value.codConcorrente,
      carrinho: this.form.value.materiais,
    };

    const dataCotacao = Object.assign(this.dataCotacao, formValue);

    this.cotacoesService
      .postCotacaoPerdida(dataCotacao)
      .pipe(
        finalize(() => {
          this.submittingForm = false;
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.success === true) {
            this.onClose();
          } else {
            this.pnotifyService.error();
          }
        },
        error: (error) => {
          this.pnotifyService.error();
        }
      });

    this.onClose();
  }

  checkFormValidators(): boolean {
    let hasError = false;

    let mapError = {
      codConcorrente: true,
      valorConcorrente: true,
    };

    if (this.form.value.codConcorrente !== null) {
      mapError.codConcorrente = false;
    }

    for (let index = 0; index < this.form.value.materiais.length; index++) {
      const material = this.form.value.materiais[index];

      if (material.valorConcorrente > 0) {
        mapError.valorConcorrente = false;
      }
    }

    if (
      mapError.codConcorrente === true &&
      mapError.valorConcorrente === true
    ) {
      hasError = true;

      this.pnotifyService.notice(
        'Selecione um concorrente ou informe o valor.'
      );
    }

    return hasError;
  }

  onClose(): void {
    let idSubModulo = this.dataCotacao.idSubModulo;
    this.formularioService.limparCarrinhoSubject.next(true);

    this.bsModalRef.hide();
    this.router.navigate([`/comercial/ciclo-vendas/${idSubModulo}/cotacoes-pedidos/lista`]);
  }
}
