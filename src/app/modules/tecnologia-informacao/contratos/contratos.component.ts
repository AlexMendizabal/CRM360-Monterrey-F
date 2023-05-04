import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';

@Component({
  selector: 'tecnologia-informacao-contratos',
  templateUrl: './contratos.component.html',
  styleUrls: ['./contratos.component.scss'],
})
export class TecnologiaInformacaoContratosComponent implements OnInit {
  loaderFullScreen: boolean = true;

  breadCrumbTree: Array<Breadcrumb> = [
    {
      descricao: 'Home',
      routerLink: '/tecnologia-informacao/home',
    },
    {
      descricao: 'Contratos',
    },
  ];

  atividades: any = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private atividadesService: AtividadesService,
    private pnotifyService: PNotifyService,
    private titleService: TitleService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit() {
    this.titleService.setTitle('contratos');
    this.activatedRoute.params.subscribe((params: any) => {
      this.registrarAcesso();
      this.getAtividadesInternas(params['idSubModulo']);
    });
  }

  registrarAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
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

  handleAtividadesInternasError() {
    this.pnotifyService.error();
    this.router.navigate(['/tecnologia-informacao/home']);
  }
}
