//angular
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

//services
import { AdminAtividadesService } from '../services/atividades.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { AdminSubModulosService } from '../../submodulos/services/submodulos.service';
import { AdminModulosService } from '../../modulos/services/modulos.service';
import { IconesFontAwesomeService } from 'src/app/shared/services/core/icons-fonts-awesome.service';
import { RouterService } from 'src/app/shared/services/core/router.service';

//interfaces
import { IAdminModulo } from '../../modulos/models/modulo';
import { IAdminSubModulo } from '../../submodulos/models/submodulo';
import { IAdminTipoAtividade } from '../models/tipoAtividade';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';

//rxjs
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';

@Component({
  selector: 'admin-atividades-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss']
})
export class AdminAtividadesCadastroComponent implements OnInit {

  appTitle = "Cadastro";

  form: FormGroup;

  modulos: IAdminModulo[];
  submodulos: IAdminSubModulo[];
  submodulo: IAdminSubModulo;
  tiposAtividade: IAdminTipoAtividade[];

  icone: string;

  loading = true;
  loadingNavBar = false;
  loadingModulos = false;
  loadingSubmodulos = false;
  loadingTipoAtividade = false;

  icones: Array<any>;
  idSubModulo: number;

  nestedLoading = {
    submodulos: true,
    tiposAtividades: true,
    icones: true,
    atividade: true,
    modulos: true
  };

  breadCrumbTree: Array<Breadcrumb> = [
    {
      descricao: 'Home',
      routerLink: '/admin/home'
    },
    {
      descricao: 'Lista de atividades',
      routerLink: '/admin/atividades'
    },
    {
      descricao: 'Cadastro'
    }
  ];

  $subscription: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private service: AdminAtividadesService,
    private moduloService: AdminModulosService,
    private submoduloService: AdminSubModulosService,
    private pnotify: PNotifyService,
    private activatedRoute: ActivatedRoute,
    private foawService: IconesFontAwesomeService,
    private router: Router,
    private routerService: RouterService,
    private location: Location,
    private atividadesService: AtividadesService,
  ) {
  }

  ngOnInit() {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.setFormBuilder();
    this.onActivatedRoute();
    this.getIcones();
    this.getModulos();
    this.getSubmodulos();
    this.getTipoAtividade();
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
        descricao: 'Lista de atividades',
        routerLink: `/admin/atividades`,
      },
      {
        descricao: this.appTitle,
      },
    ];
  }

  setFormBuilder(){
    this.form = this.formBuilder.group({
      id: [null],
      icone: [null, Validators.required],
      nome: [null, Validators.required],
      moduloId: [null, Validators.required],
      submoduloId: [null, Validators.required],
      tipoAtividadeId: [null, Validators.required],
      rota: [null],
      url: [null],
      exibeSidebar: [null],
      exibeNovaAba: [null],
      descricao: [null, Validators.required],
      situacao: [1]
    });
  }

  onActivatedRoute(){

    let id = this.activatedRoute.snapshot.params?.id;

    if(id == undefined){
      this.loading = false;
      return;
    }

    this.getAtividade(id);

  }

  getAtividade(id) {

    this.loading = true;

    this.service
      .getAtividades({id: id})
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
          let data = response.body["data"][0];
          this.form.patchValue(data)
          this.form.get('rota').setValue(data["rota_origem"]);
        },
        error => {
          this.pnotify.error("Falha ao carregar os dados da atividade.");
          this.router.navigate(["./../"], {
            relativeTo: this.activatedRoute
          })
        }
      )
  }

  getModulos(params?) {

    this.loadingModulos = true;

    this.moduloService
      .getModulos(params)
      .pipe(
        finalize(() => {
          this.loadingModulos = false;
        })
      )
      .subscribe(
        response => {
          if (response.status !== 200) {
            this.pnotify.error('Ocorreu um erro ao consultar módulos');
            this.modulos = [];
            return;
          }

          this.modulos = response.body["data"];
        },
        error => {
          this.modulos = [];
          this.pnotify.error('Ocorreu um erro ao consultar módulos');
        }
      );
  }

  getSubmodulos(params?) {

    this.loadingSubmodulos = true;

    this.submoduloService
      .getSubModulos(params)
      .pipe(
        finalize(() => {
          this.loadingSubmodulos = false;
        })
      )
      .subscribe(
        response => {
          if (response.status !== 200) {
            this.pnotify.error('Ocorreu um erro ao consultar submódulos');
            this.submodulos = [];
            return;
          }

          this.submodulos = response.body["data"];
        },
        error => {
          this.submodulos = [];
          this.pnotify.error('Ocorreu um erro ao consultar submódulos');
        }
      );
  }

  getTipoAtividade() {

    this.loadingTipoAtividade = true;

    this.service
      .getTipoAtividade()
      .pipe(
        finalize(() => {
          this.loadingTipoAtividade = false;
        })
      )
      .subscribe(
        response => {
          if (response.status !== 200) {
            this.pnotify.error('Ocorreu um erro ao consultar tipo de atividade');
            this.tiposAtividade = [];
            return;
          }

          this.tiposAtividade = response.body["data"];
        },
        error => {
          this.tiposAtividade = [];
          this.pnotify.error('Ocorreu um erro ao consultar tipo de atividade');
        }
      );
  }

  onSave() {
    this.loadingNavBar = true;

    let params = this.form.value;

    this.service
      .postAtividade(params)
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

  getParams() {
    let params = this.form.value;
    params['icone'] = this.icone;
    return params;
  }

  getIcones() {
    this.foawService
      .getIcones()
      .pipe(
        finalize(() => {
          /* this.nestedLoading.icones = false;
          this.loading = this.getStatusDataLoaded(); */
        })
      )
      .subscribe(response => {
        if (response.status === 200) {
          this.icones = response.body['icones'];
        }
      });
  }

  onIconSelected(event) {
    this.icone = event.classe;
  }

  getStatusDataLoaded() {

    let status = false;
    Object.keys(this.nestedLoading).forEach(key => {
      if (this.nestedLoading[key] === true) status = true;
    });

    return status;
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
}
