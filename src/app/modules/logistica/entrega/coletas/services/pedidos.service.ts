// angular
import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// services
import { environment } from 'src/environments/environment';
import { ILogisticaEntregaColeta } from './../models/coleta';
import { ILogisticaEntregaColetaDocumento } from './../models/documento';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogisticaEntregaPedidosService {

  private readonly API = environment.API;
  postDocumentosEvent: EventEmitter<ILogisticaEntregaColeta> = new EventEmitter();

  constructor(
    private http: HttpClient
  ) {

  }

  postPedido(params) {
    return this.http.post(`${this.API}/logistica/coletas`, params, {
      observe: "response"
    });
  }

  getPedidos(params) {
    return this.http.get(`${this.API}/logistica/coletas`, {
      params: params,
      observe: "response"
    })
  }

  postDocumento(files: FormData, params) {
    return this.http.post(`${this.API}/logistica/coletas/documentos?ID_LOGI_COLE=${params?.ID_LOGI_COLE}`, files, {
      observe: "response"
    });
  }

  putDocumento(documento: ILogisticaEntregaColetaDocumento) {
    return this.http.put(`${this.API}/logistica/coletas/documentos`, documento, {
      observe: "response"
    });
  }

  getDocumentos(params) {
    return this.http.get(`${this.API}/logistica/coletas/documentos`, {
      params: params,
      observe: "response"
    })
  }

  getEmpresas(){
    const empresas = [
      {
        "id": "18",
        "nome": "Distribuição Tiete",
        "cnpj": "49795800001883"
      },
      {
        "id": "79",
        "nome": "Distribuição Taipas",
        "cnpj": "49795800002340"
      },
      {
        "id": "6",
        "nome": "Distribuição Osasco",
        "cnpj": "49795800001530"
      },
      {
        "id": "77",
        "nome": "Distribuição Camanducaia",
        "cnpj": "10431297000365"
      },
      {
        "id": "41",
        "nome": "Distribuição Valença",
        "cnpj": "10431297000365"
      },
      {
        "id": "19",
        "nome": "Distribuição Volta Redonda",
        "cnpj": "10431297000365"
      },
      {
        "id": "3",
        "nome": "C&D Rio das Pedras",
        "cnpj": "02506609000162"
      },
      {
        "id": "46",
        "nome": "C&D Cajamar",
        "cnpj": "02506609000243"
      },
      {
        "id": "72",
        "nome": "C&D Praia Grande",
        "cnpj": "02506609000324"
      },
      {
        "id": "9661",
        "nome": "DBA Aço Especial",
        "cnpj": "17469701002897"
      },
      {
        "id": "9645",
        "nome": "DBA Piracicaba",
        "cnpj": "17469701002897"
      },
      {
        "id": "9636",
        "nome": "DBA Praia Grande",
        "cnpj": "17469701002897"
      },
      {
        "id": "9639",
        "nome": "DBA Jacarei",
        "cnpj": "17469701002897"
      },
    ]

    return of(empresas);
  
  }


}
