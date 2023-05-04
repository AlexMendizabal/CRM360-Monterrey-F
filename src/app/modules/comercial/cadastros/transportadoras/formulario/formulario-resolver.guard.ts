import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialCadastrosTransportadoraService } from '../transportadoras.service';

@Injectable({
  providedIn: 'root'
})
export class ComercialCadastrosTransportadoraFormularioResolverGuard
  implements Resolve<any> {
  constructor(
    private transportadoraService: ComercialCadastrosTransportadoraService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params['id']) {
      return this.transportadoraService.getTransportadora(route.params['id']);
    }

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      success: true,
      data: {
        id: null,
        tipoPessoa: 'F',
        cpf: null,
        rg: null,
        cnpj: null,
        inscricaoEstadual: null,
        nome: null,
        endereco: {
          logradouro: null,
          cidade: null,
          uf: ''
        },
        veiculo: {
          placa: null,
          uf: ''
        },
        freteConta: '',
        consideraEntregue: false,
        recebeCotacaoFrete: false,
        autorizaDownloadXml: false,
        contatos: []
      }
    });
  }
}
