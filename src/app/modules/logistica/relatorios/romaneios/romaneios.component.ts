//angular
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

// ngx
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { ptBrLocale } from 'ngx-bootstrap/locale';

// services
import { LogisticaRelatoriosRomaneiosService } from './romaneios.service';
import { XlsxService } from './../../../../shared/services/core/xlsx.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';

// rxjs
import { delay, finalize, take, retry } from 'rxjs/operators';
import { forkJoin, Subscription } from 'rxjs';
import { DateService } from 'src/app/shared/services/core/date.service';

defineLocale('pt-br', ptBrLocale);

@Component({
  selector: 'logistica-relatorios-romaneios',
  templateUrl: './romaneios.component.html',
  styleUrls: ['./romaneios.component.scss']
})
export class LogisticaRelatoriosRomaneiosComponent implements OnInit {

  empresas: any = [];
  romaneiosSinteticos = [];
  permission = false;
  dataLoaded = false;
  loading = false;
  loaderFullScreen = true;

  $subscription: Subscription;

  form: FormGroup;

  bsConfig: Partial<BsDatepickerConfig>;

  breadCrumbTree = [];

  constructor(
    private localeService: BsLocaleService,
    private romaneiosService: LogisticaRelatoriosRomaneiosService,
    private xlsx: XlsxService,
    private formBuilder: FormBuilder,
    private pnotify: PNotifyService,
    private atividadesService: AtividadesService,
    private activatedRoute: ActivatedRoute,
    private dateService: DateService
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );

    this.form = this.formBuilder.group({
      projeto: [null, Validators.required],
      dataInicial: [null, Validators.required],
      dataFinal: [null, Validators.required],
      statusFicha: [null]
    });
  }

  ngOnInit() {
    this.atividadesService
      .registrarAcesso()
      .subscribe();
    this.romaneiosService
      .getEmpresas(this.getMatricula())
      .pipe(
        finalize(() => {
          this.permission = this.empresas.length == 0 ? false : true;
          this.dataLoaded = true;
          this.loaderFullScreen = false;
        })
      )
      .subscribe(
        data => {
          this.empresas = [];

          if (data["status"] == 200) {
            this.empresas = data["body"];
          }
        },
        error => {
          this.permission = this.empresas.length == 0 ? false : true;
          this.dataLoaded = true;
        }
      );
    this.setBreadCrumb();
  }

  setBreadCrumb() {
    this.activatedRoute.params.subscribe(
      (response) => {
        this.breadCrumbTree = [
          {
            descricao: 'Logistica'
          },
          {
            descricao: 'Informes',
            routerLink: `/logistica/relatorios/${response["idSubModulo"]}`
          },
          {
            descricao: 'La lista'
          }
        ];
      }
    ).unsubscribe();
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

  onFieldInvalid(field: any) {
    field = this.form.get(field);

    return field.status == 'INVALID' && field.touched;
  }

  onGetRomaneiosSinteticos() {

    this.loading = true;

    let _req = [];
    let _projetos = this.form.get("projeto").value;
    let _dadosParaExportacao: Array<any> = []

    _projetos.forEach(projeto => {

      let dataInicial = this.form.get("dataInicial").value;
      let dataFinal = this.form.get("dataFinal").value;

      dataInicial = this.dateService.convert2PhpDate(dataInicial);
      dataFinal = this.dateService.convert2PhpDate(dataFinal);

      const params = {
        dataInicial: dataInicial,
        dataFinal: dataFinal,
        projeto: projeto,
        modalidade: "",
        pagina: "1",
        qtPagina: "1000000"
      }

      _req.push(
        this.romaneiosService
          .getRomaneiosSinteticos(params)
        )
    });

    forkJoin(_req)
      .pipe(
        delay(1000),
        retry(1),
        finalize(() => {
          this.loading = false;
          this.xlsx.export({data: _dadosParaExportacao});
        }))
      .subscribe(
        data => {
          data.forEach(element => {

            if (element["status"] === 200) {
              _dadosParaExportacao = _dadosParaExportacao.concat(element["body"]);
            }
          })
        },
        error => {
          this.pnotify.error();
        }
      )
  }

  onGetRomaneiosAnaliticos() {
    this.loading = true;
    let _req = [];
    let _projetos = this.form.get("projeto").value;
    let _dadosParaExportacao: Array<any> = []

    _projetos.forEach(projeto => {

      let dataInicial = this.form.get("dataInicial").value;
      let dataFinal = this.form.get("dataFinal").value;

      dataInicial = this.dateService.convert2PhpDate(dataInicial);
      dataFinal = this.dateService.convert2PhpDate(dataFinal);

      const params = {
        dataInicial: dataInicial,
        dataFinal: dataFinal,
        projeto: projeto,
        modalidade: "",
        pagina: "1",
        qtPagina: "1000000"
      }
      _req.push(this.romaneiosService
        .getRomaneiosAnaliticos(params))
    });

    forkJoin(_req)
      .pipe(
        delay(1000),
        retry(1),
        finalize(() => {
          this.loading = false;
          this.xlsx.export({data: _dadosParaExportacao});
        }))
      .subscribe(
        data => {
          data.forEach(element => {

            if (element["status"] === 200) {
              _dadosParaExportacao = _dadosParaExportacao.concat(element["body"]);
            }
          })
        },
        error => {
          this.pnotify.error();
        }
      )
  }

  onGetCtesComplementares(){

    this.loading = true;

    const params = this.getParams();

    this.romaneiosService
      .getCtesComplementares(params)
      .pipe(
        finalize(() => {
          this.loading = false
        }))
      .subscribe(
        response => {
          if(response.status !== 200){
            this.pnotify.notice('No se encontró información.')
            return
          }
          this.xlsx.export({data: response.body['data'], filename: 'relatorio__cte_complementar'});
        },
        error => {
          this.pnotify.error();
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

  getMatricula() {
    return (JSON.parse(localStorage.getItem("currentUser")))["info"]["matricula"];
  }

  selectAll() {
    const selected = this.empresas.map(item => item.dsEmpresa);
    this.form.get("projeto").patchValue(selected);
  }

  clearAll() {
    this.form.get("projeto").patchValue([]);
  }

}
