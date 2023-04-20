import { Injectable } from '@angular/core';
import { take } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AbastecimentoPainelEstoqueService {
  API_URL: string = '/api/abastecimento/painel-estoque';

  constructor(protected http: HttpClient) {}
}
