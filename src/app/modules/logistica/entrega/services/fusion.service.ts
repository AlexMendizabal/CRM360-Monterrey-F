import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LogisticaEntregaFusionService {
  private API = environment.API;

  constructor(private http: HttpClient) {}

  getPedidos(params = {}) {
    return this.http.get(`${this.API}/logistica/integracoes/fusion/pedidos`, {
      params: params,
      observe: 'response',
    });
  }

  integraPedidoFusion(params) {
    return this.http.post(
      `${this.API}/logistica/integracoes/fusion/pedidos`,
      params,
      { observe: 'response' }
    );
  }

  getManifestos(params) {
    return this.http.get(
      `${this.API}/logistica/integracoes/fusion/steellog/manifestos`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  postManifesto(params) {
    return this.http.post(
      `${this.API}/logistica/integracoes/fusion/steellog/manifestos`,
      params,
      { observe: 'response' }
    );
  }

  getFiliais() {
    return [
      {
        id: '1',
        nome: 'Centro Logístico 01',
        cnpj: '1028555020',
      },
      {
        id: '21',
        nome: 'Centro Logístico 03',
        cnpj: '1028555020',
      },
      {
        id: '2',
        nome: 'Centro Logístico 07',
        cnpj: '1028555020',
      },
      {
        id: '3',
        nome: 'Centro Logístico 08',
        cnpj: '1028555020',
      },
      {
        nome: 'Almacen 09 - Montero',
        id: '9',
        cnpj: '1028555020',
      },
      {
        nome: 'Almacen 11 - Trinidad',
        id: '11',
        cnpj: '1028555020',
      },
      {
        nome: 'Almacen 12 - Satelite',
        id: '12',
        cnpj: '1028555020',
      },
      {
        nome: 'Almacen 17 - Sucre',
        id: '17',
        cnpj: '1028555020',
      },
      {
        nome: 'Almacen 18 - La Paz',
        id: '18',
        cnpj: '1028555020',
      },
      {
        nome: 'Almacen 19 - Potosi',
        id: '19',
        cnpj: '1028555020',
      },
      {
        nome: 'Almacen 20 - Tarija',
        id: '20',
        cnpj: '1028555020',
      },
      {
        nome: 'Almacen V 32',
        id: '25',
        cnpj: '1028555020',
      },
      {
        nome: 'Centro de Acopio y Distribucion',
        id: '14',
        cnpj: '1028555020',
      },
      {
        nome: 'Producción 07',
        id: '22',
        cnpj: '1028555020',
      },
      {
        nome: 'Producción 17',
        id: '23',
        cnpj: '1028555020',
      },
      {
        nome: 'Producción 20',
        id: '24',
        cnpj: '1028555020',
      }
    ];
  }
}
