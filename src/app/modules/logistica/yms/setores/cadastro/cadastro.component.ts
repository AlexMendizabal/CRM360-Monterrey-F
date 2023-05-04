import { IconesFontAwesomeService } from 'src/app/shared/services/core/icons-fonts-awesome.service';
import { DateService } from 'src/app/shared/services/core/date.service';
import { LogisticaYmsTurnosService } from './../../turnos/services/turnos.service';
import { ILogisticaYmsTurnos } from './../../turnos/models/turnos';
import { LogisticaFiliaisService } from './../../../cadastros/filiais/services/filiais.service';
import { ILogisticaFiliais } from './../../../cadastros/filiais/models/filiais';
import { ILogisticaYmsTiposCircuito } from './../../tipos-circuito/models/tipos-circuito';
import { LogisticaYmsTiposCircuitoService } from './../../tipos-circuito/services/tipos-circuito.service';
import { FormArray } from '@angular/forms';
import { ILogisticaYmsTiposSetor } from './../../tipos-setor/models/tipos-setor';
import { LogisticaYmsTiposSetorService } from './../../tipos-setor/services/tipos-setor.service';
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
} from '@angular/forms';
//rxjs
import { Subscription, forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LogisticaYmsSetoresService } from '../services/setores.service';
//interfaces
import { ILogisticaYmsSetores } from '../models/setores';
import { isNull } from 'util';
import { elasticIn } from '@amcharts/amcharts4/.internal/core/utils/Ease';

@Component({
  selector: 'logistica-yms-setores-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss'],
})
export class LogisticaYmsSetoresCadastroComponent
  implements OnInit {
  noResult: boolean;
  $activatedRouteSubscription: Subscription;
  breadCrumbTree: Array<any> = [];
  form: FormGroup;
  appTitle: string;
  modalRef: BsModalRef;
  icone: string;
  icones: Array<any>;
  formData: Array<FormData> = [];
  bsConfig: Partial<BsDatepickerConfig>;
  filiais: Array<ILogisticaFiliais>;
  turnos: Array<ILogisticaYmsTurnos>;
  tiposSetor: Array<ILogisticaYmsTiposSetor>;
  tiposCircuito:Array<ILogisticaYmsTiposCircuito>;

  //loading
  disabledForm = false;
  loading = false;
  loadingNavBar = false;
  loadingFiliais: boolean;
  loadingIcones: boolean;
  loadingTurnos: boolean;
  loadingTiposSetor: boolean;
  loadingTiposCircuito: boolean;
  loadingTiposCircuitoSetor: boolean;

  tipos = [
    {
      nome: 'FIXO',
      cod: 'FIXO',
    },
    { 
      nome: 'VARIÁVEL',
      cod: 'VARIAVEL',
    },
  ];


  constructor(
    private dateService: DateService,
    private formBuilder: FormBuilder,
    private pnotify: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private localeService: BsLocaleService,
    private filiaisService: LogisticaFiliaisService,
    private setoresService: LogisticaYmsSetoresService,
    private foawService: IconesFontAwesomeService,
    private tiposSetorService: LogisticaYmsTiposSetorService,
    private tiposCircuitoService: LogisticaYmsTiposCircuitoService,
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
    this.getTiposSetor();
    this.getTiposCircuito()
    this.getFiliais();
    this.getIcones();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  onActivatedRoute() {
    const _params = this.activatedRoute.snapshot.params;
    if (_params.hasOwnProperty('id')) {
      this.getSetor(_params['id']);
      this.getIntervalos({ UUID_LOGI_YMS_SETO: _params['id'], IN_STAT:'1' });
    } else { 
      this.onAddIntervalos();
    } 
  }

  getIntervalos(params?) {
    this.loadingNavBar = true;
    this.loadingTiposCircuitoSetor = true
    this.setoresService
      .getIntervalos(params)
      .pipe(
        finalize(() => {
          this.loadingNavBar = false;
          this.loadingTiposCircuitoSetor = false
        })
      )
      .subscribe(async (response) => {
        if (response.status !== 200) {
          return;
        }
        const intervalos = response['body']['data'];
        const promise = () => intervalos.forEach(() => this.onAddIntervalos());
        await Promise.resolve(promise());
        this.form.get('intervalos').patchValue(intervalos)
         
      },
      (error) => {
        this.pnotify.error('Não foi encontrado nenhum material');
      }
    );
  }

  getTiposCircuito() {
    this.loadingTiposCircuito = true;
    this.tiposCircuitoService
      .getTiposCircuito({ IN_STAT: '1', IN_PAGI: '0' })
      .pipe(
        finalize(() => {
          this.loadingTiposCircuito = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.tiposCircuito = response.body['data'];
        }else{
          this.tiposCircuito = [];
          this.pnotify.notice('Nenhum tipo de circuito encontrado!')
        }
      }),
      (error: any) => {
        const message = error.error.message
        message ? this.pnotify.error(message): this.pnotify.error();
      }
  }

  getTiposSetor() {
    this.loadingTiposSetor = true;
    this.tiposSetorService
      .getTiposSetor({ IN_STAT: '1', IN_PAGI: '0' })
      .pipe(
        finalize(() => {
          this.loadingTiposSetor = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.tiposSetor = response.body['data'];
        }else{
          this.tiposSetor = [];
          this.pnotify.notice('Nenhum tipo de setor encontrado!')
        }
      },
      (error: any) => {
        const message = error.error.message
        message ? this.pnotify.error(message): this.pnotify.error();
      }
    );
  }

  getSetor(id: string) {
    this.loading = true;
    this.setoresService
      .getSetor(id)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            const data : Partial<ILogisticaYmsSetores> = response.body['data']
            this.form.patchValue(data)
            this.noResult = false;
          } else {
            this.noResult = true;
          }
        },
        (error: any) => {
          this.noResult = true;
          const message = error.error.message
          message ? this.pnotify.error(message): this.pnotify.error();
        }
      );
  }
  
  getFiliais() {
    this.loadingFiliais = true;
    this.filiaisService
      .getFiliais({ IN_STAT: '1', IN_PAGI: '0', IN_YMS: 1 })
      .pipe(
        finalize(() => {
          this.loadingFiliais = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.filiais = response.body['data'];
        }else{
          this.filiais = [];
          this.pnotify.notice('Nenhuma filial encontrada!')
        }
      }),
      (error: any) => {
        const message = error.error.message
        message ? this.pnotify.error(message): this.pnotify.error();
      }
  }


  get formIntervalos() {
    return this.form.get('intervalos') as FormArray;
  }

  onAddIntervalos() {
    this.formIntervalos.push(
      this.formBuilder.group({
        UUID_LOGI_YMS_SETO: [null],
        UUID_LOGI_YMS_CIRC_TIPO: [null, [Validators.required]],
        TP_INTV: [null, [Validators.required]],
        HR_INTV: [null, [Validators.required]],
      })
    );
  }

  onDeleteTipoCircuito(index: number) {
    if (this.formIntervalos.length === 1) {
      this.pnotify.notice('Informe ao menos um tipo de circuito.');
      return
    }
    const id = this.form.get('UUID_LOGI_YMS_SETO').value
    let intervalos = this.formIntervalos.at(index).value;
    intervalos.UUID_LOGI_YMS_SETO = id,
    intervalos = {...intervalos,'IN_STAT':'0'}
    if(!intervalos['UUID_LOGI_YMS_CIRC_TIPO']){
      this.formIntervalos.removeAt(index);
      return;
    }
    this.loadingNavBar= true;
    this.setoresService
      .postIntervalos(intervalos)
        .pipe(
          finalize(() => {
            this.loadingNavBar= false;
          })
        )
        .subscribe(
          (response) => {
            if (response.status === 200) {
              this.formIntervalos.removeAt(index);
              this.pnotify.success();
            } else {
              this.pnotify.error();
            }
          },
          (error) => {
            this.pnotify.error();
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
        descricao: 'Setores',
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
      UUID_LOGI_YMS_SETO: [null],
      NM_SETO: [null, [Validators.required]],
      UUID_LOGI_YMS_SETO_TIPO: [null, [Validators.required]],
      UUID_LOGI_FILI: [null, [Validators.required]],
      IN_STAT: [null],
      DS_OBSE: [null],
      DS_ICON: [null, [Validators.required]],
      intervalos: this.formBuilder.array([]),
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

  postSetores() {
    let params = this.form.value;
    delete params['intervalos']
    this.loadingNavBar = true;
    this.setoresService
      .postSetores(params)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response: any) => {
          if (response.status === 200) {
            const id = response.body['data'];
            this.form.get('UUID_LOGI_YMS_SETO').setValue(id);
            if(this.form.get('intervalos').value[0]['UUID_LOGI_YMS_CIRC_TIPO']){
              this.postIntervalos(id);
            }
            this.pnotify.success();
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

  async postIntervalos(id:number){
    let request = [];
    const tpCircuitos = this.formIntervalos.value;
    if (!tpCircuitos){
      this.router.navigate(['../'], {
        relativeTo: this.activatedRoute,
      });
      return
    }

    const promise = () => {
      tpCircuitos.forEach(el => {
        if (el.HR_INTV instanceof Date){
          el.HR_INTV = this.dateService.convert2PhpDate(el.HR_INTV);
        }
        const params = {...el,'UUID_LOGI_YMS_SETO':id}
        request.push(this.setoresService
          .postIntervalos(params)
      )});
    }
    await Promise.resolve(promise());
    forkJoin(request)
    .pipe(
      finalize(() => {
        this.loading = false;
        this.loadingNavBar = false;
      })
    )
    .subscribe(
      (responses: Array<any>) => {
        this.pnotify.success('Intervalos cadastrados com sucesso');
        this.router.navigate(['../'], {
          relativeTo: this.activatedRoute,
        });
      },
      (error: any) => {
        const message = error.error.message
        message ? this.pnotify.error(message): this.pnotify.error();
      }
    )
  }

  
  onNestedFieldError(formGroup: string, index: number, field: string) {
    if (this.onNestedFieldInvalid(formGroup, index, field)) {
      return 'is-invalid';
    }

    return '';
  }

  onNestedFieldInvalid(formGroup: string, index: number, field: any) {
    let nestedForm: any = this.form.controls[formGroup];
    field = nestedForm.controls[index].get(field);

    return field.status == 'INVALID' && field.touched;
  }

  onNestedFieldRequired(formGroup: string, index: number, field: string) {
    let required = false;
    let formControl = new FormControl();
    let nestedForm: any = this.form.controls[formGroup];

    if (nestedForm.controls[index].get(field).validator) {
      let validationResult = nestedForm.controls[index]
        .get(field)
        .validator(formControl);
      required =
        validationResult !== null && validationResult.required === true;
    }

    if (required) {
      return 'is-required';
    }
  }

  getIcones() {
    this.loadingIcones = true;
    this.foawService.getIcones().pipe(
      finalize(() => {
        this.loadingIcones = false;
      })
    ).subscribe(response => {
      if (response.status === 200) {
        this.icones = response.body['icones'];
      }
    });
  }

  onIconSelected(event) {
    this.icone = event.classe;
  }
   
}
