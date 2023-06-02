import { Component, OnInit } from '@angular/core';
import { map, finalize } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { AgmCoreModule } from '@agm/core';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';


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
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ComercialVendedoresService } from '../../services/vendedores.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';




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
    mapas: any[] = [];
    atividades: any[] = [];
    idEscritorio: number;
    idVendedor: number;
    latitud: number = -17.78629;
    longitud: number = -63.18117;
    nomeVendedor: string;
    nomeEscritorio: string;
    filteredVendedores: any[] = [];
    filteredGestiones: any[] = [];
    vendedor_id: any[];
    seleccion_id: any[];
    indiceVendedor: number;
    item: any;
    selectedIconUrl = 'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|C0C0C0';

    /*   events$: Observable<Array<CalendarEvent<{ compromisso: Compromisso }>>>;
      eventSelected: Compromisso; */


    queryParamsChecked = false;

    form: FormGroup;
    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private authService: AuthService,
        /* private agendaService: ComercialAgendaService, */
        private loteService: ComercialLoteService,
        private comercialService: ComercialService,
        private atividadesService: AtividadesService,
        private titleService: TitleService,
        private dateService: DateService,
        private formBuilder: FormBuilder,
        private datePipe: DatePipe,
        private vendedoresService: ComercialVendedoresService,
        private pnotifyService: PNotifyService,






    ) { }

    ngOnInit(): void {
        this.registrarAcesso();
        this.getEscritorios();
        /*  this.getRutas(); */
        this.getPerfil();
        this.titleService.setTitle('Rutas');
        //this.vendedores();
        this.gestiones();
        this.vendedores();

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
    selectedMarker: any; // Variable para almacenar el marcador seleccionado

    // Función para manejar el evento de clic en el marcador
    onMarkerClick(marker: any) {
        this.selectedMarker = marker;
    }
    filtrarMapas(params) {
        this.loteService.getRutaClientes(params).pipe(
            finalize(() => {
                this.loaderFullScreen = false;
            })
        ).subscribe(
            (response: any) => {
                if (response && response.hasOwnProperty('data')) {
                    this.mapas = response.data;

                    // Asignar colores a los markers según el código del cliente
                    this.mapas.forEach((mapa) => {
                        // Crear el objeto 'markers' si no existe
                        mapa.markers = {};
                        this.indiceVendedor = mapa.ID_VENDEDOR;
                        // Asignar color basado en el código del cliente
                        if (mapa.color === 1) {
                            mapa.markers.icon = 'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FF0000'; // Rojo
                        } else if (mapa.color === 2) {
                            mapa.markers.icon = 'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FC9F3A'; // Naranja
                        } else if (mapa.color === 3) {
                            mapa.markers.icon = 'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FFFF00'; // Amarillo
                        } else if (mapa.color === 4) {
                            mapa.markers.icon = 'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FFFFFF'; // Blanco
                        } else {
                            mapa.markers.icon = 'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|00FF00'; // Verde
                        }

                    });
                } else {
                    this.mapas = null;
                    this.latitud = this.latitud;
                    this.longitud = this.longitud;
                }
            },
            (error) => {
                //console.error(error);
            }
        );
    }

    agregarClienteTemporal(mapa: any) {
        const nuevoCliente = {
            checked: false,
            codClient: mapa.id_cliente,
            codigoCliente: mapa.CODIGO_CLIENTE,
            nombre: mapa.NOMBRE,
            direccion: mapa.DIRECCION,
            fechaVisita: mapa.FECHA_INICIO,
            mapa: mapa.markers.icon,
            vendedor_id: mapa.id_vendedor,
            indice: mapa.index
        };
        this.atividades.push(nuevoCliente);
        mapa.markers['icon'] = this.selectedIconUrl;

        this.selectVendedorDefault(nuevoCliente, mapa);
    }

    selectVendedorDefault(cliente: any, mapa: any) {
        //console.log(mapa.id_vendedor);
        const vendedorEncontrado = this.filteredVendedores.find(vendedor => vendedor.id === mapa.ID_VENDEDOR);
        if (vendedorEncontrado) {
            cliente.vendedor_id = vendedorEncontrado.id;
        } else {
            cliente.vendedor_id = ''; // Valor por defecto si el vendedor no se encuentra en filteredVendedores
        }
    }



    eliminarClienteTemporal(item: any) {
        const index = this.atividades.indexOf(item);
        let registro = 0;
        registro = this.mapas.findIndex(mapa => mapa.CODIGO_CLIENTE === item.codigoCliente);

        if (registro !== -1) {
            this.atividades.splice(index, 1);
            if (this.mapas[registro].color === 1) {
                this.mapas[registro].markers.icon = 'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FF0000'; // Rojo
            } else if (this.mapas[registro].color === 2) {
                this.mapas[registro].markers.icon = 'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FC9F3A'; // Naranja
            } else if (this.mapas[registro].color === 3) {
                this.mapas[registro].markers.icon = 'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FFFF00'; // Amarillo
            } else if (this.mapas[registro].color === 4) {
                this.mapas[registro].markers.icon = 'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|FFFFFF'; // Blanco
            } else {
                this.mapas[registro].markers.icon = 'https://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|00FF00'; // Verde
            }
        }

    }
    vendedores() {
        this.vendedoresService.getVendedores().subscribe(
            (response: any) => {
                if (response['responseCode'] === 200) {
                    this.filteredVendedores = response['result'];
                    if (this.filteredVendedores.length > 0) {
                        //this.indiceVendedor = this.filteredVendedores[].id;
                    }
                } else {
                    this.filteredVendedores = [];
                }
            }
        );
    }




    gestiones() {
        this.vendedoresService.getGestiones().subscribe(
            (response: any) => {
                if (response['success'] == true) {
                    this.filteredGestiones = response['data'];
                } else {
                    this.filteredGestiones = [];
                }
            },
            (error: any) => {
                // Manejar el error de la petición si es necesario
            }
        );
    }
    public mostrarSpinner = false;
    private enviarDatosSubject = new Subject<void>();


    enviarDatos() {
        let msgSuccess = 'Cita creada exitosamente.';
        let msgError = 'Ocurrio un error al agendar la cita.';
        const datos = this.atividades;

        /* console.log(datos);

        // Muestra el spinner
        this.mostrarSpinner = true;

        // Envía los datos al servicio utilizando el Subject
        this.loteService.guardarRutas(datos)
            .pipe(takeUntil(this.enviarDatosSubject))
            .subscribe(
                (response) => {
                    this.pnotifyService.success(msgSuccess);
                    this.mostrarSpinner = false;
                    this.actualizarPagina();
                },
                (error) => {
                    this.pnotifyService.error(msgError);
                    this.mostrarSpinner = false;
                }
            );
        this.limpiarDatos(); */
    }
    limpiarDatos() {

        this.atividades = [];
        this.filteredVendedores = [];
        this.filteredGestiones = [];
        this.latitud = this.latitud;
        this.longitud = this.longitud;

    }
    actualizarPagina() {
        location.reload();
    }
    // En caso de que el componente se destruya antes de completarse el envío de datos,
    // se debe completar el Subject para evitar errores de memoria.
    ngOnDestroy() {
        this.enviarDatosSubject.next();
        this.enviarDatosSubject.complete();
    }
    onVendedorChange(item: any, newValue: any) {

        item.id_vendedor = newValue;

    }

    onGestionChange(item: any, newValue: any) {
        item.codTitulo = newValue;
    }
    onFechaChange(item: any, newValue: any) {
        item.fechaVisita = newValue;
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
