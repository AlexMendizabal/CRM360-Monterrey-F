//Services
import { TitleService } from 'src/app/shared/services/core/title.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
//Bootstrap
import { utilsBr } from 'js-brasil';
import { BsDatepickerConfig, BsModalRef, BsLocaleService } from 'ngx-bootstrap';
//Angular
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from '@angular/forms';
//rxjs
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LogisticaFiliaisService } from '../services/filiais.service';
//interfaces
import { ILogisticaFiliais } from '../models/filiais';

@Component({
  selector: 'logistica-filiais-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss'],
})
export class LogisticaFiliaisCadastroComponent
  implements OnInit {
  noResult: boolean;
  $activatedRouteSubscription: Subscription;
  breadCrumbTree: Array<any> = [];
  form: FormGroup;
  appTitle: string;
  modalRef: BsModalRef;
  formData: Array<FormData> = [];
  bsConfig: Partial<BsDatepickerConfig>;
  //loading
  disabledForm = false;
  loading = false;
  loadingNavBar = false;

  tipos = [
    {
      cod: '1',
      nome: 'Activo',
    },
    {
      cod: '2',
      nome: 'Inactivo',
    },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private pnotify: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private localeService: BsLocaleService,
    private filiaisService: LogisticaFiliaisService,
    private titleService: TitleService,
    private atividadesService: AtividadesService,
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );
  }
  public MASKS = utilsBr.MASKS;

  ngOnInit(): void {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.setFormBuilder();
    this.onActivatedRoute();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  onActivatedRoute() {
    const _params = this.activatedRoute.snapshot.params;
    if (_params.hasOwnProperty('id')) {
      this.getFilial(_params['id']);
    }
    return
  }


  getFilial(id: number) {
    this.loading = true;
    this.filiaisService
      .getFilial(id)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            const data: ILogisticaFiliais = response.body['data']
            this.form.patchValue(data)
            this.noResult = false;
          } else {
            this.noResult = true;
          }
        },
        (error) => {
          this.pnotify.error();
          this.noResult = true;
        }
      );
  }

  setBreadCrumb(): void {
    const id = this.activatedRoute.snapshot.params.idSubModulo;
    this.appTitle = 'Registro';
    this.titleService.setTitle(this.appTitle);
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: '/logistica/home',
      },
      {
        descricao: 'Prontuários',
        routerLink: `/logistica/cadastros/${id}`,
      },
      {
        descricao: 'Sucursais',
        routerLink: `../`,
      },
      {
        descricao: this.appTitle,
      },
    ];
  }

  //formulario
  setFormBuilder(): void {
    this.form = this.formBuilder.group({
      id: [null],
      nome: [null, [Validators.required]],
      idFilial: [null, [Validators.required, Validators.min(0)]],
      status: ['1', [Validators.required]],
    });
  }

  // Validação de formulário
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

  postFiliais() {
    this.loadingNavBar = true;
    this.filiaisService
      .postFiliais(this.form.value)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response: any) => {
          if (response.status === 200) {
            this.pnotify.success();
            this.router.navigate(['../'], {
              relativeTo: this.activatedRoute,
            });
          } else {
            this.pnotify.error();
          }
        },
        (error: any) => {
          try {
            this.pnotify.error(error.error.message);
          } catch (error) {
            this.pnotify.error();
          }
        }
      );
  }

}
