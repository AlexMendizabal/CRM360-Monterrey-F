import { Injectable, EventEmitter } from '@angular/core';
import { finalize } from 'rxjs/operators';

// ngx-bootstrap
import { BsModalService } from 'ngx-bootstrap/modal';
import { HttpClient } from '@angular/common/http';
import { take,  retry} from 'rxjs/operators';


// Components

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';


// Interfaces

import { JsonResponse } from 'src/app/models/json-response';

@Injectable({
    providedIn: 'root',
})
export class NotificacionesService {
    private readonly BASE_URL: string = `http://23.254.204.187/api`;

    loaderNavbar: EventEmitter<boolean> = new EventEmitter();

    constructor(
        private modalService: BsModalService,
        private pnotifyService: PNotifyService,
        private http: HttpClient

    ) {
        this.pnotifyService.getPNotify();
    }

    getNotificaciones() {
        return this.http
            .get(this.BASE_URL+ `/core/notificaciones`)
            .pipe(take(1), retry(2));
    }
    updateNotificacion(id: number) {
        const param = {
            id: id,
        }
        return this.http
            .post(this.BASE_URL+ `/core/notificaciones/update`, param)
            .pipe(take(1), retry(2));
    }

    postLeerNotificaciones(params: any) {
        console.log(params);
        return this.http
            .post(this.BASE_URL+ `/core/notificaciones/leerNotificaciones`, params)
            .pipe(take(1), retry(2));
    }
}
