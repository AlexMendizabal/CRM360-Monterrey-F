import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { take, retry } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';

import { environment } from 'src/environments/environment';

// Services
import { ComercialCadastrosTitulosAgendaService } from './../../cadastros/titulos-agenda/titulos-agenda.service';
import { ComercialVendedoresService } from '../../services/vendedores.service';
import { AuthService } from 'src/app/shared/services/core/auth.service';
// Interfaces
import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
  providedIn: 'root',
})
export class ComercialAgendaFormularioService {
  private readonly API = `http://23.254.204.187/api/comercial/agenda/formulario`;
  private readonly API2 = `http://23.254.204.187/api/comercial`;

  constructor(
    protected http: HttpClient,
    private vendedoresService: ComercialVendedoresService,
    private titulosAgendaService: ComercialCadastrosTitulosAgendaService
  ) {}

  getclientes(id){
    return this.http
    .get(`${this.API2}/clientes/todosclientes/${id}`)
    .pipe(take(1), retry(2));
  }

  getpromotoresporcliente(codCliente){
    return this.http
    .get(`${this.API2}/clientes/getvendedorporcliente/${codCliente}`)
    .pipe(take(1), retry(2));
  }

  loadDependencies(): Observable<Object | JsonResponse> {
    let clientes = this.vendedoresService.getCarteiraClientes();
    let vendedores = this.vendedoresService.getVendedores();
    let formasContato = this.getFormasContato();
    let origensContato = this.getOrigensContato();
    let motivosReagendamento = this.getMotivosReagendamento();

    let listarTitulosAgenda = this.titulosAgendaService.getListaTitulosAgenda({
      codSituacao: '1',
    });

    return forkJoin([
      clientes,
      formasContato,
      origensContato,
      motivosReagendamento,
      listarTitulosAgenda,
      vendedores,
    ]);
  }

  getFormasContato(): Observable<Object | JsonResponse> {
    return this.http.get(`${this.API}/formas-contato`).pipe(take(1), retry(2));
  }

  getOrigensContato(): Observable<Object | JsonResponse> {
    return this.http.get(`${this.API}/origens-contato`).pipe(take(1), retry(2));
  }

  getMotivosReagendamento(): Observable<Object | JsonResponse> {
    return this.http
      .get(`${this.API}/motivos-reagendamento`)
      .pipe(take(1), retry(2));
  }
}
