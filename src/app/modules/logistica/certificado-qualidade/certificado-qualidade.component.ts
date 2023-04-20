import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize, delay } from 'rxjs/operators';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subscription, forkJoin } from 'rxjs';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';

import { PageChangedEvent } from 'ngx-bootstrap/pagination/ngx-bootstrap-pagination';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

import { LogisticaCertificadoQualidadeService } from './certificado-qualidade.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { HttpClient } from '@angular/common/http';
import { WindowService } from 'src/app/shared/services/core/window.service';

@Component({
  selector: 'logistica-certificado-qualidade',
  templateUrl: './certificado-qualidade.component.html',
  styleUrls: ['./certificado-qualidade.component.scss'],
  providers: [WindowService]
})
export class LogisticaCertificadoQualidadeComponent implements OnInit, OnDestroy {
  
  certificados: Array<any> = [];
  loading: boolean = true;
  navBarLoading: boolean = false;
  
  form: FormGroup;
  numeroCertificado: string;
  notaFiscal: any;
  lote: string;
  resetForm: boolean = true;

  itemsPerPage: number = 100;
  totalItems: number = 100;
  currentPage: number = 1;
  begin: number = 0;
  end: number = 100;

  indiceAtivoPesquisa: number;

  subscription$: Subscription;
  bsConfig: Partial<BsDatepickerConfig>;

  breadCrumbTree: any = [
    {
      descricao: 'Logistica'
    },
    {
      descricao: 'Certificado de Calidad'
    }
  ];
  campoAtivo: any;

  $activatedRouteSubscription: Subscription;

  constructor(
    private service: LogisticaCertificadoQualidadeService,
    private pnotify: PNotifyService,
    private router: Router,
    private formBuilder: FormBuilder,
    private localeService: BsLocaleService,
    private activatedRoute: ActivatedRoute,
    private atividadesService: AtividadesService,
    private http: HttpClient,
    private windowService: WindowService
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );

    this.form = this.formBuilder.group({
      no_lote: [null],
      no_cq: [null],
      espessura: [null],
      largura: [null],
      pagina: [1]
    });
  }

  ngOnInit() {
    this.atividadesService.registrarAcesso().subscribe();
    
    this.$activatedRouteSubscription = this.activatedRoute.queryParams
      .subscribe(data => {
        this.form.patchValue({
          no_lote: data['lote'],
          no_cq: data['noCq'],
          pagina: data['pagina']
        });

        this.getCertificados();
      });
  }

  ngOnDestroy(){
    this.$activatedRouteSubscription.unsubscribe();
  }

  getCertificados(pagina = 1) {
    this.navBarLoading = true;

    let _req: Array<any> = [];

    let _lotes = this.getValoresPesquisa();
    let _noCq = this.getValoresPesquisa({ campo: 'no_cq' });

    if (_lotes.length !== 0) {
      _lotes.map(element => {
        _req.push(
          this.service.getCertificados({
            lote: element,
            pagina: pagina
          })
        );
      });
    }

    if (_noCq.length !== 0) {
      _noCq.map(element => {
        _req.push(
          this.service.getCertificados({
            noCq: element,
            pagina: pagina
          })
        );
      });
    }

    if (_lotes.length === 0 && _noCq.length === 0) {
      _req.push(
        this.service.getCertificados({
          pagina: pagina
        })
      );
    }

    forkJoin(_req)
      .pipe(
        delay(500),
        finalize(() => {
          this.loading = false;
          this.navBarLoading = false;
        })
      )
      .subscribe(
        data => {
          this.certificados = [];
          data.map((element: any) => {
            if (element.status === 200) {
              this.certificados = this.certificados.concat(
                element['body']['data']
              );
              this.totalItems = element['body']['total'];
            }
          });
        },
        error => {
          this.pnotify.error(error.message);
        }
      );
  }

  onPageChanged(event: PageChangedEvent): void {
    this.navBarLoading = true;
    this.getCertificados(event.page);
  }

  onFilter() {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        noCq: this.form.get('no_cq').value,
        lote: this.form.get('no_lote').value
      }
    });

    this.getCertificados();
  }

  onResetForm() {
    this.form.reset();
    this.router.navigate(['logistica/certificado-qualidade']);
  }

  getValoresPesquisa(params = { campo: 'no_lote' }) {
    let _q: string = this.form.get(params.campo).value;
    return _q ? _q.trim().split(',') : [];
  }

  removeValoresPesquisa(params = { index: null, campo: 'no_lote' }) {
    let _q: Array<any>;

    if (this.form.get(params.campo).value) {
      _q = this.form.get(params.campo).value.split(',');
      _q.splice(params.index, 1);
      this.form.get(params.campo).setValue(_q.join(','));
      return this.onFilter();
    }

    return;
  }

  alteraValorPesquisa(params = { index: null, campo: 'no_lote', valor: null }) {
    let _q: Array<any>;

    this.indiceAtivoPesquisa = params.index;

    if (this.form.get(params.campo).value && params.valor) {
      _q = this.form.get(params.campo).value.split(',');
      _q[params.index] = params.valor;
      this.form.get(params.campo).setValue(_q.join(','));
      let _id = params.campo + '_' + params.index;
      return setTimeout(() => {
        document.getElementById(_id).focus();
      }, 0);
    }

    this.removeValoresPesquisa(params);

    return;
  }

  getLen(params) {
    let _id = params.campo + '_' + params.index;
    let _element = document.getElementById(_id);
    return _element ? _element.innerText.length + 'ch' : 'auto';
  }

  validaCampoAtivo(params = { campo: null, index: null }) {
    return this.campoAtivo == params.campo + '_' + params.index;
  }

  setCampoAtivo(params = { campo: null, index: null }) {
    return (this.campoAtivo = params.campo + '_' + params.index);
  }
}
