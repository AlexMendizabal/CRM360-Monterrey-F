import { Component, OnInit } from '@angular/core';
import { map, finalize } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { AgmCoreModule } from '@agm/core';


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
import { ComercialLoteService } from 'src/app/modules/comercial/lote/lote.service';
import { ComercialService } from '../../comercial.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { DateService } from 'src/app/shared/services/core/date.service';

// Interfaces
/* import { Compromisso } from '../models/compromisso'; */
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';

@Component({
    selector: 'ruta-agenda-compromissos',
    templateUrl: './ruta.component.html',
    styleUrls: ['./ruta.component.scss']
})
export class ComercialLoteRutaComponent implements OnInit {
    private user = this.authService.getCurrentUser();
    profile: any = {};


    loaderFullScreen = true;

    breadCrumbTree: Array<Breadcrumb> = [
        {
            descricao: 'Home',
            routerLink: '/comercial/home'
        },
        {
            descricao: 'Rutas'
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

    /*   events$: Observable<Array<CalendarEvent<{ compromisso: Compromisso }>>>;
      eventSelected: Compromisso; */

    queryParamsChecked = false;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private authService: AuthService,
        /* private agendaService: ComercialAgendaService, */
        /* private loteService: ComercialLoteService, */
        private comercialService: ComercialService,
        private atividadesService: AtividadesService,
        private titleService: TitleService,
        private dateService: DateService,

    ) { }

    ngOnInit(): void {
        this.registrarAcesso();
        this.getEscritorios();
       /*  this.getRutas(); */
        this.getPerfil();
        this.titleService.setTitle('Rutas');
    }

    appTitle(date: Date): string {
        if (this.showCalendar) {
            return `Rutas (${this.dateService.getFullMonth(
                date
            )}/${date.getFullYear()})`;
        }

        return 'Rutas';
    }

    registrarAcesso(): void {
        this.atividadesService.registrarAcesso().subscribe();
    }
    getEscritorios(): void {
        this.comercialService.getEscritorios().subscribe((response: any) => {
            if (response.responseCode === 200) {
                this.idEscritorio = response.result;
            }
        });
    }

    /* getRutas(): void {
        this.loteService.getRutaClientes().subscribe((response: any) => {
            if (response.responseCode === 200) {
                this.idVendedor = response.result;
            }
        });
    } */




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
            this.idEscritorio = event.idEscritorio;
            this.idVendedor = event.idVendedor;
            this.nomeEscritorio = event.nomeEscritorio;
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

            if(!this.queryParamsChecked) {
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

        /* this.events$ = this.agendaService.getCompromissos(paramsObj).pipe(
          map((compromissos: Compromisso[]) => {
            if (compromissos['responseCode'] === 200) {
              return compromissos['result'].map((compromisso: Compromisso) => {
                return {
                  id: compromisso.id,
                  color: {
                    primary: compromisso.color
                  },
                  title: compromisso.title,
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
        ); */
    }

    /*   dayClicked({
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
      } */

    /*   eventClicked(event: CalendarEvent<{ compromisso: Compromisso }>): void {
        this.router.navigate(['../detalhes', event.id], {
          relativeTo: this.activatedRoute
        });
      } */

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
