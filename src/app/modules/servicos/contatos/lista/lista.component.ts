import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { finalize } from 'rxjs/operators';
import { ContatoService } from '../services/contato.service';
import { IContato } from '../models/contato';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { Subscription } from 'rxjs';
import { DetailPanelService } from 'src/app/shared/templates/detail-panel/detal-panel.service';

@Component({
  selector: 'servicos-contatos-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class ServicosContatosListaComponent implements OnInit, OnDestroy {

  appTitle = "Contatos";

  breadCrumbTree: any = [
    {
      descricao: 'Home',
      routerLink: '/servicos/home'
    },
    {
      descricao: this.appTitle
    }
  ];


  form: FormGroup;

  loading = true;
  loadingNavBar = false;
  noResult = true;

  currentPage: number = 1;
  totalItems = 10;
  itemsPerPage = 50;

  contatos: IContato[] = [];
  contato: IContato;

  $activatedRouteSubscription: Subscription;
  $detailPanelSubscription: Subscription;

  showDetailPanel: boolean;
  detailPanelTitle = "Detalhes";

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private contatosService: ContatoService,
    private pnotify: PNotifyService,
    private dateService: DateService,
    private route: Router,
    private routerService: RouterService,
    private atividadesService: AtividadesService,
    private detailPanelService: DetailPanelService
  ) {
  }

  ngOnInit() {
    this.registraAcesso();
    this.buildForm();
    this.onActivateRoute();
    this.onDetailPanelEmitter();
  }

  ngOnDestroy(): void {
    this.$activatedRouteSubscription.unsubscribe();
    this.$detailPanelSubscription.unsubscribe();
  }

  registraAcesso() {
    this.atividadesService.registrarAcesso().subscribe();
  }

  buildForm() {
    this.form = this.formBuilder.group({
      ID: [null],
      NR_MATR: [null],
      NM_USUA: [null],
      TELE: [null],
      MAIL: [null],
      CARG: [null],
      TT_REGI_PAGI: [50],
      PAGI: [1],
      TIME: [(new Date()).getTime()]
    })
  }

  onActivateRoute() {
    this.$activatedRouteSubscription = this.activatedRoute.queryParams
      .subscribe(
        (response) => {

          let _response = this.routerService.getBase64UrlParams(response);

          if (Object.keys(_response).length > 0) {
            this.form.patchValue(_response);
            this.getContatos(this.getParams());
          } else {
            this.getContatos();
          }
        }
      )
  }

  getContatos(params?) {

    if (!this.loading)
      this.loadingNavBar = true;

    this.contatosService
      .get(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        response => {
          if (response.status === 200) {
            this.contatos = response.body["data"];
            this.totalItems = response.body["total"];
            this.noResult = false;
          } else {
            this.pnotify.error();
            this.noResult = true;
          }
        },
        error => {
          this.pnotify.error();
          this.noResult = true;
        }
      )
  }

  getParams() {

    let _params = {};
    let _obj = this.form.value;

    for (let prop in _obj) {
      if (_obj[prop]) {
        if (_obj[prop] instanceof Date)
          _params[prop] = this.dateService.convertToUrlDate(_obj[prop])
        else
          _params[prop] = _obj[prop]
      }
    }

    return _params;

  }

  onSearch() {
    this.form.get("TIME").setValue((new Date()).getTime());
    this.itemsPerPage = this.form.get('TT_REGI_PAGI').value;
    this.showDetailPanel = false;
    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams())
    })
  }

  onPageChanged(event) {
    this.form.get('PAGI').setValue(event.page);
    this.onSearch();
  }

  //DetailPanel

  onDetailPanelEmitter(): void {
    this.$detailPanelSubscription = this.detailPanelService.config.subscribe(
      (event: any) => {
        this.showDetailPanel = event.showing;
        //if (!event.showing) this.romaneios.map((element) => element.selected = false);
      }
    );
  }

  onViewDetails(contato: IContato) {
    this.detailPanelService.show();
    this.detailPanelService.loadedFinished(false);
    this.contato = contato;
    this.detailPanelTitle = contato.NM_USUA
  }

  onReset() {
    this.form.reset();
    this.form.get('TT_REGI_PAGI').setValue(50);
    this.onSearch();
  }

}
