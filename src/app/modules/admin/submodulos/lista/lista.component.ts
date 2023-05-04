//angular
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';

//services
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AdminSubModulosService } from '../services/submodulos.service';
import { AdminModulosService } from '../../modulos/services/modulos.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { RouterService } from 'src/app/shared/services/core/router.service';

//interfaces
import { IAdminSubModulo } from '../models/submodulo';
import { IAdminModulo } from '../../modulos/models/modulo';

//rxjs
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { DateService } from 'src/app/shared/services/core/date.service';

@Component({
  selector: 'admin-submodulos-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class AdminSubModulosListaComponent implements OnInit {
  
  form: FormGroup;

  appTitle = "Lista de submodulos";

  breadCrumbTree: any;
  data: IAdminSubModulo[];
  loading = true;
  loadingNavBar = false;
  loadingModulos = true;
  showAdvancedFilter = true;
  noResult: boolean;

  idSubModulo: number;

  modulos: IAdminModulo[];

  /* Pagination */
  itemsPerPage = 100;
  totalItems = 10;
  currentPage = 1;
  numberOfItems = [10, 25, 50, 100, 250, 500];
  /* Pagination */

  situacao = ['ATIVO', 'INATIVO'];

  $subscription: Subscription;
  $activatedRouteSubscription: Subscription;

  constructor(
    private route: Router,
    private service: AdminSubModulosService,
    private pnotify: PNotifyService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private moduloService: AdminModulosService,
    private atividadesService: AtividadesService,
    private routerService: RouterService,
    private dateService: DateService
  ) {
  }

  ngOnInit() {
    this.buildForm();
    this.setBreadCrumb();
    this.onActivatedRoute();
    this.getModulos();
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
        this.getSubModulos(this.getParams());
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
      moduloId: [null],
      situacao: [null],
      registrosPorPagina: [100],
      pagina: [1],
      t:[null]
    })
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

  getSubModulos(submodulo = {}) {
    if (!this.loading) {
      this.loadingNavBar = true;
    }

    this.service
      .getSubModulos(submodulo)
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

  getModulos(params?) {
    
    this.loadingModulos = true;

    this.moduloService
      .getModulos(params)
      .pipe(
        finalize(() => {
          this.loadingModulos = false;
        })
      )
      .subscribe(response => {
        if (response.status === 200) {
          this.modulos = response.body['data'];
        }
      });
  
  }

  onSave(params) {
    this.service
      .postSubModulo(params)
      .subscribe(
        response => { },
        error => {
          this.pnotify.error(error.error);
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

  onShowFilter() {
    this.showAdvancedFilter = !this.showAdvancedFilter;
  }

  onReset() {
    this.form.reset();
  }
}
