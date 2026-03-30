import { RouterService } from 'src/app/shared/services/core/router.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap';
import { finalize } from 'rxjs/operators';

import { LogisticaTipoVeiculoService } from '../services/tipo-veiculo.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  AbstractControl,
  Validators,
  FormControl,
} from '@angular/forms';
//interfaces
import { ILogisticaTipoVeiculo } from './../models/tipo-veiculo';
import { Subscription } from 'rxjs';

@Component({
  selector: 'logistica-tipo-veiculos-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss'],
})
export class LogisticaTipoVeiculoCadastroComponent
  implements OnInit, OnDestroy {
  noResult: boolean;
  loading = false;
  loadingNavBar = false;
  breadCrumbTree: Array<any> = [];
  form: FormGroup;
  appTitle: string;
  bsConfig: Partial<BsDatepickerConfig>;

  tipoVeiculos: Array<ILogisticaTipoVeiculo>;
  $activatedRouteSubscription: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private pnotify: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private routerService: RouterService,
    private titleService: TitleService,
    private atividadesService: AtividadesService,
    private localeService: BsLocaleService,
    private tipoVeiculoService: LogisticaTipoVeiculoService
  ) {}

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
    this.appTitle = 'Prontuário';
    const id = this.activatedRoute.snapshot.params.idSubModulo;
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
        descricao: 'Tipo de Vehículo',
        routerLink: `../`,
      },
      {
        descricao: this.appTitle,
      },
    ];
  }

  //Consumir informações que estão na rota para editar
  ngOnDestroy() {
    this.$activatedRouteSubscription.unsubscribe();
  }

  onActivatedRoute() {
    this.$activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (response) => {
        const _response = this.routerService.getBase64UrlParams(response);
        this.form.patchValue(_response);
      }
    );
  }

  //formulario
  setFormBuilder(): void {
    this.form = this.formBuilder.group({
      ID_LOGI_VEIC_TIPO: [null],
      NM_VEIC_TIPO: [null, [Validators.required]],
      TT_CAPA: [0],
      IN_STAT: ['1'],
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

  postTipoVeiculo() {
    this.loadingNavBar = true;
    this.tipoVeiculoService
      .postTipoVeiculo(this.form.value)
      .pipe(
        finalize(() => {
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response: any) => {
          if (response.status === 200) {
            this.form.reset();
            this.pnotify.success();
            this.router.navigate(['../'], {
              relativeTo: this.activatedRoute,
            });
          } else {
            this.pnotify.error();
          }
        },
        (error: any) => {
          this.pnotify.error();
        }
      );
  }
}
