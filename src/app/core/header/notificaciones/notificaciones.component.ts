import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
    FormGroup,
    FormBuilder,
    Validators,
    AbstractControl,
} from '@angular/forms';
import { EMPTY } from 'rxjs';

// ngx-bootstrap
import { BsModalRef } from 'ngx-bootstrap/modal';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';

// Interfaces

import { JsonResponse } from 'src/app/models/json-response';
import { finalize } from 'rxjs/operators';


@Component({
    selector: 'Notificaciones',
    templateUrl: './notificaciones.component.html',
    styleUrls: ['./notificaciones.component.scss'],
})


export class NotificacionesComponent
    implements OnInit {
    loaderModal: boolean;

    form: FormGroup;
    showImpostos = false;

    constructor(
        private formBuilder: FormBuilder,
        private bsModalRef: BsModalRef,
        private pnotifyService: PNotifyService,
        private confirmModalService: ConfirmModalService,
    ) {
        this.pnotifyService.getPNotify();
    }

    ngOnInit(): void {
        this.setFormBuilder();
        /* throw new Error("Method not implemented."); */

    }

    setFormBuilder(): void {
        this.form = this.formBuilder.group({
        });

        /* this.setFormValidators(); */
    }
    /*  setFormValidators(): void {
   
   
     } */


}
