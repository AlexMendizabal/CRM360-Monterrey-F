//angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';

//servicos
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { ConfirmModalService } from './../../../../../shared/modules/confirm-modal/confirm-modal.service';

// rxjs
import { finalize } from 'rxjs/operators';
import { Subscription, EMPTY } from 'rxjs';
import { take, switchMap } from 'rxjs/operators';

//modelos
import { Subtitles } from './../../../../../shared/modules/subtitles/subtitles';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { ILogisticaVeiculo } from './../models/veiculo';
import { DateService } from 'src/app/shared/services/core/date.service';
import { LogisticaVeiculoService } from '../services/veiculo.service';

@Component({
  selector: 'logistica-veiculos-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class LogisticaVeiculosListaComponent implements OnInit, OnDestroy {
  breadCrumbTree: Array<Breadcrumb>;

  idSubModulo: number;
  veiculos: Array<ILogisticaVeiculo>;
  noResult: boolean;
  loading = true; //Loading FullPage
  loadingNavBar = false; //Loading do NAVBAR

  $activatedRouteSubscription: Subscription;

  form: FormGroup;

  // Tipos de Situação dos Veiculos (Ativo/Inativo)
  tipos = [
    {
      cod: '1',
      nome: 'Activos',
    },
    {
      cod: '0',
      nome: 'Inactivos',
    },
  ];

  subtitles: Array<Subtitles> = [
    {
      id: 1,
      text: 'Activo',
      color: 'green',
    },
    {
      id: 2,
      text: 'Inactivo',
      color: 'red',
    },
  ];

  /* Pagination */
  itemsPerPage = 100;
  totalItems = 0;
  currentPage = 1;
  /* Pagination */

  constructor(
    private route: Router,
    private pnotify: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private veiculoService: LogisticaVeiculoService,
    private formBuilder: FormBuilder,
    private confirmModalService: ConfirmModalService,
    private routerService: RouterService,
    private dateService: DateService
  ) {}

  ngOnInit() {
    this.buildForm();
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
        this.getVeiculos(this.getParams());
      }
    );
  }

  buildForm() {
    this.form = this.formBuilder.group({
      ID_LOGI_VEIC: [null],
      PLAC: [null],
      DS_VEIC: [null],
      IN_STAT: [null],
      PAGI: [1],
      TT_REGI_PAGI: [this.itemsPerPage],
      TIME: [new Date().getTime()],
    });
  }

  setBreadCrumb() {
    const id = this.activatedRoute.snapshot.params.idSubModulo;
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: `/logistica/home`,
      },
      {
        descricao: 'Prontuários',
        routerLink: `/logistica/cadastros/${id}`,
      },
      {
        descricao: 'Vehículos',
      },
    ];
  }

  setPageRegistros(itemsPerPage) {
    this.itemsPerPage = itemsPerPage;
    this.onFilter();
  }

  onFilter() {
    this.form.get('TIME').setValue(new Date().getTime());
    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
    });
  }

  onReset() {
    this.form.reset();
    this.form.patchValue({
      PAGI: 1,
      TT_REGI_PAGI: 100,
      TIME: [new Date().getTime()],
    });
  }

  getVeiculos(params?) {
    if (!this.loading) this.loadingNavBar = true;

    this.veiculoService
      .getVeiculos(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.veiculos = response.body['data'];
            this.totalItems = response.body['total'];
            this.noResult = false;
          } else {
            this.noResult = true;
            this.veiculos = [];
          }
        },
        (error) => {
          this.pnotify.error();
          this.noResult = true;
        }
      );
  }

  changeType(veiculo: ILogisticaVeiculo) {
    const stat = veiculo.IN_STAT == '1' ? '0' : '1';

    this.confirmChange(stat)
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) => {
          if (!result) return EMPTY;

          this.loadingNavBar = true;
          veiculo.IN_STAT = stat;
          return this.veiculoService.postVeiculo(veiculo);
        }),
        finalize(() => {
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (success: any) => {
          this.pnotify.success();
          //tipoContrato.IN_STAT = stat;
        },
        (error: any) => {
          veiculo.IN_STAT = veiculo.IN_STAT == '1' ? '0' : '1';
          this.pnotify.error();
        }
      );
  }

  confirmChange(stat): any {
    if (stat == '1')
      return this.confirmModalService.showConfirm(
        null,
        null,
        'Desea continuar?',
        'Cancelar',
        'Confirmar'
      );

    return this.confirmModalService.showConfirm(
      'inactivate',
      'Confirmar in inactivación',
      'Desea continuar?',
      'Cancelar',
      'Confirmar'
    );
  }

  openRegister(veiculo: ILogisticaVeiculo) {
    this.route.navigate(['../cadastro'], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(veiculo),
    });
  }

  onPageChanged(event) {
    this.form.get('PAGI').setValue(event.page);
    this.onFilter();
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
