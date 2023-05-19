
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
import { IRanking } from './../models/ranking';

// Services
import { ComercialGestaoRankingClientesService } from '../ranking-clientes.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TitleService } from 'src/app/shared/services/core/title.service';

@Component({
  selector: 'comercial-gestao-ranking-clientes-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss']
})
export class ComercialGestaoRankingClientesFormularioComponent implements OnInit , IFormCanDeactivate {
  loaderNavbar: boolean;
  loaderFullScreen = true;

  appTitle: string;
  breadCrumbTree: Array<any> = [];

  form: FormGroup;
  formChanged = false;
  submittingForm: boolean;
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private location: Location,
    private formBuilder: FormBuilder,
    private rankingClientesService: ComercialGestaoRankingClientesService,
    private pnotifyService: PNotifyService,
    private atividadesService: AtividadesService,
    private titleService: TitleService
  ) { 
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
        this.appTitle = 'Editar parâmetro';
      /* } else {
        this.appTitle = 'Novo parâmetro'; */
      }

      this.titleService.setTitle(this.appTitle);

      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/comercial/home',
        },
        {
          descricao: 'Gestão',
          routerLink: `/comercial/gestao/${params['idSubModulo']}`,
        },
        {
          descricao: 'Ranking de Clientes',
          routerLink: `/comercial/gestao/${params.idSubModulo}/ranking-clientes/lista`,
        },
        {
          descricao: this.appTitle,
        },
      ];
    });
  }

  setFormBuilder(): void {
    if (this.activatedRoute.snapshot.data.detalhes.success === true) {
      const detalhes: IRanking = this.activatedRoute.snapshot.data.detalhes.data;

      this.form = this.formBuilder.group({
        codClassificacao: [detalhes.codClassificacao],
        nomeClassificacao: [detalhes.nomeClassificacao, [Validators.required]],
        peso: [detalhes.peso, [Validators.required]],
        nota1Fim: [detalhes.nota1Fim, [Validators.required]],
        nota2Inicio: [detalhes.nota2Inicio, [Validators.required]],
        nota2Fim: [detalhes.nota2Fim, [Validators.required]],
        nota3Inicio: [detalhes.nota3Inicio, [Validators.required]],
        nota3Fim: [detalhes.nota3Fim, [Validators.required]],
        nota4Inicio: [detalhes.nota4Inicio, [Validators.required]],
        nota4Fim: [detalhes.nota4Fim, [Validators.required]],
        nota5Inicio: [detalhes.nota5Inicio, [Validators.required]],

        situacao: [
          detalhes.situacao ? detalhes.situacao : 1,
          [Validators.required]], 
      });
    } else {
      this.pnotifyService.error();
      this.location.back();
    }

    this.loaderFullScreen = false;
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
      
        this.rankingClientesService
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
      if (confirm('Este cliente no forma parte de tu cartera?')) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  }
}
