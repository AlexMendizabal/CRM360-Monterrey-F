import { Injectable } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';


// Services
import { ComercialVendedoresService } from '../../services/vendedores.service';
import { ComercialClientesCadastroDadosFaturamentoFormularioService } from '../cadastro/dados-faturamento/formulario/formulario.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { take,  retry} from 'rxjs/operators';
import { JsonResponse } from 'src/app/models/json-response';


@Injectable({
  providedIn: 'root'
})
export class ComercialClientesPreCadastroService {
  private readonly BASE_URL: string = `http://127.0.0.1:8000/api`   ;
  
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
    let ciudades = this.dadosFaturamentoService.getCiudades();
    return forkJoin(ciudades);
  }


  getCenaes(){
    let cnaes = this.dadosFaturamentoService.getCnaes();
    return forkJoin(cnaes);
  }

  /* updateCliente(params){
    return this.http.post(
      `${this.BASE_URL}/sap/cliente_update`,
      params,
      { observe: 'response' }
    );
  } */

  updateCliente(params: any){
    return this.http
      .post(`http://127.0.0.1:8000/sap/cliente_update`, params)
      .pipe(take(1), retry(2));
  }

  

  postAkna(param){
    return this.http.post(
      `${this.BASE_URL}/sap/actualizar_item`,
      param,
      { observe: 'response' }
    );
  }
}
function tap(arg0: (data: any) => void): import("rxjs").OperatorFunction<Object, unknown> {
  throw new Error('Function not implemented.');
}

