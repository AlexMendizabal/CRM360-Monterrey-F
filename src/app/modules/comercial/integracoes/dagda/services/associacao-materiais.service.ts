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
export class ComercialIntegracoesServicosIntegracaoMateriaisComponent {
  private readonly BASE_URL: string = `https://crm360.monterrey.com.bo/api`;
  private readonly API = `http://127.0.0.1:8000/comercial`;

  constructor(
    private http: HttpClient,
    private comercialService: ComercialService,
    private tidSoftwareService: ComercialTidSoftwareService
  ) {}

  getAssociacao(param: any) {
    return this.http.get(
      `${this.BASE_URL}/comercial/integracoes/dagda/associacao`,
      {
        params: param,
        observe: 'response',
      }
    );
  }

  getDetalhes(param: any) {
    return this.http.get(
      `${this.BASE_URL}/comercial/integracoes/dagda/detalhes`,
      {
        params: param,
        observe: 'response',
      }
    );
  }

  getLinhas() {
    return this.http.get(`${this.BASE_URL}/common/v2/linhas`, {
      observe: 'response',
    });
  }

  getClasses(param) {
    return this.http.get(`${this.BASE_URL}/common/v2/classes`, {
      params: param,
      observe: 'response',
    });
  }

  getMateriais(param) {
    return this.http.get(`${this.BASE_URL}/common/v2/materiais`, {
      params: param,
      observe: 'response',
    });
  }

  onSubmit(param) {
    if (param.codigoMaterial) {
      return this.http.post(
        `${this.BASE_URL}/comercial/integracoes/dagda/associacao`,
        param,
        { observe: 'response' }
      );
    } else {
      return this.http.post(
        `${this.BASE_URL}/comercial/integracoes/dagda/associacao-altera-integracao`,
        param,
        { observe: 'response' }
      );
    }
  }

  deleteAssociacao(param: any) {
    return this.http.post(
      `${this.BASE_URL}/comercial/integracoes/dagda/delete-associacao`,
      param,
      { observe: 'response' }
    );
  }

  getMateriaisDagda(param?) {
    return this.http.get(
      `${this.BASE_URL}/comercial/integracoes/dagda/materiais-dagda`,
      {
        params: param,
        observe: 'response',
      }
    );
  }

  getFilterValues(): Observable<Object | JsonResponse> {
    const linhas = this.tidSoftwareService.getLinhas();
    const classes = this.comercialService.getClasses(null);

    return forkJoin([linhas, classes]);
  }

  getMateriaisTid(params: any = []): Observable<Object | JsonResponse> {
    let httpParams = new HttpParams();

    for (let param in params) {
      httpParams = httpParams.append(param, params[param]);
    }

    return this.http
      .get(`${this.API}/materiais`, { params: httpParams })
      .pipe(take(1), retry(2));
  }
}
