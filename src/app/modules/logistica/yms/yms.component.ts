import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SubModulosService } from 'src/app/shared/services/requests/submodulos.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { TitleCasePipe } from 'src/app/shared/pipes/title-case.pipe';

@Component({
  selector: 'logistica-yms',
  templateUrl: './yms.component.html',
  styleUrls: ['./yms.component.scss']
})
export class LogisticaYmsComponent implements OnInit {

  loaderFullScreen = true;

  breadCrumbTree: any = [];

  appName: string;
  atividades: any = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private subModulosService: SubModulosService,
    private atividadesService: AtividadesService,
    private pnotifyService: PNotifyService,
    private titleCasePipe: TitleCasePipe
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.registrarAcesso();
      this.getSubmodulo(params['idSubModulo']);
      this.getAtividadesInternas(params['idSubModulo']);
    });
  }

  registrarAcesso() {
    this.atividadesService
      .registrarAcesso()
      .subscribe();
  }

  getSubmodulo(idSubModulo: number) {
    this.subModulosService
      .getSubModulo(idSubModulo)
      .subscribe((response: any) => {
        if (response['status'] === 200) {
          this.appName = this.titleCasePipe.transform(response['body']['nome']);
          this.setBreadCrumb(this.appName);
        }
      });
  }

  getAtividadesInternas(idSubModulo: number) {
    this.atividadesService.getAtividadesInternas(idSubModulo).subscribe(
      (response: any) => {
        if (response['responseCode'] === 200) {
          this.atividades = response['result'];
          this.loaderFullScreen = false;
        } else {
          this.handleAtividadesInternasError();
        }
      },
      (error: any) => {
        this.handleAtividadesInternasError();
      }
    );
  }

  setBreadCrumb(nomeSubModulo: string) {
    this.breadCrumbTree = [
      {
        descricao: 'Logistica',
        routerLink: '/logistica/home'
      },
      {
        descricao: nomeSubModulo
      }
    ];
  }

  handleAtividadesInternasError() {
    this.pnotifyService.error();
    this.loaderFullScreen = false;
  }

}
