import { ILogisticaYmsTiposSetor } from './../../tipos-setor/models/tipos-setor';
import { LogisticaYmsTiposSetorService } from './../../tipos-setor/services/tipos-setor.service';
//Services
import { TitleService } from 'src/app/shared/services/core/title.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { ConfirmModalService } from './../../../../../shared/modules/confirm-modal/confirm-modal.service';
import { LogisticaYmsSetoresService } from './../../setores/services/setores.service';
import { LogisticaYmsAssociacaoMateriaisService } from '../services/associacao-materiais.service';
//Bootstrap
import { utilsBr } from 'js-brasil';
import { BsDatepickerConfig, BsModalRef, BsLocaleService } from 'ngx-bootstrap';
//Angular
import { Component, OnInit} from '@angular/core';
import { CustomTableConfig } from './../../../../../shared/templates/custom-table/models/config';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
//rxjs
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
//interfaces
import { isNull } from 'util';
import { ILogisticaYmsSetores } from './../../setores/models/setores';
import { ILogisticaYmsAssociacaoMateriais } from '../models/associacao-materiais';

@Component({
  selector: 'logistica-associacao-materiais-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss'],
})
export class LogisticaYmsAssociacaoMateriaisCadastroComponent
  implements OnInit {
    $activatedRouteSubscription: Subscription;

    form: FormGroup;
    formMateriais: FormGroup;
    
    setores: Array<ILogisticaYmsSetores>;
    tiposSetor: Array<ILogisticaYmsTiposSetor>;
    materiais: Array<any> = [];
    materiaisLista: Array<any> = [];
    breadCrumbTree: Array<any> = [];
    materiaisAssociados: Array<any> = [];
    
    noResult: boolean;
    toggleAll = false;
    searching = false;
    noMateriais = true;
    firstSearch = false;
    showMateriais = true;
    disabledForm = false;
    materiaisListaEmpty = false;
    
    appTitle: string;
    modalRef: BsModalRef;
    bsConfig: Partial<BsDatepickerConfig>;

    //loading
    loading = false;
    loadingNavBar = false;
    loadingSetores: boolean;
    loadingTiposSetor: boolean;
    loadingConsulta = false;
    loadingMateriaisLista = false;
    
    tableConfigAssocMateriais: Partial<CustomTableConfig> = {
      fixedHeader: false,
      bodyHeight: 243,
      hover: false,
    };
    
    tableConfigMateriais: Partial<CustomTableConfig> = {
      fixedHeader: false,
      bodyHeight: 243,
    };
    
    /* Pagination */
    itemsPerPage = 10;
    totalItems = 10;
    currentPage = 1;
    begin = 0;
    end = 10;
    /* Pagination */
    
  constructor(
    private pnotify: PNotifyService,
    private formBuilder: FormBuilder,
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
    private localeService: BsLocaleService,
    private atividadesService: AtividadesService,
    private setoresService: LogisticaYmsSetoresService,
    private tiposSetorService: LogisticaYmsTiposSetorService,
    private confirmModalService: ConfirmModalService,
    private associacaoMateriaisService: LogisticaYmsAssociacaoMateriaisService,
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
    this.getSetores();
    this.getTiposSetor();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  onActivatedRoute() {
    const _params = this.activatedRoute.snapshot.params;
    if (_params?.id){
      this.getAssociacao(_params['id']);
      this.getSetor(_params['id'])
    }
  }

  consultaFilial(event){
    this.getAssociacao(event.UUID_LOGI_YMS_SETO)
    this.loadingConsulta = true;
  }

  getAssociacao(id :number) {
    this.associacaoMateriaisService
      .getAssociacaoMateriais({UUID_LOGI_YMS_SETO:id, IN_STAT: 1 })
      .pipe(
        finalize(() => {
          this.loadingNavBar = false;
          this.loadingConsulta = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.materiaisAssociados = response.body['data']
          } else {
            this.materiaisAssociados = [];
            this.noResult = true;
          }

          if (this.materiaisAssociados.length > 9) {
            this.tableConfigAssocMateriais.fixedHeader = true;
          }
        },
        (error) => {
          const message = error.error.message
          message ? this.pnotify.error(message): this.pnotify.error();
          this.noResult = true;
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
            this.form.patchValue(response.body['data'])
            this.noResult = false;
          } else {
            this.noResult = true;
          }
        },
        (error: any) => {
          try {
            this.pnotify.error(error.error.message);
            this.noResult = true;
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
          this.pnotify.notice('Nenhum registro encontrado!')
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
          this.pnotify.notice('Nenhum registro encontrado!')
        }
      },
      (error: any) => {
        try {
          this.pnotify.error(error.error.message);
          this.noResult = true;
        } catch (error) {
          this.pnotify.error();
        }
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
        routerLink: `/logistica/yms/${id}`,
      },
      {
        descricao: 'Materiais por Área',
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
      UUID_LOGI_YMS_AREA_MATE: [null],
      UUID_LOGI_YMS_SETO_TIPO: [null, [Validators.required]],
      UUID_LOGI_YMS_SETO: [null, [Validators.required]],
      NM_AREA: [null],
      IN_STAT: [null],
      DS_OBSE: [null],
      assocMateriais: this.formBuilder.array([]),
    });

    this.formMateriais = this.formBuilder.group({
      buscarPor: ['NM_MATE'],
      pesquisa: [null, Validators.required],
      UUID_REFE_ERP:[null],
      NM_MATE:[null],
      NM_CLAS:[null],
      NM_LINH:[null],
    });
  }

  onLimparAssociacoes(): void {
    this.confirmDelete().subscribe((response: boolean) =>
      response ? this.deleteAssociacoes(this.form.get('UUID_LOGI_YMS_SETO').value) : null
    );
  }


  deleteAssociacoes(params): void {
    this.associacaoMateriaisService.deleteAssociacoes({UUID_LOGI_YMS_SETO:params})
    .subscribe(
      (response) => {
        if (response.status === 200) {
          this.materiaisAssociados = [];
         this.pnotify.success(response.body['message'])
        } else {
          this.pnotify.error()
        }
      },
      (error) => {
        const message = error.error.message
        message ? this.pnotify.error(message): this.pnotify.error();
        this.noResult = true;
      }
    );
  }

  onDeleteMaterial(material): void {
    this.confirmDelete().subscribe((response: boolean) =>
      response ? this.deleteMaterial(material) : null
    );
  }

  confirmDelete(): any {
    return this.confirmModalService.showConfirm(
      'delete',
      'Confirmar exclusão',
      'Deseja realmente prosseguir com a exclusão do registro?',
      'Cancelar',
      'Confirmar'
    );
  }

  deleteMaterial(material) {
    if(!material){
      this.pnotify.notice('Nenhum usuário associado!')
      return;
    }
    material['IN_STAT'] = 0
    this.loadingNavBar= true;
    this.associacaoMateriaisService
      .postAssociacaoMateriais(material)
        .pipe(
          finalize(() => {
            this.loadingNavBar= false;
          })
        )
        .subscribe(
          (response) => {
            if (response.status === 200) {
              const materialId = material.UUID_MATE + '@' + material.UUID_LOGI_YMS_SETO
              this.materiaisAssociados = this.materiaisAssociados.filter(materialAssociado =>{
                const materialCorrenteId = materialAssociado.UUID_MATE + '@' + materialAssociado.UUID_LOGI_YMS_SETO
                return materialId != materialCorrenteId
              })
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

  getMateriais(params?) {
     if (this.formMateriais.valid) {
      this.loadingNavBar = true;
      this.searching = true;
      this.materiaisLista = [];
      this.loadingMateriaisLista = false;
      this.materiaisListaEmpty = false;

      const _params = params ?? {};
      _params. situacao = '1';
      _params. qtItensPagina = 100;
      const _obj = this.formMateriais.value;
      if (_obj['pesquisa']) _params[_obj['buscarPor']] = _obj['pesquisa'];
      this.associacaoMateriaisService
        .getMateriais(_params)
        .pipe(
          finalize(() => {
            this.firstSearch = true;
            this.searching = false;
            this.loadingNavBar = false;
            this.loadingMateriaisLista = true;
          })
        )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            console.log(response.body['result'])
            this.materiaisLista = response.body['result'].map(function (el: any) {
              let o = Object.assign({}, el)
              o.checked = 0;
              return o;
            });
            if (this.materiaisLista.length > 9) {
              this.tableConfigMateriais.fixedHeader = true;
            } else {
              this.tableConfigMateriais.fixedHeader = false;
            }
          } else if (
            response.hasOwnProperty('success') &&
            response.hasOwnProperty('mensagem')
          ) {
            this.pnotify.error();
            this.materiaisListaEmpty = true;
          } else {
            this.pnotify.error();
            this.materiaisListaEmpty = true;
          }
        },
        (error: any) => {
          const message = error.error.message
          message ? this.pnotify.error(message): this.pnotify.error();
        }
      );
    }
  }
 

  onAssociarMateriais(): void {

    this.toggleAll = false;

    this.materiaisLista.forEach(el => {
      if (el.checked === 1) {
        const material = {
          UUID_MATE: el.ID,
          ID_REFE_ERP: el.ID_REFE_ERP,
          NM_MATE: el.NM_MATE,
          UUID_LOGI_YMS_SETO: this.form.get('UUID_LOGI_YMS_SETO').value
        };
        this.onAddMaterial(material);
        el.checked = 0
      }
    })
  }

  onAddMaterial(material: any) {
    if (this.checkMaterialExists(this.materiaisAssociados, material) === true) {
      this.pnotify.notice('Material já está associado!');
      return;
    }
    
    if (this.materiaisAssociados.length > 9) {
      this.tableConfigAssocMateriais.fixedHeader = true;
    }

    this.postAssociacaoMateriais({...material,IN_STAT: 1})
  }

  checkMaterialExists(lista: Array<any>, material: any): boolean {
    return lista.some((materialAssociado: any) => {
      return ((materialAssociado.UUID_LOGI_YMS_SETO == material.UUID_LOGI_YMS_SETO) &&
      (materialAssociado.UUID_MATE == material.UUID_MATE))
    });
  }

  onToggleAll() {
    this.toggleAll = !this.toggleAll;
    this.materiaisLista.forEach(el => {
      el.checked = this.toggleAll === true ? 1 : 0;
    })
  }

  onCheckMaterial(index: number, material: any): void {
    this.materiaisLista[index].checked = material.checked == 0 ? 1 : 0;
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

  postAssociacaoMateriais(material){
    this.associacaoMateriaisService.postAssociacaoMateriais(material)
    .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingNavBar = false;
        })
      )
      .subscribe(
        (response) => {
          if(response.status === 200 ){
            this.materiaisAssociados = [...this.materiaisAssociados,material]
          } else{
            this.pnotify.error();
          }
        });
        (error: any) => {
          const message = error.error.message
          message ? this.pnotify.error(message): this.pnotify.error();
        }
  }
}
