import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AbastecimentoMonitoresAnaliseComprasService {

  private readonly BASE_URL = environment.API;

  constructor(
    private httpClient: HttpClient
  ) { }

  getDepositosAssociados(idLinhas, idClasses,idTipoMaterial,idSituacao): Observable<any> {
    let linhas;
    if (!idLinhas)
     linhas = null;
    else
    linhas = idLinhas.toString()
    if (!idClasses)
      idClasses = "";
    if (!idTipoMaterial)
      idTipoMaterial = "";

    return this.httpClient.get(`${this.BASE_URL}/abastecimento/cadastros/depositos-associados-materiais`, {
      params:{
        ID_CLAS: idClasses.toString(),
        ID_LINH: linhas,
        ID_APOI_TIPO_MATE: idTipoMaterial.toString(),
        IN_STAT: idSituacao,
        IN_SELE_COMB:"1"
      },
      observe: "response"
    });
  }

  getDepositos(idsEmpresa, idSituacao) {
    if(!idsEmpresa)
      idsEmpresa = "";

    return this.httpClient.get(`${this.BASE_URL}/common/v2/depositos`, {
      params: {
        ID_EMPR: idsEmpresa.toString(),
        IN_STAT: idSituacao
      },
      observe: "response"
    });
  }

  getFiltroNivelCritico(): Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/cadastros/niveis-criticos`,
    {
      observe: "response"
    });
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

  getTiposNiveisEstoque(idSituacao) {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/tipos-niveis-estoque`, {
      params: {
        IN_STAT: idSituacao
      },
      observe: "response"
    });
  }

  getTiposMateriais(idSituacao) : Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/tipos-material`, {
      params: {
        IN_STAT: idSituacao
      },
      observe: "response"
    });
  }

  getInfAdicionais() : Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/informacoes-adicionais-atividade/1`, {
      observe: "response"
    });
  }

  getAnaliseCompras(params) : Observable<any> {
    let idEmpresas = params["empresas"] ?? "";
    let idDeposito = params["depositos"] ?? "";
    let idNivelEstoque = params["nivelEstoque"] ?? "";
    let idTipoMaterial = params["tipoMaterial"] ?? "";
    let idSituacao = params["situacao"];
    let idLinha = params["linha"] ?? "";
    let idSubLinha = params["subLinha"] ?? "";
    let idClasse = params["classe"] ?? "";
    let idMaterial = params["material"] ?? "";
    let paramData = params["paramData"] ?? "";
    let dataInicial = params["dataInicial"] ?? "";
    let dataFinal = params["dataFinal"] ?? ""; 
    let tipoVisualizacao = params["tipoVisualizacao"] ?? "";
    let idInfAdicionais = params["infAdicionais"] ?? "";
    let qtItensPagina = params["qtItensPagina"] ?? "";
    let pagina = params["pagina"] ?? "";
    let relatorioExcel = params["relatorioExcel"] ?? "";
    let idUsuario = params["idUsuario"] ?? "";
    let orderType = params["orderType"] ?? "";
    let orderBy = params["orderBy"] ?? "";

    return this.httpClient.get(`${this.BASE_URL}/abastecimento/estoque/analise-compras`, {
      params: {
        ID_EMPR: idEmpresas.toString(),
        ID_DEPO: idDeposito.toString(),
        ID_APOI_NIVE_ESTO: idNivelEstoque,
        ID_APOI_TIPO_MATE: idTipoMaterial.toString(),
        IN_STAT: idSituacao,
        ID_LINH: idLinha,
        ID_SUB_LINH: idSubLinha,
        ID_CLAS: idClasse.toString(),
        ID_MATE: idMaterial.toString(),
        /* paramData, */
        DT_INIC_VEND: dataInicial,
        DT_FINA_VEND: dataFinal,
        TP_VISU_PAIN: tipoVisualizacao,
        ID_INFO_ADIC_ATIV: idInfAdicionais.toString(),
        NR_PAGE_INIC: pagina,
        TT_REGI_PAGI: qtItensPagina,
        IN_GERA_RELA_EXCE:  relatorioExcel,
        ID_USUA: idUsuario,
        ORDE_TYPE: orderType,
        ORDE_BY: orderBy 
      },
      observe: "response"
    });
  }

  getVendasRealizadasDetalhes(params) : Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/estoque/vendas-realizadas/detalhes`, {
      params: {
        ID_EMPR: params["ID_EMPR"].toString(),
        ID_DEPO: params["ID_DEPO"].toString(),
        DT_INIC: params["DT_INIC"],
        DT_FINA: params["DT_FINA"],
        NM_MES_ANO: params["NM_MES_ANO"],
        ID_MATE: params["ID_MATE"],
        NM_EMPR: params["NM_EMPR"],
        NM_DEPO: params["NM_DEPO"],
        NR_NOTA_FISC: params["NR_NOTA_FISC"],
        DT_NOTA_FISC: params["DT_NOTA_FISC"], 
        NM_CLIE: params["NM_CLIE"],
        NM_VEND: params["NM_VEND"],
        IN_GERA_RELA_EXCE: params["IN_GERA_RELA_EXCE"],
        ID_USUA: params["ID_USUA"],
        NR_PAGE_INIC: '',
        TT_REGI_PAGI: '',
        ORDE_TYPE: '',
        ORDER_BY: ''
      },
      observe: "response"
    });
  }

  getVendasPerdidasDetalhes(params) : Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/estoque/vendas-perdidas/detalhes`, {
      params: {
        ID_EMPR: params["ID_EMPR"].toString(),
        ID_DEPO: params["ID_DEPO"].toString(),
        DT_INIC: params["DT_INIC"],
        DT_FINA: params["DT_FINA"],
        NM_MES_ANO: params["NM_MES_ANO"],
        ID_MATE: params["ID_MATE"],
        NM_EMPR: params["NM_EMPR"],
        NM_DEPO: params["NM_DEPO"],
        NR_PROP: params["NR_PROP"],
        DT_ENCE_PROP: params["DT_ENCE_PROP"],
        NM_CLIE: params["NM_CLIE"],
        IN_DATA_ENCE_PEDI: '1',
        ID_MOTI_VEND_PERD_REFE_ERP: '4',
        IN_GERA_RELA_EXCE: params["IN_GERA_RELA_EXCE"],
        ID_USUA: params["ID_USUA"],
        NR_PAGE_INIC: '',
        TT_REGI_PAGI: '',
        ORDE_TYPE: '',
        ORDER_BY: ''
      },
      observe: "response"
    });
  }

  getCarteiraDetalhes(params) : Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/estoque/carteira-em-aberto/detalhes`, {
      params: {
        ID_EMPR: params["ID_EMPR"].toString(),
        ID_DEPO: params["ID_DEPO"].toString(),
        NM_MES_ANO: params["NM_MES_ANO"],
        ID_MATE: params["ID_MATE"],
        NM_EMPR: params["NM_EMPR"],
        NM_DEPO: params["NM_DEPO"],
        NR_PEDI_ORIG: params["NR_PEDI_ORIG"],
        DT_PEDI_ORIG: params["DT_PEDI_ORIG"],
        NR_PEDI_REME: params["NR_PEDI_REME"],
        DT_PREV_ENTR: params["DT_PREV_ENTR"],
        NM_FORN: params["NM_FORN"],
        IN_GERA_RELA_EXCE: params["IN_GERA_RELA_EXCE"],
        ID_USUA: params["ID_USUA"],
        NR_PAGE_INIC: '',
        TT_REGI_PAGI: '',
        ORDE_TYPE: '',
        ORDER_BY: ''
      },
      observe: "response"
    });
  }

  getNiveisEstoqueDetalhes(params) : Observable<any> {
    let idMaterial = params["idMaterial"] ?? "";
    let idDeposito = params["idDeposito"] ?? "";
    let dataInicial = params["dataInicial"] ?? "";
    let dataFinal = params["dataFinal"] ?? "";

    return this.httpClient.get(`${this.BASE_URL}/abastecimento/estoque/situacao-material-deposito/detalhes`, {
      params: {
        ID_MATE: idMaterial,
        ID_DEPO: idDeposito,
        DT_INIC: dataInicial,
        DT_FINA: dataFinal
      },
      observe: "response"
    });
  }

  getEstoqueComprometidoPedidoVenda(params) : Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/estoque/comprometido-pedido-venda/detalhes`, {
      params: {
        NM_EMPR: params['NM_EMPR'],
        NM_DEPO: params['NM_DEPO'],
        NM_CLIE: params['NM_CLIE'],
        NM_VEND: params['NM_VEND'],
        NR_PEDI: params['NR_PEDI'],
        NR_ITEM_PEDI: params['NR_ITEM_PEDI'],
        DT_EMIS: params['DT_EMIS'],
        ID_EMPR: params['ID_EMPR'],
        ID_DEPO: params['ID_DEPO'],
        ID_MATE: params['ID_MATE'],
        NR_PAGE_INIC: params['NR_PAGE_INIC'],
        TT_REGI_PAGI: params['TT_REGI_PAGI'],
        ORDE_BY: params['ORDE_BY'],
        ORDE_TYPE: params['ORDE_TYPE'],
        IN_GERA_RELA_EXCE: params['IN_GERA_RELA_EXCE'],
        ID_USUA: params['ID_USUA']
      },
      observe: "response"
    });
  }

  getEstoqueComprometidoPlanoCorte(params) : Observable<any> {

    return this.httpClient.get(`${this.BASE_URL}/abastecimento/estoque/comprometido-plano-corte/detalhes`, {
      params: {
        NM_EMPR: params['NM_EMPR'],
        NM_DEPO: params['NM_DEPO'],
        NM_CLIE: params['NM_CLIE'],
        NM_VEND: params['NM_VEND'],
        NR_PEDI: params['NR_PEDI'],
        NR_ITEM_PEDI: params['NR_ITEM_PEDI'],
        DT_EMIS: params['DT_EMIS'],
        ID_EMPR: params['ID_EMPR'],
        ID_DEPO: params['ID_DEPO'],
        ID_MATE: params['ID_MATE'],
        NR_PAGE_INIC: params['NR_PAGE_INIC'],
        TT_REGI_PAGI: params['TT_REGI_PAGI'],
        ORDE_BY: params['ORDE_BY'],
        ORDE_TYPE: params['ORDE_TYPE'],
        IN_GERA_RELA_EXCE: params['IN_GERA_RELA_EXCE'],
        ID_USUA: params['ID_USUA']
      },
      observe: "response"
    });
  }

  getEstoqueSupensoEntrada(params) : Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/estoque/suspenso-entrada/detalhes`, {
      params: {
        NM_EMPR: params['NM_EMPR'],
        NM_DEPO: params['NM_DEPO'],
        NR_NOTA_FISC: params['NR_NOTA_FISC'],
        DS_MOTI: params['DS_MOTI'],
        DT_ENTR: params['DT_ENTR'],
        ID_EMPR: params['ID_EMPR'],
        ID_DEPO: params['ID_DEPO'],
        ID_MATE: params['ID_MATE'],
        NR_PAGE_INIC: params['NR_PAGE_INIC'],
        TT_REGI_PAGI: params['TT_REGI_PAGI'],
        ORDE_BY: params['ORDE_BY'],
        ORDE_TYPE: params['ORDE_TYPE'],
        IN_GERA_RELA_EXCE: params['IN_GERA_RELA_EXCE'],
        ID_USUA: params['ID_USUA']
      },
      observe: "response"
    });
  }

  getEstoqueSupensoGeral(params) : Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/estoque/suspenso-geral/detalhes`, {
      params: {
        NM_EMPR: params['NM_EMPR'],
        NM_DEPO: params['NM_DEPO'],
        NR_NOTA_FISC: params['NR_NOTA_FISC'],
        DS_MOTI: params['DS_MOTI'],
        DT_ENTR: params['DT_ENTR'],
        ID_EMPR: params['ID_EMPR'],
        ID_DEPO: params['ID_DEPO'],
        ID_MATE: params['ID_MATE'],
        NR_PAGE_INIC: params['NR_PAGE_INIC'],
        TT_REGI_PAGI: params['TT_REGI_PAGI'],
        ORDE_BY: params['ORDE_BY'],
        ORDE_TYPE: params['ORDE_TYPE'],
        IN_GERA_RELA_EXCE: params['IN_GERA_RELA_EXCE'],
        ID_USUA: params['ID_USUA']
      },
      observe: "response"
    });
  }

}
