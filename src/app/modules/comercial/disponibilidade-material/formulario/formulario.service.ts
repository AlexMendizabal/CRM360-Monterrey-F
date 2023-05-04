import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

// Services
import { ComercialService } from '../../comercial.service';
import { ComercialVendedoresService } from '../../services/vendedores.service';

@Injectable({
  providedIn: 'root'
})
export class ComercialDisponibilidadeMaterialFormularioService {
  private readonly API = environment.API;

  constructor(
    private comercialService: ComercialService,
    private vendedoresService: ComercialVendedoresService,
    private http: HttpClient
  ) {}

  loadDependencies(codMaterial: number) {
    const empresas = this.comercialService.getEmpresas({ tipo: 'faturamento' });
    const depositos = this.comercialService.getDepositos({ grupoManetoni: 1 });
    const vendedores = this.vendedoresService.getVendedores();
    const clientes = this.vendedoresService.getCarteiraClientes();
    const material = this.http
      .get(`${this.API}/common/materiais?codigo_material=${codMaterial}`)
      .pipe(take(1));

    return forkJoin([vendedores, empresas, depositos, clientes, material]);
  }
}
