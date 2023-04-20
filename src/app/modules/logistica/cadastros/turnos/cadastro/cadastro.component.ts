import { DateService } from 'src/app/shared/services/core/date.service';
//Services
import { TitleService } from 'src/app/shared/services/core/title.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
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
  FormControl
} from '@angular/forms';
//rxjs
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LogisticaTurnosService } from '../services/turnos.service';
//interfaces
import { ILogisticaTurnos } from '../models/turnos';
import { isNull } from 'util';

@Component({
  selector: 'logistica--turnos-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss'],
})
export class LogisticaTurnosCadastroComponent
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


  constructor(
    private dateService: DateService,
    private formBuilder: FormBuilder,
    private pnotify: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private localeService: BsLocaleService,
    private turnosService: LogisticaTurnosService,
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
    if (_params.hasOwnProperty('id')){
      this.getTurno(_params['id']);
      return
    }
  }


  getTurno(id?: string) {
    this.loading = true;
    this.turnosService
      .getTurno(id)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.form.patchValue(response.body['data'])
            console.log(this.form.value)
            this.noResult = false;
          } else {
            this.noResult = true;
          }
        },
        (error: any) => {
          this.noResult=true;
          const message = error.error.message
          message ? this.pnotify.error(message): this.pnotify.error();
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
        descricao: 'Cadastro',
        routerLink: `/logistica/cadastros/${id}`,
      },
      {
        descricao: 'Turnos',
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
      UUID_LOGI_TURN: [null],
      HR_INIC: [null, [Validators.required]],
      HR_FINA: [null, [Validators.required]],
      DS_TURN: [null, [Validators.required]],
      IN_STAT: [null],
      IN_SEGU: [false],
      IN_TERC: [false],
      IN_QUAR: [false],
      IN_QUIN: [false],
      IN_SEXT: [false],
      IN_SABA: [false],
      IN_DOMI: [false],
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

  postTurnos() {
    const _params = this.form.value;
    _params.HR_INIC = this.dateService.convert2PhpDate(this.form.get('HR_INIC').value)
    _params.HR_FINA = this.dateService.convert2PhpDate(this.form.get('HR_FINA').value)
    console.log(_params)
    this.loadingNavBar = true;
    this.turnosService
      .postTurnos(_params)
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
          const message = error.error.message
          message ? this.pnotify.error(message): this.pnotify.error();
        }
      );
  }

  onDias(dia){
    const valor = this.form.get(dia).value;
    valor == true ? false : true;
    this.form.get(dia).setValue(valor)
  }


  
}
