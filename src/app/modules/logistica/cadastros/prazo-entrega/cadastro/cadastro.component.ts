import { LogisticaRegioesEntregaService } from './../../regioes-entrega/services/regioes-entrega.service';
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

import { Subscription } from 'rxjs';
import { ILogisticaPrazoEntrega } from '../models/ILogisticaPrazoEntrega';
import { LogisticaPrazoEntregaService } from '../services/prazo-entrega.service';
import { ILogisticaRegiaoEntrega } from '../../regioes-entrega/models/ILogisticaRegiaoEntrega';

@Component({
  selector: 'logistica-prazo-entrega-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss']
})
export class LogisticaPrazoEntregaCadastroComponent implements OnInit {

  noResult: boolean;
  loading = false;
  loadingNavBar = false;
  breadCrumbTree: Array<any> = [];
  form: FormGroup;
  appTitle: string;
  bsConfig: Partial<BsDatepickerConfig>;

  prazoEntrega: ILogisticaPrazoEntrega;
  regioesEntrega: Array<ILogisticaRegiaoEntrega> = [];
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
    private service: LogisticaPrazoEntregaService,
    private regioesEntregaService: LogisticaRegioesEntregaService
  ) {}

  ngOnInit(): void {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.setFormBuilder();
    this.onActivatedRoute();
    this.getRegioesEntrega();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb(): void {
    this.appTitle = 'Registrarse';
    const id = this.activatedRoute.snapshot.params.idSubModulo;
    this.titleService.setTitle(this.appTitle);
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: '/logistica/home',
      },
      {
        descricao: 'Registrarse',
        routerLink: `/logistica/cadastros/${id}`,
      },
      {
        descricao: 'Plazos de Entrega',
        routerLink: `../`,
      },
      {
        descricao: this.appTitle,
      },
    ];
  }

  //Consumir informações que estão na rota para editar
  ngOnDestroy() {
  }

  onActivatedRoute() {
    const id = this.activatedRoute.snapshot.params?.id;
    if(id){
      this.getPrazoEntrega(id)
    }
  }

  getPrazoEntrega(id){
    this.loading = true;
    this.service
      .getPrazoEntrega(id)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(
        response => {
          if(response.status != 200){
            this.pnotify.error();
            return
          }

          this.form.patchValue(response.body['data']);
        },
        error => {
          const message = error?.error?.message;
          message ? this.pnotify.error(message) : this.pnotify.error();
        }
      )
  }

  getRegioesEntrega(){

    let params = {IN_STAT: '1', IN_PAGI: '0'};

    this.regioesEntregaService
      .getRegioesEntrega(params)
      .pipe()
      .subscribe(
        response => {
          if(response.status != 200){
            this.pnotify.error();
            return
          }

          this.regioesEntrega = response.body['data'];
        },
        error => {
          const message = error?.error?.message;
          message ? this.pnotify.error(message) : this.pnotify.error();
        }
      )
  }

  //formulario
  setFormBuilder(): void {
    this.form = this.formBuilder.group({
      UUUID: [null],
      UUID_LOGI_REGI_ENTR: [null, [Validators.required]],
      CD_FILI: [null, [Validators.required]],
      TT_PRZO: [null, [Validators.required]],
      IN_STAT: ['1', [Validators.required]],
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

  postPrazoEntrega() {
    this.loadingNavBar = true;
    this.service
      .postPrazoEntrega(this.form.value)
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
          const message = error?.error?.message;
          message ? this.pnotify.error(message) : this.pnotify.error();
        }
      );
  }

}
