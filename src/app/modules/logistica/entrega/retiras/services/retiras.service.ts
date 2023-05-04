// angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// services
import { environment } from 'src/environments/environment';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogisticaEntregaRetirasService {

  private readonly API = environment.API;

  constructor(
    private http: HttpClient
  ) { }

  getPedidos(params?) {
    return this.http.get(`${this.API}/logistica/entrega/formacao-carga/pedidos`, {
      params: params,
      observe: "response"
    })
  }

  getMateriais(params) {
    return this.http.get(`${this.API}/logistica/entrega/formacao-carga/pedido/${params.CD_PEDI}/materiais`, {
      params: params,
      observe: "response"
    })
  }

  getRomaneios(params?) {
    return this.http.get(`${this.API}/logistica/entrega/formacao-carga/romaneios`, {
      params: params,
      observe: "response"
    })
  }

  postRomaneio(params) {
    return this.http.post(`${this.API}/logistica/entrega/formacao-carga/romaneio`,
      params,
      { observe: "response" }
    );
  }

  postPedidos(params) {
    return this.http.post(`${this.API}/logistica/entrega/formacao-carga/romaneio/pedidos`,
      params,
      { observe: "response" }
    );
  }

  getRelatorio(params?) {
    return this.http.get(`${this.API}/logistica/entrega/formacao-carga/pedidos/relatorio`, {
      params: params,
      observe: "response"
    })
  }

  getFiliais(){
    const filiais = [
      {
        "CD_FILI": "18",
        "NM_FILI": "Distribuição Tiete",
      },
      {
        "CD_FILI": "79",
        "NM_FILI": "Distribuição Taipas",
      },
      {
        "CD_FILI": "6",
        "NM_FILI": "Distribuição Osasco",
      },
      {
        "CD_FILI": "77",
        "NM_FILI": "Distribuição Camanducaia",
      },
      {
        "CD_FILI": "41",
        "NM_FILI": "Distribuição Valença",
      },
      {
        "CD_FILI": "19",
        "NM_FILI": "Distribuição Volta Redonda",
      },
      {
        "CD_FILI": "3",
        "NM_FILI": "C&D Rio das Pedras",
      },
      {
        "CD_FILI": "46",
        "NM_FILI": "C&D Cajamar",
      },
      {
        "CD_FILI": "72",
        "NM_FILI": "C&D Praia Grande",
      },
      {
        "CD_FILI": "9661",
        "NM_FILI": "DBA Aço Especial",
      },
      {
        "CD_FILI": "9645",
        "NM_FILI": "DBA Piracicaba",
      },
      {
        "CD_FILI": "9636",
        "NM_FILI": "DBA Praia Grande",
      },
      {
        "CD_FILI": "9639",
        "NM_FILI": "DBA Jacarei",
      },
    ];

    return of(filiais);
  }
}
