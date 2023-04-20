import { ILogisticaFiliais } from './../../../cadastros/filiais/models/filiais';
import { ILogisticaYmsTiposSetor } from './../../tipos-setor/models/tipos-setor';
import { LogisticaYmsTiposSetorService } from './../../tipos-setor/services/tipos-setor.service';
import { ILogisticaYmsSetores } from './../../setores/models/setores';
import { LogisticaYmsSetoresService } from './../../setores/services/setores.service';
import { ILogisticaYmsEtapas } from './../models/etapas';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
// angular
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

// services
import { LogisticaYmsEtapasService } from '../services/etapas.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';

// rxjs
import { finalize } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { LogisticaFiliaisService } from '../../../cadastros/filiais/services/filiais.service';

@Component({
  selector: 'logistica-etapas-associacao-setores',
  templateUrl: './associacao-setores.component.html',
  styleUrls: ['./associacao-setores.component.scss']
})
export class LogisticaYmsEtapasAssociacaoSetoresComponent implements OnInit {

  appTitle = "Associação Setores";

  form: FormGroup;
  formSetores: FormGroup;

  breadCrumbTree: any = [];
  idSubModulo: number;
  $subscription: Subscription;

  /*loading*/
  loading = false;
  loadingNavBar = false;
  noResult = true;
  loadingEtapas: boolean;
  loadingFiliais: boolean;
  /*loading*/
  filterSetores:Array<ILogisticaYmsSetores>;
  setores= [];
  filiais: Array<ILogisticaFiliais>;
  tiposSetor: Array<ILogisticaYmsTiposSetor>;
  setoresLoading = false;
  loadingSetores = false;
  loadingFilterSetores= false;
  loadingTiposSetor= false;
  etapas: Array<ILogisticaYmsEtapas>;

  setoresAssociados = [];
  setoresAssociadosLoading = false;

  tableConfigSetoresAssociados: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 243,
    hover: false,
  };
  
  tableConfigSetores: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 243,
  };

  toggle = {
    setores: false,
    setoresAssociados: false
  };

  constructor(
    private formBuilder: FormBuilder,
    private etapasService: LogisticaYmsEtapasService,
    private pnotify: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private atividadesService: AtividadesService,
    private confirmModalService: ConfirmModalService,
    private setoresService: LogisticaYmsSetoresService,
    private tiposSetorService: LogisticaYmsTiposSetorService,
    private filiaisService: LogisticaFiliaisService,
  ) {
    this.form = this.formBuilder.group({
      "UUID_LOGI_YMS_ETAP": [{value:null, disabled:true}],
      "NM_ETAP": [null],
    });

    this.formSetores = this.formBuilder.group({
      UUID_LOGI_YMS_SETO:[null],
      NM_SETO:[null],
      UUID_LOGI_YMS_SETO_TIPO:[null],
      NM_SETO_TIPO:[null],
      UUID_LOGI_FILI:[null],
      NM_FILI:[null]
    });
  }

  ngOnInit() {

    this.atividadesService
      .registrarAcesso()
      .subscribe();
    this.onActivatedRoute();
    this.setBreadCrumb();
    this.getEtapas();
    this.getTiposSetor();
    this.getFilterSetores();
    this.getFiliais();
  }

  getFilterSetores(params?: Partial<ILogisticaYmsSetores>) {
    const _params = params ?? {};
    _params.IN_STAT = 1;
    _params.IN_PAGI = 0;
    this.loadingFilterSetores = true;
    this.setoresService
      .getSetores(_params)
      .pipe(
        finalize(() => {
          this.loadingFilterSetores = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.filterSetores = response.body['data'];
        }else{
          this.pnotify.notice('Nenhum registro encontrado!')
        }
      },
      (error: any) => {
        const message = error.error.message
        message ? this.pnotify.error(message): this.pnotify.error();
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

  onActivatedRoute() {
    const params = this.activatedRoute.snapshot.params;

    if (!params?.id){
      this.loading = false;
      return
    }
    this.form.get('UUID_LOGI_YMS_ETAP').setValue(params['id'])
    this.getSetoresAssociados({"UUID_LOGI_YMS_ETAP": params?.id})  
  }

  setBreadCrumb() {
    const id = this.activatedRoute.snapshot.params.idSubModulo;
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
        descricao: 'Etapas',
        routerLink: `../../`,
      },
      {
        descricao: this.appTitle
      }
    ];
  }

  getEtapas() {
    this.loadingEtapas = true;
    this.etapasService
      .getEtapas({ IN_STAT: '1', IN_PAGI: '0' })
      .pipe(
        finalize(() => {
          this.loadingEtapas = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.etapas = response.body['data'];
        }else{
          this.pnotify.notice('Nenhum registro encontrado!')
        }
      });
  }

  getSetores(){

    let params = {} ?? this.formSetores.value;
    params.IN_STAT = 1;
    params.IN_PAGI = 0;


    this.setoresLoading = true

    this.etapasService
      .getSetores(params)
      .pipe(
        finalize(() => {
          this.setoresLoading = false;
        })
      )
      .subscribe(
        response => {
          let setores = response.body['data'];
          console.log(setores)
          this.setores = setores.filter(setor => {
            return !this.setoresAssociados.some(item => item.UUID_LOGI_YMS_SETO == setor.ID)
          })

          this.tableConfigSetores.fixedHeader = this.setores.length > 9 ? true : false;
         
        }
      )
  }

  getSetoresAssociados(params){
    this.loadingSetores = true;
    params.IN_STAT = '1';
    params.IN_PAGI = '0';
    params.ORDE_BY = 'ID_REFE_ERP'

    this.etapasService
      .getSetoresAssociados(params)
      .pipe(
        finalize(() => {
          this.loadingSetores = false;
        })
      )
      .subscribe(
        response => {
          if(response.status !== 200){
            return
          }

          this.setoresAssociados = response.body['data'];
          this.tableConfigSetoresAssociados.fixedHeader = this.setoresAssociados.length > 9 ? true : false;
        }
      )
  }

  onAssociarSetores(){
    let setores = this.setores.filter(setor => setor.checked && setor.NR_SQNC != null);

    console.log(setores)
    this.toggle.setores = false;
    setores.map(item => {
      
      item.loading = true;

      if(this.setoresAssociados.some(setor => setor?.UUID_LOGI_YMS_SETO === item.UUID_LOGI_YMS_SETO)){
        return
      }

      let params = {
        "UUID_LOGI_YMS_ETAP": this.form.get("UUID_LOGI_YMS_ETAP").value ?? "",
        "UUID_LOGI_YMS_SETO": item?.UUID_LOGI_YMS_SETO ?? "",
        "IN_STAT": "1",
        "NR_SQNC": item?.NR_SQNC ?? "",
      }
      this.etapasService
        .postSetoresAssociados(params)
        .subscribe(
          response => {
            if(response.status === 200){
              
              this.setoresAssociados = [...this.setoresAssociados,
                {
                  ...item,
                  checked: false,
                  NR_SQNC: item.NR_SQNC,
                  NM_SETO: item.NM_SETO,
                  NM_FILI: item.NM_FILI,
                  NM_SETO_TIPO: item.NM_SETO_TIPO,
                  loading: false,
                  UUID_LOGI_YMS_SETO: item.UUID_LOGI_YMS_SETO,
                  UUID_LOGI_YMS_ETAP: this.form.get('UUID_LOGI_YMS_ETAP').value
                }
              ];
              console.log(this.setoresAssociados)
              
              this.setores = this.setores.filter(setor => !setor.checked)
              this.tableConfigSetoresAssociados.fixedHeader = this.setoresAssociados.length > 9 ? true : false;

            }
          }
        )
    });

  }

  confirmDelete(): Observable<boolean> {
    return this.confirmModalService.showConfirm(
      'delete',
      'Confirmar exclusão',
      'Deseja realmente prosseguir com a exclusão do registro?',
      'Cancelar',
      'Confirmar'
    );
  }

  onRemoverAssociacao(setor?){
    let setores = setor ? [setor] : this.setoresAssociados.filter(setor => setor.checked);
    console.log(setores)
    this.toggle.setoresAssociados = false;

    if(setores.length == 0){
      this.pnotify.notice("Nenhum setor selecionado.");
      return
    }

    this.confirmDelete()
      .subscribe(
        (response: boolean) => {
          
          if(!response){
            return
          }
          setores.map(item => {
            item.IN_STAT = '0';
            item.loading = true;

            this.etapasService
              .deleteAssociacoes(item)
              .pipe(finalize(() => {
                item.loading = false;
              }))
              .subscribe(
                response => {
                  
                  if(response.status !== 200){
                    return
                  }
                  this.setoresAssociados = this.setoresAssociados
                    .filter(setor => setor.UUID_LOGI_YMS_SETO != item.UUID_LOGI_YMS_SETO);
                  
                  this.tableConfigSetoresAssociados.fixedHeader = this.setoresAssociados.length > 9 ? true : false;
                }
              );
              (error) => {
                const message = error.error.message
                message ? this.pnotify.error(message): this.pnotify.error();
              }
          
          })
          
        }
      )
  }

  onToggleAll(item: string){
    console.log(item)
    this.toggle[item] = !this.toggle[item];
    this[item].map(setor => setor.checked = this.toggle[item]);

  }

  // Validação de formulário
  onFieldError(field: string) {
    if (this.onFieldInvalid(field)) {
      return 'is-invalid';
    }
    return '';
  }

  onFieldInvalid(field: any) {
    field = this.formSetores.get(field);
    return field.status == 'INVALID' && field.touched;
  }

  onFieldRequired(field: string) {
    let required = false;
    let formControl = new FormControl();

    if (this.formSetores.controls[field].validator) {
      let validationResult = this.formSetores.controls[field].validator(formControl);
      required =
        validationResult !== null && validationResult.required === true;
    }

    if (required) {
      return 'is-required';
    }
  }

setValidacao(event){
  console.log(event)
}
 
}
