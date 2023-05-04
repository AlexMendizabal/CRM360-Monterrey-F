import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { TitleService } from 'src/app/shared/services/core/title.service';

@Component({
  selector: 'abastecimento-monitores',
  templateUrl: './monitores.component.html',
  styleUrls: ['./monitores.component.scss']
})
export class AbastecimentoMonitoresComponent implements OnInit {
  loading: boolean = true;

  breadCrumbTree: any = [
    {
      descricao: 'Home',
      routerLink: '/abastecimento/home'
    },
    {
      descricao: 'Monitores'
    }
  ];

  atividades: any = [];

  constructor(
    private atividadesService: AtividadesService,
    private router: Router,
    private pnotify: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
  ) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.registrarAcesso();
      this.titleService.setTitle('Monitores');
      this.getAtividadesInternas(params['idSubModulo']);
    });
  }

  registrarAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
  }

  getAtividadesInternas(idSubModulo: number) {
    this.atividadesService.getAtividadesInternas(idSubModulo).subscribe(
      res => {
        if (res['responseCode'] === 200) {
          this.atividades = res['result'];
          this.loading = false;
        } else {
          this.handleAtividadesInternasError();
        }
      },
      error => {
        this.handleAtividadesInternasError();
      }
    );
  }

  handleAtividadesInternasError() {
    this.pnotify.error();
    this.router.navigate(['/abastecimento/home']);
  }
}
