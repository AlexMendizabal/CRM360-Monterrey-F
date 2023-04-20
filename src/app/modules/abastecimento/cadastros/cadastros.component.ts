import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AtividadesService } from './../../../shared/services/requests/atividades.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { TitleService } from 'src/app/shared/services/core/title.service';

@Component({
  selector: 'abastecimento-cadastros',
  templateUrl: './cadastros.component.html',
  styleUrls: ['./cadastros.component.scss']
})
export class AbastecimentoCadastrosComponent implements OnInit {
  loading: boolean = true;

  breadCrumbTree: any = [
    {
      descricao: 'Home',
      routerLink: '/abastecimento/home'
    },
    {
      descricao: 'Cadastros'
    }
  ];

  atividades: any = [];

  constructor(
    private atividadesService: AtividadesService,
    private router: Router,
    private pnotify: PNotifyService,
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      this.registrarAcesso();
      this.titleService.setTitle('Cadastros');
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
    this.router.navigate(['/abastecimento/home']);
  }
}
