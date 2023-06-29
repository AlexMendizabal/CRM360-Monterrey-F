import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { take, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ComercialService } from '../../../comercial.service';
import { ComercialTidSoftwareService } from '../../../tid-software/tid-software.service';
import { JsonResponse } from 'src/app/models/json-response';
import { Observable, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ComercialIntegracoesDagdaServicesAssociacaoCondicoesPagamento {
  private readonly BASE_URL: string = `http://127.0.0.1:8000/api`;

  constructor(
    private http: HttpClient,
    private comercialService: ComercialService,
    private tidSoftwareService: ComercialTidSoftwareService
  ) {}

  getAssociacoes(param?: any) {
    return this.http.get(
      `${this.BASE_URL}/comercial/integracoes/dagda/condicao-pagamento`,
      {
        params: param,
        observe: 'response',
      }
    );
  }

  getCondicoesPagamentoDagda() {
    return this.http.get(
      `${this.BASE_URL}/comercial/integracoes/dagda/condicao-pagamento-dagda`,
      {
        observe: 'response',
      }
    );
  }

  getCondicoesPagamentoTid() {
    return this.http.get(
      `${this.BASE_URL}/comercial/integracoes/dagda/condicao-pagamento-tid`,
      {
        observe: 'response',
      }
    );
  }

  createAssociacao(param: any) {
    return this.http.post(
      `${this.BASE_URL}/comercial/integracoes/dagda/condicao-pagamento`,
      param,
      {
        observe: 'response',
      }
    );
  }

  getDetalhes(param?: any) {
    return [
      {
        codigoTid: param.codigoTid,
        descricaoTid: 'Descrição Tid ' + param.codigoTid,
        codigoDagda: param.codigoTid,
        descricaoDagda: 'Descrição Dagda ' + param.codigoTid,
      },
    ];
  }

  getAss(param: any) {
    return [
      {
        codigoTid: '100',
        descricaoTid: 'Pagamento a Vista',
        codigoDagda: '999',
        descricaoDagda: 'Pagamento na hora',
      },
    ];
  }

  oonSubmit(param) {
    if (param.codigoMaterial) {
      return this.http.post(
        `${this.BASE_URL}/comercial/integracoes/dagda/associacao`,
        param,
        { observe: 'response' }
      );
    } else {
      return this.http.post(
        `${this.BASE_URL}/comercial/integracoes/dagda/associacao-altera-integracao`,
        param,
        { observe: 'response' }
      );
    }
  }

  deleteAssociacao(param: any) {
    return this.http.post(
      `${this.BASE_URL}/comercial/integracoes/dagda/delete-associacao`,
      param,
      { observe: 'response' }
    );
  }
}
