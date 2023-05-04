import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  FormControl,
} from '@angular/forms';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

import { finalize } from 'rxjs/operators';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
import { ControladoriaTiposFluxoCaixaService } from '../../services/tipos-fluxo-caixa.service';
import { ControladoriaFluxoCaixaService } from '../../services/fluxo-caixa.service';

@Component({
  selector: 'lista-tipos-fluxo-caixa',
  templateUrl: './tipos-fluxo-caixa.component.html',
  styleUrls: ['./tipos-fluxo-caixa.component.scss']
})
export class ControladoriaTiposFluxoCaixaComponent implements OnInit {
  appTitle = 'Tipos de Lançamentos';
  breadCrumbTree: any = [];
  spinnerFullScreen: boolean = false;
  loaderNavbar: boolean = false;
  tipos = [];
  tiposLancamentos = [];
  form: FormGroup;
  noResult = false;
  dadosEmpty = false;

  /* Paginação */
  itemsPerPage: number = 10;
  totalItems: number;
  currentPage: number = 1;
  begin: number = 0;
  end: number = 10;

  /* Config Table */
  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true,
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private tiposFluxoCaixaService: ControladoriaTiposFluxoCaixaService,
    private fluxoCaixaService: ControladoriaFluxoCaixaService,
    private formBuilder: FormBuilder,
    private route: Router,
    private routerService: RouterService,
    private notice: PNotifyService,
    private dateService: DateService
  ) {
    this.form = this.formBuilder.group({
      COD_TIPO: [null],
      DESC_TIPO: [null],
      COD_TIPO_LANCAMENTO: [null],
      DESC_TIPO_LANCAMENTO: [null],
      time: [new Date().getTime()],
    });
  }

  ngOnInit(): void {
    this.setBreadCrumb();
    this.getTipos();
    this.getTiposFluxoCaixa(this.getParams());
  }

  setBreadCrumb() {
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: '/controladoria/home',
      },
      {
        descricao: 'Lançamento fluxo de caixa',
        routerLink: '/controladoria/fluxo-caixa',
      },
      {
        descricao: this.appTitle,
      },
    ];
  }

  onFieldError(field: string) {
    if (this.onFieldInvalid(field)) {
      return 'is-invalid';
    }
    return '';
  }

  onFieldInvalid(field: any) {
    field = this.form.get(field);
    return field.status == 'INVALID' && field.touched;
  }

  onFieldRequired(field: string) {
    let required = false;
    let formControl = new FormControl();

    if (this.form.controls[field].validator) {
      let validationResult = this.form.controls[field].validator(formControl);
      required =
        validationResult !== null && validationResult.required === true;
    }

    if (required) {
      return 'is-required';
    }
  }

  /* Paginação */
  onPageChanged(event: PageChangedEvent): void {
    this.begin = (event.page - 1) * event.itemsPerPage;
    this.end = event.page * event.itemsPerPage;
  }
  /* Paginação */

  getTipos() {
    this.fluxoCaixaService.getTipos().subscribe((response) => {
      this.tipos = response['data'];
    });
  }

  getTiposFluxoCaixa(param) {
    this.spinnerFullScreen = true;
    this.tiposFluxoCaixaService
      .getTiposFluxoCaixa(param)
      .pipe(
        finalize(() => {
          this.spinnerFullScreen = false;
          this.noResult = true;
        })
      )
      .subscribe((response) => {
        if (response.status === 204) {
          this.notice.notice('Não existe tipos de lançamentos cadastrados.');
          this.tiposLancamentos = [];
        } else {
          this.tiposLancamentos = response.body['data'];
          this.totalItems = response.body['data'].length;
        }
      });
  }

  onFilter() {
    this.getTiposFluxoCaixa(this.getParams());
  }

  getParams() {
    let _params = {};
    let _obj = this.form.value;

    for (let prop in _obj) {
      if (_obj[prop]) {
        if (_obj[prop] instanceof Date)
          _params[prop] = this.dateService
            .convertToBrazilianDate(_obj[prop])
            .substring(0, 10);
        else _params[prop] = _obj[prop];
      }
    }

    return _params;
  }
}
