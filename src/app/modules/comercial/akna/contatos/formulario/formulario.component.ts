import { DateService } from './../../../../../shared/services/core/date.service';
import { RouterService } from './../../../../../shared/services/core/router.service';
import { ComercialAknaContatosService } from './../contatos.service';
//Angular
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';

//Services
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { MoedasService } from 'src/app/shared/services/requests/moedas.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

//Bootstrap
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';

//interfaces
import { IComercialAknaContatos } from './../models/contatos';

//rxjs
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'comercial-akna-contatos-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.scss'],
})
export class ComercialAknaContatosFormularioComponent implements OnInit {
  noResult: boolean;
  $activatedRouteSubscription: Subscription;
  breadCrumbTree: Array<any> = [];
  form: FormGroup;
  appTitle: string;
  bsConfig: Partial<BsDatepickerConfig>;
  formData: Array<FormData> = [];
  idLista: number;
  compararData = null;
  //loading
  loading = true;
  loadingNavBar = false;

  //Interfaces
  contatos: Array<IComercialAknaContatos>;

  constructor(
    private formBuilder: FormBuilder,
    private pnotify: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private localeService: BsLocaleService,
    private titleService: TitleService,
    private atividadesService: AtividadesService,
    private contatoService: ComercialAknaContatosService,
    private routerService: RouterService,
    private dateService: DateService,
    private route: Router
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );
  }

  ngOnInit(): void {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.setFormBuilder();
    this.onActivatedRoute();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb(): void {
    this.appTitle = 'Cadastro';
    const id = this.activatedRoute.snapshot.params.idSubModulo;
    this.titleService.setTitle(this.appTitle);
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: '/postContatos/home',
      },
      {
        descricao: 'Akna',
        routerLink: `/comercial/akna/${id}`,
      },
      {
        descricao: 'Contatos',
        routerLink: `../`,
      },
      {
        descricao: this.appTitle,
      },
    ];
  }

  onActivatedRoute() {
    const params = this.activatedRoute.snapshot.params;
    if (params.hasOwnProperty('id')) {
      this.idLista = params.id;
    }
  }

  //formulario
  setFormBuilder(): void {
    this.form = this.formBuilder.group({
      ID: [null],
      DESCRICAO: [null, [Validators.required]],
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

  onFilter() {
    this.contatoService.onEventFilter();
  }

  postContatos() {
    this.loadingNavBar = true;

    this.contatoService
      .postContatos(this.form.value)
      .pipe(
        finalize(() => {
          this.loadingNavBar = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.status === 200) {
            this.pnotify.success();
            this.router.navigate(['../'], {
              relativeTo: this.activatedRoute,
            });
          } else {
            this.pnotify.error();
          }
        },
        error: (error: any) => {
          this.pnotify.error();
        }
      });
  }

  getParams() {
    let _params = {};
    let _obj = this.form.value;

    for (let prop in _obj) {
      if (_obj[prop]) {
        if (_obj[prop] instanceof Date)
          _params[prop] = this.dateService.convertToUrlDate(_obj[prop]);
        else _params[prop] = _obj[prop];
      }
    }

    return _params;
  }
}
