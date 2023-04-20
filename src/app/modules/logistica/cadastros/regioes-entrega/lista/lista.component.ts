import { RouterService } from 'src/app/shared/services/core/router.service';
// angular
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

//services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';

//rxjs
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { DateService } from 'src/app/shared/services/core/date.service';
import { LogisticaRegioesEntregaService } from '../services/regioes-entrega.service';

@Component({
  selector: 'logistica-regioes-entrega-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class LogisticaRegioesEntregaListaComponent implements OnInit {

  appTitle = "Regiones de entrega";

  form: FormGroup;

  breadCrumbTree: any = [];

  showAdvancedFilter = true;
  regioesEntrega: any;

  idSubModulo: number;

  $subscription: Subscription;

  /* Pagination */
  itemsPerPage = 100;
  totalItems = 0;
  currentPage = 1;
  /* Pagination */

  /*loading*/
  loading = true;
  loadingNavBar = false;
  noResult = true;
  /*loading*/

  $activatedRouteSubscription: Subscription;

  constructor(
    private route: Router,
    private service: LogisticaRegioesEntregaService,
    private pnotify: PNotifyService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private atividadesService: AtividadesService,
    private routerService: RouterService,
    private dateService: DateService,
  ) {
    this.form = this.formBuilder.group({
      UUID: [null],
      ID_REFE_ERP: [null],
      NM_REGI_ENTR: [null],
      IN_STAT: [null],
      PAGI: [1],
      TT_REGI_PAGI: [this.itemsPerPage],
      TIME: [(new Date).getTime()]
    });
  }

  ngOnInit() {
    this.atividadesService.registrarAcesso().subscribe();
    this.setBreadCrumb();
    this.onActivatedRoute();
  }

  ngOnDestroy() {
    this.$activatedRouteSubscription.unsubscribe();
  }

  onActivatedRoute() {
    this.$activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (response) => {
        const _response = this.routerService.getBase64UrlParams(response);
        this.form.patchValue(_response);

        if (_response.hasOwnProperty('TT_REGI_PAGI')){
          this.itemsPerPage = _response.TT_REGI_PAGI;
        }
        
        this.getRegioesEntrega(this.getParams());
      }
    );
  }

  setBreadCrumb() {
    this.breadCrumbTree = [
      {
        descricao: 'Logistica'
      },
      {
        descricao: 'Cadastros',
        routerLink: '../../'
      },
      {
        descricao: this.appTitle
      }
    ];
  }

  getRegioesEntrega(params?) {

    if (this.loading === false) {
      this.loadingNavBar = true;
    }

    return this.service
      .getRegioesEntrega(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.regioesEntrega = response.body["data"];
            this.totalItems = response.body["total"];
            this.noResult = false;
          } else {
            this.pnotify.notice("Ningún resultado encontrado");
            this.noResult = true;
          }
        },
        (error) => {
          this.noResult = true;
          this.pnotify.error();
        }
      );
  }

  onPageChanged(event) {
    this.form.get('PAGI').setValue(event.page);
    this.form.get('TIME').setValue(new Date().getTime());
    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
    });
  }

  onShowFilter() {
    this.showAdvancedFilter = !this.showAdvancedFilter;
  }

  onFilter() {
    this.form.get("PAGI").setValue(1);
    this.form.get("TIME").setValue((new Date).getTime());

    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams())
    });

  }

  onReset() {
    this.form.reset();
    this.form.get("status").setValue("T");
    this.onFilter();
    this.route.navigate([],
      {
        relativeTo: this.activatedRoute,
        queryParams: null
      }
    );
  }


  getParams() {
    let _params = {};
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
