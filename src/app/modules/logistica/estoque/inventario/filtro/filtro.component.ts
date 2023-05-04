import { LogisticaEstoqueInventarioFiltroService } from './filtro.service';
import { PNotifyService } from '../../../../../shared/services/core/pnotify.service';
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { Router } from '@angular/router';
import { finalize, delay, retry } from 'rxjs/operators';
import {
  FormControl,
  Validators,
  FormBuilder,
  FormGroup
} from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { DateService } from 'src/app/shared/services/core/date.service';
import { string } from '@amcharts/amcharts4/core';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { forkJoin } from 'rxjs';
import { elementEventFullName } from '@angular/compiler/src/view_compiler/view_compiler';

@Component({
  selector: 'logistica-estoque-inventario-filtro',
  templateUrl: './filtro.component.html',
  styleUrls: ['./filtro.component.scss']
})
export class LogisticaEstoqueInventarioFiltroComponent implements OnInit {
  currentUser: any = JSON.parse(localStorage.getItem('currentUser'));
  matriculaAuditor: any = this.currentUser['info']['matricula'];
  ativarCampos: any = false;
  tipoInventario: number;
  spinnerFullScreen: boolean = true;
  loaderNavbar: boolean = false;
  loading: boolean = true;
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
      routerLink: '/logistica/estoque/inventario/filtro'
    },
    {
      descricao: 'Filtros'
    }
  ];
  disabledBotoes: any = {
    finalizar: false,
    editar: false,
    aprovar: false
  };

  constructor(
    private formBuilder: FormBuilder,
    private notice: PNotifyService,
    private localeService: BsLocaleService,
    private empresasService: LogisticaEstoqueInventarioFiltroService,
    private route: Router,
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
      empresas: [null, Validators.required],
      depositos: [null, Validators.required],
      linhas: [null, Validators.required],
      classes: [null],
      materiais: [null],
      dataInicial: [null],
      dataFinal: [null]
    });
    this.atividadesService.registrarAcesso().subscribe();
    this.getPerfil();
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

    this.empresasService
      .getLinhas()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((response: any) => {
        if (Object.keys(response).length > 0) {
          this.linhas = response;
        }
      });
  }

  /* INICIO ALTERA BOTÕES TIPO DE INVENTARIO */
  setType(type: number) {
    this.tipoInventario = type;
  }

  /* INICIO FUNÇÕES FILTROS COM PARÂMETROS */
  getDepositos() {
    this.loaderNavbar = true;

    if (this.form.get('empresas').status === 'VALID') {
      let idEmpresa = this.form.get('empresas').value;
      this.empresasService
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
      this.empresasService
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
      this.empresasService
        .getMateriais(descricaoLinhas, idClasses)
        .subscribe((response: any) => {
          if (Object.keys(response).length > 0) {
            this.materiais = response.result;
          }
          this.loaderNavbar = false;
        });
    }
  }

  /* INICIO CADASTRO DE INVENTÁRIO */
  postCadastraInventario() {
    if (
      this.disabledBotoes.finalizar == false &&
      this.disabledBotoes.editar == false &&
      this.disabledBotoes.aprovar == false
    ) {
      this.notice.notice('Seu usuário não pode iniciar um inventário.');
    } else {
      if (
        this.form.get('empresas').status === 'VALID' &&
        this.form.get('depositos').status === 'VALID'
      ) {
        this.spinnerFullScreen = true;
        let cdEmpresa = this.form.get('empresas').value;
        let cdDeposito = this.form.get('depositos').value;

        this.empresasService
          .postCadastraInventario(
            this.matriculaAuditor,
            cdEmpresa,
            cdDeposito,
            this.tipoInventario
          )
          .subscribe(
            (response: any) => {
              if (response.status == 200) {
                this.postMateriais(
                  this.matriculaAuditor,
                  response.body.idInventario
                );
              } else
                this.notice.error('Houve um errro ao cadastrar o inventário.');
            },
            error => {
              this.spinnerFullScreen = false;
              if (error.status < 500) this.notice.notice(error.error.dsErro);
              else this.notice.error('Ocorreu um erro!');
            }
          );
      }
    }
  }

  /* INICIO CADASTRO DE MATERIAIS */
  /* postMateriais(matriculaAuditor, idInventario) {
    let cdMateriais = [];

    if (this.form.get('materiais').value == null)
      this.materiais.forEach(element => {
        cdMateriais.push(element.codigoMaterial);
      });
    else cdMateriais.push(this.form.get('materiais').value);
    this.empresasService
      .postMateriais(matriculaAuditor, idInventario, cdMateriais)
      .pipe(finalize(() => (this.spinnerFullScreen = false)))
      .subscribe(
        (response: any) => {
          if (response.status == 200) {
            this.route.navigate([
              `logistica/estoque/inventario/${idInventario}/contagem-materiais`
            ]);
          } else this.notice.error('Não há dados.');
        },
        error => {
          if (error.status < 500) this.notice.notice(error.error.dsErro);
          else this.notice.error('Ocorreu um erro!');
        }
      );
  } */

  postMateriais(matriculaAuditor, idInventario) {
    let cdMateriais: any = [];

    if (this.form.get('materiais').value == null)
      this.materiais.forEach(element => {
        cdMateriais.push(element.codigoMaterial);
      });
    else cdMateriais = this.form.get('materiais').value;

    let particao = 50;
    let qtEnvios = Math.ceil(cdMateriais.length / particao);
    let mat: any = [];
    for (let index = 0; index < qtEnvios; index++)
      mat.push(
        this.empresasService.postMateriais(
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

          response.forEach(element => {
            if (element.status == 200) {
              contador++;
            }
          });

          if (contador === response.length) {
            this.route.navigate([
              `/logistica/estoque/inventario/${idInventario}/contagem-materiais`
            ]);
          } else {
            this.notice.error('Não há dados.');
          }
        },
        error => {
          if (error.status < 500) this.notice.notice(error.error.dsErro);
          else this.notice.error('Ocorreu um erro!');
        }
      );
  }

  /* INICIO CONSULTA DO INVENTARIO */
  onSearch() {
    this.route.navigate([`logistica/estoque/inventario/inventario`], {
      queryParams: {
        tipo: this.tipoInventario,
        empresa: this.form.get('empresas').value,
        deposito: this.form.get('depositos').value,
        linha: this.form.get('linhas').value,
        classe: this.form.get('classes').value,
        dataInicial: this.form.get('dataInicial').value,
        dataFinal: this.form.get('dataFinal').value
      }
    });
  }

  /* CONTROLE VALIDAÇÕES DOS CAMPOS */
  resetForm() {
    this.form.get('depositos').reset();
    this.form.get('linhas').reset();
    this.form.get('classes').reset();
    this.form.get('materiais').reset();
    this.form.get('empresas').reset();
  }

  mostrarCampos() {
    if (this.tipoInventario == 1 || this.tipoInventario == 2)
      this.ativarCampos = true;
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

  onVideoLoaded() {
    window.open('https://youtu.be/pwxbnXJw0uo', '_blank');
  }

  getPerfil() {
    this.empresasService
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
        error => {
          this.notice.notice(
            'Não há vinculo de perfil para realizar inventário nesse usuário.'
          );
        }
      );
  }
}
