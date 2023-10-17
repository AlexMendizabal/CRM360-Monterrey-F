import { Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';

// Services
import { ComercialVendedoresService } from '../../services/vendedores.service';
import { ComercialClientesCadastroDadosFaturamentoFormularioService } from '../cadastro/dados-faturamento/formulario/formulario.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ComercialClientesPreCadastroService {
  private readonly BASE_URL: string = `https://23.254.204.187/api/api`   ;

  constructor(
    private vendedoresService: ComercialVendedoresService,
    private dadosFaturamentoService: ComercialClientesCadastroDadosFaturamentoFormularioService,
    private http: HttpClient
  ) {}

  loadDependencies() {
    let vendedores = this.vendedoresService.getVendedores() ;
    let cnaes = this.dadosFaturamentoService.getCnaes();
    let ciudades = this.dadosFaturamentoService.getCiudades(); // Agregar esta línea
    return forkJoin([vendedores, cnaes, ciudades]); // Agregar ciudades aquí
  }

  getCiudades() {
    return this.http.get(`${this.BASE_URL}/ciudades`).pipe(
      take(1)
    );
  }



  postAkna(param){
    return this.http.post(
      `${this.BASE_URL}/comercial/integracoes/akna/log-email-boas-vindas`,
      param,
      { observe: 'response' }
    );
  }
}
function tap(arg0: (data: any) => void): import("rxjs").OperatorFunction<Object, unknown> {
  throw new Error('Function not implemented.');
}

