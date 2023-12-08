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
  selector: 'comercial-clientes-detalhes',
  templateUrl: './detalhes.component.html',
  styleUrls: ['./detalhes.component.scss']
})
export class ComercialClientesDetalhesComponent implements OnInit {
  loaderNavbar: boolean = false;

  breadCrumbTree: Array<Breadcrumb> = [
    {
      descricao: 'Home',
      routerLink: '/comercial/home'
    },
    {
      descricao: 'Busqueda de clientes',
      routerLink: '/comercial/clientes/lista'
    },
    {
      descricao: 'Detalles'
    }
  ];

  cliente: any = {};

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
    if (this.activatedRoute.snapshot.data['response']['responseCode'] === 200) {
      console.log("aqui 2",this.activatedRoute.snapshot.data);
      this.cliente = this.activatedRoute.snapshot.data['response']['result'];
      this.registrarAcesso();
      this.titleService.setTitle('Detalhes');
    } else if (
      this.activatedRoute.snapshot.data['response']['responseCode'] === 403
    ) {
      this.pnotifyService.notice('Este cliente no pertenece a su cartera');
      this.router.navigate(['/comercial/home']);
    } else {
      this.pnotifyService.error();
      this.location.back();
    }
  }

  registrarAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
  }

  classStatusBadge(status: string) {
    let badgeClass = '';

    if (status == 'Ativo') {
      badgeClass = 'badge-success';
    } else if (status == 'Inativo') {
      badgeClass = 'badge-danger';
    } else if (status == 'Potenci') {
      badgeClass = 'badge-primary';
    } else if (status == 'Arquivo') {
      badgeClass = 'badge-secondary';
    }

    return badgeClass;
  }
}
