import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
// angular
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// services
import { LogisticaEntergaRestricoesService } from '../services/restricoes.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';

// rxjs
import { finalize } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { LogisticaEntradaMateriaisService } from '../../../entrada-materiais/services/entrada-materiais.service';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';

@Component({
  selector: 'logistica-restricoes-transporte-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss']
})
export class LogisticaRestricoesTransporteCadastroComponent implements OnInit {

  appTitle = "registrar";

  form: FormGroup;
  formMateriais: FormGroup;

  status = [
    {
      "id": 1,
      "nome": "activo",
      "valor": 1
    },
    {
      "id": 0,
      "nome": "inactivo",
      "valor": 0
    }
  ]

  breadCrumbTree: any = [];
  idSubModulo: number;
  $subscription: Subscription;

  /*loading*/
  loading = true;
  loadingNavBar = false;
  noResult = true;
  /*loading*/

  materiais = [];
  materiaisLoading = false;

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
    private restricaoService: LogisticaEntergaRestricoesService,
    private pnotify: PNotifyService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private atividadesService: AtividadesService,
    private confirmModalService: ConfirmModalService
  ) {
    this.form = this.formBuilder.group({
      "UUID": [null],
      "NM_REST_TRAN": [null, Validators.required],
      "IN_STAT": [1, Validators.required],
      "NR_PRIO": [null, Validators.required],
      "DS_OBSE": [null]
    });

    this.formMateriais = this.formBuilder.group({
      buscarPor: ['NM_MATE'],
      pesquisa: [null, Validators.required]
    });
  }

  ngOnInit() {

    this.atividadesService
      .registrarAcesso()
      .subscribe();
    this.onActivatedRoute();
    this.setBreadCrumb();
  }

  onActivatedRoute() {
    const params = this.activatedRoute.snapshot.params;

    if (!params?.id){
      this.loading = false;
      return
    }

    this.getRestricao(params?.id);
    this.getMateriaisAssociados({"UUID_LOGI_REST_TRAN": params?.id})
  }

  setBreadCrumb() {
    this.breadCrumbTree = [
      {
        descricao: 'Logistica'
      },
      {
        descricao: 'Cadastro',
        routerLink: './../../'
      },
      {
        descricao: 'Restricciones de transporte',
        routerLink: '../'
      },
      {
        descricao: this.appTitle
      }
    ];
  }

  onSave() {
    this.loadingNavBar = true;
    return this.restricaoService
      .postRestricoes(this.form.value)
      .pipe(
        finalize(() => {
          this.loadingNavBar = false;
          this.loading = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.form.reset();
            this.pnotify.success();
            this.router.navigate(["./../"], {relativeTo: this.activatedRoute})
          } else {
            this.pnotify.error();
          }
        },
        (error) => {
          this.noResult = true;
          this.pnotify.error();
        }
      );
  }

  getRestricao(id) {
    this.restricaoService
      .getRestricao(id)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(
        (response) => {
          if (response.status === 200) {
            this.form.patchValue(response.body['data']);
          } else {
            this.pnotify.error();
          }
        },
        (error) => {
          this.pnotify.error();
        }
      )
  }

  getMateriais(){

    const buscarPor = this.formMateriais.get('buscarPor')?.value;
    const pesquisa = this.formMateriais.get('pesquisa')?.value;

    let params = {};

    if(buscarPor){
      params[buscarPor] = pesquisa ?? '';
    }

    this.toggle.materiais = false;

    this.materiaisLoading = true

    this.restricaoService
      .getMateriais(params)
      .pipe(
        finalize(() => {
          this.materiaisLoading = false;
        })
      )
      .subscribe(
        response => {

          if(response.status !== 200){
            this.materiais = [];
            return
          }

          let materiais = response.body['data'];

          this.materiais = materiais.filter(material => {
            return !this.materiaisAssociados.some(item => item.UUID_MATE == material.UUID)
          })

          this.tableConfigMateriais.fixedHeader = this.materiais.length > 9 ? true : false;

        }
      )
  }

  getMateriaisAssociados(params){

    params.IN_STAT = '1';
    params.IN_PAGI = '1';
    params.ORDE_BY = 'ID_REFE_ERP'

    this.materiaisAssociadosLoading = true;

    this.restricaoService
      .getMateriaisAssociados(params)
      .pipe(
        finalize(() => {
          this.materiaisAssociadosLoading = false;
        })
      )
      .subscribe(
        response => {
          if(response.status !== 200){
            this.materiaisAssociados = [];
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
        "UUID_LOGI_REST_TRAN": this.form.get("UUID").value ?? "",
        "UUID_MATE": item?.UUID ?? "",
        "IN_STAT": "1"
      }

      this.restricaoService
        .postMateriaisAssociados(params)
        .subscribe(
          response => {
            if(response.status === 200){

              this.materiaisAssociados = [...this.materiaisAssociados,
                {
                  ...item,
                  checked: false,
                  loading: false,
                  UUID_MATE: item.UUID,
                  UUID_LOGI_REST_TRAN: this.form.get("UUID").value
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
      'Confirma la eliminación',
      '¿Está seguro de que desea continuar con la eliminación del registro?',
      'Cancelar',
      'Confirmar'
    );
  }

  onRemoverAssociacao(material?){

    let materiais = material ? [material] : this.materiaisAssociados.filter(material => material.checked);
    this.toggle.materiaisAssociados = false;

    if(materiais.length == 0){
      this.pnotify.notice("Ningún material seleccionado.");
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

            this.restricaoService
              .postMateriaisAssociados(item)
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
              )

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
  // Validação de formulário

}
