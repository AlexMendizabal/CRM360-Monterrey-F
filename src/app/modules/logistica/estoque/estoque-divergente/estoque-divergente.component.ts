import { element } from 'protractor';
import { map, finalize } from 'rxjs/operators';
import { LogisticaEstoqueEstoqueDivergenteService } from './estoque-divergente.service';
import { PNotifyService } from '../../../../shared/services/core/pnotify.service';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { DateService } from 'src/app/shared/services/core/date.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';

@Component({
  selector: 'logistica-estoque-estoque-divergente',
  templateUrl: './estoque-divergente.component.html',
  styleUrls: ['./estoque-divergente.component.scss']
})
export class LogisticaEstoqueEstoqueDivergenteComponent implements OnInit {
  spinnerFullScreen: boolean = true;
  loaderNavbar: boolean = false;
  data: Date = new Date();
  form: FormGroup;
  bsConfig: Partial<BsDatepickerConfig>;
  empresas: any = [];
  depositos: any = [];
  linhas: any = [];
  classes: any = [];
  materiais: any = [];
  breadCrumbTree: any = [
    {
      descricao: 'Home',
      routerLink: '/logistica/home'
    },
    {
      descricao: 'Filtros'
    }
  ];

  placeholderDepositos = 'Selecione um deposito';
  placeholderClasses = 'Selecione uma classe';
  placeholderMateriais = 'Selecione um material';

  constructor(
    private formBuilder: FormBuilder,
    private notice: PNotifyService,
    private localeService: BsLocaleService,
    private empresasService: LogisticaEstoqueEstoqueDivergenteService,
    private route: Router,
    private dateService: DateService,
    private atividadesService: AtividadesService
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      dataInicio: [null, Validators.required],
      empresas: [null, Validators.required],
      depositos: [],
      linhas: [],
      classes: [],
      materiais: [null]
    });
    this.form.get('dataInicio').setValue(this.data);

    this.atividadesService.registrarAcesso().subscribe();

    /* INICIO FILTROS INICIAIS */
    this.empresasService
      .getEmpresas()
      .pipe(
        finalize(() => {
          this.spinnerFullScreen = false;
        })
      )
      .subscribe((response: any) => {
        if (Object.keys(response).length > 0) {
          this.empresas = response;
        }
      });

    this.empresasService.getLinhas().subscribe((response: any) => {
      if (Object.keys(response).length > 0) {
        this.linhas = response;
      }
    });
    /* FIM FILTROS INICIAIS */
  }

  /* INICIO FUNÇÕES FILTROS COM PARÂMETROS */

  getDepositos() {
    this.placeholderDepositos = 'Carregando...';
    this.loaderNavbar = true;

    if (this.form.get('empresas').status === 'VALID') {
      let idEmpresa = this.form.get('empresas').value;
      this.empresasService
        .getDepositos(idEmpresa)
        .pipe(
          finalize(() => {
            this.loaderNavbar = false;
            this.placeholderDepositos = 'Selecione um deposito';
          })
        )
        .subscribe((response: any) => {
          if (Object.keys(response).length > 0) {
            this.depositos = response;
          }
        });
    }
  }

  getClasses() {
    this.placeholderClasses = 'Carregando...';
    this.loaderNavbar = true;
    let descricaoLinhas = [];

    if (this.form.get('linhas').status === 'VALID') {
      descricaoLinhas.push(this.form.get('linhas').value);
      this.empresasService
        .getClasses(descricaoLinhas)
        .pipe(
          finalize(() => {
            this.loaderNavbar = false;
            this.placeholderClasses = 'Selecione uma classe';
          })
        )
        .subscribe((response: any) => {
          if (Object.keys(response).length > 0) {
            this.classes = response;
          }
          this.loaderNavbar = false;
        });
    }
  }

  getMateriais() {
    let params = {};

    this.placeholderMateriais = 'Carregando...';
    this.materiais = [];
    this.loaderNavbar = true;

    if (this.form.get('classes').value) {
      params['classes'] = btoa(this.form.get('classes').value);
    }

    if (this.form.get('linhas').value) {
      params['linhas'] = btoa(this.form.get('linhas').value);
    }

    this.empresasService
      .getMateriais(params)
      .pipe(
        finalize(() => {
          this.loaderNavbar = false;
          this.placeholderMateriais = 'Selecione um material';
        })
      )
      .subscribe((response: any) => {
        if (Object.keys(response).length > 0) {
          this.materiais = response.result;
        }
      });
  }
  /* FIM FUNÇÕES FILTROS COM PARÂMETROS */

  /* INICIO CONSULTA ESTOQUE DIVERGENTE */
  getLista() {
    if (this.form.status === 'VALID') {
      this.route.navigate(['logistica/estoque/estoque-divergente/lista'], {
        queryParams: {
          empresas: this.form.get('empresas').value,
          depositos: this.form.get('depositos').value,
          linhas: this.form.get('linhas').value,
          classes: this.form.get('classes').value,
          materiais: this.form.get('materiais').value,
          dataInicio: this.form.get('dataInicio').value
        }
      });
    }
  }
  /* INICIO CONSULTA ESTOQUE DIVERGENTE */

  /* CONTROLE VALIDAÇÕES DOS CAMPOS */
  resetForm() {
    this.form.get('depositos').reset();
    this.form.get('linhas').reset();
    this.form.get('classes').reset();
    this.form.get('materiais').reset();
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
}
