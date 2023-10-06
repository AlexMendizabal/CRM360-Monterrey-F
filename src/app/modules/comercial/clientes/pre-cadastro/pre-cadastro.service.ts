import { Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';

// Services
import { ComercialVendedoresService } from '../../services/vendedores.service';
import { ComercialClientesCadastroDadosFaturamentoFormularioService } from '../cadastro/dados-faturamento/formulario/formulario.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ComercialClientesPreCadastroService {
  private readonly BASE_URL: string = `http://23.254.204.187/api`;

  constructor(
    private vendedoresService: ComercialVendedoresService,
    private dadosFaturamentoService: ComercialClientesCadastroDadosFaturamentoFormularioService,
    private http: HttpClient
  ) {}

  loadDependencies() {
    let vendedores = this.vendedoresService.getVendedores();
    let cnaes = this.dadosFaturamentoService.getCnaes();

    return forkJoin([vendedores, cnaes]);
  }

  postAkna(param){
    return this.http.post(
      `${this.BASE_URL}/comercial/integracoes/akna/log-email-boas-vindas`,
      param,
      { observe: 'response' }
    );
  }
}
