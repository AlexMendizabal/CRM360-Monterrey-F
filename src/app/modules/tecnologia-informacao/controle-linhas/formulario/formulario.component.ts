import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { DateService } from './../../../../shared/services/core/date.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { finalize, switchMap, take } from 'rxjs/operators';

// ngx-bootstrap
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { ptBrLocale } from 'ngx-bootstrap/locale';

defineLocale('pt-br', ptBrLocale);

// Interfaces
import { IFormCanDeactivate } from 'src/app/guards/iform-candeactivate';
import { utilsBr } from 'js-brasil';
// Services
import { TecnologiaInformacaoControleLinhaService } from '../controle-linhas.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';

// Interfaces
import { ControleLinha } from '../models/controle-linha';
import { ITenconologiaInformacaoControleLinhasDocumento } from '../models/documento';
import { EMPTY } from 'rxjs';

@Component({
  selector: 'tecnologia-informacao-controle-linha-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
})
export class TecnologiaInformacaoControleLinhaFormularioComponent
  implements OnInit, IFormCanDeactivate {
  public MASKS = utilsBr.MASKS;
  loaderNavbar: boolean;

  appTitle: string;
  breadCrumbTree: Array<any> = [];
  loadingSituacoes = false;
  bsConfig: Partial<BsDatepickerConfig>;

  situacoes = [];
  anexosLoaded: boolean = false;
  documentos: Array<ITenconologiaInformacaoControleLinhasDocumento>;

  form: FormGroup;
  formChanged = false;
  submittingForm: boolean;

  constructor(
    private localeService: BsLocaleService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private confirmModalService: ConfirmModalService,
    private dateService: DateService,
    private formBuilder: FormBuilder,
    private controleLinhaService: TecnologiaInformacaoControleLinhaService,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private titleService: TitleService
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.setFormBuilder();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        this.appTitle = 'Editar linha';
      } else {
        this.appTitle = 'Novo linha';
      }

      this.titleService.setTitle(this.appTitle);

      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/tecnologia-informacao/home',
        },
        {
          descricao: 'Controle de linhas',
          routerLink: `/tecnologia-informacao/controle-linhas`,
        },
        {
          descricao: this.appTitle,
        },
      ];
    });
  }

  setFormBuilder(): void {
    if (this.activatedRoute.snapshot.data.detalhes.success === true) {
      const detalhes: ControleLinha = this.activatedRoute.snapshot.data.detalhes
        .data;

      const data: Date =
        detalhes.dataVencimentoContrato === null
          ? new Date()
          : new Date(detalhes.dataVencimentoContrato);

      this.form = this.formBuilder.group({
        codLinha: [{ value: detalhes['codLinha'], disabled: false }],
        matricula: [{ value: detalhes['matricula'], disabled: false }],
        numLinha: [
          { value: detalhes['numLinha'], disabled: false },
          [Validators.required],
        ],
        descricao: [
          { value: detalhes['descricao'], disabled: false },
          [Validators.required],
        ],
        nomeUsuario: [
          { value: detalhes['nomeUsuario'], disabled: true },
          [Validators.required],
        ],
        codEscritorio: [{ value: detalhes['codEscritorio'], disabled: true }],
        nomeEscritorio: [
          { value: detalhes['nomeEscritorio'], disabled: true },
          [Validators.required],
        ],
        codEmpresa: [{ value: detalhes['codEmpresa'], disabled: true }],
        nomeEmpresa: [
          { value: detalhes['nomeEmpresa'], disabled: true },
          [Validators.required],
        ],
        dsSituacao: [
          { value: detalhes['dsSituacao'], disabled: true },
          [Validators.required],
        ],
        codSituacao: [
          { value: detalhes['codSituacao'], disabled: true },
          [Validators.required],
        ],
        valor: [
          { value: detalhes['valor'], disabled: false },
          [Validators.required],
        ],
        numContrato: [
          { value: detalhes['numContrato'], disabled: false },
          [Validators.required],
        ],
        dataVencimentoContrato: [
          {
            value: detalhes['dataVencimentoContrato']
              ? this.dateService.convertStringToDate(
                  detalhes['dataVencimentoContrato'],
                  'usa'
                )
              : null,
            disabled: false,
          },
          [Validators.required],
        ],
        plano: [
          { value: detalhes['plano'], disabled: false },
          [Validators.required],
        ],
        gestorFun: [
          { value: detalhes['gestorFun'], disabled: false },
          [Validators.required],
        ],
        dados: [
          { value: detalhes['dados'], disabled: false },
          [Validators.required],
        ],
        conta: [
          { value: detalhes['conta'], disabled: false },
          [Validators.required],
        ],
        codChip: [
          { value: detalhes['codChip'], disabled: false },
          [
            Validators.required,
            Validators.maxLength(20),
            Validators.minLength(20),
          ],
        ],
        numConta: [
          { value: detalhes['numConta'], disabled: false },
          [Validators.required],
        ],
        senha: [
          { value: detalhes['senha'], disabled: false },
          [Validators.required],
        ],
      });
    } else {
      this.pnotifyService.error();
      this.location.back();
    }

    this.getDocumentos();
  }

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

  onSubmit(): void {
    if (this.form.pristine) {
      this.location.back();
    } else {
      if (this.form.valid) {
        this.loaderNavbar = true;
        this.submittingForm = true;

        this.controleLinhaService
          .save(this.form.value)
          .pipe(
            finalize(() => {
              this.loaderNavbar = false;
              this.submittingForm = false;
            })
          )
          .subscribe(
            (response: any) => {
              if (
                response.hasOwnProperty('mensagem') &&
                response.hasOwnProperty('success') &&
                response.success === true
              ) {
                this.form.reset();
                this.formChanged = false;
                this.pnotifyService.success(response.mensagem);

                this.activatedRoute.params.subscribe((params: any) => {
                  if (params.hasOwnProperty('id')) {
                    this.location.back();
                  } else {
                    this.router.navigate(['../lista'], {
                      relativeTo: this.activatedRoute,
                    });
                  }
                });
              } else if (
                response.hasOwnProperty('mensagem') &&
                response.hasOwnProperty('success') &&
                response.success === false
              ) {
                this.pnotifyService.notice(response.mensagem);
              } else {
                this.pnotifyService.error();
              }
            },
            (error: any) => {
              this.pnotifyService.error();
            }
          );
      }
    }
  }

  onCancel(): void {
    this.location.back();
  }

  onInput(): void {
    this.formChanged = true;
  }

  getFuncionariosSituacoes() {
    this.controleLinhaService
      .getFuncionariosSituacoes()
      .pipe(finalize(() => (this.loadingSituacoes = false)))
      .subscribe((response) => {
        this.situacoes = response['data'];
      });
  }
  formCanDeactivate(): boolean {
    if (this.formChanged) {
      if (confirm('Informações não salvas serão perdidas. Deseja continuar?')) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  }
  //UPLOAD DE ARQUIVOS
  onFile(files) {
    if (files.length === 0) return;

    const formData = new FormData();
    formData.append('file', files[0]);

    const codLinha = this.form.get('codLinha').value;

    this.controleLinhaService
      .postDocument(formData, codLinha)
      .subscribe((response) => {
        console.log(response);
      });
  }

  getDocumentos() {
    if (!this.form.get('codLinha').value) return;

    this.controleLinhaService
      .getDocumentos({
        codLinha: this.form.get('codLinha').value,
      })
      .subscribe((response) => {
        this.documentos = response.body['data'];
        console.log(this.documentos);
      });
  }

  onDelete(documento: any) {
    let confirm$ = this.confirmModalService.showConfirm(
      'delete',
      'Confirmar exclusão',
      'Deseja realmente prosseguir com a exclusão do anexo?',
      'Cancelar',
      'Confirmar'
    );

    confirm$
      .asObservable()
      .pipe(
        take(1),
        switchMap((result) =>
          result ? this.putDocumento(documento.idDocumento) : EMPTY
        )
      )
      .subscribe(
        (success) => {
          this.pnotifyService.success();
          this.documentos = [];
          this.getDocumentos();
        },
        (error) => {
          this.pnotifyService.error('Erro ao excluir anexo. Tente novamente!');
        }
      );
  }

  putDocumento(idDocumento: number) {
    this.anexosLoaded = false;
    return this.controleLinhaService.putDocumento({
      idDocumento: idDocumento,
      status: '0',
    });
  }
}
