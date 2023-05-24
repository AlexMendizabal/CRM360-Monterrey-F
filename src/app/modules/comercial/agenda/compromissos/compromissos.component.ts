import { Component, OnInit } from '@angular/core';
import { map, finalize } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// angular-calendar
import { CalendarEvent } from 'angular-calendar';
import {
  isSameMonth,
  isSameDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  format
} from 'date-fns';

// Services
import { AuthService } from 'src/app/shared/services/core/auth.service';
import { ComercialAgendaService } from 'src/app/modules/comercial/agenda/agenda.service';
import { ComercialService } from '../../comercial.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { DateService } from 'src/app/shared/services/core/date.service';

// Interfaces

import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
export interface Compromisso {
  id: string;
  color: {
    primary: string;
  };
  title: string;
  client: string;
  start: Date;
  end: Date;
  allDay: boolean;
  description: string;
  draggable: boolean;
  codClient: string; // Nueva propiedad para el código del cliente
  formContactId: string; // Nueva propiedad para el ID del formulario de contacto
  formContactDesc: string; // Nueva propiedad para la descripción del formulario de contacto
  typeContactId: string; // Nueva propiedad para el ID del tipo de contacto
  typeContactDesc: string; // Nueva propiedad para la descripción del tipo de contacto
}



@Component({
  selector: 'comercial-agenda-compromissos',
  templateUrl: './compromissos.component.html',
  styleUrls: ['./compromissos.component.scss']
})
export class ComercialAgendaCompromissosComponent implements OnInit {
  private user = this.authService.getCurrentUser();
  profile: any = {};
  destroy$: Subject<void> = new Subject<void>();
  refreshEvents(): void {
    this.fetchEvents();
  }
  loaderFullScreen = true;

  breadCrumbTree: Array<Breadcrumb> = [
    {
      descricao: 'Home',
      routerLink: '/comercial/home'
    },
    {
      descricao: 'Agenda'
    }
  ];

  activatedRouteSubscription: Subscription;

  showFilter = false;
  showCalendar = false;
  showPermissionDenied = false;

  view = 'month';
  viewDate: Date = new Date();
  activeDayIsOpen = false;

  idEscritorio: number;
  idVendedor: number;
  nomeVendedor: string;
  nomeEscritorio: string;


  events$: Observable<Array<CalendarEvent<{ compromisso: Compromisso }>>>;
  eventSelected: Compromisso;

  queryParamsChecked = false;
  // ...
  estado: number;
  // ...
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private agendaService: ComercialAgendaService,
    private comercialService: ComercialService,
    private atividadesService: AtividadesService,
    private titleService: TitleService,
    private dateService: DateService
    
  ) {}

  ngOnInit(): void {
    this.registrarAcesso();
    this.getPerfil();
    this.titleService.setTitle('Agenda');
    // Actualizar los eventos cada 1 hora
interval(60 * 60 * 1000) // 1 hora en milisegundos
.pipe(takeUntil(this.destroy$))
.subscribe(() => {
  this.fetchEvents();
});


  }
ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}

  appTitle(date: Date): string {
    if (this.showCalendar) {
      return `Agenda (${this.dateService.getFullMonth(
        date
      )}/${date.getFullYear()})`;
    }

    return 'Agenda';
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  getPerfil(): void {
    this.comercialService
      .getPerfil()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.responseCode === 200) {
            this.profile = response.result;

            if (
              this.profile.coordenador === true ||
              this.profile.gestor === true ||
              (this.profile.vendedor === true &&
                this.profile.coordenador === false &&
                this.profile.gestor === false &&
                this.profile.hasVinculoOperadores === true)
            ) {
              this.checkRouterParams();
            } else if (
              this.profile.vendedor === true &&
              this.profile.coordenador === false &&
              this.profile.gestor === false &&
              this.profile.hasVinculoOperadores === false
            ) {
              this.fetchEvents();
              this.idVendedor = this.user.info.idVendedor;
              this.idEscritorio = this.user.info.idEscritorio;
              this.showCalendar = true;
            } else {
              this.showPermissionDenied = true;
            }
          } else {
            this.showPermissionDenied = true;
          }
        },
        error: (error: any) => {
          this.showPermissionDenied = true;
        }
      });
  }

  enableFilterButton(): boolean {
    if (
      this.profile.coordenador === true ||
      this.profile.gestor === true ||
      (this.profile.vendedor === true &&
        this.profile.coordenador === false &&
        this.profile.gestor === false &&
        this.profile.hasVinculoOperadores === true)
    ) {
      return true;
    } else {
      return false;
    }
  }

  dataFilter(event: any): void {
    console.log(event)
    this.idVendedor = event.idVendedor;
    this.nomeEscritorio = this.user.info.nomeCompleto;
    this.idEscritorio = event.idEscritorio;
    this.nomeVendedor = event.nomeVendedor;
  }

  checkRouterParams(): void {
    let formValue = {
      idEscritorio: null,
      idVendedor: null,
      nomeEscritorio: null,
      nomeVendedor: null
    };

    this.activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (queryParams: any) => {
        if (Object.keys(queryParams).length > 0) {
          let params: any = atob(queryParams['q']);
          params = JSON.parse(params);

          this.idEscritorio = parseInt(params.idEscritorio);
          this.idVendedor = parseInt(params.idVendedor);
          this.nomeEscritorio = params.nomeEscritorio;
          this.nomeVendedor = params.nomeVendedor;

          this.showFilter = false;
          this.showCalendar = true;
          this.fetchEvents();

          Object.keys(formValue).forEach(formKey => {
            Object.keys(params).forEach(paramKey => {
              if (
                formKey == paramKey &&
                formValue[formKey] != params[paramKey]
              ) {
                if (!isNaN(Number(params[paramKey]))) {
                  formValue[formKey] = Number(params[paramKey]);
                } else {
                  formValue[formKey] = params[paramKey];
                }
              }
            });
          });
        } else {
          this.showFilter = true;
          this.showCalendar = false;
        }
      }
    );
    this.activatedRouteSubscription.unsubscribe();
  }

  fetchEvents(): void {
    const getStart: any = {
      month: startOfMonth,
      week: startOfWeek,
      day: startOfDay
    }[this.view];

    const getEnd: any = {
      month: endOfMonth,
      week: endOfWeek,
      day: endOfDay
    }[this.view];

    let paramsObj = {};

    if (!this.queryParamsChecked) {
      this.activatedRoute.queryParams.subscribe((queryParams: any) => {
        if (Object.keys(queryParams).length > 0) {
          let params: any = atob(queryParams['q']);
          params = JSON.parse(params);

          const queryDate = params.inicio.split('-');

          this.viewDate.setFullYear(queryDate[0]);
          this.viewDate.setMonth(queryDate[1] - 1);
          this.viewDate.setDate(queryDate[2]);

          paramsObj = {
            inicio: params.inicio,
            fim: params.fim,
            idEscritorio: params.idEscritorio,
            idVendedor: params.idVendedor,
            nomeEscritorio: params.nomeEscritorio,
            nomeVendedor: params.nomeVendedor
          };
        } else {
          this.viewDate = new Date();

          paramsObj = {
            inicio: format(getStart(this.viewDate), 'yyyy-MM-dd'),
            fim: format(getEnd(this.viewDate), 'yyyy-MM-dd'),
            idEscritorio: this.idEscritorio,
            idVendedor: this.idVendedor,
            nomeEscritorio: this.nomeEscritorio,
            nomeVendedor: this.nomeVendedor
          };
        }
      });
    } else {
      paramsObj = {
        inicio: format(getStart(this.viewDate), 'yyyy-MM-dd'),
        fim: format(getEnd(this.viewDate), 'yyyy-MM-dd'),
        idEscritorio: this.idEscritorio,
        idVendedor: this.idVendedor,
        nomeEscritorio: this.nomeEscritorio,
        nomeVendedor: this.nomeVendedor
      };
    }

    this.queryParamsChecked = true;
    this.activeDayIsOpen = false;

    this.events$ = this.agendaService.getCompromissos(paramsObj).pipe(
      map((compromissos: Compromisso[]) => {
        if (compromissos['responseCode'] === 200) {
          // Asigna el valor deseado a la variable estado
    this.estado = 1;
    
    return compromissos['result'].map((compromisso: Compromisso) => {
      
      // Función para obtener el color en base a la variable estado
      // const getColorFromVariable = (): string => {
      //   switch (this.estado) {
      //           case 1:
      //             return 'blue'; // Color azul
      //           case 2:
      //             return 'yellow'; // Color amarillo
      //           case 3:
      //             return 'green'; // Color verde
      //           default:
      //             return 'gray'; // Color por defecto en caso de otro valor
      //         }
      //       }
    
            return {
              id: compromisso.id,
              color: {
                primary: compromisso.color, //getColorFromVariable()
              },
              title: `${compromisso.title} - ${compromisso.client}`,
              codClient: compromisso.codClient,
              client: compromisso.client,
              formContactId: compromisso.formContactId,
              formContactDesc: compromisso.formContactDesc,
              typeContactId: compromisso.typeContactId,
              typeContactDesc: compromisso.typeContactDesc,
              start: new Date(compromisso.start),
              end: new Date(compromisso.end),
              allDay: compromisso.allDay,
              description: compromisso.description,
              draggable: false
            };
          });
        } else {
          return [];
        }
      }),
      finalize(() => {
        this.setRouterParams(paramsObj);
      })
    );
  }

  dayClicked({
    date,
    events
  }: {
    date: Date;
    events: Array<CalendarEvent<{ compromisso: Compromisso }>>;
  }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
        this.viewDate = date;
      }
    }
  }

  eventClicked(event: CalendarEvent<{ compromisso: Compromisso }>): void {
    this.router.navigate(['../detalhes', event.id], {
      relativeTo: this.activatedRoute
    });
  }

  onFilter(showFilter: boolean): void {
    if (showFilter) {
      this.showCalendar = true;
      this.fetchEvents();
    } else {
      this.showCalendar = false;
      this.setRouterParams(null);
    }

    this.showFilter = !this.showFilter;
  }

  setRouterParams(params: any): void {
    if (params === null) {
      this.router.navigate([], {
        relativeTo: this.activatedRoute
      });
    } else {
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: { q: btoa(JSON.stringify(params)) },
        queryParamsHandling: 'merge'
      });
    }
  }
}
