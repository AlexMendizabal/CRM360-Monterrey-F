import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { AdminAtividadesService } from '../../admin/atividades/services/atividades.service';

@Component({
  selector: 'comercial-gestao',
  templateUrl: './gestao.component.html',
  styleUrls: ['./gestao.component.scss']
})
export class ComercialGestaoComponent implements OnInit {
  loaderFullScreen: boolean = true;

  breadCrumbTree: Array<Breadcrumb> = [
    {
      descricao: 'Home',
      routerLink: '/comercial/home'
    },
    {
      descricao: 'Gestão'
    }
  ];

  atividades: any = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private atividadesService: AtividadesService,
    private _atividadesService: AdminAtividadesService,
    private pnotifyService: PNotifyService,
    private titleService: TitleService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit() {
    this.titleService.setTitle('Gestão');
    this.activatedRoute.params.subscribe((params: any) => {
      this.registrarAcesso();
      this.getAtividadesInternas(params['idSubModulo']);
    });
  }

  registrarAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
  }

  getAtividadesInternas(idSubModulo: number) {

    let matricula = (JSON.parse(localStorage.getItem('currentUser')))?.info?.matricula;

    let params = {
      submoduloId: idSubModulo,
      matricula: matricula,
      exibeSidebar: 0
    }

    this._atividadesService
      .getAtividades(params)
      .subscribe(
        response => {
          if(response.status !== 200){
            this.handleAtividadesInternasError();
            return
          }

          this.atividades = response.body["data"];
          this.loaderFullScreen = false;

        },
        (error: any) => {
          this.handleAtividadesInternasError();
        }
      )
  }

  // getAtividadesInternas(idSubModulo: number) {
  //   this.atividadesService.getAtividadesInternas(idSubModulo).subscribe({
  //     next: (response: any) => {
  //       if (response['responseCode'] === 200) {
  //         this.atividades = response['result'];
  //         this.loaderFullScreen = false;
  //       } else {
  //         this.handleAtividadesInternasError();
  //       }
  //     },
  //     error: (error: any) => {
  //       this.handleAtividadesInternasError();
  //     }
  //   });
  // }

  handleAtividadesInternasError() {
    this.pnotifyService.error();
    this.location.back();
  }
}
