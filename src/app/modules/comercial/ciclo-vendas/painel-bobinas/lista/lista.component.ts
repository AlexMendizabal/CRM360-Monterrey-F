import { MaterialPerdido } from './../../../materiais-perdidos/models/material-perdido';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { CardCounterConfig } from 'src/app/shared/templates/card-counter/models/config';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { IComercialPainelBobinas } from './../models/painel-bobinas';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
//angular
import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
  AbstractControl,
} from '@angular/forms';

//servicos
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ComercialPainelBobinasService } from '../painel-bobinas.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { ComercialCicloVendasCotacoesFormularioService } from '../../cotacoes/formulario/formulario.service';

// rxjs
import { finalize, take, switchMap } from 'rxjs/operators';
import { Subscription, EMPTY } from 'rxjs';

//materiais
import { Subtitles } from './../../../../../shared/modules/subtitles/subtitles';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { DateService } from 'src/app/shared/services/core/date.service';

import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { JsonResponse } from 'src/app/models/json-response';

@Component({
  selector: 'comercial-ciclo-vendas-painel-bobinas-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.scss'],
})
export class ComercialPainelBobinasListaComponent implements OnInit, OnDestroy {
  breadCrumbTree: Array<Breadcrumb>;
  modalRef: BsModalRef;
  idSubModulo: number;
  noResult = false;
  loading = false; //Loading FullPage
  loadingNavBar = false; //Loading do NAVBAR
  materiais: Array<any> = [];
  empresas: Array<any> = [];
  materiaisSelecionados = [];
  $activatedRouteSubscription: Subscription;
  qtMateriais = 0;
  form: FormGroup;

  cardCounterConfig: Partial<CardCounterConfig> = {
    showDecimals: false,
    format: 'number',
  };
  // Tipos de Situação dos Materials (Ativo/Inativo)
  tipos = [
    {
      cod: '1',
      nome: 'Ativos',
    },
    {
      cod: '0',
      nome: 'Inativos',
    },
  ];

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

  // CUSTOM TABLE
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  /* Pagination */
  itemsPerPage: number = 100;
  totalItems: number;
  currentPage: number = 1;
  /* Pagination */

  constructor(
    private route: Router,
    private pnotify: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private painelBobinasService: ComercialPainelBobinasService,
    private formBuilder: FormBuilder,
    private modalService: BsModalService,
    private titleService: TitleService,
    private confirmModalService: ConfirmModalService,
    private routerService: RouterService,
    private dateService: DateService,
    private formularioService: ComercialCicloVendasCotacoesFormularioService
  ) {}

  ngOnInit() {
    localStorage.removeItem('comercialPainelBobinasMateriais');
    this.getEmpresas();
    this.buildForm();
    this.setBreadCrumb();
    this.titleService.setTitle('Painel de Bobinas');
    this.onActivatedRoute();
  }

  ngOnDestroy() {
    this.$activatedRouteSubscription.unsubscribe();
  }

  getLocalStorage() {
    try {
      const materiais = localStorage.getItem('comercialPainelBobinasMateriais');
      this.materiaisSelecionados = JSON.parse(atob(materiais));
    } catch (error) {
      this.materiaisSelecionados = [];
      localStorage.removeItem('comercialPainelBobinasMateriais');
    }
  }

  onActivatedRoute() {
    this.$activatedRouteSubscription =
      this.activatedRoute.queryParams.subscribe((response) => {
        const _response = this.routerService.getBase64UrlParams(response);
        this.form.patchValue(_response);
      });
  }

  setPageRegistros(itemsPerPage) {
    this.itemsPerPage = itemsPerPage;
    this.onFilter();
  }

  buildForm() {
    this.form = this.formBuilder.group({
      lote: [null],
      empresa: [18, [Validators.required]],
      pagina: [1],
      registros: [this.itemsPerPage],
      categoriaProduto: [1],
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
        descricao: 'Ciclo de Vendas',
        routerLink: `/comercial/ciclo-vendas/${id}`,
      },
      {
        descricao: 'Painel de Bobinas',
      },
    ];
  }

  onFilter(params?) {
    localStorage.removeItem('comercialPainelBobinasMateriais');
    this.form.get('TIME').setValue(new Date().getTime());
    this.route.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(this.getParams()),
    });
    this.getListaBobinas(this.getParams());
    this.getLocalStorage();
  }

  checkMaterial(material: any): void {
    material.checked = material.checked == 0 ? 1 : 0;
    const materiais = this.materiais.filter(
      (material) => material['checked'] == 1
    );
    this.materiaisSelecionados = materiais;
    localStorage.removeItem('comercialPainelBobinasMateriais');
    localStorage.setItem(
      'comercialPainelBobinasMateriais',
      btoa(JSON.stringify(this.materiaisSelecionados))
    );
  }

  getTotalMateriais() {
    return this.materiaisSelecionados.length;
  }

  removeMaterial(material: any): void {
    this.materiaisSelecionados = this.materiaisSelecionados.filter(
      (value: any) => value.sequenciaLote != material.sequenciaLote
    );

    this.materiais.map((value: any) => {
      if (value.sequenciaLote == material.sequenciaLote) {
        material.checked = 0;
      }

      this.materiaisSelecionados = this.materiaisSelecionados.filter(
        (value: any) => value.checked == 1
      );

      localStorage.removeItem('comercialPainelBobinasMateriais');
      localStorage.setItem(
        'comercialPainelBobinasMateriais',
        btoa(JSON.stringify(this.materiaisSelecionados))
      );
    });
    if (this.materiaisSelecionados.length == 0) {
      localStorage.removeItem('comercialPainelBobinasMateriais');
    }
  }

  openModal(template: TemplateRef<any>) {
    this.materiaisSelecionados;
    this.modalRef = this.modalService.show(template, {
      animated: false,
      class: 'modal-xl',
      backdrop: 'static',
    });
  }

  hideModal() {
    this.modalRef.hide();
  }

  getListaBobinas(params) {
    this.loading = true;
    this.painelBobinasService
      .getListaBobinas(params)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.success === true) {
            const codMaterial = this.materiaisSelecionados.map(
              (material) => material.ID
            );
            this.materiais = response.data.map(function (el: any) {
              var o = Object.assign({}, el);
              o.checked = codMaterial.includes(o.ID) ? 1 : 0;
              return o;
            });
            this.materiais = this.materiais.filter(
              (value: any) => value.situacao == 'Disponível'
            );
            this.totalItems = this.materiais.length;
            this.noResult = false;
          }
          if (this.materiais.length == 0) {
            this.pnotify.notice('Nenhum registro encontrado!');
            this.materiais = [];
            this.noResult = true;
          }
        },
        error: (error) => {
          this.pnotify.error();
        }
      });
  }

  getEmpresas() {
    this.loading = true;
    this.formularioService
      .loadDependencies()
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe((response: Array<JsonResponse | any>) => {
        this.empresas = response[1].result || [];
      });
  }

  openRegister() {
    this.hideModal();
    this.route.navigate(['../novo'], {
      relativeTo: this.activatedRoute,
      queryParams: this.routerService.setBase64UrlParams(
        this.form.get('categoriaProduto').value.toString()
      ),
    });
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

  // Validação de formulário
  onFieldError(field: string): string {
    if (this.onFieldInvalid(field)) {
      return 'is-invalid';
    }

    return '';
  }

  onFieldInvalid(field: any): boolean {
    field = this.form.get(field);

    return field.status == 'INVALID' && field.touched;
  }

  onFieldRequired(
    abstractControl: AbstractControl,
    abstractControlField?: string
  ): string {
    if (abstractControl.validator) {
      const validator = abstractControl.validator({} as AbstractControl);
      if (validator && validator.required) {
        return 'is-required';
      }
    }

    if (abstractControlField) {
      for (const controlName in abstractControl['controls']) {
        if (abstractControl['controls'][controlName]) {
          if (
            this.onFieldRequired(abstractControl['controls'][controlName]) &&
            controlName == abstractControlField
          ) {
            return 'is-required';
          }
        }
      }
    }

    return '';
  }

  onPageChanged(event) {
    this.form.get('PAGI').setValue(event.page);
    this.onFilter();
  }
}
