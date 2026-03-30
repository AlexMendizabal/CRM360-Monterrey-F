import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { DetailPanelService } from 'src/app/shared/templates/detail-panel/detal-panel.service';
import { ControladoriaAssociacoesPluserCentroCustoEmpresasService } from '../services/empresas.service';
import { LogisticaSoftranCentroCustoVeiculoService } from 'src/app/modules/logistica/services/softran-ideal/centro-custo-veiculo.service';

import { IControladoriaAssociacoesPluserCentroCustoEmpresaAssociacao } from '../models/associacao';
import { ILogisticaSoftranIdealCentroCustoVeiculo } from 'src/app/modules/logistica/models/softra-ideal/centroCustoVeiculo';

import { PageChangedEvent } from 'ngx-bootstrap';
import { finalize } from 'rxjs/operators';


@Component({
  selector: 'controladoria-associacoes-pluser-empresas-centro-custo',
  templateUrl: './centro-custo.component.html',
  styleUrls: ['./centro-custo.component.scss']
})
export class ControladoriaAssociacoesPluserEmpresasCentroCustoComponent implements OnInit {

  @Input() set setEmpresa(empresa) {

    if (Object.keys(empresa).length === 0)
      return;

    this.empresa = empresa;
    this.onViewDetails();

  };

  centroCustoVeiculo: ILogisticaSoftranIdealCentroCustoVeiculo[] = [];
  noResult: boolean = false;
  loading: boolean = true;

  /* Pagination */
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalItems: any = 10;
  begin: number = 0;
  end: number = this.itemsPerPage;
  /* Pagination */

  empresa: any;

  form: FormGroup;

  constructor(
    private softranCentroCustoVeiculoService: LogisticaSoftranCentroCustoVeiculoService,
    private pnotify: PNotifyService,
    private detailPanelService: DetailPanelService,
    private service: ControladoriaAssociacoesPluserCentroCustoEmpresasService,
    private formBuilder: FormBuilder
  ) {
  }

  ngOnInit(): void {
    this.onFormBuilder();
    this.getCentroCustoVeiculo({ ORDE_BY: "DS_CENT_CUST_VEIC", IN_PAGI: "0" });
  }

  onFormBuilder() {
    this.form = this.formBuilder.group({
      search: [null]
    })
  }

  getCentroCustoVeiculo(params?) {
    this.loading = true;

    this.softranCentroCustoVeiculoService
      .getCentroCustoVeiculo(params)
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

            this.centroCustoVeiculo = response.body["data"];
            this.totalItems = this.centroCustoVeiculo.length;

            if (this.empresa)
              this.getAssociacoes({ CD_REFE: this.empresa.CD_EMPR, IN_STAT: '1' });
            else
              this.loading = false;

            this.noResult = false;

          } else {
            this.centroCustoVeiculo = [];
            this.noResult = true;
            this.loading = false;
          }
        },
        (error) => {
          this.centroCustoVeiculo = [];
          this.noResult = true;
          this.loading = false;
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
            this.centroCustoVeiculo.map(item => item["CHEC"] = false);
            return
          }

          const associacoes: IControladoriaAssociacoesPluserCentroCustoEmpresaAssociacao[] = response.body["data"];

          let associacoesIds: number[] = [];

          const promise = associacoes
            .filter((associacao) => associacao.IN_STAT == '1')
            .map((associacao) => associacoesIds.push(associacao.CD_ASSO))
          console.log(associacoesIds)
          console.log(this.centroCustoVeiculo)
          await Promise
            .all(promise)
            .then(async () => {

              this.centroCustoVeiculo
                .map(item => {
                  item["CHEC"] = associacoesIds.includes(item.CD_CENT_CUST_VEIC)
                });

            })
            .catch(() => {
              this.centroCustoVeiculo.map(item => item["CHEC"] = false);
            })
        },
        (error) => {
          this.centroCustoVeiculo.map(item => item["CHEC"] = false);
          this.pnotify.error();
        }
      )
  }

  postAssociacoes(item: ILogisticaSoftranIdealCentroCustoVeiculo) {

    item["LOAD"] = true;
    //item["CHEC"] = !item["CHEC"];

    const _params = {
      CD_ASSO: item.CD_CENT_CUST_VEIC,
      CD_REFE: this.empresa["CD_EMPR"],
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
          this.getAssociacoes({ CD_REFE: this.empresa.CD_EMPR, IN_STAT: '1' });
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
    this.getAssociacoes({ CD_REFE: this.empresa.CD_EMPR, IN_STAT: "1" });
    this.loading = true;

  }

  onPageChanged($event: PageChangedEvent) {
    this.begin = ($event.page - 1) * this.itemsPerPage;
    this.end = this.begin + this.itemsPerPage;
  }

  onFilter() {

    let _value = this.form.get("search").value ?? "";

    let _params = { ORDE_BY: "DS_CENT_CUST_VEIC", IN_PAGI: "0" };

    if (Number.isInteger(_value)) {
      _params["CD_CENT_CUST_VEIC"] = _value;
    } else {
      _params["DS_CENT_CUST_VEIC"] = _value;
    }

    this.getCentroCustoVeiculo(_params)

  }

}
