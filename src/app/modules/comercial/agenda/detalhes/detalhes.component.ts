import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, toArray, take, switchMap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { from } from 'rxjs';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { ComercialAgendaService } from 'src/app/modules/comercial/agenda/agenda.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { AuthService } from 'src/app/shared/services/core/auth.service';

import { Injectable } from '@angular/core';
// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { array } from '@amcharts/amcharts4/core';

@Component({
  selector: 'comercial-agenda-detalhes',
  templateUrl: './detalhes.component.html',
  styleUrls: ['./detalhes.component.scss']
})

export class ComercialAgendaDetalhesComponent implements OnInit {
latitud: any;
longitud: any;
modalRef: BsModalRef | undefined;
actualizarMarcador($event: any) {
throw new Error('Method not implemented.');
}
  breadCrumbTree: Array<Breadcrumb> = [

    {
      descricao: 'Home',
      routerLink: '/comercial/home'
    },

    {
      descricao: 'Agenda',
      routerLink: `/comercial/agenda/compromissos`
    },

    {
      descricao: 'Detalles de cita'
    }

  ];

  detalhes: any = {
    status: null
  };

  imagenes: any = [];
  img: any = [];
  //mostrarElemento: boolean = true;
  //ocultarFormulario(){
   // this.mostrarElemento = false;
 // }

  switchEdit: boolean;
  private user = this.authservice.getCurrentUser();
  posiciones: any;



  constructor(
    private activatedRoute: ActivatedRoute,
    private atividadesService: AtividadesService,
    private authservice: AuthService,
    private router: Router,
    private dateService: DateService,
    private http: HttpClient,
    private agendaService: ComercialAgendaService,
    private confirmModalService: ConfirmModalService,
    private pnotifyService: PNotifyService,
    private titleService: TitleService,
    private modalService: BsModalService
  ) {

    this.pnotifyService.getPNotify();

  }





  ngOnInit() {

    this.registrarAcesso();
    this.titleService.setTitle('Detalles de cita');
    const detalhes = this.activatedRoute.snapshot.data['detalhes']['result'];
    const inicio = new Date(detalhes['start']);
    const fim = new Date(detalhes['end']);
    this.detalhes.status = detalhes.status;
    if (this.user.info.matricula == 1) {
      this.switchEdit = true;
    } else {
      this.switchEdit = false;
    }
    this.detalhes.id = detalhes.id;
    this.detalhes.title = detalhes.title;
    this.detalhes.codClient = detalhes.codClient;
    this.detalhes.motivo = detalhes.motivo;
    this.detalhes.client = detalhes.client;
    this.detalhes.formContactDesc = detalhes.formContactDesc;
    this.detalhes.typeContactDesc = detalhes.typeContactDesc;
    this.detalhes.allDay = detalhes.allDay;
    this.detalhes.anexo = detalhes.anexo;
    this.detalhes.observacionFinal = detalhes.observacionFinal;
    this.latitud = detalhes.latitud;
    this.longitud = detalhes.longitud;
    this.detalhes.url_web = detalhes.url_web;

    this.filtrarPosiciones(detalhes.id)
    this.imagenesAnexo(detalhes.id)
    //console.log(this.imagenesAnexo(detalhes.id));



    //console.log(detalhes);
    this.detalhes.description =

      detalhes.description != null

        ? detalhes.description.replace(/(?:\r\n|\r|\n)/g, '<br />')

        : null;

    if (this.detalhes.allDay === true) {

      this.detalhes.fullDate = `${this.dateService.getFullDate(
        inicio,
        fim,
        false
      )} (Dia completo)`;

    } else {
      if (this.dateService.sameDay(inicio, fim)) {
        this.detalhes.fullDate = this.dateService.getFullDate(inicio, fim);
      } else {
      }
    }
  }

  registrarAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
  }

  onEliminar(detalhes: any) {
    this.router.navigate(['../../eliminar', detalhes.id], {
      relativeTo: this.activatedRoute
    });
  }

  onEdit(detalhes: any) {
    detalhes.status = 2;
    this.router.navigate(['../../editar', detalhes.id], {
      relativeTo: this.activatedRoute
    });
  }

  onReschedule(detalhes: any) {

    detalhes.status = 4;

    this.router.navigate(['../../reagendar', detalhes.id], {

      relativeTo: this.activatedRoute

    });

  }

  onFinish(detalhes: any) {
    detalhes.status = 3;
    this.router.navigate(['../../finalizar', detalhes.id], {
      relativeTo: this.activatedRoute
    });
  }

  onDelete(detalhes: any) {

    let confirm$ = this.confirmModalService.showConfirm(
      'Borrar',
      'Confirmar borrado',
      'Desea realmente borrar la cita?',
      'Cancelar',
      'Confirmar'
    );

    confirm$
      .asObservable()
      .pipe(
        take(1),
        switchMap(result =>
          result ? this.agendaService.deleteCompromisso(detalhes.id) : EMPTY
        )
      )

      .subscribe({
        next: (success) => {
          this.pnotifyService.success('Cita borrada con exito!');
          this.router.navigate(['../../compromissos'], {
            relativeTo: this.activatedRoute
          });
        },

        error: (error) => {
          this.pnotifyService.error(
            'Error al borrar, intente nuevamente!'
          );
        }
      });
  }

  filtrarPosiciones(id_agenda: any) {
    this.agendaService.getPosicionPromotor(id_agenda).subscribe(
      (response: any) => {
        this.posiciones = response.result;
      }
    )
  }

  imagenesAnexo(id_agenda: any) {
    this.agendaService.getImagenes(id_agenda).subscribe(
      (response: any) => {
        this.imagenes = response.result;
      },
      (error: any) => {
        console.error('Error al obtener las imágenes:', error);
      }
    );
  }


  // decodeBase64Image(base64Image: string): string{
  //   const decodedString = atob(base64Image);
  //   return decodedString;
  // }

  decodificarBase64(base64String: string): string {
    const binaryString = window.atob(base64String);
    const byteArray = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      byteArray[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([byteArray], { type: 'image/jpeg' }); // Cambia 'image/png' al tipo de imagen correcto si no es PNG
    return URL.createObjectURL(blob);
  }

  mostrarImagen(urlImagen: string) {
    this.abrirVentana("data:image/jpeg;base64;"+urlImagen);
  }

  abrirVentana(urlImagen: string) {
    window.open(urlImagen, "_blank");
  }

  abrirModal(template: any) {
    this.modalRef = this.modalService.show(template);
  }

}
