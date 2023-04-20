//Services
import { LogisticaYmsTiposEtapaService } from './../../tipos-etapa/services/tipos-etapa.service';
import { LogisticaYmsSetoresService } from './../../setores/services/setores.service';
import { ILogisticaYmsSetores } from './../../setores/models/setores';
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
} from '@angular/forms';
//rxjs
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LogisticaYmsEtapasService } from '../services/etapas.service';
//interfaces
import { ILogisticaYmsEtapas } from '../models/etapas';
import { isNull } from 'util';
import { ILogisticaYmsCircuitos } from '../../circuitos/models/circuitos';
import { ILogisticaYmsTiposEtapa } from '../../tipos-etapa/models/tipos-etapa';

@Component({
  selector: 'logistica-yms-etapas-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss'],
})
export class LogisticaYmsEtapasCadastroComponent
  implements OnInit {
  noResult: boolean;
  $activatedRouteSubscription: Subscription;
  breadCrumbTree: Array<any> = [];
  form: FormGroup;
  appTitle: string;
  modalRef: BsModalRef;
  formData: Array<FormData> = [];
  bsConfig: Partial<BsDatepickerConfig>;
  tiposEtapa: Array<ILogisticaYmsTiposEtapa>;
  setores: Array<ILogisticaYmsSetores>;

  //loading
  disabledForm = false;
  loading = false;
  loadingNavBar = false;
  loadingTiposEtapa:boolean;
  loadingSetores:boolean;

  tipos = [
    {
      cod: 'fixa',
      nome: 'Fixa',
    },
    {
      cod: 'variavel',
      nome: 'Variável',
    },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private pnotify: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private localeService: BsLocaleService,
    private etapasService: LogisticaYmsEtapasService,
    private titleService: TitleService,
    private atividadesService: AtividadesService,
    private tiposEtapaService: LogisticaYmsTiposEtapaService,
    private setoresService: LogisticaYmsSetoresService,
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
    this.getTiposEtapa();
    this.getSetores();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  onActivatedRoute() {
    const _params = this.activatedRoute.snapshot.params;
    if (_params.hasOwnProperty('id'))
    return this.getEtapa(_params['id']); 
  }

  getTiposEtapa(params?: Partial<ILogisticaYmsCircuitos>) {
    const _params = params ?? {};
    _params.IN_STAT = 1;
    _params.IN_PAGI = 0;
    this.loadingTiposEtapa = true;
    this.tiposEtapaService
      .getTiposEtapa(_params)
      .pipe(
        finalize(() => {
          this.loadingTiposEtapa = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.tiposEtapa = response.body['data'];
        }else{
          this.tiposEtapa = [];
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

  getSetores(params?: Partial<ILogisticaYmsSetores>) {
    const _params = params ?? {};
    _params.IN_STAT = 1;
    _params.IN_PAGI = 0;
    this.loadingSetores = true;
    this.setoresService
      .getSetores(_params)
      .pipe(
        finalize(() => {
          this.loadingSetores = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.setores = response.body['data'];
        }else{
          this.setores = []
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


  getEtapa(id: number) {
    this.loading = true;
    this.etapasService
      .getEtapa(id)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            const data : ILogisticaYmsEtapas = response.body['data'][0]
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
        descricao: 'Etapas',
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
      UUID_LOGI_YMS_ETAP: [null],
      NM_ETAP: [null, [Validators.required]],
      SG_ETAP: [null, [Validators.required]],
      UUID_LOGI_YMS_ETAP_TIPO:[null, [Validators.required]],
      NM_ETAP_TIPO:[null],
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

  postEtapas() {
    this.loadingNavBar = true;
    this.etapasService
      .postEtapas(this.form.value)
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
