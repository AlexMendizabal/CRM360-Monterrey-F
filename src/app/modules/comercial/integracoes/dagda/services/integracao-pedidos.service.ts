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
export class ComercialIntegracoesDagdaIntegracaoPedidosService {

  private readonly BASE_URL: string = `http://23.254.204.187/api`;

  private readonly API = `http://23.254.204.187/api/comercial/integracoes/dagda`;

  constructor(
    private http: HttpClient,
    private comercialService: ComercialService,
    private tidSoftwareService: ComercialTidSoftwareService
  ) {}

  getIntegracaoPedidos(param: any) {
    return this.http.get(
      `${this.API}`,
      {
        params: param,
        observe: 'response',
      }
    );
  }

  postIntegracaoPedidos(params) {
    return this.http.post(`${this.API}`, params, {
      observe: 'response',
    });
  }

  getIntegracaoStatus() {
    return this.http.get(
      `${this.API}/status`
    );
  }

  getIntegracaoLogs(param: any) {
    return this.http.get(
      `${this.API}/logs`,
      {
        params: param,
        observe: 'response',
      }
    );
  }
}
