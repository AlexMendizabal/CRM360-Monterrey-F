import { LogisticaYmsTiposCircuitoService } from './../../tipos-circuito/services/tipos-circuito.service';
import { ILogisticaYmsTiposCircuito } from './../../tipos-circuito/models/tipos-circuito';
import { ILogisticaFiliais } from './../../../cadastros/filiais/models/filiais';
import { LogisticaFiliaisService } from './../../../cadastros/filiais/services/filiais.service';
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
  FormControl,
  FormArray,
} from '@angular/forms';
//rxjs
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LogisticaYmsCircuitosService } from '../services/circuitos.service';
//interfaces
import { ILogisticaYmsCircuitos } from '../models/circuitos';
import { isNull } from 'util';

@Component({
  selector: 'logistica-yms-circuitos-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss'],
})
export class LogisticaYmsCircuitosCadastroComponent
  implements OnInit {
  noResult: boolean;
  $activatedRouteSubscription: Subscription;
  breadCrumbTree: Array<any> = [];
  form: FormGroup;
  appTitle: string;
  modalRef: BsModalRef;
  formData: Array<FormData> = [];
  bsConfig: Partial<BsDatepickerConfig>;
  filiais: Array<ILogisticaFiliais>;
  tiposCircuito: Array<ILogisticaYmsTiposCircuito>;
  //loading
  disabledForm = false;
  loading = false;
  loadingNavBar = false;
  loadingFiliais:boolean;
  loadingTiposCircuito:boolean;


  constructor(
    private formBuilder: FormBuilder,
    private pnotify: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private localeService: BsLocaleService,
    private circuitosService: LogisticaYmsCircuitosService,
    private titleService: TitleService,
    private atividadesService: AtividadesService,
    private filiaisService: LogisticaFiliaisService,
    private tiposCircuitoService: LogisticaYmsTiposCircuitoService
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
    this.getFiliais();
    this.getTiposCircuito();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  onActivatedRoute() {
    const _params = this.activatedRoute.snapshot.params;
    if (_params.hasOwnProperty('id'))
    return this.getCircuito(_params['id']); 
  }

  getFiliais(){
    this.loadingFiliais = true;
    this.filiaisService
    .getFiliais({ IN_STAT: '1', IN_PAGI: '0', IN_YMS: 1 })
    .pipe(
      finalize(() => {
        this.loadingFiliais = false;
      })
    )
    .subscribe(
      (response) => {
        if (response.status === 200) {
          this.filiais = response.body['data']
        } else {
          this.filiais = [];
          this.pnotify.notice('Nenhuma filial encontrada!')
        }
      },
      (error) => {
        const message = error.error.message
        message ? this.pnotify.error(message): this.pnotify.error();
      }
    );
  }

  getTiposCircuito(){
    this.loadingTiposCircuito = true;
    this.tiposCircuitoService
    .getTiposCircuito({ IN_STAT: '1', IN_PAGI: '0' })
    .pipe(
      finalize(() => {
        this.loadingTiposCircuito = false;
      })
    )
    .subscribe(
      (response) => {
        if (response.status === 200) {
          this.tiposCircuito = response.body['data']
        } else {
          this.tiposCircuito = [];
          this.pnotify.notice('Nenhuma filial encontrada!')
        }
      },
      (error) => {
        const message = error.error.message
        message ? this.pnotify.error(message): this.pnotify.error();
      }
    );
  }


  getCircuito(id: number) {
    this.loading = true;
    this.circuitosService
      .getCircuito(id)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            const data : ILogisticaYmsCircuitos = response.body['data'][0]
            this.form.patchValue(data);
            this.noResult = false;
          } else {
            this.noResult = true;
          }
        },
        (error) => {
          const message = error.error.message
          message ? this.pnotify.error(message): this.pnotify.error();
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
        descricao: 'YMS',
        routerLink: `/logistica/yms/${id}`,
      },
      {
        descricao: 'Circuitos',
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
      UUID_LOGI_YMS_CIRC: [null],
      UUID_LOGI_FILI: [null, [Validators.required]],
      NM_FILI:[null],
      NM_CIRC: [null, [Validators.required]],
      UUID_LOGI_YMS_CIRC_TIPO: [null, [Validators.required]],
      NM_CIRC_TIPO: [null],
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

  postCircuitos() {
    this.loadingNavBar = true;
    this.circuitosService
      .postCircuitos(this.form.value)
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
        (error) => {
          const message = error.error.message
          message ? this.pnotify.error(message): this.pnotify.error();
        }
      );
  }
  
}
