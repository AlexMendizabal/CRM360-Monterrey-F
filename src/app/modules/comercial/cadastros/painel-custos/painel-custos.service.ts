import { Custos } from './models/painelcustos';
import { observable, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from './../../../../../environments/environment';
import { Injectable } from '@angular/core';
import { take } from 'rxjs/operators';



@Injectable({
  providedIn: 'root'
})
export class ComercialCadastroPainelCustosService {
   private readonly API = `https://crm360.monterrey.com.bo/api/comercial/cadastros/painel-custos`;
   /*private readonly API = `http://localhost:3000`;*/

  constructor(protected http: HttpClient) {}

  listar(): Observable<any>{
    return this.http.get<Custos[]>(`${this.API}/lista`).pipe(take(1));
  }

  getlista(params: any): Observable<any>{
    return this.http.get(`${this.API}/lista`,{params, observe: 'response'});
  }

  getdetail(params: any): Observable<any>{
    return this.http.get(`${this.API}/detail/${params.ID_ITEM}`);
  }

  getdetailc(id): Observable<any>{
    return this.http.get(`${this.API}/detail/${id}`, {observe: 'response'});
  }

  getdagda(): Observable<any>{
    return this.http.get(`${this.API}/dagda`).pipe(take(1));
  }

  getdagdad(id): Observable<any>{
    return this.http.get(`${this.API}/dagda/${id}`, {observe: 'response'});
  }

  postinclusao(params: Custos): Observable<any>{
    return this.http.post(`${this.API}/inclusao/`,params);
  }

  putalteracao(params: Custos): Observable<any>{
    return this.http.put(`${this.API}/alteracao/${params.ID_ITEM}`,params);
  }

}
