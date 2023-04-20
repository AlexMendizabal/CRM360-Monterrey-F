import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from '@angular/forms';
import { Router, ActivatedRoute, Data } from '@angular/router';

import { finalize } from 'rxjs/operators';

import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
//Converte rota em base64
import { RouterService } from 'src/app/shared/services/core/router.service';

import { SulFluminenseFiltroService } from './filtro.service';
import { INivelCritico } from './nivelCritico';
import { TitleService } from 'src/app/shared/services/core/title.service';

@Component({
  selector: 'painel-decisao-abastecimento',
  templateUrl: './painel-decisao-abastecimento.component.html',
  styleUrls: ['./painel-decisao-abastecimento.component.scss']
})
export class SulFluminensePainelDecisaoAbastecimentoComponent
  implements OnInit {
  loaderFullScreen: boolean = true;
  loaderNavbar: boolean = false;
  enableCards: boolean = false;

  form: FormGroup;

  unidades: Array<any> = [];
  linhas: Array<any> = [];
  classes: Array<any> = [];
  materiais: Array<any> = [];
  materiaisID: Array<any> = [];
  breadCrumbTree: any = [];
  nivelCritico: Array<INivelCritico> = [];

  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  matriculaUsuario: any = this.currentUser['info']['matricula'];

  ordenacao: any = [
    {
      id: 1,
      descricao: 'Codigo Material'
    },
    {
      id: 2,
      descricao: 'Descrição Material'
    },
    {
      id: 3,
      descricao: 'Linha'
    },
    {
      id: 4,
      descricao: 'Classe'
    }
  ];


  constructor(
    private formBuilder: FormBuilder,
    private filtroService: SulFluminenseFiltroService,
    private atividadesService: AtividadesService,
    private routerService: RouterService,
    private pnotify: PNotifyService,
    private titleService: TitleService,
    private router: Router,
    private activateRoute: ActivatedRoute
  ) {
    this.form = this.formBuilder.group({
      linhas: [null, Validators.required],
      classes: [null],
      materiais: [null],
      unidades: [null],
      ordenacao: [null]
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.loaderFullScreen = false;
    }, 1000);
    this.registrarAcesso();
    this.setBreadCrumb();
    this.setFormValues();
    this.getLinhas();    
    this.getUnidades();
    this.titleService.setTitle('Painel de decisão de abastecimento');
    this.form.get('ordenacao').setValue(1);
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb(): void {
    this.activateRoute.params.subscribe((params: any) => {
      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/sul-fluminense/home'
        },
        {
          descricao: 'Distribuição',
          routerLink: `/sul-fluminense/distribuicao/${params['idSubModulo']}`
        },
        {
          descricao: 'Painel de decisão de abastecimento'
        }
      ];
    });
  }

  setFormValues(): void {
    let _response = this.activateRoute.snapshot.queryParams;
    let parametros = this.routerService.getBase64UrlParams(_response);
    let unidades = parametros['unidades']
      ? atob(parametros['unidades']).split(',')
      : [];
    let linhas = parametros['linhas']
      ? atob(parametros['linhas']).split(',')
      : [];
    let classes: Array<number> = [];
    let materiais: Array<number> = [];

    this.form.get('linhas').setValue(linhas);
    this.form.get('unidades').setValue(unidades);

    let _materiais = parametros['materiais']
      ? atob(parametros['materiais']).split(',')
      : [];

    let _classes = parametros['classes']
      ? atob(parametros['classes']).split(',')
      : [];

    for (let index = 0; index < _classes.length; index++) {
      classes.push(parseInt(_classes[index]));
    }

    for (let index = 0; index < _materiais.length; index++) {
      materiais.push(parseInt(_materiais[index]));
    }

    if (this.form.get('linhas').status == 'VALID') {
      this.filtroService
        .getClasses(linhas)
        .pipe(
          finalize(() => {
            this.form.patchValue({
              classes: classes
            });
          })
        )
        .subscribe((response: any) => {
          if (Object.keys(response).length > 0) {
            if(response['status'] === 200) {
              this.classes = response['body'];
              this.form.get('classes').enable();
            }
          }
        });
    } else {
      this.form.get('classes').disable();
    }

    if (this.form.get('classes').status == 'VALID') {
      this.filtroService
        .getMateriais(linhas, classes)
        .pipe(
          finalize(() => {
            this.form.patchValue({
              materiais: materiais
            });
          })
        )
        .subscribe((response: any) => {
          if (Object.keys(response).length > 0) {
            if (response['body'].responseCode === 200) {
              this.materiais = response.result;
              this.form.get('materiais').enable();
            }
          }
        });
    } else {
      this.form.get('materiais').disable();
    }
  }

  /* INICIO - CARREGA DADOS DO FILTRO */
  getLinhas(): void {
    this.filtroService
      .getLinhas()
      .pipe(
        finalize(() => (this.loaderNavbar = false))
      )
      .subscribe(
        (response: any) => {
          if (Object.keys(response).length > 0) {
            if(response['status'] === 200) {
              this.linhas = response['body'];
            }
          }
        },
        error => {
          this.pnotify.error('Erro ao carregar Filtro Linhas');
        }
      );
  }

  getClasses(): void {
    this.classes = [];
    
    if (this.form.get('linhas').value.length > 1) {
      this.form.get('classes').setValidators([Validators.required]);
    } else {
      this.form.get('classes').setValidators([Validators.nullValidator]);
      this.form.get('materiais').disable();
    }
    
    if (this.form.get('linhas').status === 'VALID') {
      this.loaderNavbar = true;
      let descricaoLinhas = this.form.get('linhas').value;
      this.filtroService.getClasses(descricaoLinhas)
      .pipe(
        finalize(() => (this.loaderNavbar = false))
      )
      .subscribe(
        (response: any) => {
          if (Object.keys(response).length > 0) {
            if(response['status'] === 200) {
              this.classes = response['body'];
              this.form.get('classes').reset();
              this.form.get('classes').enable();
            }
          }
        },
        error => {
          this.pnotify.error('Erro ao carregar filtro Classes');
        }
      );
    } else {
      this.form.get('classes').reset();
      this.form.get('materiais').reset();
      this.form.get('classes').disable();
      this.form.get('materiais').disable();
    }
  }

  getMateriais(): void {
    this.materiais = [];
    
    if (
      this.form.get('classes').value.length > 0 &&
      (this.form.get('linhas').status === 'VALID' ||
      this.form.get('classes').status === 'VALID')
      ) {
      this.loaderNavbar = true;
      let descricaoLinhas = this.form.get('linhas').value;
      let idClasses = this.form.get('classes').value;
      this.filtroService.getMateriais(descricaoLinhas, idClasses)
      .pipe(
        finalize(() => (this.loaderNavbar = false))
      )
      .subscribe(
        (response: any) => {
          if (Object.keys(response).length > 0) {
            if (response['body'].responseCode === 200) {
              this.materiais = response['body'].result;
              this.form.get('materiais').reset();
              this.form.get('materiais').enable();
            } else if (response['body'].responseCode === 204) {
              this.materiais = [];
              this.pnotify.notice(
                'Não há materiais cadastrados para essa classe'
              );
            }
          }
          this.loaderNavbar = false;
        },
        error => {
          this.pnotify.error('Erro ao carregar filtro Materias');
        }
      );
    } else {
      this.form.get('materiais').reset();
      this.form.get('materiais').disable();
    }
  }

  getUnidades(): void {
    this.unidades = [];
    this.loaderNavbar = true;

    this.filtroService.getUnidades()
      .subscribe(
        (response: any) => {
          if (Object.keys(response).length > 0) {
            if(response['status'] === 200) {
              this.unidades = response['body'];
            }
          }
          this.loaderNavbar = false;
        },
        error => {
          this.pnotify.error('Erro ao carregar filtro Unidades');
        }
      );
  }
  /* FIM - CARREGA DADOS DO FILTRO */

  onFilter(): void {
    let unidades = this.form.get('unidades').value;
    let linhas = this.form.get('linhas').value;
    let classes = this.form.get('classes').value;
    let materiais = this.form.get('materiais').value;
    let ordenacao = this.form.get('ordenacao').value;

    /* define millesegundos para enviar na rota e sempre poder filtrar */
    let aux = new Date();
    let m = aux.getMilliseconds();

    this.setRouterParams({
      matriculaUsuario: this.matriculaUsuario,
      unidades: unidades ? btoa(unidades) : '',
      linhas: linhas ? btoa(linhas) : '',
      classes: classes ? btoa(classes) : '',
      materiais: materiais ? btoa(materiais) : '',
      ordenacao: ordenacao,
      r: m
    });
  }

  setRouterParams(params: any): void {
    this.router.navigate([],
      {
        relativeTo: this.activateRoute,
        queryParams: this.routerService.setBase64UrlParams(params)
      }
    );
  }

  onResetForm(): void {
    this.form.reset();
    this.router.navigate([],
    { 
     relativeTo: this.activateRoute
    }
      )
      .finally(() => window.location.reload());
  }

  /* VALIDAÇÕES DO FILTRO */
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
}
