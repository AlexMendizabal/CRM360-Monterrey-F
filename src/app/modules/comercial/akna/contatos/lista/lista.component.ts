import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { CustomTableConfig } from './../../../../../shared/templates/custom-table/models/config';
import { HttpResponse } from '@angular/common/http';
import { ComercialAknaContatosService } from './../contatos.service';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { IComercialAknaContatos } from './../models/contatos';
import { ConfirmModalService } from './../../../../../shared/modules/confirm-modal/confirm-modal.service';
//angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';

//servicos
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { RouterService } from 'src/app/shared/services/core/router.service';

// rxjs
import { finalize, take, switchMap } from 'rxjs/operators';
import { Subscription, EMPTY } from 'rxjs';

//modelos
import { Subtitles } from './../../../../../shared/modules/subtitles/subtitles';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { DateService } from 'src/app/shared/services/core/date.service';

@Component({
  selector: 'comercial-akna-contatos-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class ComercialAknaContatosListaComponent implements OnInit, OnDestroy {
  breadCrumbTree: Array<Breadcrumb>;
  noResult = false;
  loading = false; //Loading FullPage
  loadingNavBar = false; //Loading do NAVBAR

  tableConfig: Partial<CustomTableConfig> = { subtitleBorder: true };

  bsConfig: Partial<BsDatepickerConfig>;
  $activatedRouteSubscription: Subscription;
  contatoSelecionado: IComercialAknaContatos;
  contatos: IComercialAknaContatos[] = [];
  contatosFiltrados: IComercialAknaContatos[] = [];
  form: FormGroup;

  // Tipos de Situação dos Tipos de Items (Ativo/Inativo)
  tipos = [
    {
      cod: 'N',
      nome: 'Ativos',
    },
    {
      cod: 'S',
      nome: 'Arquivado',
    },
  ];

  subtitles: Array<Subtitles> = [
    {
      id: 1,
      text: 'ATIVO',
      color: 'green',
    },
    {
      id: 2,
      text: 'ARQUIVADO',
      color: 'red',
    },
  ];

  /* Pagination */
  itemsPerPage: number = 10;
  totalItems: number;
  currentPage: number = 1;
  begin: number = 0;
  end: number = 10;
  /* Pagination */

  constructor(
    private route: Router,
    private pnotify: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private localeService: BsLocaleService,
    private contatoService: ComercialAknaContatosService,
    private confirmModalService: ConfirmModalService,
    private routerService: RouterService,
    private dateService: DateService
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );
  }

  ngOnInit() {
    this.buildForm();
    this.setBreadCrumb();
    this.onActivatedRoute();
  }

  ngOnDestroy() {
    this.$activatedRouteSubscription.unsubscribe();
  }

  onActivatedRoute() {
    this.$activatedRouteSubscription =
      this.activatedRoute.queryParams.subscribe((response) => {
        const _response = this.routerService.getBase64UrlParams(response);
        this.form.patchValue(_response);
        this.getContatos(this.getParams());
      });
  }

  getContatos(params?) {
    this.loading = true;

    this.contatoService
      .getContatos(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe({
        next: (response: HttpResponse<IComercialAknaContatos[]>) => {
          if (response.status === 200) {
            this.contatos = response.body;
            this.contatosFiltrados = response.body;
            this.totalItems = response.body.length;
            this.loading = false;
          } else {
            this.noResult = true;
            this.contatos = [];
          }
        },
        error: (error) => {
          this.pnotify.error();
          this.noResult = true;
        }
      });
  }

  buildForm() {
    this.form = this.formBuilder.group({
      ID: [null],
      DESCRICAO: [null],
      ARQUIVADA: [null],
      CONTATOS_VALIDOS: [null],
      PAGI: [1],
      TIME: [new Date().getTime()],
    });
  }

  setBreadCrumb() {
    const id = this.activatedRoute.snapshot.params.idSubModulo;
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: `/comercial/home`,
      },
      {
        descricao: 'Akna',
        routerLink: `/comercial/akna/${id}`,
      },
      {
        descricao: 'Contatos',
      },
    ];
  }

  async onFilter() {
    const { ID, DESCRICAO, ARQUIVADA } = this.getParams();

    let _params = {};

    if (ID) _params['ID'] = ID;

    if (DESCRICAO) _params['DESCRICAO'] = DESCRICAO;

    if (ARQUIVADA) _params['ARQUIVADA'] = ARQUIVADA;

    if (Object.keys(_params).length === 0) {
      this.contatosFiltrados = this.contatos;
      return;
    }

    const promise = new Promise((resolve, reject) => {
      try {
        const filter = this.contatos.filter((contato) => {
          let _match = false;
          for (const key in _params) {
            if (key === 'DESCRICAO') {
              if (
                contato[key]
                  .toString()
                  .toLowerCase()
                  .indexOf(_params[key].toString().toLowerCase()) == -1
              ) {
                _match = false;
                break;
              }
            } else if (contato[key] !== _params[key]) {
              _match = false;
              break;
            }
            _match = true;
          }
          return _match;
        });
        resolve(filter);
      } catch (error) {
        reject(error);
      }
    });

    await promise
      .then((contatos: IComercialAknaContatos[]) => {
        this.contatosFiltrados = contatos;
        console.log(contatos);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  openRegister(contato: IComercialAknaContatos) {
    this.route.navigate(['../cadastro'], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(contato),
    });
  }

  onPageChanged(event: PageChangedEvent): void {
    this.begin = (event.page - 1) * event.itemsPerPage;
    this.end = event.page * event.itemsPerPage;
  }

  getParams() {
    let _params: Partial<IComercialAknaContatos> = {};
    let _obj = this.form.value;

    for (let prop in _obj) {
      if (_obj[prop]) {
        if (_obj[prop] instanceof Date)
          _params[prop] = this.dateService.convertToUrlDate(_obj[prop]);
        else _params[prop] = _obj[prop];
      }
    }

    return _params;
  }

  classStatusBorder(contato: IComercialAknaContatos): string {
    let borderClass: string;

    if (contato.ARQUIVADA == 'N') {
      borderClass = 'border-success';
    } else if (contato.ARQUIVADA == 'S') {
      borderClass = 'border-danger';
    }

    return borderClass;
  }
}
