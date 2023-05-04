//angular
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

//services
import { AdminUsuariosService } from '../services/usuarios.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AdminPerfisService } from '../../perfis/services/perfis.service';
import { AdminModulosService } from '../../modulos/services/modulos.service';
import { AdminPrestadorServicoPessoasService } from '../../prestador-servico/pessoas/pessoas.service';
import { RouterService } from 'src/app/shared/services/core/router.service';
//rxjs
import { finalize } from 'rxjs/operators';
import { forkJoin, Observable } from 'rxjs';

//interfaces
import { IAdminPeril } from '../../perfis/models/perfil';
import { IAdminPrestadorServicoPessoa } from '../../prestador-servico/pessoas/pessoa';
import { AdminPrestadorServicoService } from '../../prestador-servico/prestador-servico.service';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { IAdminDepartamento } from '../../departamentos/departamento';
import { IAdminEmpresa } from '../../empresas/empresa';
import { IAdminCargo } from '../../cargos/cargo';
import { AdminDepartamentosService } from '../../departamentos/departamentos.service';
import { AdminEmpresasService } from '../../empresas/empresas.service';
import { AdminCargosService } from '../../cargos/cargos.service';
import { CustomTableConfig } from 'src/app/shared/templates/custom-table/models/config';
import { ConfirmModalService } from 'src/app/shared/modules/confirm-modal/confirm-modal.service';
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap';

@Component({
  selector: 'admin-usuarios-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss']
})
export class AdminUsuariosCadastroComponent implements OnInit {
  
  form: FormGroup;
  formPerfis: FormGroup;

  breadCrumbTree: Array<Breadcrumb>;

  appTitle = "Registros";
  modulos = [];

  loading = true;
  loadingNavBar = false;

  /* Pagination */
  itemsPerPage = 100;
  totalItems = 10;
  currentPage = 1;
  /* Pagination */

  perfis = [];
  perfisLoading = false;

  perfisAssociados = [];
  perfisAssociadosLoading = false;

  tableConfigPerfisAssociados: Partial<CustomTableConfig> = {
    subtitleBorder: true
  };

  tableConfigPerfis: Partial<CustomTableConfig> = {
    fixedHeader: false,
    bodyHeight: 243,
  };

  toggle = {
    perfis: false,
    perfisAssociados: false
  };

  bsConfig: Partial<BsDatepickerConfig>;
  
  constructor(
    private formBuilder: FormBuilder,
    private service: AdminUsuariosService,
    private pnotify: PNotifyService,
    private perfilService: AdminPerfisService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private modulosService: AdminModulosService,
    private confirmModalService: ConfirmModalService,
    private localeService: BsLocaleService,
  ) {
    this.localeService.use('pt-br');
    this.bsConfig = Object.assign(
      {},
      { containerClass: 'theme-dark-blue' },
      { adaptivePosition: true },
      { showWeekNumbers: false }
    );
  }

  ngOnInit() {
    this.buildForm();
    this.onActivatedRoute();
    this.setBreadCrumb();
    this.getModulos();
  }

  setBreadCrumb() {
    this.breadCrumbTree = [
      {
        descricao: 'Home',
        routerLink: `/admin/home`,
      },
      {
        descricao: 'Lista de usuarios',
        routerLink: `/admin/usuarios`,
      },
      {
        descricao: this.appTitle,
      },
    ];
  }

  onActivatedRoute() {
    
    const params = this.activatedRoute.snapshot.params;
    
    if (!params?.id){
      this.loading = false;
      return
    }

    this.getUsuario(params?.id);
    this.getPerfisAssociados({"usuarioId": params?.id})
  }

  buildForm() {

    this.form = this.formBuilder.group({
      id: [null],
      nome: [null, Validators.required],
      matricula: [null, Validators.required],
      apelido: [null, Validators.required],
      pessoaTipo: ['F', Validators.required],
      departamento: [null, Validators.required],
      empresa: [null, Validators.required],
      cargo: [null, Validators.required],
      dataAniversario: [null],
      email: [null, Validators.required],
      telefoneComercial: [null],
      telefoneCelular: [null],
      ramal: [null],
      senha: [null],
      moduloId: [null, Validators.required],
      situacao: [1, Validators.required],
    });

    this.formPerfis = this.formBuilder.group({
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

  getUsuario(id) {
    
    this.loading = true;
    
    this.service
      .getUsuarios({id: id})
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

          data.dataAniversario = data.dataAniversario ? new Date(data.dataAniversario) : null;

          this.form.patchValue(data)
        }
      )
  }

  onSave() {
    this.loadingNavBar = true;
    
    let params = this.form.value;

    this.service
      .postUsuario(params)
      .pipe(
        finalize(() => {
          this.loadingNavBar = false
        })
      )
      .subscribe(
        response => {
          this.pnotify.success();
          this.router.navigate(["./../"], {
            relativeTo: this.activatedRoute
          });
        },
        error => {
          let message = error.error?.message;
          message ? this.pnotify.error(message) : this.pnotify.error();
        }
      );
  }

  getModulos(){
    
    this.loading = true;

    this.modulosService
      .getModulos()
      .pipe(
        finalize(() => {
          this.loading = false
        })
      )
      .subscribe(
        response => {
          if(response.status !== 200){
            return
          }
          let data = response.body["data"];
          this.modulos = data;
        }
      )
  }

  getPerfisAssociados(params){

    params.situacao = '1';
    params.inPagina = '0';
    /* params.ORDE_BY = 'ID_REFE_ERP' */

    this.perfisAssociadosLoading = true;

    this.perfilService
      .getPerfis(params)
      .pipe(
        finalize(() => {
          this.perfisAssociadosLoading = false;
        })
      )
      .subscribe(
        response => {
          if(response.status !== 200){
            return
          }

          this.perfisAssociados = response.body['data'];
          this.tableConfigPerfisAssociados.fixedHeader = this.perfisAssociados.length > 9 ? true : false;
        }
      )
  }

  getPerfis(){

    const buscarPor = this.formPerfis.get('buscarPor')?.value;
    const pesquisa = this.formPerfis.get('pesquisa')?.value;

    let params = {};
    
    if(buscarPor){
      params[buscarPor] = pesquisa ?? '';
    }

    this.toggle.perfis = false;

    this.perfisLoading = true

    this.perfilService
      .getPerfis(params)
      .pipe(
        finalize(() => {
          this.perfisLoading = false;
        })
      )
      .subscribe(
        response => {
          
          if(response.status != 200){
            this.perfis = [];
            return;
          }

          let data = response.body['data'];
          
          this.perfis = data.filter(perfil => {
            return !this.perfisAssociados.some(item => item.id == perfil.id)
          })

          this.tableConfigPerfis.fixedHeader = this.perfis.length > 9 ? true : false;
         
        },
        error => {
          this.perfis = [];
          console.log(error)
        }
      )
  }

  onAssociarPerfis(){
    
    let perfis = this.perfis.filter(material => material.checked);
    this.toggle.perfis = false;

    perfis.map(item => {
      
      item.loading = true;

      if(this.perfisAssociados.some(atividade => atividade?.id === item.id)){
        return
      }

      let params = {
        "perfilId": item?.id ?? "",
        "usuarioId": this.form.get("id").value ?? "",
        "situacao": "1"
      }

      this.service
        .postPerfilAssociado(params)
        .subscribe(
          response => {
            if(response.status === 200){
              
              this.perfisAssociados = [...this.perfisAssociados,
                {
                  ...item,
                  checked: false,
                  loading: false,
                  attividadeId: item.id,
                  perfilId: this.form.get("id").value
                }
              ];
              
              this.perfis = this.perfis.filter(material => !material.checked)
              this.tableConfigPerfisAssociados.fixedHeader = this.perfisAssociados.length > 9 ? true : false;

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

  onRemoverAssociacao(perfil?){
    
    let _perfis = perfil ? [perfil] : this.perfisAssociados.filter(perfil => perfil.checked);
    
    let perfis = _perfis.map(item => { return {perfilId: item.id, usuarioId: this.form.get('id').value}})
    
    this.toggle.perfisAssociados = false;

    if(perfis.length == 0){
      this.pnotify.notice("Nenhum perfil selecionado.");
      return
    }

    this.confirmDelete()
      .subscribe(
        (response: boolean) => {
          
          if(!response){
            this.perfisAssociados.map(item => item.checked = false);
            return;
          }

          perfis.map(item => {
      
            item["situacao"] = '0';
            item["loading"] = true;

            this.service
              .postPerfilAssociado(item)
              .pipe(finalize(() => {
                item["loading"] = false;
              }))
              .subscribe(
                response => {
                  
                  if(response.status !== 200){
                    return
                  }
                  
                  this.perfisAssociados = this.perfisAssociados
                    .filter(perfil => perfil.id != item.perfilId);
                  
                  this.tableConfigPerfisAssociados.fixedHeader = this.perfisAssociados.length > 9 ? true : false;
                },
                error => {
                  this.pnotify.error("Erro ao remover perfil.");
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
