import { Component, OnInit } from '@angular/core';
import { LogisticaEstoqueInventarioListaInventarioService } from './inventario.service';
import { finalize, take } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'logistica-estoque-lista-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.scss']
})
export class LogisticaEstoqueInventarioListaInventarioComponent
  implements OnInit {
  listaInventarios: any = [];
  inventarios: any = [];
  totalItems: number;
  loaderNavbar: boolean = false;
  spinnerFullScreen: boolean = true;
  ultimoStatusEnviado: any = null;
  noResult: boolean = true;
  noResultado: boolean = true;
  noLista: boolean = true;
  $subscription: Subscription;
  inve: any = [];
  compressedTable = false;
  idInventario: number;
  infoClasses = '';
  infoLinha = '';
  infoIdInventario = '';

  /* Parametros para filtros */
  tipo: any;
  empresa: any;
  deposito: any;
  linha: any;
  classe: any;
  dataInicial: any;
  dataFinal: any;
  cdInventario = '';
  sigla: any;
  informacoes: any;
  parametro: boolean = false;
  checked: boolean = true;
  /* Parametros para filtros */

  breadCrumbTree: any = [
    {
      descricao: 'Home',
      routerLink: '/logistica/estoque/inventario/filtro'
    },
    {
      descricao: 'Filtro',
      routerLink: '/logistica/estoque/inventario/filtro'
    },
    {
      descricao: 'Lista para consulta de inventários'
    }
  ];

  /* Paginação */
  itemsPerPage: number = 10;
  currentPage: number = 1;
  /* Paginação */

  constructor(
    private inventarioService: LogisticaEstoqueInventarioListaInventarioService,
    private activatedRoute: ActivatedRoute,
    private notice: PNotifyService,
    private route: Router,
    private atividadesService: AtividadesService
  ) {}

  ngOnInit() {
    this.tipo = '';
    this.empresa = '';
    this.deposito = '';
    this.linha = '';
    this.classe = '';
    this.dataInicial = '';
    this.dataFinal = '';
    this.cdInventario = '';
    this.sigla = '';
    this.atividadesService.registrarAcesso().subscribe();
    this.getInventario('');
  }

  getInventario(sigla = '', page = 1) {
    this.loaderNavbar = true;
    this.sigla = sigla;
    this.checked = !this.checked;
    if (this.checked == false) {
      sigla = '';
    }

    this.inventarioService
      .getInventario(
        page,
        this.tipo,
        this.empresa,
        this.deposito,
        this.linha,
        this.classe,
        this.dataInicial,
        this.dataFinal,
        this.cdInventario,
        sigla
      )
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.spinnerFullScreen = false;
        })
      )
      .subscribe(
        data => {
          this.noResult = false;
          this.inve = data['inventarios'];
          this.inventarios = data['inventarios'];
          this.loaderNavbar = false;
          let lancamentos = [];
          this.inventarios.forEach(element => {
            if (element.empresa || element.deposito) {
              lancamentos.push({
                empresa: element.empresa,
                deposito: element.deposito
              });
            }
          });

          this.informacoes = lancamentos;

          if (!this.totalItems) {
            this.totalItems = data['qtRegistros'];
          }
        },
        error => {
          this.notice.notice(
            'Não há inventários cadastrados para esse status.'
          );
        }
      );
  }

  getClassesInventario(idInventario, i) {
    this.noLista = true;
    this.loaderNavbar = true;
    this.noResultado = false;
    this.inventarioService
      .getClassesInventario(idInventario)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
        })
      )
      .subscribe((response: any) => {
        if (response['status'] === 200) {
          response.body.forEach(element => {
            if (element.dsClasse == null) {
              this.noResultado = true;
            } else {
              this.noLista = false;
              this.infoClasses = response.body;
            }
          });
        }
      });
    this.compressedTable = true;
    this.infoLinha = this.inve[i].dsLinha;
    this.infoIdInventario = this.inve[i].idInventario;
  }

  /* Paginação */
  onPageChanged(event: PageChangedEvent): void {
    this.getInventario('', event.page);
  }
  /* Paginação */

  abrirInventario(idInventario, idStatusInventario) {
    this.route.navigate(
      [`logistica/estoque/inventario/${idInventario}/contagem-materiais`],
      {
        queryParams: {
          tipo: this.tipo,
          empresa: this.empresa,
          deposito: this.deposito,
          linha: this.linha,
          classe: this.classe,
          dataInicial: this.dataInicial,
          dataFinal: this.dataFinal,
          sigla: this.sigla
        }
      }
    );
  }

  abrirRelatorio(idInventario, idStatusInventario) {
    this.route.navigate(
      [`logistica/estoque/inventario/${idInventario}/relatorio`],
      {
        queryParams: {
          tipo: this.tipo,
          empresa: this.empresa,
          deposito: this.deposito,
          linha: this.linha,
          classe: this.classe,
          dataInicial: this.dataInicial,
          dataFinal: this.dataFinal,
          sigla: this.sigla,
          informacoes: this.informacoes
        }
      }
    );
  }

  openModal(index) {
    this.idInventario = this.inventarios[index].idInventario;
    this.compressedTable = true;
  }

  onClose() {
    this.compressedTable = false;
  }

  clickEvent(inventario) {
    this.inventarios.forEach(element => {
      if (element.idInventario != inventario.idInventario) {
        element.status = false;
      } else if (inventario.status == true) {
        inventario.status = true;
      } else {
        inventario.status = !inventario.status;
      }
    });
  }
}
