import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LogisticaEstoquePainelInventarioInventarioRelatorioService {
  private readonly BASE_URL: string = `https://crm360.monterrey.com.bo/api`;

  constructor(private http: HttpClient) {}

  getLista(idInventario) {
    return this.http.get(
      `${this.BASE_URL}/logistica/estoque/inventario/${idInventario}/materiais`
    );
  }

  getInfoInventario(idInventario) {
    return this.http.get(
      `${this.BASE_URL}/logistica/estoque/inventario/${idInventario}/resultado`
    );
  }

  getInfoInventarioRotativoGeral(idInventario) {
    return this.http.get(
      `${this.BASE_URL}/logistica/estoque/inventario-rotativo/${idInventario}`
    );
  }

  getInfoInventarioRotativo(idInventario, cdMaterial) {
    return this.http.get(
      `${this.BASE_URL}/logistica/estoque/inventario-rotativo/${idInventario}/material/${cdMaterial}`,
      {
        observe: 'response',
      }
    );
  }
}
