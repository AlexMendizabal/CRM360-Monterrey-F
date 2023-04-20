import { event } from './../../../admin/perfis/models/event';
import { Injectable, EventEmitter } from '@angular/core';

// services
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { IComercialAknaContatos } from './models/contatos';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ComercialAknaContatosService {
  private readonly API = environment.API;
  event: EventEmitter<Partial<event>> = new EventEmitter<Partial<event>>();
  constructor(private http: HttpClient) {}
  getContatos(params?) {
    return this.http.get(
      `${this.API}/comercial/integracoes/akna/listas-contatos`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  postContatos(contatos: IComercialAknaContatos) {
    return this.http.post(`${this.API}/comercial/akna/contatos`, contatos, {
      observe: 'response',
    });
  }

  // -------------------------------------------Clientes-------------------------------

  getClientes(params?) {
    return this.http.get(
      `${this.API}/comercial/integracoes/akna/listas-contatos-clientes`,
      {
        params: params,
        observe: 'response',
      }
    );
  }
  getSetorAtividades(params?) {
    return this.http.get(
      `${this.API}/comercial/emailMarketing/associacao/setor-atividade`,
      {
        params: params,
        observe: 'response',
      }
    );
  }

  postVinculoClientes(params) {
    return this.http.post(`${this.API}`, params, {
      observe: 'response',
    });
  }

  onEventLoading(value: boolean): void {
    this.event.emit({ loading: value });
  }

  onEventFilter(): void {
    this.event.emit({ filter: true });
  }
}
