//angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';

//rxjs
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';

//services
import { AdminPerfisService } from '../services/perfis.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { RouterService } from 'src/app/shared/services/core/router.service';

//interfaces
import { IAdminPeril } from '../models/perfil';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { DateService } from 'src/app/shared/services/core/date.service';

@Component({
  selector: 'admin-perfis-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class AdminPerfisListaComponent implements OnInit, OnDestroy {
  
  data: IAdminPeril[];
  form: FormGroup;

  loading = true;
  loadingNavBar = false;
  noResult: boolean;

  breadCrumbTree: Array<Breadcrumb> = [
    {
      descricao: 'Home',
      routerLink: '/admin/home'
    },
    {
      descricao: 'Lista de perfis'
    }
  ];

  /* Pagination */
  itemsPerPage = 100;
  totalItems = 10;
  currentPage = 1;
  /* Pagination */

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true
  };

  $activatedRouteSubscription: Subscription;

  constructor(
    private service: AdminPerfisService,
    private pnotify: PNotifyService,
    private route: Router,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private atividadesService: AtividadesService,
    private routerService: RouterService,
    private dateService: DateService
  ) {
    this.form = this.formBuilder.group({
      nome: [null],
      sigla: [null],
      pagina: [1],
      registrosPorPagina: [this.itemsPerPage],
      situacao: ['1'],
      t: [(new Date()).getTime()]
    });
  }

  ngOnInit() {
    this.registrarAcesso();
    this.onActivatedRoute();
  }

  ngOnDestroy(): void {
    this.$activatedRouteSubscription.unsubscribe();

  }

  registrarAcesso() {
    this.atividadesService
      .registrarAcesso()
      .subscribe();
  }

  onActivatedRoute() {
    this.$activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(response => {
      const _response = this.routerService.getBase64UrlParams(response);
      
      if(_response?.registrosPorPagina){
        this.itemsPerPage = _response?.registrosPorPagina;
      }
      
      this.form.patchValue(_response);
      this.getPerfis(this.getParams());
    });
  }

  getPerfis(params?) {

    this.itemsPerPage = this.form.get("registrosPorPagina").value;

    if (!this.loading) {
      this.loadingNavBar = true;
    }

    this.service
      .getPerfis(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        response => {
          if (response.status !== 200) {
            this.data = [];
            this.noResult = true;
            this.pnotify.notice('Não houve retorno para sua consulta');
            return
          }
          this.noResult = false;
          this.data = response.body['data'];
          this.totalItems = response.body['total'];
        },
        error => {
          this.data = [];
          this.noResult = true;
          this.pnotify.error();
        }
      );
  }
  
  onPageChanged(event) {
    this.form.get('pagina').setValue(event.page);
    this.form.get('t').setValue((new Date).getTime());
    this.route.navigate([], {
      queryParams: this.routerService.setBase64UrlParams(this.getParams())
    })
  }

  onFilter() {
    this.form.get("t").setValue((new Date()).getTime());
    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams())
    })
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

  onReset() {
    this.form.patchValue({
      nome: null,
      sigla: null,
      pagina: 1,
      registrosPorPagina: this.itemsPerPage,
      situacao: '1',
      time: [(new Date()).getTime()]
    })
    this.onFilter();
  }
}
