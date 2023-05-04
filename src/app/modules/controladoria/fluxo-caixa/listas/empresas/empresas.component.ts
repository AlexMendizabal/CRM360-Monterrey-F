import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ControladoriaEmpresasService } from '../../services/empresas.service';

@Component({
  selector: 'lista-empresas',
  templateUrl: './empresas.component.html',
  styleUrls: ['./empresas.component.scss']
})
export class ControladoriaListaEmpresasComponent implements OnInit {
  appTitle = 'Empresas';
  breadCrumbTree: any = [];
  spinnerFullScreen: boolean = false;
  loaderNavbar: boolean = false;
  noResult = false;
  empresas = [];
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
    private empresaService: ControladoriaEmpresasService,
    private route: Router,
    private notice: PNotifyService
  ) {}

  ngOnInit(): void {
    this.setBreadCrumb();
    this.getEmpresas();
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

  getEmpresas() {
    let idLancEmpr = 0;
    this.spinnerFullScreen = true;
    this.empresaService.getEmpresas(idLancEmpr).subscribe((response) => {
      if (response.status === 204) {
        this.notice.notice('Não existe empresas cadastradas.');
        this.spinnerFullScreen = false;
      } else {
        this.empresas = response.body['data'];
        this.totalItems = response.body['data'].length;
        this.spinnerFullScreen = false;
        this.noResult = true;
      }
    });
  }
}
