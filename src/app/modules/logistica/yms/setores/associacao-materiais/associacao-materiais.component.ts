import { ILogisticaYmsSetores } from './../models/setores';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
// angular
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// services
import { LogisticaYmsSetoresService } from '../services/setores.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';

// rxjs
import { finalize } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

@Component({
  selector: 'logistica-Setores-associacao-materiais',
  templateUrl: './associacao-materiais.component.html',
  styleUrls: ['./associacao-materiais.component.scss']
})
export class LogisticaYmsSetoresAssociacaoMateriaisComponent implements OnInit {

  appTitle = "Associação Material";

  form: FormGroup;
  formMateriais: FormGroup;

  breadCrumbTree: any = [];
  idSubModulo: number;
  $subscription: Subscription;

  /*loading*/
  loading = false;
  loadingNavBar = false;
  noResult = true;
  loadingSetores: boolean;
  /*loading*/

  materiais = [];
  materiaisLoading = false;
  loadingMateriais = false;
  setores: Array<ILogisticaYmsSetores>;

  materiaisAssociados = [];
  materiaisAssociadosLoading = false;

  tableConfigMateriaisAssociados: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 243,
    hover: false,
  };
  
  tableConfigMateriais: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 243,
  };

  toggle = {
    materiais: false,
    materiaisAssociados: false
  };

  constructor(
    private formBuilder: FormBuilder,
    private setoresService: LogisticaYmsSetoresService,
    private pnotify: PNotifyService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private atividadesService: AtividadesService,
    private confirmModalService: ConfirmModalService
  ) {
    this.form = this.formBuilder.group({
      "UUID_LOGI_YMS_SETO": [{value:null, disabled:true}],
      "NM_SETO": [null],
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

  ngOnInit() {

    this.atividadesService
      .registrarAcesso()
      .subscribe();
    this.onActivatedRoute();
    this.setBreadCrumb();
    this.getSetores();
  }

  onActivatedRoute() {
    const params = this.activatedRoute.snapshot.params;

    if (!params?.id){
      this.loading = false;
      return
    }
    this.form.get('UUID_LOGI_YMS_SETO').setValue(params['id'])
    this.getMateriaisAssociados({"UUID_LOGI_YMS_SETO": params?.id})  
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
        descricao: 'Setores',
        routerLink: `../../`,
      },
      {
        descricao: this.appTitle
      }
    ];
  }

  getSetores() {
    this.loadingSetores = true;
    this.setoresService
      .getSetores({ IN_STAT: '1', IN_PAGI: '0' })
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
      });
  }

  getMateriais(){

    const buscarPor = this.formMateriais.get('buscarPor')?.value;
    const pesquisa = this.formMateriais.get('pesquisa')?.value;

    let params = {};
    
    if(buscarPor){
      params[buscarPor] = pesquisa ?? '';
    }
    params['situacao'] = '1';
    params['qtItensPagina'] = 100;

    this.materiaisLoading = true

    this.setoresService
      .getMateriais(params)
      .pipe(
        finalize(() => {
          this.materiaisLoading = false;
        })
      )
      .subscribe(
        response => {
          let materiais = response.body['result'];
          this.materiais = materiais.filter(material => {
            return !this.materiaisAssociados.some(item => item.UUID_MATE == material.ID)
          })

          this.tableConfigMateriais.fixedHeader = this.materiais.length > 9 ? true : false;
         
        }
      )
  }

  getMateriaisAssociados(params){
    this.loadingMateriais = true;
    params.IN_STAT = '1';
    params.IN_PAGI = '0';
    params.ORDE_BY = 'ID_REFE_ERP'

    this.setoresService
      .getMateriaisAssociados(params)
      .pipe(
        finalize(() => {
          this.loadingMateriais = false;
        })
      )
      .subscribe(
        response => {
          if(response.status !== 200){
            return
          }

          this.materiaisAssociados = response.body['data'];
          this.tableConfigMateriaisAssociados.fixedHeader = this.materiaisAssociados.length > 9 ? true : false;
        }
      )
  }

  onAssociarMateriais(){
    
    let materiais = this.materiais.filter(material => material.checked);
    this.toggle.materiais = false;

    materiais.map(item => {
      
      item.loading = true;

      if(this.materiaisAssociados.some(material => material?.ID_REFE_ERP === item.ID_REFE_ERP)){
        return
      }

      let params = {
        "UUID_LOGI_YMS_SETO": this.form.get("UUID_LOGI_YMS_SETO").value ?? "",
        "UUID_MATE": item?.ID ?? "",
        "IN_STAT": "1"
      }
      this.setoresService
        .postMateriaisAssociados(params)
        .subscribe(
          response => {
            if(response.status === 200){
              
              this.materiaisAssociados = [...this.materiaisAssociados,
                {
                  ...item,
                  checked: false,
                  loading: false,
                  UUID_MATE: item.ID,
                  UUID_LOGI_YMS_SETO: this.form.get('UUID_LOGI_YMS_SETO').value
                }
              ];
              
              this.materiais = this.materiais.filter(material => !material.checked)
              this.tableConfigMateriaisAssociados.fixedHeader = this.materiaisAssociados.length > 9 ? true : false;

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

  onRemoverAssociacao(material?){
    
    let materiais = material ? [material] : this.materiaisAssociados.filter(material => material.checked);
    this.toggle.materiaisAssociados = false;

    if(materiais.length == 0){
      this.pnotify.notice("Nenhum material selecionado.");
      return
    }

    this.confirmDelete()
      .subscribe(
        (response: boolean) => {
          
          if(!response){
            return
          }
          materiais.map(item => {
            item.IN_STAT = '0';
            item.loading = true;

            this.setoresService
              .deleteAssociacoes(item)
              .pipe(finalize(() => {
                item.loading = false;
              }))
              .subscribe(
                response => {
                  
                  if(response.status !== 200){
                    return
                  }
                  this.materiaisAssociados = this.materiaisAssociados
                    .filter(material => material.UUID_MATE != item.UUID_MATE);
                  
                  this.tableConfigMateriaisAssociados.fixedHeader = this.materiaisAssociados.length > 9 ? true : false;
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
    this.toggle[item] = !this.toggle[item];
    this[item].map(material => material.checked = this.toggle[item]);
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

 
}
