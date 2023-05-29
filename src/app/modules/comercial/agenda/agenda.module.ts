import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { registerLocaleData } from '@angular/common';
import LocalBO from '@angular/common/locales/es-BO';

registerLocaleData(LocalBO, 'es-BO');

// Angular Calendar
import { FlatpickrModule } from 'angularx-flatpickr';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

// ngx-bootstrap
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';

// ng-select
import { NgSelectModule } from '@ng-select/ng-select';

// Guards
import { FormDeactivateGuard } from 'src/app/guards/form-deactivate.guard';

// Modules
import { ComercialAgendaRoutingModule } from './agenda-routing.module';
import { NotFoundModule } from 'src/app/core/not-found/not-found.module';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { TemplatesModule } from 'src/app/shared/templates/templates.module';
import { ComercialTemplatesModule } from '../templates/templates.module';

// Components
import { ComercialAgendaCompromissosComponent } from './compromissos/compromissos.component';
import { ComercialAgendaDetalhesComponent } from './detalhes/detalhes.component';
import { ComercialAgendaFormularioComponent } from './formulario/formulario.component';
import { AgmCoreModule } from '@agm/core';

@NgModule({
  declarations: [
    ComercialAgendaCompromissosComponent,
    ComercialAgendaDetalhesComponent,
    ComercialAgendaFormularioComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ComercialAgendaRoutingModule,
    FlatpickrModule.forRoot(),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    BsDropdownModule.forRoot(),
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
    NgSelectModule,
    NotFoundModule,
    SharedModule,
    TemplatesModule.forRoot(),
    ComercialTemplatesModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDl5b7STz9xYNDhybTTer2POVncX9FYqCc' // Reemplaza con tu propia clave de API de Google Maps
    }),
  ],
  providers: [FormDeactivateGuard, { provide: LOCALE_ID, useValue: 'es-BO' }]
})
export class ComercialAgendaModule {}
