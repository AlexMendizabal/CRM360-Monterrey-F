import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';

import { finalize, retry } from 'rxjs/operators';
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap';

import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { PNotifyService } from './../../../../../shared/services/core/pnotify.service';

import { LogisticaEstoquePainelInventarioCadastroService } from './cadastro.service';
import { forkJoin } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss'],
})
export class LogisticaEstoquePainelInventarioCadastroComponent
  implements OnInit {
  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  matriculaAuditor: any = this.currentUser['info']['matricula'];
  form: FormGroup;
  bsConfig: Partial<BsDatepickerConfig>;
  loaderNavbar: boolean = false;
  spinnerFullScreen: boolean = true;
  loading: boolean = true;
  appTitle = 'Cadastrar inventário';

  tipo: any;
  empresas: any;
  depositos: any;
  linhas: any;
  classes: any;
  materiais: any;
  dataInicial: any;
  dataFinal: any;
  cdInventario = '';

  breadCrumbTree: Array<Breadcrumb> = [
    {
      descricao: 'Lista de inventários',
      routerLink: '/logistica/estoque/painel-inventario/lista',
    },
    {
      descricao: this.appTitle,
    },
  ];

  /* TIPOS DE INVENTÁRIOS */
  tipoInventario: any = [
    {
      codigo: 1,
      descNome: 'Inventário oficial',
    },
    {
      codigo: 2,
      descNome: 'Inventário rotativo',
    },
  ];

  disabledBotoes: any = {
    finalizar: false,
    editar: false,
    aprovar: false,
  };

  constructor(
    private formBuilder: FormBuilder,
    private localeService: BsLocaleService,
    private cadastroService: LogisticaEstoquePainelInventarioCadastroService,
    private notice: PNotifyService,
    private route: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );

    this.form = this.formBuilder.group({
      tipoInventario: [null, Validators.required],
      cdEmpresa: [null, Validators.required],
      cdDeposito: [null, Validators.required],
      linhas: [null, Validators.required],
      classes: [null],
      materiais: [null],
      cdInventario: [null],
      sigla: [null],
      pagina: 1,
      matriculaAuditor: [this.matriculaAuditor, Validators.required],
    });
  }

  ngOnInit(): void {
    this.cadastroService
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
    this.cadastroService
      .getLinhas()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((response: any) => {
        if (Object.keys(response).length > 0) {
          this.linhas = response;
        }
      });

    this.getPerfil();
  }

  getDepositos() {
    this.loaderNavbar = true;

    if (this.form.get('cdEmpresa').status === 'VALID') {
      let idEmpresa = this.form.get('cdEmpresa').value;
      this.cadastroService
        .getDepositos(idEmpresa)
        .subscribe((response: any) => {
          if (Object.keys(response).length > 0) {
            this.depositos = response;
          }
          this.loaderNavbar = false;
        });
    }
  }

  getClasses() {
    this.classes = [];
    let descricaoLinhas = [];
    this.loaderNavbar = true;

    if (this.form.get('linhas').status === 'VALID') {
      descricaoLinhas.push(this.form.get('linhas').value);
      this.cadastroService
        .getClasses(descricaoLinhas)
        .subscribe((response: any) => {
          if (Object.keys(response).length > 0) {
            this.classes = response;
          }
          this.loaderNavbar = false;
        });
    }
  }

  getMateriais(linhas, classes) {
    this.materiais = [];
    this.loaderNavbar = true;

    if (
      this.form.get('linhas').status === 'VALID' ||
      this.form.get('classes').status === 'VALID'
    ) {
      let descricaoLinhas = this.form.get('linhas').value;
      let idClasses = this.form.get('classes').value;
      this.cadastroService
        .getMateriais(descricaoLinhas, idClasses)
        .subscribe((response: any) => {
          if (Object.keys(response).length > 0) {
            this.materiais = response.result;
          }
          this.loaderNavbar = false;
        });
    }
  }

  postCadastraInventario() {
    if (
      this.disabledBotoes.finalizar == false &&
      this.disabledBotoes.editar == false &&
      this.disabledBotoes.aprovar == false
    ) {
      this.notice.notice('Seu usuário não pode iniciar um inventário.');
    } else {
      if (
        this.form.get('cdEmpresa').status === 'VALID' &&
        this.form.get('cdDeposito').status === 'VALID'
      ) {
        this.spinnerFullScreen = true;

        this.cadastroService.postCadastraInventario(this.form.value).subscribe(
          (response: any) => {
            if (response.status == 200) {
              this.postMateriais(
                this.matriculaAuditor,
                response.body.data
              );
            } else
              this.notice.error('Houve um errro ao cadastrar o inventário.');
          },
          (error) => {
            this.spinnerFullScreen = false;
            if (error.status < 500) this.notice.notice(error.error.dsErro);
            else this.notice.error('Ocorreu um erro! postCadastraInventario');
          }
        );
      }
    }
  }

  postMateriais(matriculaAuditor, idInventario) {
    let cdMateriais: any = [];

    if (this.form.get('materiais').value == null)
      this.materiais.forEach((element) => {
        cdMateriais.push(element.codigoMaterial);
      });
    else cdMateriais = this.form.get('materiais').value;

    let particao = 50;
    let qtEnvios = Math.ceil(cdMateriais.length / particao);
    let mat: any = [];
    for (let index = 0; index < qtEnvios; index++)
      mat.push(
        this.cadastroService.postMateriais(
          matriculaAuditor,
          idInventario,
          cdMateriais.slice(particao * index, particao * (index + 1))
        )
      );
    forkJoin(mat)
      .pipe(
        retry(2),
        finalize(() => (this.spinnerFullScreen = false))
      )
      .subscribe(
        (response: any) => {
          let contador = 0;

          response.forEach((element) => {
            if (element.status == 200) {
              contador++;
            }
          });

          if (contador === response.length) {
            this.route.navigate([`../${idInventario}/contagem-materiais`], {
              relativeTo: this.activatedRoute,
            });
          } else {
            this.notice.error('Não há dados.');
          }
        },
        (error) => {
          if (error.status < 500) this.notice.notice(error.error.dsErro);
          else this.notice.error('Ocorreu um erro!');
        }
      );
  }

  getPerfil() {
    this.cadastroService
      .getPerfil(this.matriculaAuditor)
      .pipe(
        finalize(() => {
          this.spinnerFullScreen = false;
          this.loaderNavbar = false;
        })
      )
      .subscribe(
        (response: any) => {
          this.disabledBotoes = response['disabledBotoes'];
        },
        (error) => {
          this.notice.notice(
            'Não há vinculo de perfil para realizar inventário nesse usuário.'
          );
        }
      );
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

  resetForm(formReset) {
    this.form.get('classes').reset();
    this.form.get('materiais').reset();

    if (formReset == 'classes') return;

    this.form.get('linhas').reset();

    if (formReset == 'linhas') return;

    this.form.get('cdDeposito').reset();
  }
}
