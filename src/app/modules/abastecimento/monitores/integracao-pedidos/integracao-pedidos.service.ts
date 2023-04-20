import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AbastecimentoMonitoresIntegracaoPedidosService {

  private readonly BASE_URL = environment.API;

  constructor(
    private httpClient: HttpClient
  ) { }

  getIntegradoresPedidos(params) : Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/integradores-pedidos`, {
      params: {
        IN_STAT: params
      },
      observe: "response"
    });
  }

  getIntegradorDepositos(params) : Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/cadastros/associacao-integrador-pedidos-depositos`,
    {
      params: {
        ID_APOI_INTE_PEDI: params['ID_APOI_INTE_PEDI']
      },
      observe: "response"
    })
    .pipe(take(1))
  }

  getLinhas(idSituacao) : Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/linhas`,{
      params: {
        IN_STAT: idSituacao
      },
      observe: "response"
    });
  }

  getSubLinhas(descricaoLinhas,idSituacao) {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/sub-linhas`,{
      params: {
        ID_LINH: descricaoLinhas.toString(),
        IN_STAT:idSituacao
      },
      observe: "response"
    });
  }

  getClasses(descricaoLinhas, idSubLinha, idSituacao) : Observable<any> {
    if (!idSubLinha)
      idSubLinha = "";
    return this.httpClient.get(`${this.BASE_URL}/common/v2/classes`, {
      params: {
        ID_LINH: descricaoLinhas.toString(),
        ID_SUB_LINH: idSubLinha,
        IN_STAT: idSituacao
      },
      observe: "response"
    });
  }  

  getMateriais(idClasses, idTipoMaterial, idSituacao) : Observable<any> {
    if (!idClasses)
      idClasses = "";
    if (!idTipoMaterial)
      idTipoMaterial = "";

    return this.httpClient.get(`${this.BASE_URL}/common/v2/materiais`, {
      params: {
        ID_CLAS: idClasses.toString(),
        ID_APOI_TIPO_MATE: idTipoMaterial.toString(),
        IN_STAT: idSituacao
      },
       observe: "response"
    });
  }

  getSituacoes() : Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/cadastros/situacao-integracao-pedido`, {
      observe: "response"
    });
  }

  getPedidosIntegracao(params) : Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/cadastros/pedidos-integracao`, {
      params: {
        DT_INIC_ENVI: params['DT_INIC_ENVI'],
        DT_FINA_ENVI: params['DT_FINA_ENVI'],
        ID_APOI_INTE_PEDI: params['ID_APOI_INTE_PEDI'].toString(),
        //ID_EMPR: params['ID_EMPR'],
        ID_DEPO: params['ID_DEPO'].toString(),
        //ID_FORN: params['ID_FORN'],
        ID_LINH: params['ID_LINH'],
        ID_SUB_LINH: params['ID_SUB_LINH'],
        ID_CLAS: params['ID_CLAS'],
        ID_MATE: params['ID_MATE'].toString(),
        //NR_PEDI: params['NR_PEDI'],
        ID_STAT_PEDI: params['ID_STAT_PEDI'].toString(),
        IN_INCL_ITEM_PEDI: params['IN_INCL_ITEM_PEDI'],
        IN_GERA_RELA_EXCE: params['IN_GERA_RELA_EXCE'],
        ID_USUA: params['ID_USUA'],
        NR_PAGE_INIC: params['NR_PAGE_INIC'],
        TT_REGI_PAGI: params['TT_REGI_PAGI'],
        ORDE_BY: params['ORDE_BY'],
        ORDE_TYPE: params['ORDE_TYPE']
      },
       observe: "response"
    });
  }

  getPedidosIntegracaoItens(params) : Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/cadastros/pedido-integracao-itens`, {
      params: {
        ID_INTE_PEDI_COMP: params['ID_INTE_PEDI_COMP'],
        ID_STAT_ITEM_PEDI: "",
        NR_PAGE_INIC: "",
        TT_REGI_PAGI: "",
        ORDE_BY: "",
        ORDE_TYPE: ""
      },
       observe: "response"
    });
  }

  getPedidosIntegracaoLogs(params) : Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/cadastros/pedido-integracao-itens-auditoria`, {
      params: {
        ID_INTE_PEDI_COMP: params['ID_INTE_PEDI_COMP'],
        ID_INTE_PEDI_COMP_ITEM: params['ID_INTE_PEDI_COMP_ITEM'],
        NR_PAGE_INIC: "",
        TT_REGI_PAGI: "",
        ORDE_BY: "",
        ORDE_TYPE: ""
      },
       observe: "response"
    });
  }
}
