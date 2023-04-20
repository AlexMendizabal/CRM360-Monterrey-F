import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AtividadesService } from './../../../shared/services/requests/atividades.service';
import { PNotifyService } from './../../../shared/services/core/pnotify.service';

@Component({
  selector: 'fiscal-relatorios',
  templateUrl: './relatorios.component.html',
  styleUrls: ['./relatorios.component.scss']
})
export class FiscalRelatoriosComponent implements OnInit {
  loading: boolean = true;

  breadCrumbTree: any = [
    {
      descricao: 'Home',
      routerLink: '/fiscal/home'
    },
    {
      descricao: 'Relatórios de notas fiscais'
    }
  ];

  atividades: any = [];

  constructor(
    private atividadesService: AtividadesService,
    private router: Router,
    private pnotify: PNotifyService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
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
    this.router.navigate(['/fiscal/home']);
  }
}
