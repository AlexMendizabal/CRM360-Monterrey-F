//angualr
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';

//rxjs
import { finalize } from 'rxjs/operators';

//services
import { AdminModulosService } from '../services/modulos.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { RouterService } from 'src/app/shared/services/core/router.service';

//interfaces
import { IAdminModulo } from '../models/modulo';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { Subscription } from 'rxjs';
import { DateService } from 'src/app/shared/services/core/date.service';

@Component({
  selector: 'admin-modulos-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class AdminModulosListaComponent implements OnInit {
  
  data: IAdminModulo[];
  
  loading = true;
  loadingNavBar = false;
  noResult: boolean;
  
  appTitle = "Lista de módulos";

  form: FormGroup;

  idSubModulo: number;

  breadCrumbTree: Array<Breadcrumb>;

  $activatedRouteSubscription: Subscription;
  
  /* Pagination */
  itemsPerPage = 10;
  totalItems = 10;
  currentPage = 1;
  /* Pagination */

  constructor(
    private moduloService: AdminModulosService,
    private route: Router,
    private pnotify: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private atividadesService: AtividadesService,
    private routerService: RouterService,
    private formBuilder: FormBuilder,
    private dateService: DateService
  ) {
    
  }

  ngOnInit() {
    this.buildForm();
    this.setBreadCrumb();
    this.onActivatedRoute();
  }

  ngOnDestroy() {
    this.$activatedRouteSubscription?.unsubscribe();
  }

  onActivatedRoute() {
    this.$activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (response) => {
        
        const _response = this.routerService.getBase64UrlParams(response);
        
        if(_response?.registrosPorPagina){
          this.itemsPerPage = _response?.registrosPorPagina;
        }
        
        this.form.patchValue(_response);
        this.getModulos(this.getParams());
      }
    );
  }

  onFilter() {
    this.form.get('t').setValue(new Date().getTime());
    this.form.get('pagina').setValue(1);
    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
    });
  }

  buildForm() {
    this.form = this.formBuilder.group({
      id: [null],
      nome: [null],
      rota: [null],
      pagina: [1],
      registrosPorPagina: [100],
      t:[null]
    })
  }

  setPageRegistros(itemsPerPage) {
    this.itemsPerPage = itemsPerPage;
    this.onFilter();
  }

  setBreadCrumb() {
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: `/admin/home`,
      },
      {
        descricao: this.appTitle,
      },
    ];
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

  getModulos(params?) {

    if (!this.loading) {
      this.loadingNavBar = true;
    }

    this.moduloService
      .getModulos(params)
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

  onReset() {
    this.form.reset();
  }
}
