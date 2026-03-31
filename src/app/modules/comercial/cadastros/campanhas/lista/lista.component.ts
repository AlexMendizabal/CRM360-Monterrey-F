import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Subscription, EMPTY, Observable } from 'rxjs';
import { take, switchMap, finalize } from 'rxjs/operators';

// ngx-bootstrap
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

// Services
import {ComercialCadastrosCampanhasService } from '../campanhas.service'
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { DetailPanelService } from 'src/app/shared/templates/detail-panel/detal-panel.service';

// Interfaces
import { JsonResponse } from 'src/app/models/json-response';
import { ICampanhas } from '../models/campanhas';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

@Component({
  selector: 'comercial-cadastros-campanhas-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss']
})
export class ComercialCadastrosCampanhasListaComponent implements OnInit {
  loaderFullScreen = false;
  loaderNavbar: boolean;
  breadCrumbTree: Array<Breadcrumb> = [];

  subtitles: Array<Subtitles> = [
    {
      id: 1,
      text: 'Ativo',
      color: 'green',
    },
    {
      id: 2,
      text: 'Inativo',
      color: 'red',
    },
  ];

  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  tableConfigMateriais: Partial<CustomTableConfig> = {
    hover: false,
  };

  activatedRouteSubscription: Subscription;
  showDetailPanelSubscription: Subscription;
  showDetailPanel = false;
  detailPanelTitle: string;

  form: FormGroup;
  orderBy = 'id';
  orderType = 'ASC';

  maxSize = 10;
  itemsPerPage = 300;
  currentPage = 1;
  totalItems = 0;

  dados: Array<ICampanhas> = [];
  dadosLoaded = false;
  dadosEmpty = false;

  campanhasSelecionada: ICampanhas;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private campanhasService: ComercialCadastrosCampanhasService,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private titleService: TitleService,
    private confirmModalService: ConfirmModalService,
    private detailPanelService: DetailPanelService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.setFormFilter();
    this.titleService.setTitle('Campañas');

   /*  setTimeout(() => {
      this.loaderFullScreen = true;
    }, 1000); */

  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }
  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/comercial/home'
        },
        {
          descricao: 'Cadastros',
          routerLink: `/comercial/cadastros/${params.idSubModulo}`
        },
        {
          descricao: 'Campanhas'
        }
      ];
    });
  }

  setFormFilter(): void {
    const formValue: any = this.checkRouterParams();

    this.form = this.formBuilder.group({
      codigo: [formValue.codigo],
      nome: [formValue.nome],
      orderBy: [formValue.orderBy],
      pagina: [formValue.pagina],
      registros: [formValue.registros, Validators.required]
    });

    this.checkOrder();
  }

  checkOrder(): void {
    if (this.form.value.orderBy !== this.orderBy) {
      this.orderBy = this.form.value.orderBy;
    }

    if (this.form.value.orderType !== this.orderType) {
      this.orderType = this.form.value.orderType;
    }
  }

  checkRouterParams(): Object {
    let formValue = {
      codigo: null,
      nome: null,
      codSituacao: '',
      orderBy: this.orderBy,
      orderType: this.orderType,
      pagina: 1,
      registros: this.itemsPerPage,
    };

    this.activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (queryParams: any) => {
        if (Object.keys(queryParams).length > 0) {
          let params = atob(queryParams['q']);
          params = JSON.parse(params);
          /* this.setSubmittedSearch();
          this.search(params); */

          Object.keys(formValue).forEach(formKey => {
            Object.keys(params).forEach(paramKey => {
              if (
                formKey == paramKey &&
                formValue[formKey] != params[paramKey]
              ) {
                if (!isNaN(Number(params[paramKey]))) {
                  formValue[formKey] = Number(params[paramKey]);
                } else {
                  formValue[formKey] = params[paramKey];
                }
              }
            });
          });
        }
      }
    );
    this.activatedRouteSubscription.unsubscribe();

    return formValue;
  }

/*   setSubmittedSearch(): void {
    this.searchSubmitted = true;
  }

  search(params: any): void {

  } */
}

