import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DateService } from 'src/app/shared/services/core/date.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LogisticaEstoqueInventarioListaInventarioService {
  private readonly BASE_URL: string = `https://crm360.monterrey.com.bo/api`;

  constructor(private http: HttpClient, private dateService: DateService) {}

  getInventario(
    page,
    tipo,
    empresa,
    deposito,
    linha,
    classe,
    dataInicial,
    dataFinal,
    cdInventario,
    sigla
  ) {
    let di = dataInicial
      ? this.dateService.convert2PhpDate(new Date(dataInicial))
      : '';
    let df = dataFinal
      ? this.dateService.convert2PhpDate(new Date(dataFinal))
      : '';
    return this.http.get(`${this.BASE_URL}/logistica/estoque/inventario`, {
      params: {
        pagina: page ? page : '',
        tipo: tipo,
        empresa: empresa,
        deposito: deposito,
        linha: linha,
        classe: classe,
        dataInicial: di,
        dataFinal: df,
        cdInventario: cdInventario,
        sigla: sigla
      }
    });
  }

  getClassesInventario(idInventario) {
    return this.http.get(
      `${this.BASE_URL}/logistica/estoque/inventario/classes/${idInventario}`,
      {
        observe: 'response'
      }
    );
  }
}
