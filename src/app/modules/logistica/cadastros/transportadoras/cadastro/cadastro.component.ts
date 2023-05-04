import { RouterService } from 'src/app/shared/services/core/router.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { BsLocaleService, BsDatepickerConfig } from 'ngx-bootstrap';
import { finalize } from 'rxjs/operators';

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
import { ILogisticaTransportadora } from '../models/transportadora';

//rxjs
import { Subscription } from 'rxjs';

import { LogisticaTransportadorasService } from '../services/transportadoras.service';

@Component({
  selector: 'logistica-transportadoras-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss']
})
export class LogisticaTransportadorasCadastroComponent implements OnInit {

  noResult: boolean;
  loading = false;
  loadingNavBar = false;
  breadCrumbTree: Array<any> = [];
  form: FormGroup;
  appTitle: string;
  bsConfig: Partial<BsDatepickerConfig>;

  transportadoras: Array<ILogisticaTransportadora>;
  $activatedRouteSubscription: Subscription;

  loadingTipoVeiculo: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private pnotify: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private routerService: RouterService,
    private titleService: TitleService,
    private atividadesService: AtividadesService,
    private localeService: BsLocaleService,
    private transportadoraService: LogisticaTransportadorasService
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
        descricao: 'Transportadoras',
        routerLink: `../`,
      },
      {
        descricao: this.appTitle,
      },
    ];
  }

  //Consumir informações que estão na rota para editar
  ngOnDestroy() {
    //this.$activatedRouteSubscription.unsubscribe();
  }

  onActivatedRoute() {
    
    const id = this.activatedRoute.snapshot.params?.id;

    if(id){
      this.getTransportadora(id)
      return
    }

    this.loading = false;


    /* this.$activatedRouteSubscription = this.activatedRoute.queryParams.subscribe(
      (response) => {
        const _response = this.routerService.getBase64UrlParams(response);
        this.form.patchValue(_response);
      }
    ); */
  }

  //formulario
  setFormBuilder(): void {
    this.form = this.formBuilder.group({
      ID_LOGI_TRAN: [null],
      NR_CNPJ: [null, [Validators.required]],
      NM_FANT: [null, [Validators.required]],
      NM_RAZA_SOCI: [null, [Validators.required]],
      DS_OBSE: [null],
      IN_STAT: ['1'],
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

  postTransportadora() {
    this.loadingNavBar = true;
    this.transportadoraService
      .postTransportadora(this.form.value)
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
            this.router.navigate(['./../'], {
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

  getTransportadora(id){
    
    this.transportadoraService
      .getTransportadora(id)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(
        (response: any) => {
          if (response.status === 200) {
           this.form.patchValue(response.body['data']);
          } else {
            this.pnotify.notice('Transportadora no localizado.');
            this.router.navigate(['./../'], {
              relativeTo: this.activatedRoute,
            });
          }
        },
        (error: any) => {
          this.pnotify.error();
        }
      );
  }

}
