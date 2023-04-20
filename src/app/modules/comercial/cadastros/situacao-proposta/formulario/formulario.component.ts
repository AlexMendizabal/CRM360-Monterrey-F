import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { finalize } from 'rxjs/operators';

// Interfaces
import { IFormCanDeactivate } from 'src/app/guards/iform-candeactivate';

// Services
import { ComercialCadastrosSituacaoPropostaService } from '../situacao-proposta.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';

// Interfaces
import { SituacaoProposta } from '../models/situacao-proposta';
import { JsonResponse } from 'src/app/models/json-response';

@Component({
  selector: 'comercial-cadastros-situacao-proposta-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
})
export class ComercialCadastrosSituacaoPropostaFormularioComponent
  implements OnInit, IFormCanDeactivate {
  loaderNavbar: boolean;
  loaderFullScreen = true;

  appTitle: string;
  breadCrumbTree: Array<any> = [];

  form: FormGroup;
  formChanged = false;
  submittingForm: boolean;

  situacoesPropostaTid: Array<any> = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private formBuilder: FormBuilder,
    private situacaoPropostaService: ComercialCadastrosSituacaoPropostaService,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private titleService: TitleService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.getFormFields();
    this.setFormBuilder();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  getFormFields(): void {
    this.loaderFullScreen = true;

    this.situacaoPropostaService
      .getListaSituacaoPropostaTid()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe((response: JsonResponse) => {
        if (response.success === true) {
          this.situacoesPropostaTid = response.data;

          this.situacoesPropostaTid.unshift({
            codSituacao: 0,
            nomeSituacao: 'NENHUM',
          });
        }
      });
  }

  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        this.appTitle = 'Editar Situação de Proposta';
      } else {
        this.appTitle = 'Nova Situação de Proposta';
      }

      this.titleService.setTitle(this.appTitle);

      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/comercial/home',
        },
        {
          descricao: 'Cadastros',
          routerLink: `/comercial/cadastros/${params.idSubModulo}`,
        },
        {
          descricao: 'Situação de Proposta',
          routerLink: `/comercial/cadastros/${params.idSubModulo}/situacao-propostas/lista`,
        },
        {
          descricao: this.appTitle,
        },
      ];
    });
  }

  setFormBuilder(): void {
    if (this.activatedRoute.snapshot.data.detalhes.success === true) {
      const detalhes: SituacaoProposta = this.activatedRoute.snapshot.data
        .detalhes.data;

      this.form = this.formBuilder.group({
        codSituacaoProposta: [detalhes.codSituacaoProposta],
        situacaoProposta: [detalhes.situacaoProposta, [Validators.required]],
        codParametroSituacaoProposta: [
          detalhes.codParametroSituacaoProposta,
          [Validators.required],
        ],
        codSituacao: [detalhes.codSituacao, [Validators.required]],
        codTipoFinalizacao: [detalhes.codTipoFinalizacao],
        permiteAlterarEmpresa: [detalhes.permiteAlterarEmpresa],
      });
    } else {
      this.pnotifyService.error();
      this.location.back();
    }
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

        this.situacaoPropostaService
          .save(this.form.value)
          .pipe(
            finalize(() => {
              this.loaderNavbar = false;
              this.submittingForm = false;
            })
          )
          .subscribe({
            next: (response: any) => {
              if (
                response.hasOwnProperty('mensagem') &&
                response.hasOwnProperty('success') &&
                response.success === true
              ) {
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
            error: (error: any) => {
              this.pnotifyService.error();
            }
          });
      }
    }
  }

  onCancel(): void {
    this.location.back();
  }

  onInput(): void {
    this.formChanged = true;
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
}
