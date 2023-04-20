//angular
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';

//rxjs
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';

//services
import { AdminAtividadesService } from '../services/atividades.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AdminModulosService } from '../../modulos/services/modulos.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { AdminSubModulosService } from '../../submodulos/services/submodulos.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';

//interfaces
import { IAdimAtividade } from '../models/atividade';
import { IAdminSubModulo } from '../../submodulos/models/submodulo';
import { IAdminModulo } from '../../modulos/models/modulo';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { DateService } from 'src/app/shared/services/core/date.service';

@Component({
  selector: 'admin-atividades-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class AdminAtividadesListaComponent implements OnInit {
  
  appTitle = "Lista de atividades";

  data: IAdimAtividade[];
  
  form: FormGroup;
  loading = true;
  loadingNavBar = false;
  noResult: boolean;
  loadingModulo = false;
  loadingSubmodulo = false;
  loadingTipoAtividade = false;

  modulos: Array<IAdminModulo> = [];
  submodulos: Array<IAdminSubModulo> = [];
  tipoAtividade: Array<any> = [];

  idSubModulo: number;

  breadCrumbTree: Array<Breadcrumb> = [
    {
      descricao: 'Home',
      routerLink: '/admin/home'
    },
    {
      descricao: 'Lista de atividades'
    }
  ];

  situacao = [
    {
      id: 1,
      nome: 'Ativo'
    },
    {
      id: 0,
      nome: 'Inativo'
    }
  ];

  /* Pagination */
  itemsPerPage = 100;
  totalItems = 10;
  currentPage = 1;
  /* Pagination */

  $subscription: Subscription;
  $activatedRouteSubscription: Subscription;

  constructor(
    private service: AdminAtividadesService,
    private moduloService: AdminModulosService,
    private submoduloService: AdminSubModulosService,
    private pnotify: PNotifyService,
    private route: Router,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private routerService: RouterService,
    private dateService: DateService
  ) {
  }

  ngOnInit() {
    
    this.buildForm();
    this.setBreadCrumb();
    this.onActivatedRoute();
    this.getTipoAtividade();
    this.getModulos();
    this.getSubmodulos();

    /* this.atividadesService
      .registrarAcesso()
      .subscribe() */
  }

  ngOnDestroy() {
    this.$activatedRouteSubscription?.unsubscribe();
  }

  onActivatedRoute() {
    this.$activatedRouteSubscription = this.activatedRoute
      .queryParams
      .subscribe(
        (response) => {
          const _response = this.routerService.getBase64UrlParams(response);
          
          if(_response?.registrosPorPagina){
            this.itemsPerPage = _response?.registrosPorPagina;
          }

          this.form.patchValue(_response);
          this.getAtividades(this.getParams());
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
      nome: [null],
      moduloId: [null],
      submoduloId: [null],
      tipoAtividadeId: [null],
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

  getAtividades(params?) {

    if (!this.loading) {
      this.loadingNavBar = true;
    }

    this.service
      .getAtividades(params)
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

  getTipoAtividade() {
    
    this.loadingTipoAtividade = false;

    this.service
      .getTipoAtividade()
      .pipe(
        finalize(() => {
          this.loadingTipoAtividade = false;
        })
      )
      .subscribe(
        response => {
        if (response.status === 200) {
          this.tipoAtividade = response.body['data'];
        }
    });
  }

  getModulos(params?) {
    
    this.loadingModulo = true;
    
    this.moduloService
      .getModulos(params)
      .pipe(
        finalize(() => {
          this.loadingModulo = false
        })
      )
      .subscribe(response => {
        if (response.status === 200) {
          this.modulos = response.body['data'];
        }
      });
  }

  getSubmodulos(params?) {
    
    this.loadingSubmodulo = true;
    
    this.submoduloService
      .getSubModulos(params)
      .pipe(
        finalize(() => {
          this.loadingSubmodulo = false
        })
      )
      .subscribe(response => {
        if (response.status === 200) {
          this.submodulos = response.body['data'];
        }
      });
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
        if (Number.isInteger(_obj[prop]))
          _params[prop] = parseInt(_obj[prop])
        if (_obj[prop] instanceof Date)
          _params[prop] = this.dateService.convertToUrlDate(_obj[prop]);
        else _params[prop] = _obj[prop];
      }
    }

    return _params;
  }

  onReset() {
    this.form.reset();
  }
}
