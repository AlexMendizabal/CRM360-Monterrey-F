import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

// Services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';

@Component({
  selector: 'comercial-comissoes-vendedores-internos',
  templateUrl: './vendedores-internos.component.html',
  styleUrls: ['./vendedores-internos.component.scss']
})
export class ComercialComissoesVendedoresInternosComponent implements OnInit {
  loaderNavbar: boolean = false;

  breadCrumbTree: Array<Breadcrumb> = [];
  appTitle: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private pnotifyService: PNotifyService,
    private location: Location,
    private atividadesService: AtividadesService,
    private titleService: TitleService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit() {
      this.registrarAcesso();
      this.setBreadCrumb();
  }

  registrarAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {

    this.appTitle = 'Vendedores Internos';
    this.titleService.setTitle(this.appTitle)

    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: '/comercial/home',
      },
      {
        descricao: 'Comissões',
        routerLink: `/comercial/comissoes/${params['idSubModulo']}`,
      },
      {
        descricao: this.appTitle,
      },
    ];
    });
  }
}
