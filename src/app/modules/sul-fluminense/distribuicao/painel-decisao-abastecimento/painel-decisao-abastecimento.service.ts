import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PainelDecisaoAbastecimentoService {

  private readonly BASE_URL = environment.API;

  constructor(
    private httpClient : HttpClient
  ) { }


  getMateriaisId(dados): Observable<any> {
    let unidades = dados["unidades"];
    let materiais = dados["materiais"];
    let linhas = dados["linhas"];
    let classes = dados["classes"];
    let matriculaUsuario = dados["matriculaUsuario"];
    let pagina = dados["pagina"];
    let ordenacao = dados["ordenacao"];

    return this.httpClient.get(`${this.BASE_URL}/abastecimento/demandas-materiais`, {
      params: {
        Unidades: (unidades==undefined) ? '' : (unidades),
        Materiais: (materiais==undefined) ? '' : (materiais),
        Linhas: (linhas),
        Classes: (classes==undefined) ? '' : (classes),
        MatriculaUsuario : matriculaUsuario,
        Pagina: pagina,
        CampoOrdenacao: ordenacao
      },
       observe: "response"
    });
  }

  getDemandasMateriais(dados): Observable<any> {
    let unidades = dados["unidades"];
    let materiais = dados["materiais"];

    return this.httpClient.get(`${this.BASE_URL}/abastecimento/demandas-materiais`, {
      params: {
        Unidades: (unidades==undefined) ? '' : (unidades),
        Materiais: (materiais==undefined) ? '' : (materiais)
      },
       observe: "response"
    });
  }

  getMateriaisDetalhes(idUnidade, idMaterial, pesoEspecifico): Observable<any> {
    let unidades = idUnidade;
    let materiais = idMaterial;
    //let pesoEsp = 

    return this.httpClient.get(`${this.BASE_URL}/abastecimento/demandas-materiais/detalhes`, {
      params: {
        Unidade: (unidades==undefined) ? '' : (unidades),
        Material: (materiais==undefined) ? '' : (materiais),
        PesoEspecifico: (pesoEspecifico==undefined) ? '' : (pesoEspecifico),
      },
       observe: "response"
    });
  }

  getCountMateriais(dados): Observable<any> {
    let unidades = dados["unidades"];
    let materiais = dados["materiais"];
    let linhas = dados["linhas"];
    let classes = dados["classes"];
    let matriculaUsuario = dados["matriculaUsuario"];

    return this.httpClient.get(`${this.BASE_URL}/abastecimento/materiais-em-carteira`, {
      params: {
        Unidades: (unidades==undefined) ? '' : (unidades),
        Materiais: (materiais==undefined) ? '' : (materiais),
        Linhas: (linhas),
        Classes: (classes==undefined) ? '' : (classes),
        MatriculaUsuario : matriculaUsuario,
        CampoOrdenacao: "1"
      },
       observe: "response"
    });
  }

}
