import { TitleCasePipe } from 'src/app/shared/pipes/title-case.pipe';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { SubModulosService } from 'src/app/shared/services/requests/submodulos.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AdminAtividadesService } from 'src/app/modules/admin/atividades/services/atividades.service';

@Component({
  selector: 'comercial-integracoes-dagda',
  templateUrl: './dagda.component.html',
  styleUrls: ['./dagda.component.scss'],
})
export class ComercialIntegracoesDagdaComponent implements OnInit {
  loaderFullScreen = true;

  breadCrumbTree: any = [];

  appName: string;
  atividades: any = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private subModulosService: SubModulosService,
    private atividadesService: AtividadesService,
    private _atividadesService: AdminAtividadesService,
    private pnotifyService: PNotifyService,
    private titleCasePipe: TitleCasePipe
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      this.registrarAcesso();
      this.getSubmodulo(params['idSubModulo']);
      this.getAtividadesInternas(params['idSubModulo']);
    });
  }

  registrarAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
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
  //     },
  //   });
  // }

  setBreadCrumb(nomeSubModulo: string) {
    this.breadCrumbTree = [
      {
        descricao: 'Comercial',
        routerLink: '/comercial/home',
      },
      {
        descricao: nomeSubModulo,
      },
    ];
  }

  handleAtividadesInternasError() {
    this.pnotifyService.error();
    this.loaderFullScreen = false;
  }
}
