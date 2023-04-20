import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { BsLocaleService } from 'ngx-bootstrap';

import { RouterService } from 'src/app/shared/services/core/router.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

import { AbastecimentoMonitoresAnaliseComprasService } from '../analise-compras.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'abastecimento-monitores-analise-compras-modal-nivel-estoque',
  templateUrl: './modal-nivel-estoque.component.html',
  styleUrls: ['./modal-nivel-estoque.component.scss']
})
export class AbastecimentoMonitoresAnaliseComprasModalNivelEstoqueComponent implements OnInit {

  @Input() item;

  loadingDetalhesModal:boolean = false;
  noResultModal:boolean = false;
  loaderBody = false;

  dadosDetalhesNivelEstoqueModal: any = [];

  constructor(
    private formBuilder: FormBuilder,
    private localeService: BsLocaleService,
    private routerService: RouterService,
    private activatedRoute: ActivatedRoute,
    private dateService: DateService,
    private service: AbastecimentoMonitoresAnaliseComprasService,
    private pnotifyService: PNotifyService,
  ) { }

  ngOnInit(): void {
    this.setParamsNivelEstoque();
  }

  setParamsNivelEstoque() {
    let queryParams = this.routerService.getBase64UrlParams(this.activatedRoute.snapshot.queryParams);
    let dataInicial = queryParams["dataInicial"];
    let dataFinal = queryParams["dataFinal"];
  
    let params: any = [];
    let tipoVisualizacao = queryParams["tipoVisualizacao"];
    let idDeposito;
    let idMaterial = this.item["ID_MATE"];
  
    if(tipoVisualizacao == 'S') {
      idDeposito = queryParams["depositos"];
    } else if(tipoVisualizacao == 'A') {
      idDeposito = this.item["ID_DEPO"];
    }
  
    params = ({idMaterial, idDeposito, dataInicial, dataFinal});
    
    this.getNivelEstoqueDetalhes(params);
  }

  getNivelEstoqueDetalhes(params) {
    this.loaderBody = true;
    this.loadingDetalhesModal = false;
    this.noResultModal = false;

    this.dadosDetalhesNivelEstoqueModal = [];
    
    this.service.getNiveisEstoqueDetalhes(params)
    .pipe(
      finalize(() => this.loaderBody = false)
    )
    .subscribe((res: any) => {
      if (Object.keys(res).length > 0) {
        if(res.status === 200) {
          if(res['body']['responseCode'] === 200) {
            this.loadingDetalhesModal = true;
            this.noResultModal = false;
            this.dadosDetalhesNivelEstoqueModal = res['body']['result'][0];
          } else  if(res['body']['responseCode'] === 404) {
            this.noResultModal = true;
            this.loadingDetalhesModal = false;
            this.pnotifyService.notice('Não há dados');
          }
        }
      }
    },
    error => {
      this.noResultModal = true;
      this.loadingDetalhesModal = false;
      this.pnotifyService.error('Erro ao detalhes de niveis de estoque');
    });
  }

}
