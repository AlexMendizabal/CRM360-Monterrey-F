import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

// Services
import { ComercialAgendaService } from 'src/app/modules/comercial/agenda/agenda.service';

@Injectable({
  providedIn: 'root',
})
export class ComercialAgendaDetalhesResolverGuard implements Resolve<any> {
  constructor(private agendaService: ComercialAgendaService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    if (route.params && route.params['id']) {
      return this.agendaService.getCompromisso(route.params['id']);
    }

    let codCliente: any = '';
    if (route.params && route.params['codCliente']) {
      codCliente = parseInt(route.params['codCliente']);
    }

    // É implementado o método "of" para manter a tipagem de retorno com Observable.
    return of({
      responseCode: 200,
      result: {
        id: null,
        title: null,
        codTitulo:null, 
        codClient: codCliente,
        formContactId: '',
        typeContactId: '',
        start: null,
        end: null,
        allDay: false,
        description: null,
        rescheduleId: null,
        color: {
          primary: '#0033FF',
        },
      },
    });
  }
}
