import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take, switchMap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { ComercialAgendaService } from 'src/app/modules/comercial/agenda/agenda.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';

@Component({
  selector: 'comercial-agenda-detalhes',
  templateUrl: './detalhes.component.html',
  styleUrls: ['./detalhes.component.scss']
})
export class ComercialAgendaDetalhesComponent implements OnInit {
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
      descricao: 'Detalhes do compromisso'
    }
  ];

  detalhes: any = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private atividadesService: AtividadesService,
    private router: Router,
    private dateService: DateService,
    private agendaService: ComercialAgendaService,
    private confirmModalService: ConfirmModalService,
    private pnotifyService: PNotifyService,
    private titleService: TitleService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit() {
    this.registrarAcesso();
    this.titleService.setTitle('Detalles del compromiso');

    const detalhes = this.activatedRoute.snapshot.data['detalhes']['result'];
    const inicio = new Date(detalhes['start']);
    const fim = new Date(detalhes['end']);

    this.detalhes.id = detalhes.id;
    this.detalhes.title = detalhes.title;
    this.detalhes.codClient = detalhes.codClient;
    this.detalhes.client = detalhes.client;
    this.detalhes.formContactDesc = detalhes.formContactDesc;
    this.detalhes.typeContactDesc = detalhes.typeContactDesc;
    this.detalhes.allDay = detalhes.allDay;
    this.detalhes.description =
      detalhes.description != null
        ? detalhes.description.replace(/(?:\r\n|\r|\n)/g, '<br />')
        : null;

    if (this.detalhes.allDay === true) {
      this.detalhes.fullDate = `${this.dateService.getFullDate(
        inicio,
        fim,
        false
      )} (dia inteiro)`;
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

  onEdit(detalhes: any) {
    this.router.navigate(['../../editar', detalhes.id], {
      relativeTo: this.activatedRoute
    });
  }

  onReschedule(detalhes: any) {
    this.router.navigate(['../../reagendar', detalhes.id], {
      relativeTo: this.activatedRoute
    });
  }

  onDelete(detalhes: any) {
    let confirm$ = this.confirmModalService.showConfirm(
      'delete',
      'Confirmar exclusão',
      'Deseja realmente prosseguir com a exclusão do compromisso?',
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
          this.pnotifyService.success('Compromisso excluído com sucesso!');
          this.router.navigate(['../../compromissos'], {
            relativeTo: this.activatedRoute
          });
        },
        error: (error) => {
          this.pnotifyService.error(
            'Erro ao excluir compromisso. Tente novamente!'
          );
        }
      });
  }
}
