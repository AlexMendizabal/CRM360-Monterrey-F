import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { finalize } from 'rxjs/operators';

import { defineLocale } from 'ngx-bootstrap/chronos';
import { ptBrLocale } from 'ngx-bootstrap/locale';
import { AbastecimentoCadastroMediaVendasService } from '../media-vendas.service';
defineLocale('pt-br', ptBrLocale);

@Component({
  selector: 'abastecimento-cadastros-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss']
})
export class AbastecimentoCadastrosMediaVendasCadastroComponent implements OnInit {
  loading: boolean = false;
  loaderNavBar: boolean = true;
  compararData: boolean = false;

  bsConfig: Partial<BsDatepickerConfig>;
  
  form: FormGroup;
  linhas: any = [];
  classes: any = [];

  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  idUsuario: any = this.currentUser['info']['id'];

  breadCrumbTree: any = [];

  constructor(
    private formBuilder : FormBuilder,
    private pnotify: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private localeService: BsLocaleService,
    private service: AbastecimentoCadastroMediaVendasService

  ) { 
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );
    this.form = this.formBuilder.group({
      linhas: [null, Validators.required],
      classes: [null],
      dataInicial: [null, [Validators.required]],
      dataFinal: [null, [Validators.required]]});
  }
  
  ngOnInit(): void {
    this.onBreadCumbTree();
    this.getLinhas();
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

  getLinhas(): void {
    this.service
    .getLinhas()
    .pipe(
      finalize(() => (this.loading = false, this.loaderNavBar = false))
    )
    .subscribe(res => {
      if(Object.keys(res).length > 0){
        this.linhas = res["body"];
      }
    },
    error => {
      this.pnotify.error("Erro ao carregar Linhas")
    });
  }

  getClasses(): void {
    this.classes = [];
    this.loaderNavBar = true;

    if(this.form.get('linhas').status === "VALID") { 
     let descricaoLinhas  = this.form.get('linhas').value
     this.service
      .getClasses(descricaoLinhas)
      .subscribe(res => {
        if(Object.keys(res).length > 0){
          this.classes = res["body"];
        }
        this.loaderNavBar = false;
      },
      error => {
        this.pnotify.error("Erro ao carregar Classes")
      }
      )
    }
  }

  onSave(): void {
    this.loaderNavBar = true;
    this.service
      .postMediaVendas({
        idUsuario: this.idUsuario,
        linha: this.form.get("linhas").value.toString(),
        classes: this.form.get("classes").value,
        periodoInicial: this.form.get("dataInicial").value,
        periodoFinal: this.form.get("dataFinal").value
      })
      .pipe(
        finalize(() => this.loaderNavBar=false)
      )
      .subscribe(
        (res: any) => {
          if(res.status === 200){
            this.pnotify.success(res['body']);
            this.form.reset();
          } else if (res.status === 204) {
            this.pnotify.notice(res['body']);
          } else {
            this.pnotify.error("Ocorreu um erro durante a consulta");
          }
        },
        (error) => {
          this.pnotify.error(error["error"]);
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
