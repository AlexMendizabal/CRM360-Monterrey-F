import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { finalize } from 'rxjs/operators';

// Services
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { TitleCasePipe } from 'src/app/shared/pipes/title-case.pipe';

@Component({
  selector: 'power-bi-renderizador-atividade',
  templateUrl: './atividade.component.html',
  styleUrls: ['./atividade.component.scss'],
  providers: [TitleCasePipe]
})
export class PowerBiRenderizadorAtividadeComponent implements OnInit {
  loaderFullScreen: boolean = true;

  breadCrumbTree: any = [];

  appName: string;
  appUrl: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private atividadesService: AtividadesService,
    private pnotifyService: PNotifyService,
    private titleCasePipe: TitleCasePipe
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit() {
    this.getAtividade();
  }

  getAtividade() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.atividadesService
        .getAtividade(params['idAtividade'])
        .pipe(
          finalize(() => {
            this.loaderFullScreen = false;
          })
        )
        .subscribe(
          (response: any) => {
            if (response['responseCode'] === 200) {
              this.appName = this.titleCasePipe.transform(
                response['result']['nomeAtividade']
              );
              this.appUrl = response['result']['urlExterna'];
              this.setBreadCrumb();
            } else {
              this.handleAtividadeError();
            }
          },
          (error: any) => {
            this.handleAtividadeError();
          }
        );
    });
  }

  handleAtividadeError() {
    this.pnotifyService.error();
    this.location.back();
  }

  setBreadCrumb() {
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: '/power-bi/home'
      },
      {
        descricao: this.appName
      }
    ];
  }
}
