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
import { Subscription, forkJoin } from 'rxjs';

//ngx-bootstrap
import { ModalDirective } from 'ngx-bootstrap/modal';

//services
import { AdminModulosService } from '../services/modulos.service';
import { PNotifyService } from 'src/app/shared/services/core/pnotify.service';
import { IconesFontAwesomeService } from 'src/app/shared/services/core/icons-fonts-awesome.service';
import { RouterService } from 'src/app/shared/services/core/router.service';

//interfaces
import { IAdminModulo } from '../models/modulo';
import { Breadcrumb } from 'src/app/shared/modules/breadcrumb/breadcrumb';
import { AtividadesService } from 'src/app/shared/services/requests/atividades.service';

@Component({
  selector: 'admin-modulos-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.scss']
})
export class AdminModulosCadastroComponent implements OnInit {

  @ViewChild('childModal', { static: false }) childModal: ModalDirective;

  appTitle = "Cadastro";

  form: FormGroup;
  idModulo: number;
  icone: string;
  modulo: IAdminModulo;
  loading = true;
  loadingNavBar = false;
  icones: Array<any>;
  idSubModulo: number;

  $subscription: Subscription;

  breadCrumbTree: Array<Breadcrumb>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private service: AdminModulosService,
    private pnotify: PNotifyService,
    private foawService: IconesFontAwesomeService,
    private router: Router,
    private atividadesService: AtividadesService,
    private routerService: RouterService
  ) {
  }

  ngOnInit() {
    this.registrarAcesso();
    this.setBreadCrumb();
    this.setFormBuilder();
    this.onActivatedRoute();
    this.getIcones();
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
        descricao: 'Lista de módulos',
        routerLink: `/admin/modulos`,
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
      rota: [null, Validators.required],
      icone: [null, Validators.required],
      situacao: [1]
    });
  }

  onActivatedRoute(){

    let id = this.activatedRoute.snapshot.params?.id;

    if(id == undefined){
      this.loading = false;
      return;
    }

    this.getModulo(id);

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

    this.loadingNavBar = true;

    let params = this.form.value;

    this.service
      .postModulo(params)
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
    this.foawService
      .getIcones()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(response => {
        if (response.status === 200) {
          this.icones = response.body['icones'];
        }
      });
      console.log()
      console.log(this.getIcones)
  }

  getModulo(id){

    this.loading = true;

    this.service
      .getModulos({id: id})
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
        }
      )
  }


}

