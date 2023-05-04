import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { finalize } from 'rxjs/operators';

// Services
import { ComercialIntegracoesArcelorMittalClassesMateriaisService } from './../classes-materiais.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

// Interfaces
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';

@Component({
  selector: 'comercial-integracoes-arcelor-mittal-classes-materiais-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss']
})
export class ComercialIntegracoesArcelorMittalClassesMateriaisFormularioComponent
  implements OnInit {
  loaderFullScreen = true;
  loadingNavBar = false;

  form: FormGroup;
  formChanged = false;
  submittingForm = false;

  breadCrumbTree: Array<Breadcrumb> = [];

  classesMateriais: any = [];

  constructor(
    private classesMateriaisService: ComercialIntegracoesArcelorMittalClassesMateriaisService,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private location: Location,
    private pnotifyService: PNotifyService
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
          routerLink: '/comercial/home'
        },
        {
          descricao: 'Integração com Arcelor Mittal',
          routerLink: `/comercial/integracoes/arcelor-mittal/${params['idSubModulo']}`
        },
        {
          descricao: 'Classes de Materiais',
          routerLink: `/comercial/integracoes/arcelor-mittal/${params['idSubModulo']}/classes-de-materiais`
        },
        {
          descricao: 'Cadastro'
        }
      ];
    });
  }

  getFormFields(): void {
    this.classesMateriaisService
      .getClasses()
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response['responseCode'] === 200) {
            this.classesMateriais = response['result'];
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
    this.location.back();
  }

  setFormBuilder(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      this.form = this.formBuilder.group({
        idArcelorMittal: [params['id'], Validators.required],
        dsArcelorMittal: [
          {
            value: this.activatedRoute.snapshot.data['detalhes'][
              'nomeArcelorMittal'
            ],
            disabled: true
          }
        ],
        idManetoni: [this.activatedRoute.snapshot.data['detalhes']['result']]
      });
    });
  }

  onSave() {
    this.loadingNavBar = true;

    this.classesMateriaisService
      .updateAssociacao(this.form.value)
      .pipe(
        finalize(() => {
          this.loaderFullScreen = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (response['responseCode'] === 200) {
            this.pnotifyService.success();
            this.location.back();
          } else {
            this.pnotifyService.error();
          }
        },
        error: (error) => {
          this.pnotifyService.error();
        }
      });
  }
}
