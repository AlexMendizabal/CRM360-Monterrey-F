import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { LogisticaEstoquePainelInventarioInventarioMateriaisOcorrenciasService } from './materiais-ocorrencias.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { finalize, retry } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { Subscription, forkJoin } from 'rxjs';
import { DetailPanelService } from 'src/app/shared/templates/detail-panel/detal-panel.service';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { DateService } from 'src/app/shared/services/core/date.service';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';

@Component({
  selector: 'materiais-ocorrencias',
  templateUrl: './materiais-ocorrencias.component.html',
  styleUrls: ['./materiais-ocorrencias.component.scss']
})
export class LogisticaEstoquePainelInventarioInventarioMateriaisOcorrenciasComponent implements OnInit, OnDestroy {
  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  matriculaAuditor: any = this.currentUser['info']['matricula'];
  idInventario = this.activatedRoute.snapshot.params['id'];

  form: FormGroup;
  spinnerFullScreen = true;
  loaderNavbar = true;
  ocorrencias: any;
  tempOcorrencias: any;
  materiaisNotaFiscal: any = [];
  notaFiscalSelecionada: number;
  cdOcorrencia = '';
  cdEmp = '';
  loading = false;
  qtNotasFiscais: any;
  noResult = false;
  tableNotasFiscaisMateriaisConfig = false;

  appTitle = 'Ocorrências - Inventário:' + this.idInventario;
  appTitleBreadcrumb = 'Ocorrências';
  appTitleNotasFiscais = 'Lista de Materiais da ocorrência';

  breadCrumbTree: Array<Breadcrumb> = [
    {
      descricao: 'Contagem de materiais',
      routerLink: `../../${this.idInventario}/contagem-materiais`,
    },
    {
      descricao: this.appTitleBreadcrumb,
    },
  ];

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

  subtitles: Array<Subtitles> = [
    {
      id: 1,
      text: 'Devolução Total de R.O.',
      color: 'red',
    },
    {
      id: 2,
      text: 'Devolução Parcial de R.O.',
      color: 'yellow',
    },
  ];

  constructor(
    private activatedRoute: ActivatedRoute,
    private notice: PNotifyService,
    private route: Router,
    private formBuilder: FormBuilder,
    private detailPanelService: DetailPanelService,
    private dateService: DateService,
    private ocorrenciasService: LogisticaEstoquePainelInventarioInventarioMateriaisOcorrenciasService
  ) {
    this.form = this.formBuilder.group({
      cdNotaFiscal: [null],
      cdOcorrencia: [null],
    });
  }

  ngOnInit(): void {
    this.getListaExistente();
    this.onSubscription();
  }

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

  getParams() {
    let _params = {};
    const obj = this.form.value;

    for (let prop in obj) {
      if (obj[prop]) {
        if (prop == 'dataInicio' || prop == 'dataFim') {
          _params[prop] =
            obj[prop] instanceof Date
              ? this.dateService.convertToUrlDate(obj[prop])
              : obj[prop].substring(0, 10);
        } else {
          _params[prop] = obj[prop];
        }
      }
    }
    return _params;
  }

  getListaExistente() {
    if (this.getListaCarregadaMaisNotaFiscal()) {
      const val = this.cdOcorrencia;

      if (!val) {
        this.ocorrencias = this.tempOcorrencias;
      }

      const temp = this.tempOcorrencias.filter((row) => {
        return Object.keys(row).some((property) => {
          return row[property] === null
            ? null
            : row[property].toString().indexOf(val) !== -1;
        });
      });

      this.ocorrencias = temp;
      this.loading = false;
    } else {
      this.getInventario();
    }
  }

  getListaCarregadaMaisNotaFiscal() {
    let containsOcorrencia = false;
    let isNotUndefined = typeof this.tempOcorrencias !== 'undefined';

    if (isNotUndefined) {
      containsOcorrencia = this.tempOcorrencias.find(
        (element) => element.ocorrencia === this.cdOcorrencia
      );
    }

    return isNotUndefined && containsOcorrencia;
  }

  getInventario(){
    this.ocorrenciasService.getInventario(this.idInventario)
    .pipe(
      finalize(() => (
        this.getOcorrencias()
        )
      ))
    .subscribe((response) =>{
      if (response['status'] === 200) {
        this.cdEmp = response.body['data']['inventarios']['0']['cdEmpresa'];
      }
    })
  }

  getOcorrencias(){
    this.detailPanelService.hide();
    this.spinnerFullScreen = true;
    this.loaderNavbar = true;
    this.ocorrenciasService
    .getOcorrencias(this.idInventario, this.getParams())
    .pipe(
      finalize(() => 
        (
          this.loaderNavbar = false,
          this.spinnerFullScreen = false
        )
      ))
    .subscribe((response) =>{
      if (response['status'] === 200) {
        this.ocorrencias = response['body']['data']['ocorrencias'];
        this.qtNotasFiscais = response['body']['data']['qtRegistros'];
        this.noResult = true;
      }
    })
  }

  getMateriaisNotasFiscais(param) {
    this.detailPanelService.show();
    this.loading = true;
    this.materiaisNotaFiscal = [];
    this.ocorrenciasService
      .getMateriaisNotasFiscais(this.idInventario, param)
      .pipe(finalize(() => (
        this.loading = false
        )))
      .subscribe((response) => {
        if (response['status'] === 200) {
          this.materiaisNotaFiscal = response['body']['data'];
          this.notaFiscalSelecionada = param;
          this.detailPanelService.loadedFinished(false);
        } else this.detailPanelService.loadedFinished(true);
      });
  }

  salvarNotasFiscais() {
    let checkAlterado = [];
    this.ocorrencias.forEach((element) => {
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
        this.ocorrenciasService.salvarNotasFiscais(
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

  fecharSalvar(idInventario) {
    this.route.navigate([`../../${idInventario}/contagem-materiais`], {
      relativeTo: this.activatedRoute,
    });
  }
}
