//Services
import { TitleService } from 'src/app/shared/services/core/title.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { LogisticaEntradaMateriaisStatusRecebimentoService } from '../services/status-recebimento.service';

//Bootstrap
import { utilsBr } from 'js-brasil';
import { BsDatepickerConfig, BsModalRef, BsLocaleService } from 'ngx-bootstrap';

//Angular
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';

//rxjs
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

//interfaces
import { ILogisticaEntradaMateriaisStatusRecebimento } from '../models/statusRecebimento';

@Component({
  selector: 'logistica-entrada-materiais-notas-fiscais-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss'],
})
export class LogisticaEntradaMateriaisStatusRecebimentoCadastroComponent
  implements OnInit {
  noResult: boolean;
  $activatedRouteSubscription: Subscription;
  breadCrumbTree: Array<any> = [];
  form: FormGroup;
  appTitle: string;
  modalRef: BsModalRef;
  formData: Array<FormData> = [];
  bsConfig: Partial<BsDatepickerConfig>;
  disabledForm = false;

  //loading
  loading = false;
  loadingNavBar = false;

  //Interfaces
  statusRecebimento: Array<ILogisticaEntradaMateriaisStatusRecebimento> = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private pnotify: PNotifyService,
    private titleService: TitleService,
    private localeService: BsLocaleService,
    private activatedRoute: ActivatedRoute,
    private atividadesService: AtividadesService,
    private statusRecebimentoService: LogisticaEntradaMateriaisStatusRecebimentoService,
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
    if (_params.hasOwnProperty('id'))
    return this.getStatusRecebimento({ ID_LOGI_ENMA_NOFI_STAT: _params['id'] }); 
  }


  getStatusRecebimento(params?: Partial<ILogisticaEntradaMateriaisStatusRecebimento>) {
    this.loading = true;
    const _params = params ?? {};
    this.statusRecebimentoService
      .getStatusRecebimento(_params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.form.patchValue(response.body['data'][0]) 
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
    this.appTitle = 'Cadastro';
    this.titleService.setTitle(this.appTitle);
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: '/logistica/home',
      },
      {
        descricao: 'Entrada de Materiais',
        routerLink: `/logistica/entrada-materiais/${id}`,
      },
      {
        descricao: 'Status de Recebimento',
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
      ID_LOGI_ENMA_NOFI_STAT: [null],
      NM_STAT: [null, [Validators.required]],
      IN_STAT: [null],
      DS_OBSE: [null],
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

  postStatusRecebimento() {
    this.loadingNavBar = true;
    this.statusRecebimentoService
      .postStatusRecebimento(this.form.value)
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
