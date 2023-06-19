import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ComercialClientesCadastroDadosRelacionamentoFormularioService {
  private readonly API = `http://127.0.0.1:8000/comercial/clientes/cadastro/formulario/dados-relacionamento`;

  constructor(protected http: HttpClient) {}

  loadDepencies() {
    let tiposAtendimento = this.getTiposAtendimento();
    let periodos = this.getPeriodos();
    let frequenciaContatos = this.getFrequenciaContatos();
    let frequenciaVisitas = this.getFrequenciaVisitas();
    let origensContato = this.getOrigensContato();

    return forkJoin([
      tiposAtendimento,
      periodos,
      frequenciaContatos,
      frequenciaVisitas,
      origensContato
    ]).pipe(take(1));
  }

  getTiposAtendimento() {
    return this.http.get(`${this.API}/tipos-atendimento`).pipe(take(1));
  }

  getPeriodos() {
    return this.http.get(`${this.API}/periodos`).pipe(take(1));
  }

  getFrequenciaContatos() {
    return this.http.get(`${this.API}/frequencia-contatos`).pipe(take(1));
  }

  getFrequenciaVisitas() {
    return this.http.get(`${this.API}/frequencia-visitas`).pipe(take(1));
  }

  getOrigensContato() {
    return this.http.get(`${this.API}/origens-contato`).pipe(take(1));
  }
}
