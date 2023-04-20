import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { DetailPanelService } from 'src/app/shared/templates/detail-panel/detal-panel.service';
import { ControladoriaAssociacoesPluserTipoDespesaService } from '../services/tipo-despesa.service';

import { PageChangedEvent } from 'ngx-bootstrap';
import { finalize } from 'rxjs/operators';

import { IControladoriaAssociacoesPluserTipoDespesaPlanoContaAssociacao } from '../models/associacao';
import { ILogisticaSonfranIdealPlanoConta } from 'src/app/modules/logistica/models/softra-ideal/planoConta';
import { IControladoriaAssociacoesPluserTipoDespesa } from '../models/tipoDespesa';
import { LogisticaSofranIdealPlanoContaService } from 'src/app/modules/logistica/services/softran-ideal/plano-conta.service';

@Component({
  selector: 'controladoria-associacoes-pluser-plano-conta',
  templateUrl: './plano-conta.component.html',
  styleUrls: ['./plano-conta.component.scss']
})
export class ControladoriaAssociacoesPluserTipoDespesaPlanoContaComponent implements OnInit {

  @Input() set setTipoDespesa(tipoDespesa) {

    if (Object.keys(tipoDespesa).length === 0)
      return;

    this.tipoDespesa = tipoDespesa;
    this.onViewDetails();

  };

  planosConta: ILogisticaSonfranIdealPlanoConta[] = [];
  noResult: boolean = false;
  loading: boolean = true;

  /* Pagination */
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalItems: any = 10;
  begin: number = 0;
  end: number = this.itemsPerPage;
  /* Pagination */

  tipoDespesa: IControladoriaAssociacoesPluserTipoDespesa;

  form: FormGroup;

  constructor(
    private planoContaService: LogisticaSofranIdealPlanoContaService,
    private pnotify: PNotifyService,
    private detailPanelService: DetailPanelService,
    private service: ControladoriaAssociacoesPluserTipoDespesaService,
    private formBuilder: FormBuilder
  ) {
  }

  ngOnInit(): void {
    this.onFormBuilder();
    this.getPlanoConta({ ORDE_BY: "DS_PLAN_CONT" });
  }

  onFormBuilder() {
    this.form = this.formBuilder.group({
      search: [null]
    })
  }

  getPlanoConta(params?) {
    this.loading = true;

    params = {...params, "CD_PLAN_CONT_TIPO": 4}

    this.planoContaService
      .getPlanoConta(params)
      .pipe(
        finalize(() => {
          this.begin = 0;
          this.end = 10;
          this.currentPage = 1;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {

            this.planosConta = response.body["data"];
            this.totalItems = this.planosConta.length;

            if (this.tipoDespesa)
              this.getAssociacoes({ CD_REFE: this.tipoDespesa.CD_DESP_TIPO, IN_STAT: '1' });
            else
              this.loading = false;

            this.noResult = false;

          } else {
            this.planosConta = [];
            this.noResult = true;
          }
        },
        (error) => {
          this.planosConta = [];
          this.noResult = true;
          this.pnotify.error();
        }
      )
  }

  getAssociacoes(params?) {

    this.service
      .getAssociacoes(params)
      .pipe(
        finalize(() => {
          this.loading = false
        })
      )
      .subscribe(
        async (response) => {

          if (response.status !== 200) {
            this.planosConta.map(item => item["CHEC"] = false);
            return
          }

          const associacoes: IControladoriaAssociacoesPluserTipoDespesaPlanoContaAssociacao[] = response.body["data"];

          let associacoesIds: number[] = [];

          const promise = associacoes
            .filter((associacao) => associacao.IN_STAT == '1')
            .map((associacao) => associacoesIds.push(associacao.CD_ASSO))

          await Promise
            .all(promise)
            .then(async () => {

              this.planosConta
                .map(item => {
                  item["CHEC"] = associacoesIds.includes(item.CD_PLAN_CONT)
                });

            })
            .catch(() => {
              this.planosConta.map(item => item["CHEC"] = false);
            })
        },
        (error) => {
          this.planosConta.map(item => item["CHEC"] = false);
          this.pnotify.error();
        }
      )
  }

  postAssociacoes(item: ILogisticaSonfranIdealPlanoConta) {

    item["LOAD"] = true;
    //item["CHEC"] = !item["CHEC"];

    const _params = {
      CD_ASSO: item.CD_PLAN_CONT,
      CD_REFE: this.tipoDespesa["CD_DESP"],
      IN_STAT: item["CHEC"] ? '0' : '1',
      ID_INTE_PLUS_DPAR_TIPO_ASSO: 1
    }

    this.service
      .postAssociacao(_params)
      .pipe(
        finalize(() => {
          item["LOAD"] = false;
        })
      )
      .subscribe(
        response => {
          this.pnotify.success();
          this.getAssociacoes({ CD_REFE: this.tipoDespesa.CD_DESP_TIPO, IN_STAT: '1' });
        },
        error => {
          try {
            this.pnotify.error(error.error.message)
          } catch (error) {
            this.pnotify.error();
          }
        }
      )
  }

  onViewDetails() {
    this.detailPanelService.show();
    this.detailPanelService.loadedFinished(false);
    this.getAssociacoes({ CD_REFE: this.tipoDespesa.CD_DESP_TIPO, IN_STAT: '1' });
    this.loading = true;

  }

  onPageChanged($event: PageChangedEvent) {
    this.begin = ($event.page - 1) * this.itemsPerPage;
    this.end = this.begin + this.itemsPerPage;
  }

  onFilter() {

    let _value = this.form.get("search").value ?? '';

    let _params = { ORDE_BY: "DS_PLAN_CONT" };

    if (Number.isInteger(_value)) {
      _params["CD_PLAN_CONT"] = _value;
    } else {
      _params["DS_PLAN_CONT"] = _value;
    }

    this.getPlanoConta(_params)

  }

}
