import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';

@Component({
  selector: 'financeiro-relatorios',
  templateUrl: './relatorios.component.html',
  styleUrls: ['./relatorios.component.scss'],
})
export class FinanceiroRelatoriosComponent implements OnInit {
  loaderFullScreen = true;

  breadCrumbTree: Array<Breadcrumb> = [
    {
      descricao: 'Home',
      routerLink: '/financeiro/home',
    },
    {
      descricao: 'Relatórios',
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
    this.titleService.setTitle('Relatórios');
    this.activatedRoute.params.subscribe((params: any) => {
      this.registrarAcesso();
      this.getAtividadesInternas(params.idSubModulo);
    });
  }

  registrarAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
  }

  getAtividadesInternas(idSubModulo: number) {
    this.atividadesService.getAtividadesInternas(idSubModulo).subscribe(
      (response: any) => {
        if (response.responseCode === 200) {
          this.atividades = response.result;
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
    this.router.navigate(['/financeiro/home']);
  }
}
