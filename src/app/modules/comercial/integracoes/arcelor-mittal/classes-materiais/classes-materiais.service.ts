import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ComercialIntegracoesArcelorMittalClassesMateriaisService {
  private readonly API = `https://crm360.monterrey.com.bo/api/comercial/integracoes/arcelor-mittal/classes-materiais`;

  constructor(protected http: HttpClient) {}

  getLista() {
    return this.http.get(`${this.API}/lista`).pipe(take(1));
  }

  getAssociacoes(idArcelorMittal: number) {
    return this.http
      .get(`${this.API}/associacoes/${idArcelorMittal}`)
      .pipe(take(1));
  }

  getClasses() {
    return this.http.get(`${this.API}/classes`).pipe(take(1));
  }

  updateAssociacao(data: any) {
    return this.http.put(`${this.API}/salvar`, data).pipe(take(1));
  }
}
