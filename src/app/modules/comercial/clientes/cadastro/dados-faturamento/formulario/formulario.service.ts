import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { take, tap } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComercialClientesCadastroDadosFaturamentoFormularioService {
  private readonly API = `http://23.254.204.187/api/comercial/clientes/cadastro/formulario/dados-faturamento`;

  constructor(protected http: HttpClient) {}

  loadDependenciesPF() {
    const tiposCadastro = this.getTiposCadastro();
    const contribuintes = this.getContribuintes();
    const setorAtividades = this.getSetorAtividades();

    return forkJoin([tiposCadastro, contribuintes, setorAtividades]).pipe(
      take(1)
    );
  }

  loadDependenciesPJ() {
    const tiposCadastro = this.getTiposCadastro();
    const regimesTributacao = this.getRegimesTributacao();
    const contribuintes = this.getContribuintes();
    const setorAtividades = this.getSetorAtividades();
    const finalidadesMaterial = this.getFinalidadesMaterial();
    const cnaes = this.getCnaes();

    return forkJoin([
      tiposCadastro,
      regimesTributacao,
      contribuintes,
      setorAtividades,
      finalidadesMaterial,
      cnaes
    ]).pipe(take(1));
  }

  getTiposCadastro() {
    return this.http.get(`${this.API}/tipos-cadastro`).pipe(take(1));
  }

  getRegimesTributacao() {
    return this.http.get(`${this.API}/regimes-tributacao`).pipe(take(1));
  }

  getContribuintes() {
    return this.http.get(`${this.API}/contribuintes`).pipe(take(1));
  }

  getSetorAtividades() {
    return this.http.get(`${this.API}/setor-atividades`).pipe(take(1));
  }

  getFinalidadesMaterial() {
    return this.http.get(`${this.API}/finalidades-material`).pipe(take(1));
  }

  getCnaes() {
    return this.http.get(`${this.API}/cnaes`).pipe(take(1));
  }
  getCiudades() {
    return this.http.get(`${this.API}/ciudades`).pipe(
      take(1)
    );
  }

}
