import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { TitleService } from 'src/app/shared/services/core/title.service';

@Component({
  selector: 'sul-fluminense-entrada-materiais',
  templateUrl: './entrada-materiais.component.html',
  styleUrls: ['./entrada-materiais.component.scss']
})
export class SulFluminenseEntradaMateriaisComponent implements OnInit {
  loading: boolean = true;

  breadCrumbTree: any = [
    {
      descricao: 'Home',
      routerLink: '/sul-fluminense/home'
    },
    {
      descricao: 'Entrada de materiais'
    }
  ];

  atividades: any = [];

  constructor(
    private atividadesService: AtividadesService,
    private router: Router,
    private titleService: TitleService,
    private pnotify: PNotifyService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Entrada de materiais');  
    this.activatedRoute.params.subscribe((params: any) => {
      this.registrarAcesso();
      this.getAtividadesInternas(params['idSubModulo']);
    });
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  getAtividadesInternas(idSubModulo: number): void {
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

  handleAtividadesInternasError(): void {
    this.pnotify.error();
    this.router.navigate(['/sul-fluminense/home']);
  }
}
