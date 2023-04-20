//angular
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';

//rxjs
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';

//service
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AdminUsuariosService } from './../services/usuarios.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { RouterService } from 'src/app/shared/services/core/router.service';

//interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { IAdminPeril } from '../../perfis/models/perfil';
import { AdminPerfisService } from '../../perfis/services/perfis.service';
import { DateService } from 'src/app/shared/services/core/date.service';

@Component({
  selector: 'admin-usuarios-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class AdminUsuariosListaComponent implements OnInit {

  appTitle = "Lista de usuarios";

  form: FormGroup;

  loading = true;
  loadingNavBar = false;
  loadingSincronizarAd = false;
  
  noResult: boolean;

  usuarios: Array<any> = [];
  perfis: IAdminPeril[] = [];
  loadingPerfis = true;
  data = [];

  /* Pagination */
  itemsPerPage = 10;
  totalItems = 10;
  currentPage = 1;
  numberOfItems = [10, 25, 50, 100, 250, 500];
  /* Pagination */

  breadCrumbTree: Array<Breadcrumb> = [
    {
      descricao: 'Home',
      routerLink: '/admin/home'
    },
    {
      descricao: 'Lista de usuarios'
    }
  ];

  $activatedRouteSubscription: Subscription;

  constructor(
    private pnotify: PNotifyService,
    private service: AdminUsuariosService,
    private route: Router,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private atividadesService: AtividadesService,
    private routerService: RouterService,
    private perfilService: AdminPerfisService,
    private dateService: DateService
  ) {
  }

  ngOnInit() {

    this.buildForm();
    this.setBreadCrumb();
    this.onActivatedRoute();
    this.getPerfis({inPagina: 0, situacao: 1});
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
        this.getData(this.getParams());
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
      matricula: [null],
      perfilId: [null],
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

  onPageChanged(event) {
    this.form.get('pagina').setValue(event.page);
    this.form.get('t').setValue((new Date).getTime());
    this.route.navigate([], {
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
    this.form.reset();
    this.onFilter();
  }

  getData(params?){

    if (!this.loading) {
      this.loadingNavBar = true;
    }

    this.service
      .getUsuarios(params)
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
            this.pnotify.notice('No hubo devolución de tu consulta');
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

  getPerfis(params?) {

    this.loadingPerfis = true;

    this.perfilService
      .getPerfis(params)
      .pipe(
        finalize(() => {
          this.loadingPerfis = false;
        })
      )
      .subscribe(
        response => {

          if(response.status != 200){
            this.pnotify.error("Erro ao carregar perfis.");
            return
          }

          this.perfis = response.body['data'];
          
        },
        error => {
          this.pnotify.error("Erro ao carregar perfis.");
        }
      );
  }
}
