import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AbastecimentoCadastrosParametrosGeraisEstoqueService {

  private readonly BASE_URL = environment.API;

  constructor(
    private httpClient: HttpClient
  ) { }

  getEmpresas (params): Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/empresas`, {
      params: {
        IN_STAT: params['idSituacao']
      },
      observe: "response"
    });
  }

  getDepositos(params): Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/depositos`, {
      params: {
        ID_EMPR: params['idsEmpresa'].toString(),
        IN_STAT: params['idSituacao']
      },
      observe: "response"
    });
  }

  getTiposMateriais(params): Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/tipos-material`, {
      params: {
        IN_STAT: params['idSituacao']
      },
      observe: "response"
    });
  }

  getLinhas(params): Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/linhas`,{
      params: {
        IN_STAT: params['idSituacao']
      },
      observe: "response"
    });
  }

  getSubLinhas(params): Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/sub-linhas`,{
      params: {
        ID_LINH: params['descricaoLinhas'].toString(),
        IN_STAT:params['idSituacao']
      },
      observe: "response"
    });
  }

  getClasses(params): Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/classes`, {
      params: {
        ID_LINH: params['descricaoLinhas'].toString(),
        ID_SUB_LINH: params['idSubLinha'].toString(),
        IN_STAT: params['idSituacao']
      },
      observe: "response"
    });
  }

  getMateriais(params): Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/materiais`, {
      params: {
        ID_CLAS: params['idClasses'].toString(),
        ID_APOI_TIPO_MATE: params['idTipoMaterial'].toString(),
        IN_STAT: params['idSituacao']
      },
       observe: "response"
    });
  }
  
  getNivelEstoqueClasseDeposito(_params): Observable<any> {
    const params = {
      ID_EMPR : _params['ID_EMPR'] ? _params['ID_EMPR'].toString() : '',
      ID_CLAS : _params['ID_CLAS'] ? _params['ID_CLAS'].toString() : '',
      ID_DEPO : _params['ID_DEPO'] ? _params['ID_DEPO'].toString() : '',
      ID_LINH : _params['ID_LINH'] ? _params['ID_LINH'].toString() : '',
      ID_MATE : _params['ID_MATE'] ? _params['ID_MATE'].toString() : '',
      ID_SUB_LINH: _params['ID_SUB_LINH'] ? _params['ID_SUB_LINH'].toString() : '',
      ID_TIPO_MATE: _params['ID_TIPO_MATE'] ? _params['ID_TIPO_MATE'].toString() :'',
      IN_STAT: _params['IN_STAT'] ?? '',
      IN_RELA_EXCE: _params['IN_RELA_EXCE'] ?? '',
      TT_MESE_PERI_VEND_SIMU: _params['TT_MESE_PERI_VEND_SIMU'] ?? '',
      ID_USUA: _params['ID_USUA'] ?? ''
    }

    return this.httpClient.get(`${this.BASE_URL}/abastecimento/cadastros/nivel-estoque-classes-depositos`, {
      params,
      observe: "response"
    });
  }

  getCalculoPeriodoVendasRealizadas(params): Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/cadastros/vendas-realizadas-classe-periodo`, {
      params,
      observe: "response"
    })
  }

  getCalculoPeriodoVendasRealizadasMaterial(params): Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/cadastros/vendas-realizadas-material-periodo`, {
      params,
      observe: "response"
    })
  }

  getCalculoPeriodoVendasRealizadasClasseMaterial(params): Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/cadastros/vendas-realizadas-classe-material-periodo`, {
      params,
      observe: "response"
    })
  }

  /* Detalhes de Materiais */
  getTiposNiveisdeEstoque(): Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/common/v2/tipos-niveis-estoque`, {
      observe: "response"
    });
  }

  getNivelEstoqueMaterialDeposito(params): Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/cadastros/nivel-estoque-materiais-deposito`, {
      params,
      observe: "response"
    });
  }

  postNivelEstoqueMaterialDeposito(record): Observable<any> {
    return this.httpClient.post(`${this.BASE_URL}/abastecimento/cadastros/nivel-estoque-material-deposito`,
      record
    );
  }

  postNivelEstoqueMaterialDepositoAltearar(record): Observable<any> {
    return this.httpClient.post(`${this.BASE_URL}/abastecimento/cadastros/deposito-associado-material-alterar`,
      record
    );
  }

  getNivelEstoqueMaterialDepositoLogs(params): Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/cadastros/nivel-estoque-material-deposito-auditoria`, {
      params,
      observe: "response"
    });
  }
  /* Detalhes de Materiais */
  
  /* Vinculo Material Depósito */
  getMaterialDepositos(_params): Observable<any> {
    const params = {
      ID_DEPO: _params['ID_DEPO'] ? _params['ID_DEPO'].toString() : '' ,
      ID_APOI_TIPO_MATE: _params['ID_APOI_TIPO_MATE'] ? _params['ID_APOI_TIPO_MATE'].toString() : '' ,
      ID_LINH: _params['ID_LINH'] ? _params['ID_LINH'].toString() : '' ,
      ID_SUB_LINH: _params['ID_SUB_LINH'] ? _params['ID_SUB_LINH'].toString() : '' ,
      ID_CLAS: _params['ID_CLAS'] ? _params['ID_CLAS'].toString() : '' ,
      ID_SITU_MATE: _params['ID_SITU_MATE'] ?? '' ,
    }
    
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/cadastros/materiais-disponiveis-associacao-depositos`, {
      params,
      observe: "response"
    });
  }

  postMaterialDeposito(record): Observable<any> {
    return this.httpClient.post(`${this.BASE_URL}/abastecimento/cadastros/deposito-associado-material`,
      record
    )
  }

  getMaterialDepositosDetalhes(params): Observable<any> {
    return this.httpClient.get(`${this.BASE_URL}/abastecimento/cadastros/depositos-associados-materiais`, {
      params,
      observe: "response"
    })
  }
  /* Vinculo Material Depósito */

  /* Cadastro de Niveis de Estoque */
  postNivelEstoque(record): Observable<any> {
    return this.httpClient.post(`${this.BASE_URL}/abastecimento/cadastros/nivel-estoque-totais`,
      record
    )
  }
  /* Cadastro de Niveis de Estoque */

}
