import { IComercialAknaMensagens } from './../models/mensagens';
import { ComercialAknaMensagensService } from './../mensagens.service';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { CustomTableConfig } from './../../../../../shared/templates/custom-table/models/config';
import { HttpResponse } from '@angular/common/http';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
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
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { DateService } from 'src/app/shared/services/core/date.service';

@Component({
  selector: 'comercial-akna-mensagens-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class ComercialAknaMensagensListaComponent implements OnInit, OnDestroy {
  breadCrumbTree: Array<Breadcrumb>;
  noResult = false;
  loading = false; //Loading FullPage
  loadingNavBar = false; //Loading do NAVBAR

  tableConfig: Partial<CustomTableConfig> = { subtitleBorder: true };

  bsConfig: Partial<BsDatepickerConfig>;
  $activatedRouteSubscription: Subscription;
  mensagemSelecionado: IComercialAknaMensagens;
  mensagens: IComercialAknaMensagens[] = [];
  mensagensFiltrados: IComercialAknaMensagens[] = [];
  form: FormGroup;

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
    private mensagemService: ComercialAknaMensagensService,
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
        this.getMensagens(this.getParams());
      });
  }

  getMensagens(params?) {
    this.loading = true;

    this.mensagemService
      .getMensagens(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe({
        next: (response: HttpResponse<IComercialAknaMensagens[]>) => {
          if (response.status === 200) {
            this.mensagens = response.body;
            this.mensagensFiltrados = response.body;
            this.totalItems = response.body.length;
            this.loading = false;
          } else {
            this.noResult = true;
            this.mensagens = [];
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
      TITULO: [null],
      DATA: [null],
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
        descricao: 'Mensagens',
      },
    ];
  }

  async onFilter() {
    const { TITULO, DATA } = this.getParams();

    let _params = {};

    if (TITULO) _params['TITULO'] = TITULO;

    if (Object.keys(_params).length === 0) {
      this.mensagensFiltrados = this.mensagens;
      return;
    }

    const promise = new Promise((resolve, reject) => {
      try {
        const filter = this.mensagens.filter((mensagem) => {
          let _match = false;
          for (const key in _params) {
            if (key === 'TITULO') {
              if (
                mensagem[key]
                  .toString()
                  .toLowerCase()
                  .indexOf(_params[key].toString().toLowerCase()) == -1
              ) {
                _match = false;
                break;
              }
            } else if (mensagem[key] !== _params[key]) {
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
      .then((mensagens: IComercialAknaMensagens[]) => {
        this.mensagensFiltrados = mensagens;
       // console.log(mensagens);
      })
      .catch((error) => {
        //console.log(error);
      });
  }

  openRegister(mensagem: IComercialAknaMensagens) {
    this.route.navigate(['../cadastro'], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(mensagem),
    });
  }

  onPageChanged(event: PageChangedEvent): void {
    this.begin = (event.page - 1) * event.itemsPerPage;
    this.end = event.page * event.itemsPerPage;
  }

  getParams() {
    let _params: Partial<IComercialAknaMensagens> = {};
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
}
