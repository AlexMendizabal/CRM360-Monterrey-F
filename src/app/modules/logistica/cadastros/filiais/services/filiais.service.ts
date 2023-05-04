//angular
import { Injectable } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { ILogisticaFiliais } from '../models/filiais';

@Injectable({
  providedIn: 'root',
})
export class LogisticaFiliaisService {
  private readonly API = environment.API;

  constructor(private http: HttpClient) {}


  getFiliais(params?) {
    return this.http.get(
      `${this.API}/logistica/filiais`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  getFilial(id: number) {
    return this.http.get(
      `${this.API}/logistica/filiais/${id}`,
      {
        observe: 'response',
      }
    );
  }

  postFiliais(filiais: ILogisticaFiliais) {
    return this.http.post(
      `${this.API}/logistica/filiais`,
      filiais,
      {
        observe: 'response',
      }
    );
  }

  getUsuariosAssociados(params?) {
    return this.http.get(
      `${this.API}/logistica/filiais/usuarios`,
      {
        params: params,
        observe: 'response',
      }
    );
  }


  postUsuariosAssociados(associacao) {
    return this.http.post(
      `${this.API}/logistica/filiais/usuarios`,
      associacao,
      {
        observe: 'response',
      }
    );
  }

  deleteAssociacoes(params) {
    return this.http.delete(
      `${this.API}/logistica/filiais/usuarios`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  getUsuarios(params?) {
    return this.http.get(
      `${this.API}/core/mtcorp/usuarios`,
      {
        params: params,
        observe: 'response',
      }
    );
  }
}
