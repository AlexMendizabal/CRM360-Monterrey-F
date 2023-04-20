import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SubModulosService } from 'src/app/shared/services/requests/submodulos.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { TitleCasePipe } from 'src/app/shared/pipes/title-case.pipe';
import { AdminSubModulosService } from '../../admin/submodulos/services/submodulos.service';
import { AdminAtividadesService } from '../../admin/atividades/services/atividades.service';

@Component({
  selector: 'logistica-cadastros',
  templateUrl: './cadastros.component.html',
  styleUrls: ['./cadastros.component.scss']
})
export class LogisticaCadastrosComponent implements OnInit {

  loaderFullScreen = true;

  breadCrumbTree: any = [];

  appName: string;
  atividades: any = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private subModulosService: AdminSubModulosService,
    private atividadesService: AtividadesService,
    private _atividadesService: AdminAtividadesService,
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
      .subscribe(
        (response: any) => {
          if (response.status === 200) {
            let nome = response['body']['nome'];
            this.appName = this.titleCasePipe.transform(nome);
            this.setBreadCrumb(this.appName);
          }
        }
      );
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
