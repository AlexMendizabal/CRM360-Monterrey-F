//angular
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

//services
import { AdminPerfisService } from '../services/perfis.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AdminAtividadesService } from '../../atividades/services/atividades.service';
import { RouterService } from 'src/app/shared/services/core/router.service';

//rxjs
import { finalize } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';

//interfaces
import { IAdimAtividade } from '../../atividades/models/atividade';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { Subtitles } from 'src/app/shared/modules/subtitles/subtitles';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

import { event } from '../models/event';
import { Location } from '@angular/common';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';

@Component({
  selector: 'admin-perfis-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss']
})
export class AdminPerfisCadastroComponent implements OnInit, OnDestroy {
  
  form: FormGroup;
  formAtividades: FormGroup;

  appTitle = "Registros";

  loading = true;
  loadingNavBar = false;

  /* Pagination */
  itemsPerPage = 100;
  totalItems = 10;
  currentPage = 1;
  /* Pagination */


  tableConfig: Partial<CustomTableConfig> = {
    subtitleBorder: true
  };

  $activatedRouteSubscription: Subscription;

  breadCrumbTree: Array<Breadcrumb>;

  atividades = [];
  atividadesLoading = false;

  atividadesAssociadas = [];
  atividadesAssociadasLoading = false;

  tableConfigAtividadesAssociadas: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 243,
    hover: false,
  };
  
  tableConfigAtividades: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 243,
  };

  toggle = {
    atividades: false,
    atividadesAssociadas: false
  };

  constructor(
    private service: AdminPerfisService,
    private formBuilder: FormBuilder,
    private pnotify: PNotifyService,
    private atividadesService: AdminAtividadesService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private confirmModalService: ConfirmModalService
  ) {

  }

  ngOnInit() {
    this.buildForm();
    this.onActivatedRoute();
    this.registrarAcesso();
    this.setBreadCrumb();
  }

  registrarAcesso(): void {
    this.atividadesService.registrarAcesso().subscribe();
  }

  setBreadCrumb() {
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: `/admin/home`,
      },
      {
        descricao: 'Lista de perfiles',
        routerLink: `/admin/perfis`,
      },
      {
        descricao: this.appTitle,
      },
    ];
  }

  ngOnDestroy(): void {
    this.$activatedRouteSubscription?.unsubscribe();
  }

  onActivatedRoute() {
    const params = this.activatedRoute.snapshot.params;
    
    if (!params?.id){
      this.loading = false;
      return
    }
    
    this.getPerfil(params?.id);
    this.getAtividadesAssociadas({"perfilId": params?.id})
  }

  buildForm() {

    this.form = this.formBuilder.group({
      id: [null],
      nome: [null, Validators.required],
      sigla: [null, Validators.required],
      situacao: [1]
    });

    this.formAtividades = this.formBuilder.group({
      buscarPor: ['nome'],
      pesquisa: [null, Validators.required]
    });

  }

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

  getPerfil(id) {
    
    this.loading = true;
    
    this.service
      .getPerfil({id: id})
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(
        response => {
          if(response.status !== 200){
            return
          }
          let data = response.body["data"][0];
          this.form.patchValue(data)
        }
      )
  }

  onSave() {
    this.loadingNavBar = true;
    
    let params = this.form.value;
    //console.log(params);
    this.service
      .postPerfil(params)
      .pipe(
        finalize(() => {
          this.loadingNavBar = false
        })
      )
      .subscribe(
        response => {
          this.pnotify.success();
         /*this.router.navigate(["./../"], {
            relativeTo: this.activatedRoute
          });*/
        },
        error => {
          let message = error.error?.message;
          message ? this.pnotify.error(message) : this.pnotify.error();
        }
      );
  }

  onEliminar(){
    this.loadingNavBar = true;
    let params = this.form.value;
    
    //console.log(params);
    this.service
      .postPerfil(params)
      .pipe(
        finalize(() => {
          this.loadingNavBar = false
        })
      )
      .subscribe(
        response => {
          this.pnotify.delete();
         /*this.router.navigate(["./../"], {
            relativeTo: this.activatedRoute
          });*/ 
        },
        error => {
          let message = error.error?.message;
          message ? this.pnotify.error(message) : this.pnotify.error();
        }
      );
  }

  getAtividades(){

    const buscarPor = this.formAtividades.get('buscarPor')?.value;
    const pesquisa = this.formAtividades.get('pesquisa')?.value;

    let params = {};
    
    if(buscarPor){
      params[buscarPor] = pesquisa ?? '';
    }

    this.toggle.atividades = false;

    this.atividadesLoading = true

    this.atividadesService
      .getAtividades(params)
      .pipe(
        finalize(() => {
          this.atividadesLoading = false;
        })
      )
      .subscribe(
        response => {
          
          if(response.status != 200){
            this.atividades = [];
            return;
          }

          let data = response.body['data'];
          
          this.atividades = data.filter(atividade => {
            return !this.atividadesAssociadas.some(item => item.id == atividade.id)
          })

          this.tableConfigAtividades.fixedHeader = this.atividades.length > 9 ? true : false;
         
        },
        error => {
          this.atividades = [];
          console.log(error)
        }
      )
  }

  getAtividadesAssociadas(params){

    params.IN_STAT = '1';
    params.IN_PAGI = '0';
    /* params.ORDE_BY = 'ID_REFE_ERP' */

    this.atividadesAssociadasLoading = true;

    this.atividadesService
      .getAtividades(params)
      .pipe(
        finalize(() => {
          this.atividadesAssociadasLoading = false;
        })
      )
      .subscribe(
        response => {
          if(response.status !== 200){
            return
          }
          console.log(response);
          this.atividadesAssociadas = response.body['data'];
          this.tableConfigAtividadesAssociadas.fixedHeader = this.atividadesAssociadas.length > 9 ? true : false;
        }
      )

  }

  onAssociarAtividades(){
    
    let atividades = this.atividades.filter(material => material.checked);
    this.toggle.atividades = false;

    atividades.map(item => {
      
      item.loading = true;

      if(this.atividadesAssociadas.some(atividade => atividade?.id === item.id)){
        return
      }

      let params = {
        "atividadeId": item?.id ?? "",
        "perfilId": this.form.get("id").value ?? "",
        "status": "1"
      }

      this.service
        .postAtividadesAssociadas(params)
        .subscribe(
          response => {
            if(response.status === 200){
              
              this.atividadesAssociadas = [...this.atividadesAssociadas,
                {
                  ...item,
                  checked: false,
                  loading: false,
                  attividadeId: item.id,
                  perfilId: this.form.get("id").value
                }
              ];
              
              this.atividades = this.atividades.filter(material => !material.checked)
              this.tableConfigAtividadesAssociadas.fixedHeader = this.atividadesAssociadas.length > 9 ? true : false;

            }
          },
          error => {
            item.loading = false;
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

  onRemoverAssociacao(atividade?){
    
    let _atividades = atividade ? [atividade] : this.atividadesAssociadas.filter(atividade => atividade.checked);
    
    let atividades = _atividades.map(item => { return {atividadeId: item.id, perfilId: this.form.get('id').value}})
    
    this.toggle.atividadesAssociadas = false;

    if(atividades.length == 0){
      this.pnotify.notice("Nenhuma atividade selecionada.");
      return
    }

    this.confirmDelete()
      .subscribe(
        (response: boolean) => {
          
          if(!response){
            this.atividadesAssociadas.map(item => item.checked = false);
            return;
          }

          atividades.map(item => {
      
            item["status"] = '0';
            item["loading"] = true;

            this.service
              .postAtividadesAssociadas(item)
              .pipe(finalize(() => {
                item["loading"] = false;
              }))
              .subscribe(
                response => {
                  
                  if(response.status !== 200){
                    return
                  }
                  
                  this.atividadesAssociadas = this.atividadesAssociadas
                    .filter(atividade => atividade.id != item.atividadeId);
                  
                  this.tableConfigAtividadesAssociadas.fixedHeader = this.atividadesAssociadas.length > 9 ? true : false;
                }
              )
          
          })
          
        }
      )
  }

  onToggleAll(item: string){
    this.toggle[item] = !this.toggle[item];
    this[item].map(material => material.checked = this.toggle[item]);
  }
}