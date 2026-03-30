import { ILogisticaFiliais } from './../../../cadastros/filiais/models/filiais';
import { ILogisticaYmsTiposEtapa } from './../../tipos-etapa/models/tipos-etapa';
import { LogisticaYmsTiposEtapaService } from './../../tipos-etapa/services/tipos-etapa.service';
import { ILogisticaYmsEtapas } from './../../etapas/models/etapas';
import { LogisticaYmsEtapasService } from './../../etapas/services/etapas.service';
import { ILogisticaYmsCircuitos } from './../models/circuitos';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
// angular
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

// services
import { LogisticaYmsCircuitosService } from '../services/circuitos.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';

// rxjs
import { finalize } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { LogisticaFiliaisService } from '../../../cadastros/filiais/services/filiais.service';

@Component({
  selector: 'logistica-circuitos-associacao-etapas',
  templateUrl: './associacao-etapas.component.html',
  styleUrls: ['./associacao-etapas.component.scss']
})
export class LogisticaYmsCircuitosAssociacaoEtapasComponent implements OnInit {

  appTitle = "Associação Etapas";

  form: FormGroup;
  formEtapas: FormGroup;

  breadCrumbTree: any = [];
  idSubModulo: number;
  $subscription: Subscription;

  /*loading*/
  loading = false;
  loadingNavBar = false;
  noResult = true;
  loadingCircuitos: boolean;
  /*loading*/
  filterEtapas:Array<ILogisticaYmsEtapas>;
  etapas= [];
  tiposEtapa: Array<ILogisticaYmsTiposEtapa>;
  etapasLoading = false;
  loadingEtapas = false;
  loadingFilterEtapas= false;
  loadingTiposEtapa= false;
  circuitos: Array<ILogisticaYmsCircuitos>;

  etapasAssociadas = [];
  etapasAssociadasLoading = false;

  tableConfigEtapasAssociados: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 243,
    hover: false,
  };
  
  tableConfigEtapas: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 243,
  };

  toggle = {
    etapas: false,
    etapasAssociadas: false
  };

  constructor(
    private formBuilder: FormBuilder,
    private circuitosService: LogisticaYmsCircuitosService,
    private pnotify: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private atividadesService: AtividadesService,
    private confirmModalService: ConfirmModalService,
    private etapasService: LogisticaYmsEtapasService,
    private tiposEtapaService: LogisticaYmsTiposEtapaService,
    private filiaisService: LogisticaFiliaisService,
  ) {
    this.form = this.formBuilder.group({
      "UUID_LOGI_YMS_CIRC": [{value:null, disabled:true}],
      "NM_CIRC": [null],
    });

    this.formEtapas = this.formBuilder.group({
      UUID_LOGI_YMS_ETAP:[null],
      NM_ETAP:[null],
      UUID_LOGI_YMS_ETAP_TIPO:[null],
      NM_ETAP_TIPO:[null],
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
    this.getCircuitos();
    this.getTiposEtapa();
    this.getFilterEtapas();
  }

  getFilterEtapas(params?: Partial<ILogisticaYmsEtapas>) {
    const _params = params ?? {};
    _params.IN_STAT = 1;
    _params.IN_PAGI = 0;
    this.loadingFilterEtapas = true;
    this.etapasService
      .getEtapas(_params)
      .pipe(
        finalize(() => {
          this.loadingFilterEtapas = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.filterEtapas = response.body['data'];
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

  getTiposEtapa() {
    this.loadingTiposEtapa = true;
    this.tiposEtapaService
      .getTiposEtapa({ IN_STAT: '1', IN_PAGI: '0' })
      .pipe(
        finalize(() => {
          this.loadingTiposEtapa = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.tiposEtapa = response.body['data'];
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


  onActivatedRoute() {
    const params = this.activatedRoute.snapshot.params;

    if (!params?.id){
      this.loading = false;
      return
    }
    this.form.get('UUID_LOGI_YMS_CIRC').setValue(params['id'])
    this.getEtapasAssociados({"UUID_LOGI_YMS_CIRC": params?.id})  
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
        descricao: 'Circuitos',
        routerLink: `../../`,
      },
      {
        descricao: this.appTitle
      }
    ];
  }

  getCircuitos() {
    this.loadingCircuitos = true;
    this.circuitosService
      .getCircuitos({ IN_STAT: '1', IN_PAGI: '0' })
      .pipe(
        finalize(() => {
          this.loadingCircuitos = false;
        })
      )
      .subscribe((response) => {
        if (response.status === 200) {
          this.circuitos = response.body['data'];
        }else{
          this.pnotify.notice('Nenhum registro encontrado!')
        }
      });
  }

  getEtapas(){

    let params = {} ?? this.formEtapas.value;
    params.IN_STAT = 1;
    params.IN_PAGI = 0;


    this.etapasLoading = true

    this.circuitosService
      .getEtapas(params)
      .pipe(
        finalize(() => {
          this.etapasLoading = false;
        })
      )
      .subscribe(
        response => {
          let etapas = response.body['data'];
          console.log(etapas)
          this.etapas = etapas.filter(etapa => {
            return !this.etapasAssociadas.some(item => item.UUID_LOGI_YMS_ETAP == etapa.ID)
          })

          this.tableConfigEtapas.fixedHeader = this.etapas.length > 9 ? true : false;
         
        }
      )
  }

  getEtapasAssociados(params){
    this.loadingEtapas = true;
    params.IN_STAT = '1';
    params.IN_PAGI = '0';
    params.ORDE_BY = 'ID_REFE_ERP'

    this.circuitosService
      .getEtapasAssociados(params)
      .pipe(
        finalize(() => {
          this.loadingEtapas = false;
        })
      )
      .subscribe(
        response => {
          if(response.status !== 200){
            return
          }

          this.etapasAssociadas = response.body['data'];
          this.tableConfigEtapasAssociados.fixedHeader = this.etapasAssociadas.length > 9 ? true : false;
        }
      )
  }

  onAssociarEtapas(){
    let etapas = this.etapas.filter(etapa => etapa.checked && etapa.NR_SQNC != null);

    console.log(etapas)
    this.toggle.etapas = false;
    etapas.map(item => {
      
      item.loading = true;

      if(this.etapasAssociadas.some(etapa => etapa?.UUID_LOGI_YMS_ETAP === item.UUID_LOGI_YMS_ETAP)){
        return
      }

      let params = {
        "UUID_LOGI_YMS_CIRC": this.form.get("UUID_LOGI_YMS_CIRC").value ?? "",
        "UUID_LOGI_YMS_ETAP": item?.UUID_LOGI_YMS_ETAP ?? "",
        "IN_STAT": "1",
        "NR_SQNC": item?.NR_SQNC ?? "",
      }
      this.circuitosService
        .postEtapasAssociados(params)
        .subscribe(
          response => {
            if(response.status === 200){
              
              this.etapasAssociadas = [...this.etapasAssociadas,
                {
                  ...item,
                  checked: false,
                  NR_SQNC: item.NR_SQNC,
                  NM_ETAP: item.NM_ETAP,
                  NM_FILI: item.NM_FILI,
                  NM_ETAP_TIPO: item.NM_ETAP_TIPO,
                  loading: false,
                  UUID_LOGI_YMS_ETAP: item.UUID_LOGI_YMS_ETAP,
                  UUID_LOGI_YMS_CIRC: this.form.get('UUID_LOGI_YMS_CIRC').value
                }
              ];
              console.log(this.etapasAssociadas)
              
              this.etapas = this.etapas.filter(etapa => !etapa.checked)
              this.tableConfigEtapasAssociados.fixedHeader = this.etapasAssociadas.length > 9 ? true : false;

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

  onRemoverAssociacao(etapa?){
    let etapas = etapa ? [etapa] : this.etapasAssociadas.filter(etapa => etapa.checked);
    console.log(etapas)
    this.toggle.etapasAssociadas = false;

    if(etapas.length == 0){
      this.pnotify.notice("Nenhum etapa selecionado.");
      return
    }

    this.confirmDelete()
      .subscribe(
        (response: boolean) => {
          
          if(!response){
            return
          }
          etapas.map(item => {
            item.IN_STAT = '0';
            item.loading = true;

            this.circuitosService
              .deleteAssociacoes(item)
              .pipe(finalize(() => {
                item.loading = false;
              }))
              .subscribe(
                response => {
                  
                  if(response.status !== 200){
                    return
                  }
                  this.etapasAssociadas = this.etapasAssociadas
                    .filter(etapa => etapa.UUID_LOGI_YMS_ETAP != item.UUID_LOGI_YMS_ETAP);
                  
                  this.tableConfigEtapasAssociados.fixedHeader = this.etapasAssociadas.length > 9 ? true : false;
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
    this[item].map(etapa => etapa.checked = this.toggle[item]);

  }

  // Validação de formulário
  onFieldError(field: string) {
    if (this.onFieldInvalid(field)) {
      return 'is-invalid';
    }
    return '';
  }

  onFieldInvalid(field: any) {
    field = this.formEtapas.get(field);
    return field.status == 'INVALID' && field.touched;
  }

  onFieldRequired(field: string) {
    let required = false;
    let formControl = new FormControl();

    if (this.formEtapas.controls[field].validator) {
      let validationResult = this.formEtapas.controls[field].validator(formControl);
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
