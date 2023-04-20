import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { LogisticaEstoquePainelInventarioInventarioMateriaisNotasFiscaisService } from './materiais-notas-fiscais.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { finalize, retry } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { Subscription, forkJoin } from 'rxjs';
import { DetailPanelService } from 'src/app/shared/templates/detail-panel/detal-panel.service';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';

@Component({
  selector: 'materiais-notas-fiscais',
  templateUrl: './materiais-notas-fiscais.component.html',
  styleUrls: ['./materiais-notas-fiscais.component.scss'],
})
export class LogisticaEstoquePainelInventarioInventarioMateriaisNotasFiscaisComponent
  implements OnInit, OnDestroy {
  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  matriculaAuditor: any = this.currentUser['info']['matricula'];
  idInventario = this.activatedRoute.snapshot.params['id'];

  form: FormGroup;
  notasFiscais: any;
  tempNotasFiscais: any;
  qtNotasFiscais: any;
  loading = false;
  cdNotaFiscal = '';
  cdEmp = '';
  materiaisNotaFiscal: any = [];
  notaFiscalSelecionada: number;
  spinnerFullScreen = true;
  loaderNavbar = true;

  tableFilterConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  /* Paginação */
  itemsPerPage: number = 10;
  totalItems: number;
  currentPage: number = 1;
  begin: number = 0;
  end: number = 10;
  beginP: number = 0;
  endP: number = 10;
  /* Paginação */

  /* Painel de detalhes */
  $showDetailPanelSubscription: Subscription;
  showDetailPanel = false;

  appTitle = 'Notas fiscais - Inventário:' + this.idInventario;
  appTitleBreadcrumb = 'Notas fiscais';
  appTitleNotasFiscais = 'Lista de Materiais da Nota';

  breadCrumbTree: Array<Breadcrumb> = [
    {
      descricao: 'Contagem de materiais',
      routerLink: `../../${this.idInventario}/contagem-materiais`,
    },
    {
      descricao: this.appTitleBreadcrumb,
    },
  ];

  tableNotasFiscaisMateriaisConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private notice: PNotifyService,
    private route: Router,
    private formBuilder: FormBuilder,
    private detailPanelService: DetailPanelService,
    private notaFiscalService: LogisticaEstoquePainelInventarioInventarioMateriaisNotasFiscaisService
  ) {
    this.form = this.formBuilder.group({
      cdNotaFiscal: [null],
    });
  }

  ngOnInit() {
    this.openModalNotaFiscal();
    this.onSubscription();
  }

  openModalNotaFiscal() {
    this.getListaExistente();
  }

  getListaExistente() {
    if (this.getListaCarregadaMaisNotaFiscal()) {
      const val = this.cdNotaFiscal;

      if (!val) {
        this.notasFiscais = this.tempNotasFiscais;
      }

      const temp = this.tempNotasFiscais.filter((row) => {
        return Object.keys(row).some((property) => {
          return row[property] === null
            ? null
            : row[property].toString().indexOf(val) !== -1;
        });
      });

      this.notasFiscais = temp;
      this.loading = false;
    } else {
      this.getInventario();
    }
  }

  getListaCarregadaMaisNotaFiscal() {
    let containsNotaFiscal = false;
    let isNotUndefined = typeof this.tempNotasFiscais !== 'undefined';

    if (isNotUndefined) {
      containsNotaFiscal = this.tempNotasFiscais.find(
        (element) => element.notaFiscal === this.cdNotaFiscal
      );
    }

    return isNotUndefined && containsNotaFiscal;
  }

  getNotasFiscais() {
    this.loaderNavbar = true;
    if (this.activatedRoute.snapshot.params['id'] > 0) {
      this.notaFiscalService
        .getNotasFiscais(this.idInventario, this.cdNotaFiscal, this.cdEmp)
        .pipe(finalize(() => (this.loaderNavbar = false)))
        .subscribe(
          (data) => {
            if (data['status'] === 200) {
              this.notasFiscais = data['body']['data']['notasFiscais'];
              this.tempNotasFiscais = data['body']['data']['notasFiscais'];
              this.qtNotasFiscais = data['body']['data']['qtRegistros'];
              this.spinnerFullScreen = false;
            } else this.notice.notice('Não houve retorno para sua consulta');
          },
          (error) => this.notice.error(error.message)
        );
    }
  }

  getMateriaisNotasFiscais(notaFiscal) {
    this.detailPanelService.show();
    this.loading = true;
    this.materiaisNotaFiscal = [];
    this.notaFiscalService
      .getMateriaisNotasFiscais(this.idInventario, notaFiscal)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((data) => {
        if (data['status'] === 200) {
          this.materiaisNotaFiscal = data['body']['data'];
          this.notaFiscalSelecionada = notaFiscal;
          this.detailPanelService.loadedFinished(false);
        } else this.detailPanelService.loadedFinished(true);
      });
  }

  salvarNotasFiscais() {
    let checkAlterado = [];
    this.notasFiscais.forEach((element) => {
      if (element.checkAlterado) {
        checkAlterado.push(element);
      }
    });

    let particao = 50;
    let qtEnvios = Math.ceil(checkAlterado.length / particao);
    let req: any = [];

    this.loaderNavbar = true;

    for (let index = 0; index < qtEnvios; index++)
      req.push(
        this.notaFiscalService.salvarNotasFiscais(
          this.idInventario,
          checkAlterado.slice(particao * index, particao * (index + 1)),
          this.matriculaAuditor
        )
      );

    forkJoin(req)
      .pipe(
        retry(2),
        finalize(() => (this.loaderNavbar = false))
      )
      .subscribe(
        (data) => {
          let contador = 0;
          data[0]['body'].forEach((element) => {
            if (element['responseCode'] == 200) {
              this.notice.success('Itens salvos com sucesso!');
              contador++;
            } else {
              this.notice.error(element['response']);
            }
          });
          if (contador === data.length) {
          }
        },
        (error) => {
          this.notice.error('Ocorreu um erro ao salvar os itens');
        }
      );
  }

  verificaCheck(notaFiscal) {
    notaFiscal.checkAlterado = !notaFiscal.checkAlterado;
    this.salvarNotasFiscais();
    this.getInventario();
  }

  /* Paginação */
  onPageChanged(event: PageChangedEvent): void {
    this.begin = (event.page - 1) * event.itemsPerPage;
    this.end = event.page * event.itemsPerPage;
  }
  /* Paginação */

  onSubscription() {
    this.$showDetailPanelSubscription = this.detailPanelService.config.subscribe(
      (event: any) => {
        this.showDetailPanel = event.showing;
      }
    );
  }

  ngOnDestroy() {
    this.$showDetailPanelSubscription.unsubscribe();
  }

  fecharSalvar(idInventario) {
    this.route.navigate([`../../${idInventario}/contagem-materiais`], {
      relativeTo: this.activatedRoute,
    });
  }

  getInventario(){
    this.notaFiscalService.getInventario(this.idInventario)
    .pipe(
      finalize(() => (
        this.getNotasFiscais()
        )
      ))
    .subscribe((response) =>{
      if (response['status'] === 200) {
        this.cdEmp = response.body['data']['inventarios']['0']['cdEmpresa'];
      }
    })

    
  }
}
