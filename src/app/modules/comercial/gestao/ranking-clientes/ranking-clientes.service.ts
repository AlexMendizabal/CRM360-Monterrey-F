import { Injectable } from "@angular/core";

import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

//interfaces
import { IRanking } from './models/ranking';



@Injectable({
    providedIn: 'root',
})
export class ComercialGestaoRankingClientesService{

    private readonly API = `http://127.0.0.1:8000/comercial/gestao/ranking-clientes`;

    constructor(protected http: HttpClient) {}

    getListaRanking(params: any): Observable<any> {
        let httpParams = new HttpParams();

        for (let param in params) {
        httpParams = httpParams.append(param, params[param]);
        }

        return this.http
        .get(`${this.API}/lista`, { params: httpParams })
        .pipe(take(1));
    }

    getAlteracoes(codRanking: number): Observable<any> {
        return this.http.get(`${this.API}/alteracoes/${codRanking}`).pipe(take(1));
    }

    getDetalhes(codRanking: number): Observable<any> {
        return this.http.get(`${this.API}/detalhes/${codRanking}`).pipe(take(1));
    }

    private saveRanking(ranking: IRanking) {
        return this.http.post(`${this.API}/salvar`, ranking).pipe(take(1));
    }

    private updateRanking(ranking: IRanking) {
        return this.http.put(`${this.API}/atualizar`, ranking).pipe(take(1));
    }

    save(ranking: IRanking): Observable<any> {
        if (ranking.codClassificacao !== null) {
        return this.updateRanking(ranking);
        }

        return this.saveRanking(ranking);
    }

    activateRanking(codigo: number): Observable<any> {
        return this.http.post(`${this.API}/ativar`, codigo).pipe(take(1));
    }

    inactivateRanking(codigo: number): Observable<any> {
        return this.http.post(`${this.API}/inativar`, codigo).pipe(take(1));
    }


}
