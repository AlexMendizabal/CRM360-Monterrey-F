import { Component, OnInit } from '@angular/core';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { ActivatedRoute, Router } from '@angular/router';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ControladoriaTiposSaldosBancosService } from '../../services/tipos-saldos-bancos.service';

@Component({
  selector: 'lista-tipos-saldos-bancos',
  templateUrl: './tipos-saldos-bancos.component.html',
  styleUrls: ['./tipos-saldos-bancos.component.scss']
})
export class ControladoriaListaTiposSaldosBancosComponent implements OnInit {
  appTitle = 'Tipos de lançamentos';
  breadCrumbTree: any = [];
  spinnerFullScreen: boolean = false;
  loaderNavbar: boolean = false;
  noResult = false;
  tiposLancamentos = [];
  dadosEmpty = false;

  /* Paginação */
  itemsPerPage: number = 10;
  totalItems: number;
  currentPage: number = 1;
  begin: number = 0;
  end: number = 10;

  constructor(
    private activatedRoute: ActivatedRoute,
    private tipoSaldosBancosService: ControladoriaTiposSaldosBancosService,
    private route: Router,
    private notice: PNotifyService
  ) {}

  ngOnInit(): void {
    this.setBreadCrumb();
    this.getTipos();
  }

  setBreadCrumb() {
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: '/controladoria/home',
      },
      {
        descricao: 'Lançamento saldos bancos',
        routerLink: '/controladoria/saldos-bancos',
      },
      {
        descricao: this.appTitle,
      },
    ];
  }

  getTipos() {
    let param = 0;
    this.spinnerFullScreen = true;
    this.tipoSaldosBancosService.getTipos(param).subscribe((response) => {
      if (response.status === 204) {
        this.notice.notice('Não existe tipos de lançamentos cadastrados.');
        this.spinnerFullScreen = false;
      } else {
        this.tiposLancamentos = response.body['data'];
        this.totalItems = response.body['data'].length;
        this.spinnerFullScreen = false;
        this.noResult = true;
      }
    });
  }

  /* Paginação */
  onPageChanged(event: PageChangedEvent): void {
    this.begin = (event.page - 1) * event.itemsPerPage;
    this.end = event.page * event.itemsPerPage;
  }
  /* Paginação */
}
