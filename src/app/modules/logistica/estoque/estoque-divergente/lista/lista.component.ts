import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { finalize } from 'rxjs/operators';
import { PNotifyService } from '../../../../../shared/services/core/pnotify.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, ɵConsole, ViewChild } from '@angular/core';

import { LogisticaEstoqueEstoqueDivergenteListaService } from './lista.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import {
  BsModalService,
  ModalDirective,
  BsModalRef
} from 'ngx-bootstrap/modal';
@Component({
  selector: 'logistica-estoque-estoqueDivergente-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class LogisticaEstoqueEstoqueDivergenteListaComponent implements OnInit {
  @ViewChild('childModal', { static: false }) childModal: ModalDirective;
  spinnerFullScreen: boolean = true;
  listas: any = [];
  parametros: any = {};
  divergencia = '';
  dtDivergencia = '';
  breadCrumbTree: any = [
    {
      descricao: 'Home',
      routerLink: '/logistica/home'
    },
    {
      descricao: 'Filtros',
      routerLink: '/logistica/estoque/estoque-divergente'
    },
    {
      descricao: 'Listagem de Estoque Divergente'
    }
  ];

  noResult = false;
  compressedTable = false;
  divergenciaEstoque = '';
  entradas = '';
  saidas = '';
  dataMovimentacao = '';
  dsLinha = '';

  /* Paginação */
  itemsPerPage: number = 10;
  totalItems: number;
  currentPage: number = 1;
  begin: number = 0;
  end: number = 10;
  beginP: number = 0;
  endP: number = 10;
  /* Paginação */

  constructor(
    private activatedRoute: ActivatedRoute,
    private notice: PNotifyService,
    private empresasService: LogisticaEstoqueEstoqueDivergenteListaService,
    private dateSevice: DateService,
    private atividadesService: AtividadesService
  ) {}

  ngOnInit() {
    this.totalItems = 0;
    this.activatedRoute.queryParams.subscribe(data => {
      this.empresasService
        .getLista({
          empresas: data['empresas'] ? data['empresas'] : '',
          depositos: data['depositos'] ? data['depositos'] : '',
          linhas: data['linhas'] ? data['linhas'] : '',
          classes: data['classes'] ? data['classes'] : '',
          codigoMaterial: data['materiais'] ? data['materiais'] : '',
          dataInicio: this.dateSevice.convert2PhpDate(
            new Date(data['dataInicio'])
          )
        })
        .pipe(
          finalize(() => {
            this.spinnerFullScreen = false;
          })
        )
        .subscribe(
          data => {
            if (data.status === 204) {
              this.notice.notice('Não há divengências.');
              this.noResult = true;
            } else {
              this.noResult = false;
              this.listas = data.body;
              this.listas.forEach((element, i) => {
                element.indice = i + 1;
              });
              this.totalItems = data.body['length'];
            }
          },
          error => {
            this.noResult = true;
            this.notice.error();
          }
        );
    });

    this.atividadesService.registrarAcesso().subscribe();
  }

  getData(material, codigoDeptData) {
    this.activatedRoute.queryParams.subscribe(data => {
      this.empresasService
        .getData({
          deposito: codigoDeptData,
          codigoMaterial: material,
          dataInicio: this.dateSevice.convert2PhpDate(
            new Date(data['dataInicio'])
          )
        })
        .subscribe(
          response => {
            if (response.status === 204) {
              this.notice.notice('Não há informações.');
            } else {
              this.divergencia = response.body['divergencia'];
              this.dtDivergencia = response.body['dtDivergencia'];
            }
          },
          error => this.notice.error()
        );
    });
  }

  /* Paginação */
  onPageChanged(event: PageChangedEvent): void {
    this.begin = (event.page - 1) * event.itemsPerPage;
    this.end = event.page * event.itemsPerPage;
  }
  /* Paginação */

  openModal(index) {
    let codigoMaterialData = this.listas[index].CD_MATE;
    let codigoDeptData = this.listas[index].CD_DEPO;
    this.getData(codigoMaterialData, codigoDeptData);
    this.childModal.show();
  }

  hideChildModal(): void {
    this.childModal.hide();
  }

  openTab(index) {
    let _i = this.currentPage * this.itemsPerPage - this.itemsPerPage + index;
    this.divergenciaEstoque = this.listas[_i].DIVE_ESTO;
    this.entradas = this.listas[_i].ENTR;
    this.saidas = this.listas[_i].SAID;
    this.dataMovimentacao = this.listas[_i].DATA;
    this.dsLinha = this.listas[_i].DS_LINHA;
    this.compressedTable = true;
  }

  onClose() {
    this.compressedTable = false;
  }

  clickEvent(lista) {
    this.listas.forEach(element => {
      if (element.indice != lista.indice) {
        element.status = false;
      } else if (lista.status == true) {
        lista.status = true;
      } else {
        lista.status = !lista.status;
      }
    });
  }
}
