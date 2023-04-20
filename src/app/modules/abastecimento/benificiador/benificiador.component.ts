import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { TitleService } from 'src/app/shared/services/core/title.service';

@Component({
  selector: 'abastecimento-benificiador',
  templateUrl: './benificiador.component.html',
  styleUrls: ['./benificiador.component.scss']
})
export class AbastecimentoBenificiadorComponent implements OnInit {
  loading: boolean = true;

  breadCrumbTree: any = [
    {
      descricao: 'Home',
      routerLink: '/abastecimento/home'
    },
    {
      descricao: 'Beneficiador'
    }
  ];

  atividades: any = [];

  constructor(
    private atividadesService: AtividadesService,
    private titleService: TitleService,
    private router: Router,
    private pnotify: PNotifyService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Beneficiador');  
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
    this.router.navigate(['/abastecimento/home']);
  }
}
