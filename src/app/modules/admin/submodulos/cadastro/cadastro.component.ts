//angular
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from '@angular/forms';

//rxjs
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';

//services
import { AdminSubModulosService } from '../services/submodulos.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { IconesFontAwesomeService } from 'src/app/shared/services/core/icons-fonts-awesome.service';
import { RouterService } from 'src/app/shared/services/core/router.service';

//Interfaces
import { IAdminModulo } from '../../modulos/models/modulo';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';
import { AdminModulosService } from '../../modulos/services/modulos.service';

@Component({
  selector: 'admin-submodulo-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss']
})
export class AdminSubModulosCadastroComponent implements OnInit {
  
  appTitle = "Cadastro";
  
  form: FormGroup;
  icone: string;
  modulos: IAdminModulo[];
  loading = true;
  loadingNavBar = false;
  icones: Array<any>;

  breadCrumbTree: Array<Breadcrumb>;

  $subscription: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private service: AdminSubModulosService,
    private modulosService: AdminModulosService,
    private pnotify: PNotifyService,
    private foawService: IconesFontAwesomeService,
    private router: Router,
    private routerService: RouterService,
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
        descricao: 'Lista de submódulos',
        routerLink: `/admin/submodulos`,
      },
      {
        descricao: this.appTitle,
      },
    ];
  }

  setFormBuilder(){
    this.form = this.formBuilder.group({
      id: [null],
      nome: [null, Validators.required],
      moduloId: [null, Validators.required],
      icone: [null, Validators.required],
      status: [1]
    });
  }

  onActivatedRoute(){
    
    let id = this.activatedRoute.snapshot.params?.id;

    if(id == undefined){
      this.loading = false;
      return;
    }

    this.getSubModulo(id);        

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

  onSave() {
    
    let params = this.form.value;

    this.loadingNavBar = true;
    
    this.service
      .postSubModulo(params)
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

  getIcones() {
    this.foawService.getIcones().subscribe(response => {
      if (response.status === 200) {
        this.icones = response.body['icones'];
      }
    });
  }

  getSubModulo(id){
    
    this.loading = true;

    this.service
      .getSubModulos({id: id})
      .pipe(
        finalize(() => {
          this.loading = false
        })
      )
      .subscribe(
        response => {
          if(response.status !== 200){
            this.pnotify.error("Falha ao carregar informações.");
            this.router.navigate(["./../"], {
            relativeTo: this.activatedRoute
          });
            return
          }
          let data = response.body["data"][0];
          this.form.patchValue(data)
        },
        error => {
          this.pnotify.error("Falha ao carregar informações.");
          this.router.navigate(["./../"], {
            relativeTo: this.activatedRoute
          });
        }
      )
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

}
