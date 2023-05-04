import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ControladoriaBancosService } from '../../services/bancos.service';

@Component({
  selector: 'lista-bancos',
  templateUrl: './bancos.component.html',
  styleUrls: ['./bancos.component.scss']
})
export class ControladoriaListaBancosComponent implements OnInit {
  appTitle = 'Bancos/Fundos';
  breadCrumbTree: any = [];
  spinnerFullScreen: boolean = false;
  loaderNavbar: boolean = false;
  noResult = false;
  bancos = [];
  dadosEmpty = false;

  /* Config Table */
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: false,
  };

  /* Paginação */
  itemsPerPage: number = 10;
  totalItems: number;
  currentPage: number = 1;
  begin: number = 0;
  end: number = 10;

  constructor(
    private activatedRoute: ActivatedRoute,
    private bancosService: ControladoriaBancosService,
    private route: Router,
    private notice: PNotifyService
  ) {}

  ngOnInit(): void {
    this.setBreadCrumb();
    this.getBancos();
  }

  setBreadCrumb() {
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: '/controladoria/home',
      },
      {
        descricao: 'Lançamento fluxo de caixa',
        routerLink: '/controladoria/fluxo-caixa',
      },
      {
        descricao: this.appTitle,
      },
    ];
  }

  /* Paginação */
  onPageChanged(event: PageChangedEvent): void {
    this.begin = (event.page - 1) * event.itemsPerPage;
    this.end = event.page * event.itemsPerPage;
  }
  /* Paginação */

  getBancos() {
    let idLancBanc = 0;
    this.spinnerFullScreen = true;
    this.bancosService.getBancos(idLancBanc).subscribe((response) => {
      if (response.status === 204) {
        this.notice.notice('Não existe bancos cadastrados.');
        this.spinnerFullScreen = false;
      } else {
        this.bancos = response.body['data'];
        this.totalItems = response.body['data'].length;
        this.spinnerFullScreen = false;
        this.noResult = true;
      }
    });
  }
}
