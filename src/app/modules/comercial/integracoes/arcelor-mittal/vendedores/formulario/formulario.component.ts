import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { finalize } from 'rxjs/operators';

// Services
import { ComercialIntegracoesArcelorMittalVendedoresService } from './../vendedores.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { ComercialService } from '../../../../comercial.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { IFormCanDeactivate } from 'src/app/guards/iform-candeactivate';
import { JsonResponse } from 'src/app/models/json-response';

@Component({
  selector: 'comercial-integracoes-arcelor-mittal-vendedores-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
})
export class ComercialIntegracoesArcelorMittalVendedoresFormularioComponent
  implements OnInit, IFormCanDeactivate {
  loaderFullScreen = true;
  loadingNavBar = false;

  form: FormGroup;
  formChanged = false;
  submittingForm = false;

  breadCrumbTree: Array<Breadcrumb> = [];

  vendedores: any = [];
  escritorios: Array<any> = [];

  constructor(
    private vendedoresService: ComercialIntegracoesArcelorMittalVendedoresService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private location: Location,
    private pnotifyService: PNotifyService,
    private confirmModalService: ConfirmModalService,
    private comercialService: ComercialService
  ) {
    this.pnotifyService.getPNotify();
  }

  ngOnInit(): void {
    this.setBreadCrumb();
    this.getFormFields();
    this.setFormBuilder();
  }

  setBreadCrumb(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      this.breadCrumbTree = [
        {
          descricao: 'Home',
          routerLink: '/comercial/home',
        },
        {
          descricao: 'Integração com Arcelor Mittal',
          routerLink: `/comercial/integracoes/arcelor-mittal/${params['idSubModulo']}`,
        },
        {
          descricao: 'Vendedores',
          routerLink: `/comercial/integracoes/arcelor-mittal/${params['idSubModulo']}/vendedores`,
        },
        {
          descricao: 'Cadastro',
        },
      ];
    });
  }

  getFormFields(): void {
    this.vendedoresService
      .getVendedores()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe({
        next: (response: JsonResponse) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            this.vendedores = response.data;
          } else {
            this.handleGetFormFields();
          }
        },
        error: (error: any) => {
          if (error.error.hasOwnProperty('mensagem')) {
            this.pnotifyService.error(error.error.mensagem);
          } else {
            this.handleGetFormFields();
          }
        }
      });

    this.comercialService
      .getEscritorios()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] === 200) {
            this.escritorios = response['result'];
          } else {
            this.handleGetFormFields();
          }
        },
        error: (error: any) => {
          this.handleGetFormFields();
        }
      });
  }

  handleGetFormFields(): void {
    this.pnotifyService.error();
    //this.location.back();
  }

  setFormBuilder(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      const detalhes = this.activatedRoute.snapshot.data;
      
      this.form = this.formBuilder.group({
        idArcelorMittal: [detalhes.idArcelorMittal, Validators.required],
        dsArcelorMittal: [
          {
            value: detalhes.nomeArcelorMittal,
            disabled: true,
          },
        ],
        vendManetoni: [detalhes.idManetoni],
        escritorio: [detalhes.idEscritorio],
      });
    });
  }

  onSave() {
    this.loadingNavBar = true;

    this.vendedoresService
      .updateAssociacao(this.form.value)
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.hasOwnProperty('success') && response.success === true) {
            this.form.reset();
            this.formChanged = false;
            this.pnotifyService.success(response.mensagem);

            this.activatedRoute.params.subscribe((params: any) => {
              let navigateTo: string;

              if (params.hasOwnProperty('id')) {
                navigateTo = '../../lista';
              } else {
                navigateTo = '../lista';
              }

              this.router.navigate([navigateTo], {
                relativeTo: this.activatedRoute,
              });
            });
          } else if (
            response.hasOwnProperty('success') &&
            response.success === false
          ) {
            this.pnotifyService.error(response.mensagem);
          } else {
            this.pnotifyService.error();
          }
        },
        error: (error: any) => {
          this.pnotifyService.error();
        }
      });
  }

  onCancel(): void {
    this.location.back();
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
