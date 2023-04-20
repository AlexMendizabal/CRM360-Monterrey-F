import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl
} from '@angular/forms';
import { finalize } from 'rxjs/operators';

// Interfaces
import { IFormCanDeactivate } from 'src/app/guards/iform-candeactivate';

// Services
import { ComercialCadastrosEscritorioService } from '../escritorios.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { ComercialService } from '../../../comercial.service';

// Interfaces
import { Escritorio } from '../models/escritorio';

@Component({
  selector: 'comercial-cadastros-escritorio-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss']
})
export class ComercialCadastrosEscritorioFormularioComponent
  implements OnInit, IFormCanDeactivate {
  loaderNavbar: boolean;
  loaderFullScreen = true;

  appTitle: string;
  breadCrumbTree: Array<any> = [];

  form: FormGroup;
  formChanged = false;
  submittingForm: boolean;

  empresas: Array<any> = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private formBuilder: FormBuilder,
    private escritorioService: ComercialCadastrosEscritorioService,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private titleService: TitleService,
    private comercialService: ComercialService
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

  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        this.appTitle = 'Editar escritório';
      } else {
        this.appTitle = 'Novo escritório';
      }

      this.titleService.setTitle(this.appTitle);

      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/comercial/home'
        },
        {
          descricao: 'Cadastros',
          routerLink: `/comercial/cadastros/${params.idSubModulo}`
        },
        {
          descricao: 'Escritórios',
          routerLink: `/comercial/cadastros/${params.idSubModulo}/escritorios/lista`
        },
        {
          descricao: this.appTitle
        }
      ];
    });
  }

  getFormFields(): void {
    this.comercialService
      .getEmpresas(null)
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.responseCode === 200) {
            this.empresas = response.result;
          } else {
            this.pnotifyService.error();
            this.location.back();
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
          this.location.back();
        }
      });
  }

  setFormBuilder(): void {
    if (this.activatedRoute.snapshot.data.detalhes.success === true) {
      const detalhes: Escritorio = this.activatedRoute.snapshot.data.detalhes
        .data;

      this.form = this.formBuilder.group({
        codEscritorio: [detalhes.codEscritorio],
        nomeEscritorio: [detalhes.nomeEscritorio, [Validators.required]],
        codEmpresa: [detalhes.codEmpresa, [Validators.required]],
        codSituacao: [detalhes.codSituacao, [Validators.required]]
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

        this.escritorioService
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
                this.form.reset();
                this.formChanged = false;
                this.pnotifyService.success(response.mensagem);

                this.activatedRoute.params.subscribe((params: any) => {
                  if (params.hasOwnProperty('id')) {
                    this.location.back();
                  } else {
                    this.router.navigate(['../lista'], {
                      relativeTo: this.activatedRoute
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
