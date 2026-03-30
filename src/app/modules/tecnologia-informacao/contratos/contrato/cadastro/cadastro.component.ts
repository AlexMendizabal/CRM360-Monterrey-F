import { Observable } from 'rxjs';
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
import { TecnologiaInformacaoCadastroModeloService } from './../../modelo/services/modelo.service';
import { TecnologiaInformacaoCadastroTipoContratoService } from './../../tipo-contrato/services/tipo-contrato.service';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { TitleService } from 'src/app/shared/services/core/title.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { TecnologiaInformacaoCadastroContratoService } from '../services/contrato.service';
import { MoedasService } from 'src/app/shared/services/requests/moedas.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';

//Bootstrap
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap';

//interfaces
import { ITecnologiaInformacaoModelo } from './../../modelo/models/modelo';
import { ITenconologiaInformacaoDocumento } from './../models/documento';
import { ITecnologiaInformacaoTipoContrato } from './../../tipo-contrato/models/tipoContrato';
import { ITecnologiaInformacaoContrato } from './../models/contrato';

//rxjs
import { finalize, take, switchMap } from 'rxjs/operators';
import { Subscription, EMPTY, forkJoin } from 'rxjs';

import { MASKS } from 'ng-brazil';
import { IMoeda } from 'src/app/models/moeda';
import { fork } from 'child_process';

@Component({
  selector: 'tecnologia-informacao-cadastros-contrato-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss'],
})
export class TecnologiaInformacaoCadastrosContratoCadastroComponent
  implements OnInit {
  public MASKS = MASKS;
  noResult: boolean;
  $activatedRouteSubscription: Subscription;
  breadCrumbTree: Array<any> = [];
  form: FormGroup;
  appTitle: string;
  bsConfig: Partial<BsDatepickerConfig>;
  formData: Array<FormData> = [];
  prefixoMoeda: string = '';
  compararData = null;

  //loading
  loading = true;
  loadingTipoContrato: boolean;
  loadingFiliais: boolean;
  loadingIndices: boolean;
  loadingModelo: boolean;
  loadingMoeda = false;
  loadingNavBar = false;
  anexosLoaded: boolean = false;

  //Interfaces
  modelo: ITecnologiaInformacaoModelo[] = [];
  moedas: IMoeda[] = [];
  tipoContrato: ITecnologiaInformacaoTipoContrato[] = [];
  filiais = [];
  indices = [];
  documentos: Partial<ITenconologiaInformacaoDocumento>[] = [];
  contratos: Array<ITecnologiaInformacaoContrato>;

  constructor(
    private formBuilder: FormBuilder,
    private pnotify: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private moedasService: MoedasService,
    private localeService: BsLocaleService,
    private confirmModalService: ConfirmModalService,
    private titleService: TitleService,
    private atividadesService: AtividadesService,
    private contratoService: TecnologiaInformacaoCadastroContratoService,
    private tipoContratoService: TecnologiaInformacaoCadastroTipoContratoService,
    private modeloService: TecnologiaInformacaoCadastroModeloService
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
    this.getTipoContrato();
    this.getMoedas();
    this.getContratoPai();
    this.getEmpresas();
    this.getIndices();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  getTipoContrato(params?: Partial<ITecnologiaInformacaoTipoContrato>) {
    const _params = params ?? {};
    _params.IN_STAT = '1';
    this.loadingTipoContrato = true;
    this.tipoContratoService
      .getTipoContrato(_params)
      .pipe(
        finalize(() => {
          this.loadingTipoContrato = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.tipoContrato = response.body['data'];
          } else {
            this.tipoContrato = [];
          }
        },
        (error) => {
          this.tipoContrato = [];
        }
      );
  }

  getEmpresas() {
    this.loadingFiliais = true;
    this.contratoService
      .getEmpresas()
      .pipe(
        finalize(() => {
          this.loadingFiliais = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.filiais = response.body['data'];

            const params = this.activatedRoute.snapshot.params;

            if (!params.hasOwnProperty('id')) return;

            this.getEmpresasAssoc({ ID_TECN_INFO_CONT: params.id });
          } else {
            this.filiais = [];
          }
        },
        (error) => {
          this.pnotify.error('Erro ao carregar empresas');
          this.filiais = [];
        }
      );
  }

  getEmpresasAssoc(params?: Partial<ITecnologiaInformacaoContrato>) {
    this.contratoService.getEmpresasAssoc(params).subscribe((response) => {
      if (response.status === 200) {
        const empresas: Array<any> = response.body['data'];

        let filiaisId = [];

        empresas.map((empresa) => {
          const filial = this.filiais.filter((filial) => {
            return (
              filial['CD_EMPR'] == empresa['CD_EMPR'] &&
              filial['CD_FILI'] == empresa['CD_FILI']
            );
          });

          if (filial.length === 1) {
            filiaisId.push(filial[0]['RAW']);
          }
        });

        this.form.get('CD_EMPR').setValue(filiaisId);
      }
    });
  }
  getIndices(params?) {
    this.loadingIndices = true;
    this.contratoService
      .getIndices()
      .pipe(
        finalize(() => {
          this.loadingIndices = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.indices = response.body['data'];
          } else {
            this.indices = [];
          }
        },
        (error) => {
          this.indices = [];
          this.pnotify.error('Erro ao carregar indices');
        }
      );
  }

  getMoedas(params?) {
    this.loadingMoeda = true;
    this.moedasService
      .getMoedas()
      .pipe(
        finalize(() => {
          this.loadingMoeda = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.moedas = response.body['data'];
          }
        },
        (error) => {
          this.moedas = [];
          this.pnotify.error('Erro ao carregar moedas');
        }
      );
  }

  getModelo() {
    this.loadingModelo = true;
    this.modeloService
      .getModelo({ IN_STAT: '1' })
      .pipe(
        finalize(() => {
          this.loadingModelo = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.modelo = response.body['data'];
          } else {
            this.modelo = [];
          }
        },
        (error) => {
          this.pnotify.error('Erro ao carregar modelos');
          this.modelo = [];
        }
      );
  }

  getContrato(params?) {
    this.loading = true;
    this.contratoService.getContrato(params).subscribe(
      (response) => {
        if (response.status === 200) {
          this.loading = false;
          const _items: ITecnologiaInformacaoContrato =
            response.body['data'][0];
          _items.DT_INIC = new Date(_items.DT_INIC);
          _items.DT_VENC = new Date(_items.DT_VENC);
          _items.PRAZ_CANC = new Date(_items.PRAZ_CANC);
          this.form.patchValue(_items);
          this.setPrefixoMoeda(_items.PREF_MOED);
        }
        this.loading = false;
      },
      (error) => {
        this.pnotify.error('Erro ao carregar Contratos');
        this.pnotify.error();
      }
    );
  }

  getContratoPai(params?) {
    this.contratoService.getContrato(params).subscribe((response) => {
      if (response.status === 200) {
        this.contratos = response.body['data'];
      }
    });
  }

  getDocumentos(params?) {
    this.contratoService.getDocumento(params).subscribe(
      (response) => {
        if (response.status === 200) {
          this.documentos = response.body['data'];
        } else {
          this.documentos = [];
        }
      },
      (error) => {
        this.documentos = [];
      }
    );
  }

  postContrato() {
    this.loadingNavBar = true;
    let _contrato = JSON.parse(JSON.stringify(this.form.value));
    _contrato['IN_ITEM_COMP'] = _contrato['IN_ITEM_COMP'] ? '1' : '0';

    this.contratoService.postContrato(_contrato).subscribe(
      (response: any) => {
        if (response.status === 200) {
          const id = response.body['data'];
          this.form.get('ID_TECN_INFO_CONT').setValue(id);
          this.sendChilds();
        } else {
          this.pnotify.error();
        }
      },
      (error: any) => {
        this.loadingNavBar = false;
        if (error.error.hasOwnProperty('message'))
          this.pnotify.error(error.error.message);
        else this.pnotify.error();
      }
    );
  }

  sendChilds() {
    const documentos = this.postDocumentos(this.form.value);
    const empresas = this.postEmpresas(this.form.value);

    const requests = [...documentos, ...empresas];

    if (requests.length === 0) {
      this.loadingNavBar = false;
      this.form.reset();
      this.pnotify.success(`Registro salvo com sucesso`);
      this.router.navigate(['./../'], {
        relativeTo: this.activatedRoute,
      });
    }

    forkJoin(requests)
      .pipe(
        finalize(() => {
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (responses) => {
          let hasError = false;

          responses.forEach((response) => {
            if (response.status !== 200) {
              this.pnotify.error();
              hasError = true;
              this.loadingNavBar = false;
            }
          });

          if (!hasError) {
            this.loadingNavBar = false;
            this.form.reset();
            this.pnotify.success(`Registro salvo com sucesso`);
            this.router.navigate(['./../'], {
              relativeTo: this.activatedRoute,
            });
          }
        },
        (error) => {
          this.pnotify.error();
        }
      );
  }

  postDocumentos(
    params: ITecnologiaInformacaoContrato
  ): Array<Observable<any>> {
    let requests = [];

    if (this.formData.length === 0) {
      return requests;
    }

    const id = this.form.get('ID_TECN_INFO_CONT').value;

    this.formData.forEach((element, index) => {
      requests.push(this.contratoService.postDocumento(element, id));
    });

    return requests;
  }

  postEmpresas(params: ITecnologiaInformacaoContrato): Array<Observable<any>> {
    const empresasId: number[] = params.CD_EMPR;

    if (!empresasId) return [];

    const empresasFiltradas = this.filiais.filter((filial) =>
      empresasId.includes(filial['RAW'])
    );

    if (empresasFiltradas.length == 0) return [];

    const _params = {
      ID_TECN_INFO_CONT: params.ID_TECN_INFO_CONT,
      EMPR: empresasFiltradas,
    };

    return [this.contratoService.postEmpresas(_params)];
  }

  putDocumento(documento: ITenconologiaInformacaoDocumento) {
    const [type, title, message, cancelTxt, okTxt] = [
      'inactivate',
      'Confirmar inativação',
      'Deseja realmente prosseguir com a inativação do registro?',
      'Cancelar',
      'Confirmar',
    ];

    this.confirmModalService
      .showConfirm(type, title, message, cancelTxt, okTxt)
      .pipe(
        take(1),
        switchMap((result) => {
          if (!result) return EMPTY;

          this.loadingNavBar = true;

          return this.contratoService.putDocumento(documento);
        }),
        finalize(() => {
          this.loadingNavBar = false;
        })
      )
      .subscribe((response) => {
        this.pnotify.success('Anexos atualizado com sucesso');
        this.getDocumentos({
          ID_TECN_INFO_CONT: this.form.get('ID_TECN_INFO_CONT').value,
          IN_STAT: '1',
        });
      });
  }

  setBreadCrumb(): void {
    this.appTitle = 'Cadastro';
    const id = this.activatedRoute.snapshot.params.idSubModulo;
    this.titleService.setTitle(this.appTitle);
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: '/tecnologia-informacao/home',
      },
      {
        descricao: 'Contratos',
        routerLink: `/tecnologia-informacao/contratos/${id}`,
      },
      {
        descricao: 'Contratos',
        routerLink: `../`,
      },
      {
        descricao: this.appTitle,
      },
    ];
  }

  setPrefixoMoeda(prefixoMoeda?: string) {
    prefixoMoeda = prefixoMoeda ?? 'R$ ';

    if (prefixoMoeda.toString().slice(-1) === ' ') {
      this.prefixoMoeda = prefixoMoeda;
      return;
    }

    this.prefixoMoeda = prefixoMoeda.toString() + ' ';

    return;
  }

  //formulario
  setFormBuilder(): void {
    this.form = this.formBuilder.group({
      DS_CONT: [null, [Validators.required, Validators.maxLength(30)]],
      ID_TECN_INFO_CONT_REFE: [null],
      ID_TECN_INFO_CONT_TIPO: [null, [Validators.required]],
      ID_TECN_INFO_CONT: [null],
      VL_CONT: [null, [Validators.required]],
      IN_STAT: ['1', [Validators.required]],
      DS_OBSE: [null],
      DT_INIC: [null, [Validators.required]],
      DT_VENC: [null, [Validators.required]],
      DT_INCL: [null],
      MULT_CANC: [null],
      PRAZ_CANC: [null],
      ID_MOED: ['1'],
      IN_VL_VARI: [0, [Validators.required]],
      SG_MOED: [null],
      PREF_MOED: ['R$ '],
      IN_ITEM_COMP: [false],
      VL_ITEM_COMP: [null],
      CD_EMPR: [null],
      INTE_REAJ: [12],
      ID_INDI: [null],
    });
  }

  onActivatedRoute() {
    const _params = this.activatedRoute.snapshot.params;
    if (!_params.hasOwnProperty('id')) return;
    this.getContrato({ ID_TECN_INFO_CONT: _params.id });
    this.getDocumentos({ ID_TECN_INFO_CONT: _params['id'], IN_STAT: '1' });
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

  onRemove(documento: ITenconologiaInformacaoDocumento) {
    documento.IN_STAT = '0';
    this.putDocumento(documento);
  }

  appendFile(files: FileList) {
    if (files.length === 0) return;
    const fd = new FormData();
    fd.append('file', files[0]);
    this.formData.push(fd);
    this.documentos.push({ NM_DOCU: files[0]['name'] });
  }

  comparaData() {
    if (!this.form.get('DT_VENC').value) {
      return false;
    } else if (
      this.form.get('DT_INIC').value > this.form.get('DT_VENC').value
    ) {
      this.compararData = true;
      return this.compararData;
    }
  }
}
