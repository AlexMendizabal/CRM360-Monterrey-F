
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { finalize } from 'rxjs/operators';

import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { RouterService } from 'src/app/shared/services/core/router.service';

import { AbastecimentoCadastroMediaVendasService } from '../media-vendas.service';

@Component({
  selector: 'abastecimento-cadastros-edita',
  templateUrl: './edita.component.html',
  styleUrls: ['./edita.component.scss']
})
export class AbastecimentoCadastrosMediaVendasEditaComponent implements OnInit {
  loading: boolean = false;
  loaderNavBar: boolean = true;
  compararData: boolean = false;

  bsConfig: Partial<BsDatepickerConfig>;

  form: FormGroup;
  
  linhas: any = [];
  classes: any = [];
  linha: string;

  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  idUsuario: any = this.currentUser['info']['id'];

  breadCrumbTree: any;

  constructor(
    private formBuilder: FormBuilder,
    private pnotify: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private routerService: RouterService,
    private service: AbastecimentoCadastroMediaVendasService,
    private localeService: BsLocaleService,
  ) {

    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );

    this.form = this.formBuilder.group({
      linha: [null],
      classe: [null],
      dataInicial: [null, [Validators.required]],
      dataFinal: [null, [Validators.required]]
    });

  }

  ngOnInit(): void {
    this.onBreadCumbTree();
    this.setValuesForm();
    this.disableForms();
  }

  setValuesForm(): void {
    let parametros = this.routerService.getBase64UrlParams(this.activatedRoute.snapshot.queryParams);
    const classeId: number = parseInt(parametros["CodigoClasse"]);
    const linha = parametros["Linha"];
    let periodoInicial = parametros["PeriodoInicial"];
    let periodoFinal = parametros["PeriodoFinal"];

    if (periodoInicial != undefined) {
      periodoInicial = this.formatDate(periodoInicial);
    }
    if (periodoFinal != undefined) {
      periodoFinal = this.formatDate(periodoFinal);
    }
    this.getLinhas();
    this.getClasses(linha);

    this.form.get("linha").setValue(linha);
    this.form.get("classe").setValue(classeId);
    this.form.get("dataInicial").setValue(periodoInicial);
    this.form.get("dataFinal").setValue(periodoFinal);
  }

  disableForms(): void {
    this.form.get('linha').disable();
    this.form.get('classe').disable();
  }

  onBreadCumbTree(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/abastecimento/home'
        },
        {
          descricao: 'Cadastros',
          routerLink: `/abastecimento/cadastros/${params['idSubModulo']}`
        },
        {
          descricao: 'Média de vendas',
          routerLink: `/abastecimento/cadastros/${params['idSubModulo']}/media-vendas/lista`
        },
        {
          descricao: 'Cadastro'
        }
      ];

    })
  }

  onEdit(): void {
    this.loaderNavBar = true;
    let linhas = [
      this.form.get("linha").value
    ];
    let classes = [
      this.form.get("classe").value
    ];

    this.service
      .putMediaVendas({
        idUsuario: this.idUsuario,
        linha: linhas.toString(),
        classes: classes,
        periodoInicial: this.form.get("dataInicial").value,
        periodoFinal: this.form.get("dataFinal").value
      })
      .pipe(
        finalize(() => this.loaderNavBar = false)
      )
      .subscribe(
        (res: any) => {
          if (res.status === 200) {
            this.pnotify.success(res['body']);
          } else if (res.status === 204) {
            this.pnotify.notice(res['body']);
          } else {
            this.pnotify.error("Ocorreu um erro durante a consulta");
          }
        },
        error => {
          this.pnotify.error(error["error"]);
        }
      )
  }

  getLinhas(): void {
    this.service
      .getLinhas()
      .pipe(
        finalize(() => (this.loading = false, this.loaderNavBar = false))
      )
      .subscribe(res => {
        if (Object.keys(res).length > 0) {
          this.linhas = res["body"];
        }
      },
        error => {
          this.pnotify.error("Erro ao carregar Linhas")
        });
  }

  getClasses(linha: string): void {
    this.classes = [];
    this.loaderNavBar = true;

    let descricaoLinhas = this.form.get('linha').value;

    if (descricaoLinhas) {
      this.form.get('classe').reset();
    }

    this.service
      .getClasses(descricaoLinhas || linha)
      .pipe(
        finalize(() => this.loaderNavBar = false)
      )
      .subscribe(res => {
        if (Object.keys(res).length > 0) {
          this.classes = res["body"];
        }
      },
        error => {
          this.pnotify.error("Erro ao carregar Classes")
        }
      )
  }

  onFieldError(field: string): string {
    if (this.onFieldInvalid(field)) {
      return 'is-invalid';
    }
    return '';
  }

  onFieldInvalid(field: any): any {
    field = this.form.get(field);
    return field.status == 'INVALID' && field.touched;
  }

  onFieldRequired(field: string): any {
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

  formatDate(data: any): any {
    return (data.substr(0, 10).split('-').reverse().join('-'));
  }
  
  comparaData(): boolean {
    let stra = this.form.get('dataInicial').value;
    let strb = this.form.get('dataFinal').value;
    let dataInicial = {};
    let dataFinal = {};

    if (stra instanceof Date) {
      dataInicial = stra;
    } else if(stra !== null) {
      dataInicial = new Date(stra.split('-').reverse().join('-'));
    }

    if (strb instanceof Date) {
      dataFinal = strb;
    } else if(strb !== null) {
      dataFinal = new Date(strb.split('-').reverse().join('-'));
    }

    if (!dataInicial) {
      this.compararData = false;
      return false;
    } else if (dataInicial > dataFinal) {
      this.compararData = true;
      return this.compararData;
    }
  }

}
